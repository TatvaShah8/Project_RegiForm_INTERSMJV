"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Film,
  BookOpen,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  ExternalLink,
  Award,
  LogIn,
  Crown,
  Activity,
  ChevronRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { useRegister } from "@/lib/store";
import { REGISTRATION_OPEN } from "@/lib/fest";
import { useFestQr, IdPass } from "@/components/register/IdPass";
import { StudentAuthModal } from "@/components/navigation/StudentAuthModal";
import { useToast } from "@/hooks/use-toast";

const QrScannerModal = dynamic(
  () => import("@/components/scanner/QrScannerModal").then((m) => m.QrScannerModal),
  { ssr: false }
);

const PARTICIPATING_HOSTELS = [
  { city: "Vadodara", role: "HOST HOSTEL", isHost: true },
  { city: "Ahmedabad", role: "PARTICIPANT", isHost: false },
  { city: "Pune", role: "PARTICIPANT", isHost: false },
  { city: "Andheri, Mumbai", role: "PARTICIPANT", isHost: false },
  { city: "Sandhurst Road, Mumbai", role: "PARTICIPANT", isHost: false },
  { city: "Vallabh Vidyanagar", role: "PARTICIPANT", isHost: false },
  { city: "Bhavnagar", role: "PARTICIPANT", isHost: false },
  { city: "Surat", role: "PARTICIPANT", isHost: false },
];

const SPORTS_LIST = [
  { name: "Cricket", emoji: "🏏", category: "Boys & Girls" },
  { name: "Volleyball", emoji: "🏐", category: "Boys Division" },
  { name: "Football", emoji: "⚽", category: "Boys Division" },
  { name: "Throwball", emoji: "🏐", category: "Girls Division" },
  { name: "Table Tennis", emoji: "🏓", category: "Singles & Doubles" },
  { name: "Badminton", emoji: "🏸", category: "Singles & Doubles" },
  { name: "Chess", emoji: "♟️", category: "Mind Sport" },
  { name: "Carrom", emoji: "🎯", category: "Board Masters" },
  { name: "Tug of War", emoji: "🪢", category: "Power Showdown" },
  { name: "Kho Kho", emoji: "🏃‍♀️", category: "Girls Division" },
  { name: "Reel Making", emoji: "🎬", category: "Digital Challenge" },
];

const TOURNAMENT_STATS = [
  { label: "PARTICIPATING HOSTELS", val: "12", sub: "Across India" },
  { label: "ATHLETES & DELEGATES", val: "500+", sub: "Verified Students" },
  { label: "SPORTS DISCIPLINES", val: "11", sub: "Competitive Arenas" },
  { label: "TOURNAMENT DAYS", val: "04", sub: "Dec 24–27, 2026" },
];

export function HomePage() {
  const router = useRouter();
  const s = useRegister();
  const qr = useFestQr();
  const { toast } = useToast();

  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [idPassOpen, setIdPassOpen] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);

  const isHydrated = s._hasHydrated;
  const isLoggedIn = isHydrated && s.completed && !!s.firstName;
  const displayName = [s.firstName, s.surname].filter(Boolean).join(" ") || "Student";

  const handleLogout = () => {
    s.logout();
    setIdPassOpen(false);
    toast({
      title: "LOGGED OUT",
      description: "You have been logged out. Click Log In / Register to switch accounts.",
    });
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      {/* ── Main Navigation Header ── */}
      <TournamentNav activeNav="home" />

      <main className="fest-scroll mx-auto w-full max-w-5xl flex-1 px-4 pb-20 md:px-6">
        {/* ── 1. Hero Title Section ── */}
        <section className="mb-10 pt-4 text-center md:mb-14 md:pt-6">
          {/* Host Tag */}
          <div className="mb-3.5 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-fest-orange/40 bg-white/80 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-fest-orange shadow-sm backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-fest-orange" />
              SHRI MAHAVIRA JAINA VIDYALAYA · VADODARA (HOST)
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-4xl uppercase leading-[1.05] tracking-wide text-fest-deep drop-shadow-sm sm:text-6xl md:text-7xl lg:text-8xl">
            SMJV YOUTH FESTIVAL <span className="fest-gradient-text">2026</span>
          </h1>

          <div className="mx-auto mt-3 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-white/85 bg-white/70 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-fest-deep shadow-xs backdrop-blur-md sm:text-sm">
              ANNUAL INTER-HOSTEL SPORTS &amp; CULTURAL CHAMPIONSHIP
            </span>
          </div>

          {/* Date, Location, and Scope Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium sm:gap-3 sm:text-sm text-fest-label">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/75 px-4 py-1.5 shadow-xs backdrop-blur-md transition hover:border-fest-orange/50">
              <Calendar className="h-4 w-4 text-fest-orange" />
              <span>24–27 December 2026</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/75 px-4 py-1.5 shadow-xs backdrop-blur-md transition hover:border-fest-orange/50">
              <MapPin className="h-4 w-4 text-fest-orange" />
              <span>Vadodara, Gujarat</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/75 px-4 py-1.5 shadow-xs backdrop-blur-md transition hover:border-fest-orange/50">
              <Trophy className="h-4 w-4 text-fest-orange" />
              <span>12 Hostels · 11 Sports · 500+ Athletes</span>
            </span>
          </div>

          {/* Primary Call-to-Action Bar */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setIdPassOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow to-fest-orange px-6 py-3 font-display text-sm uppercase tracking-wider text-fest-ink shadow-lg shadow-fest-orange/25 transition hover:brightness-110 active:scale-95"
                >
                  <Award className="h-4 w-4" />
                  <span>VIEW MY ID PASS 🏅</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-fest-deep/20 bg-white/85 px-5 py-3 font-display text-sm uppercase tracking-wider text-fest-deep shadow-sm backdrop-blur-md transition hover:border-fest-orange hover:bg-white active:scale-95"
                >
                  <QrCode className="h-4 w-4 text-fest-orange" />
                  <span>SCAN ATHLETE QR</span>
                </button>
              </>
            ) : (
              <>
                {REGISTRATION_OPEN ? (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow to-fest-orange px-7 py-3 font-display text-sm uppercase tracking-wider text-fest-ink shadow-lg shadow-fest-orange/25 transition hover:brightness-110 active:scale-95"
                  >
                    <span>REGISTER TO PLAY</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow to-fest-orange px-7 py-3 font-display text-sm uppercase tracking-wider text-fest-ink shadow-lg shadow-fest-orange/25 transition hover:brightness-110 active:scale-95"
                  >
                    <span>LOG IN / VIEW PASS</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <Link
                  href="/schedule/boys"
                  className="inline-flex items-center gap-2 rounded-2xl border border-fest-deep/20 bg-white/85 px-5 py-3 font-display text-sm uppercase tracking-wider text-fest-deep shadow-sm backdrop-blur-md transition hover:border-fest-orange hover:bg-white active:scale-95"
                >
                  <Calendar className="h-4 w-4 text-fest-orange" />
                  <span>MATCH FIXTURES</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* ── 2. Tournament Metrics Ribbon ── */}
        <section className="mb-12 md:mb-16">
          <div className="relative mx-auto w-full max-w-4xl">
            <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-fest-yellow/20 via-fest-orange/20 to-fest-gold/20 blur-xl" />
            <div className="relative grid grid-cols-2 gap-3 rounded-3xl border border-white/90 bg-white/75 p-5 shadow-[0_16px_48px_rgba(28,36,56,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:grid-cols-4 sm:p-6 text-center">
              {TOURNAMENT_STATS.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-2">
                  <span className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wide text-fest-deep">
                    <span className="fest-gradient-text">{stat.val}</span>
                  </span>
                  <span className="mt-1 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-fest-deep">
                    {stat.label}
                  </span>
                  <span className="font-mono text-[10px] text-fest-label/70">
                    {stat.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Live Countdown Section ── */}
        <section className="mb-12 md:mb-16">
          <SectionErrorBoundary name="Live Countdown Timer">
            <CountdownTimer />
          </SectionErrorBoundary>
        </section>

        {/* ── 4. Quick Action Portals Grid ── */}
        <section className="mb-14 md:mb-18">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-fest-orange">
                TOURNAMENT ACCREDITATION &amp; HUBS
              </span>
              <h2 className="font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl md:text-4xl">
                OFFICIAL PORTALS &amp; ACTIVITIES
              </h2>
            </div>
            <p className="font-mono text-xs text-fest-label">
              Everything you need for festival days
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
            {/* Card 1: Tournament Schedule */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/85 bg-white/75 p-6 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-fest-orange/50 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 text-fest-deep shadow-xs">
                    <Calendar className="h-6 w-6 text-fest-orange" />
                  </div>
                  <span className="rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
                    MATCH FIXTURES
                  </span>
                </div>
                <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
                  MATCH SCHEDULES
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fest-label">
                  Complete day-by-day match timetables, pitches, and venues for Boys and Girls divisions across 8 competitive sports.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5 pt-3 border-t border-fest-orange/15">
                <Link
                  href="/schedule/boys"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-fest-deep px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-sm transition hover:bg-fest-deep/90"
                >
                  <span>BOYS SCHEDULE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/schedule/girls"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-fest-deep/20 bg-white/80 px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:bg-white"
                >
                  <span>GIRLS SCHEDULE</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Official Rules */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/85 bg-white/75 p-6 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-fest-orange/50 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 text-fest-deep shadow-xs">
                    <BookOpen className="h-6 w-6 text-fest-orange" />
                  </div>
                  <span className="rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
                    GUIDELINES
                  </span>
                </div>
                <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
                  RULES &amp; REGULATIONS
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fest-label">
                  Official tournament code of conduct, player eligibility criteria, points system, and rulebooks for all sport events.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5 pt-3 border-t border-fest-orange/15">
                <Link
                  href="/rules/boys"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-fest-deep px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-sm transition hover:bg-fest-deep/90"
                >
                  <span>BOYS RULES</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/rules/girls"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-fest-deep/20 bg-white/80 px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:bg-white"
                >
                  <span>GIRLS RULES</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Reel Making Competition */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/85 bg-white/75 p-6 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-fest-orange/50 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 text-fest-deep shadow-xs">
                    <Film className="h-6 w-6 text-fest-orange" />
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    DIGITAL HYPE CHALLENGE
                  </span>
                </div>
                <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
                  REEL MAKING COMPETITION
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fest-label">
                  For the first time ever, all 12 SMJV Hostels assemble for a creative digital reel showdown. Build hype and celebrate hostel spirit!
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-3 border-t border-fest-orange/15">
                {isLoggedIn ? (
                  <Link
                    href="/reel-making"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-sm transition hover:brightness-105"
                  >
                    <span>OFFICIAL REEL BRIEF</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-sm transition hover:brightness-105"
                  >
                    <span>LOG IN TO VIEW BRIEF</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
                <span className="font-mono text-[11px] font-medium text-fest-label">
                  *Registered Students Only
                </span>
              </div>
            </div>

            {/* Card 4: QR Scanner & Student Networking Pass */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/85 bg-white/75 p-6 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-fest-orange/50 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 text-fest-deep shadow-xs">
                    <QrCode className="h-6 w-6 text-fest-orange" />
                  </div>
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-green-700">
                    SMART NETWORKING
                  </span>
                </div>
                <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
                  STUDENT PASS &amp; QR SCANNER
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fest-label">
                  Scan any student&apos;s QR pass via camera or image upload to exchange verified contact details. Connect with athletes across hostels!
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-3 border-t border-fest-orange/15">
                {isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setScannerOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-fest-deep px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-sm transition hover:bg-fest-deep/90 active:scale-95"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>SCAN STUDENT QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdPassOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-fest-deep/20 bg-white/80 px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:bg-white active:scale-95"
                    >
                      <span>MY ID PASS</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-sm transition hover:brightness-105 active:scale-95"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>{REGISTRATION_OPEN ? "LOG IN / REGISTER TO SCAN" : "LOG IN TO SCAN"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-[11px] font-medium text-fest-label">
                      *Registered Students Only
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Participating SMJV Hostels Grid ── */}
        <section className="mb-14 md:mb-18">
          <div className="mb-6 text-center">
            <span className="rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-fest-orange">
              DELEGATIONS ASSEMBLING IN VADODARA
            </span>
            <h2 className="mt-2.5 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl md:text-4xl">
              12 PARTICIPATING SMJV HOSTELS
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base font-medium text-fest-deep">
              Athletes and contingents representing Shri Mahavira Jaina Vidyalaya hostels from across India
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {PARTICIPATING_HOSTELS.map((hostel) => (
              <div
                key={hostel.city}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-1 ${
                  hostel.isHost
                    ? "border-fest-orange/70 bg-gradient-to-br from-white/95 via-fest-yellow/25 to-fest-orange/20 shadow-md shadow-fest-orange/20 ring-1 ring-fest-orange/40"
                    : "border-white/85 bg-white/70 hover:border-fest-orange/50 hover:bg-white/90"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label/70">
                      SMJV BRANCH
                    </span>
                    {hostel.isHost && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-fest-orange px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white shadow-xs">
                        <Crown className="h-2.5 w-2.5" />
                        HOST
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1.5 font-display text-base uppercase tracking-wide text-fest-deep sm:text-lg">
                    {hostel.city}
                  </h4>
                </div>
                <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] font-medium text-fest-label">
                  <CheckCircle2 className="h-3.5 w-3.5 text-fest-orange" />
                  <span>Verified Contingent</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Tournament Sports Disciplines ── */}
        <section className="mb-14 md:mb-18">
          <div className="mb-6 text-center">
            <span className="rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-fest-orange">
              ATHLETIC EXCELLENCE
            </span>
            <h2 className="mt-2.5 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl md:text-4xl">
              COMPETITIVE SPORTS DISCIPLINES
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base font-medium text-fest-deep">
              Battleground across outdoor fields, indoor courts, and digital arenas
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {SPORTS_LIST.map((sport) => (
              <div
                key={sport.name}
                className="flex items-center gap-2.5 rounded-2xl border border-white/85 bg-white/70 px-4 py-2.5 shadow-xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-fest-orange/50 hover:bg-white"
              >
                <span className="text-xl sm:text-2xl">{sport.emoji}</span>
                <div>
                  <span className="block font-display text-xs uppercase tracking-wide text-fest-deep sm:text-sm">
                    {sport.name}
                  </span>
                  <span className="block font-mono text-[9px] text-fest-label/80">
                    {sport.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Bottom Host Banner ── */}
        <section className="overflow-hidden rounded-3xl border border-white/90 bg-gradient-to-r from-fest-yellow/30 via-white/90 to-fest-orange/30 p-6 shadow-[0_20px_50px_rgba(28,36,56,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-10 text-center sm:text-left">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <img
                  src="/logo.jpg"
                  alt="SMJV Youth Festival 2026"
                  className="h-10 w-10 rounded-full border border-fest-orange/40 object-cover shadow-sm"
                />
                <span className="font-display text-lg uppercase tracking-wide text-fest-deep sm:text-xl">
                  SHRI MAHAVIRA JAINA VIDYALAYA
                </span>
              </div>
              <h3 className="mt-2.5 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl md:text-4xl">
                READY FOR THE ULTIMATE HOSTEL BATTLE?
              </h3>
              <p className="mt-2 max-w-xl text-sm sm:text-base font-medium text-fest-deep leading-relaxed">
                Mark your calendars: 24, 25, 26 &amp; 27 December 2026 in Vadodara. Follow rules, check your schedules, and get your pass ready!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/schedule/boys"
                className="inline-flex items-center gap-2 rounded-2xl bg-fest-deep px-6 py-3 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-md transition hover:bg-fest-deep/90 active:scale-95"
              >
                <span>OPEN SCHEDULE</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-14 text-center pb-6">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs font-mono font-bold">
            <Link
              href="/contact"
              className="text-fest-label hover:text-fest-orange transition underline-offset-4 hover:underline"
            >
              CONTACT US &amp; SUPPORT
            </Link>
          </div>
          <p className="font-mono text-xs text-fest-label">
            © 2026 SMJV YOUTH FESTIVAL VADODARA ORGANIZING COMMITTEE · ALL RIGHTS RESERVED
          </p>
        </footer>
      </main>

      {/* ── Modals Integrated For One-Click Use ── */}
      <IdPass
        open={idPassOpen}
        onOpenChange={setIdPassOpen}
        qr={qr}
        onLogout={handleLogout}
        onOpenScanner={() => setScannerOpen(true)}
      />

      <StudentAuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />

      <QrScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onOpenAuth={() => setAuthModalOpen(true)}
      />
    </div>
  );
}
