"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, LogIn, LogOut, QrCode } from "lucide-react";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { logoutFirebase } from "@/lib/auth-service";
import { useRegister } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { IdPass, useFestQr } from "@/components/register/IdPass";
import { StudentAuthModal } from "@/components/navigation/StudentAuthModal";

const QrScannerModal = dynamic(
  () => import("@/components/scanner/QrScannerModal").then((m) => m.QrScannerModal),
  { ssr: false }
);

interface TournamentNavProps {
  activeNav: "home" | "rules" | "schedule" | "register" | "edit" | "reel-making" | "contact";
  activeGender?: "boys" | "girls";
}

export function TournamentNav({
  activeNav,
  activeGender = "boys",
}: TournamentNavProps) {
  const pathname = usePathname();
  const s = useRegister();
  const { toast } = useToast();
  const qr = useFestQr();

  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [idPassOpen, setIdPassOpen] = React.useState(false);
  const [scannerOpen, setScannerOpen] = React.useState(false);

  const isHydrated = s._hasHydrated;
  const isLoggedIn = isHydrated && s.completed && !!s.firstName;

  const displayName = [s.firstName, s.surname].filter(Boolean).join(" ") || "Student";
  const initials = `${s.firstName?.charAt(0) || ""}${s.surname?.charAt(0) || ""}`.toUpperCase() || "S";

  const handleLogout = async () => {
    await logoutFirebase();
    s.logout();
    setIdPassOpen(false);
    toast({
      title: "LOGGED OUT",
      description: "You have been logged out. Click Log In / Register to switch accounts.",
    });
  };

  return (
    <SectionErrorBoundary name="Tournament Navigation">
      {/* ── Top Fixed Header Bar ── */}
      <header className="sticky top-0 z-40 border-b border-white/75 bg-white/55 shadow-[0_4px_30px_rgba(28,36,56,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-180">
        <div className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
          {/* Left spacer so center title stays balanced on desktop */}
          <div className="hidden sm:block sm:w-20 md:w-24 shrink-0" />

          {/* Center Brand Title & Logo: Click redirects to Home */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-1.5 font-display text-xs uppercase tracking-wide text-fest-deep transition hover:opacity-90 active:scale-95 sm:gap-2.5 sm:text-base md:text-xl"
            title="SMJV Youth Festival 2026 - Go to Home"
          >
            <img
              src="/logo.jpg"
              alt="SMJV Youth Festival 2026 Logo"
              className="h-7 w-7 shrink-0 rounded-full border border-fest-orange/30 object-cover shadow-sm sm:h-8 sm:w-8 md:h-9 md:w-9"
            />
            <span className="truncate whitespace-nowrap">
              SMJV YOUTH FESTIVAL <span className="fest-gradient-text">2026</span>
            </span>
          </Link>

          {/* ── Header Actions: QR Scanner & Profile / Auth Controls ── */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Quick QR Scanner Button (Only available for registered/logged-in students) */}
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-fest-orange/40 bg-gradient-to-r from-fest-yellow/20 via-white/80 to-fest-orange/20 px-2 py-1 sm:px-3 sm:py-1.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs backdrop-blur-md transition hover:border-fest-orange hover:bg-fest-orange/20 active:scale-95"
                  title="Scan Student QR Code Pass"
                >
                  <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-fest-orange shrink-0" />
                  <span className="hidden sm:inline">SCAN PASS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIdPassOpen(true)}
                  className="group flex items-center gap-1.5 sm:gap-2.5 rounded-full border border-white/90 bg-white/75 py-0.5 sm:py-1 pl-0.5 sm:pl-1 pr-2.5 sm:pr-3.5 shadow-[0_4px_16px_rgba(28,36,56,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:border-fest-orange/60 hover:bg-white active:scale-95"
                  title="Click to view Official Student ID Pass"
                >
                  {/* Circle Photo */}
                  <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0 overflow-hidden rounded-full border-2 border-fest-orange bg-white shadow-sm md:h-9 md:w-9">
                    {s.photo ? (
                      <img
                        src={s.photo}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fest-yellow to-fest-orange font-display text-[10px] sm:text-xs font-bold text-fest-ink">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Name beside circle */}
                  <span className="max-w-[100px] sm:max-w-[150px] md:max-w-[200px] truncate font-display text-xs uppercase tracking-wide text-fest-deep group-hover:text-fest-orange md:text-sm">
                    {displayName}
                  </span>
                </button>

                {/* Quick Logout button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-white/80 bg-white/60 p-1.5 sm:p-2 text-fest-label shadow-sm backdrop-blur-md transition hover:border-red-400 hover:bg-red-50 hover:text-red-600 active:scale-95"
                  title="Log Out / Switch Account"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-gradient-to-r from-fest-yellow to-fest-orange px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-95 md:px-4"
              >
                <LogIn className="h-3.5 w-3.5 shrink-0" />
                <span className="sm:hidden">LOGIN</span>
                <span className="hidden sm:inline">LOG IN / REGISTER</span>
                <ArrowRight className="hidden sm:inline h-3.5 w-3.5 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Primary Top Navigation Bar & Gender Selector ── */}
      <div className="mb-8 mt-6 flex flex-col items-center md:mb-10 md:mt-8">
        {/* Main Horizontal Nav Bar: Rules | Schedule | Reel Making Competition (Register hidden if logged in) */}
        <nav
          aria-label="Tournament navigation"
          className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/80 bg-white/50 p-1.5 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180 md:gap-2"
        >
          {[
            { id: "rules", label: "RULES", href: `/rules/${activeGender}` },
            { id: "schedule", label: "SCHEDULE", href: `/schedule/${activeGender}` },
            ...(isLoggedIn && (s.role === "sports" || s.role === "cultural")
              ? [
                  {
                    id: "edit",
                    label: "EDIT REGISTRATION",
                    href: s.role === "cultural" ? "/register/edit-cultural" : "/register/edit",
                  },
                ]
              : []),
            ...(isLoggedIn ? [{ id: "reel-making", label: "REEL MAKING COMPETITION", href: "/reel-making" }] : []),
            ...(!isLoggedIn ? [{ id: "register", label: "REGISTER", href: "/register" }] : []),
            { id: "contact", label: "CONTACT US", href: "/contact" },
          ].map((tab) => {
            const active = activeNav === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative whitespace-nowrap rounded-xl px-3.5 py-1.5 font-display text-xs uppercase tracking-wider transition sm:px-5 sm:py-2 md:px-6 md:py-2.5 md:text-sm ${
                  active ? "text-fest-ink" : "text-fest-label hover:text-fest-deep"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mainNavPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange shadow-md shadow-fest-orange/25"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <span className="relative z-10 block font-bold">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Horizontal Nav Bar: Boys | Girls (appears when Schedule or Rules is selected) */}
        {(activeNav === "schedule" || activeNav === "rules") && (
          <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/45 p-1 shadow-[0_6px_20px_rgba(28,36,56,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-xl md:mt-5">
            {[
              { id: "boys", label: "BOYS", href: `/${activeNav}/boys` },
              { id: "girls", label: "GIRLS", href: `/${activeNav}/girls` },
            ].map((g) => {
              const active = activeGender === g.id;
              return (
                <Link
                  key={g.id}
                  href={g.href}
                  className={`relative rounded-lg px-5 py-1.5 font-display text-xs uppercase tracking-wider transition md:px-6 md:py-2 ${
                    active ? "text-fest-yellow" : "text-fest-label hover:text-fest-deep"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="genderNavPill"
                      className="absolute inset-0 rounded-lg bg-fest-deep shadow-sm"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 block font-bold ${
                      active ? "text-fest-yellow" : ""
                    }`}
                  >
                    {g.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Official Student ID Pass Dialog ── */}
      <IdPass
        open={idPassOpen}
        onOpenChange={setIdPassOpen}
        qr={qr}
        onLogout={handleLogout}
        onOpenScanner={() => setScannerOpen(true)}
      />

      {/* ── Student Auth (Login / Register) Modal ── */}
      <StudentAuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />

      {/* ── Student QR Code Scanner & Networking Modal ── */}
      <QrScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onOpenAuth={() => setAuthModalOpen(true)}
      />
    </SectionErrorBoundary>
  );
}
