"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LogIn, ArrowRight, ShieldCheck, Film, Calendar, AlertTriangle } from "lucide-react";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { ReelMakingView } from "@/components/competition/ReelMakingView";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { StudentAuthModal } from "@/components/navigation/StudentAuthModal";
import { useRegister } from "@/lib/store";

export default function ReelMakingPage() {
  const router = useRouter();
  const s = useRegister();
  const [authOpen, setAuthOpen] = React.useState(false);

  const isHydrated = s._hasHydrated;
  const isLoggedIn = isHydrated && s.completed && !!s.firstName;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <TournamentNav activeNav="reel-making" />

      <main className="fest-scroll mx-auto w-full max-w-5xl flex-1 px-4 pb-16 md:px-6">
        {!isHydrated ? (
          // Loading skeleton state during hydration
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-fest-orange border-t-transparent" />
            <p className="font-mono text-xs uppercase tracking-widest text-fest-label">
              VERIFYING ACCREDITATION STATUS...
            </p>
          </div>
        ) : !isLoggedIn ? (
          // Protected Lock Screen: Visible only to registered students
          <SectionErrorBoundary name="Reel Making Protected Access">
            <div className="mx-auto mt-6 max-w-lg text-center md:mt-12">
              <div className="relative overflow-hidden rounded-3xl border border-fest-orange/40 bg-gradient-to-br from-white/95 via-white/80 to-fest-yellow/20 p-6 shadow-[0_20px_50px_rgba(28,36,56,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-fest-yellow to-fest-orange text-fest-ink shadow-md shadow-fest-orange/25">
                  <Lock className="h-8 w-8" />
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>REGISTERED STUDENTS EXCLUSIVE</span>
                </div>

                <h1 className="mt-3 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl">
                  REEL MAKING COMPETITION
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-fest-label sm:text-sm">
                  The official rules, evaluation criteria, and timeline for <strong>THE REEL ARENA – SMJV 2026</strong> are exclusively available to registered student athletes.
                </p>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>LOG IN TO ACCREDITED ACCOUNT</span>
                  </button>

                  <Link
                    href="/register"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/90 bg-white/70 px-5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs backdrop-blur-md transition hover:border-fest-orange/60 hover:bg-white active:scale-[0.98]"
                  >
                    <span>REGISTER AS A NEW STUDENT</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/schedule/boys"
                    className="mt-2 font-mono text-[11px] text-fest-label hover:text-fest-orange transition underline underline-offset-4"
                  >
                    Return to Tournament Schedule
                  </Link>
                </div>
              </div>
            </div>

            <StudentAuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab="login" />
          </SectionErrorBoundary>
        ) : (
          // Full Reel Making Competition Section for Registered Students
          <SectionErrorBoundary name="Reel Making Competition Content">
            <ReelMakingView />
          </SectionErrorBoundary>
        )}
      </main>

      <footer className="mt-auto border-t border-fest-border/60 py-4 text-center font-mono text-xs tracking-[0.25em] text-fest-label">
        SMJV YOUTH FESTIVAL 2026 · VADODARA · OFFICIAL REEL ARENA
      </footer>
    </div>
  );
}
