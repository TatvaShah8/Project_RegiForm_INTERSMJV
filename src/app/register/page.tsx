"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, LogIn } from "lucide-react";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { RegistrationFlow } from "@/components/register/RegistrationFlow";
import { StudentAuthModal } from "@/components/navigation/StudentAuthModal";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { REGISTRATION_OPEN } from "@/lib/fest";
import { useRegister } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const s = useRegister();
  const isHydrated = s._hasHydrated;
  const isLoggedIn = isHydrated && s.completed && !!s.firstName;
  const [authOpen, setAuthOpen] = React.useState(false);

  React.useEffect(() => {
    if (isLoggedIn) {
      router.replace("/schedule/boys");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  if (!REGISTRATION_OPEN) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col">
        <TournamentNav activeNav="home" />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 pb-16">
          <div className="w-full rounded-3xl border border-white/85 bg-white/75 p-8 text-center shadow-xl backdrop-blur-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-fest-orange/35 bg-fest-orange/15 text-fest-orange">
              <Lock className="h-7 w-7" />
            </div>
            <span className="mt-4 inline-block rounded-full border border-fest-orange/35 bg-white/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange">
              REGISTRATIONS PAUSED
            </span>
            <h1 className="mt-3 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl">
              REGISTRATION IS CURRENTLY CLOSED
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-fest-label">
              New registrations are closed for now. Already registered? Log in below to view or print your official tournament ID pass.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md transition hover:brightness-110"
              >
                <LogIn className="h-4 w-4" />
                <span>LOG IN TO VIEW MY PASS</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 bg-white px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep transition hover:bg-black/5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </main>
        <StudentAuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <TournamentNav activeNav="register" />

      <main className="fest-scroll mx-auto w-full max-w-5xl flex-1 px-3 pb-12 md:px-6">
        <SectionErrorBoundary name="Registration Portal">
          <RegistrationFlow showHeader={false} />
        </SectionErrorBoundary>
      </main>
    </div>
  );
}
