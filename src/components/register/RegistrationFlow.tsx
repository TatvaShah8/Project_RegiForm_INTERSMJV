"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRegister } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Step1Account } from "./Step1Account";
import { Step2Verify } from "./Step2Verify";
import { Step3General } from "./Step3General";
import { Step4Sports } from "./Step4Sports";
import { SuccessScreen } from "./SuccessScreen";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

type Step = 1 | 2 | 3 | 4 | "success";

const stepVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir >= 0 ? 56 : -56,
    filter: "blur(6px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir >= 0 ? -56 : 56,
    filter: "blur(6px)",
    transition: { duration: 0.28, ease: "easeIn" as const },
  }),
};

export function RegistrationFlow({ showHeader = true }: { showHeader?: boolean } = {}) {
  const s = useRegister();
  const [step, setStep] = React.useState<Step>(1);
  const [dir, setDir] = React.useState(1);
  const { toast } = useToast();

  const go = (n: Step) => {
    const cur = step === "success" ? 5 : step;
    const nxt = n === "success" ? 5 : n;
    setDir(nxt >= cur ? 1 : -1);
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  /* issue OTPs when the verification step opens (once per session) */
  React.useEffect(() => {
    if (step !== 2) return;
    const st = useRegister.getState();
    const already = st.otpIssued;
    st.issueOtps();
    if (!already) {
      toast({
        title: "VERIFICATION SENT",
        description: `OTP codes sent to ${st.email} and +91 ${st.mobile}.`,
      });
    }
     
  }, [step]);

  const stepLabel =
    step === "success" ? "COMPLETE ✓" : `STEP 0${step} / 04`;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      {/* wordmark bar */}
      {showHeader && (
        <header className="sticky top-0 z-40 border-b border-white/75 bg-white/55 shadow-[0_4px_30px_rgba(28,36,56,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-180">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
            <span className="flex items-center gap-2.5 font-display text-lg uppercase tracking-wide text-fest-deep md:text-xl">
              <img
                src="/logo.jpg"
                alt="SMJV Youth Festival 2026 Logo"
                className="h-8 w-8 rounded-full border border-fest-orange/30 object-cover shadow-sm md:h-9 md:w-9"
              />
              <span>
                SMJV YOUTH FESTIVAL <span className="fest-gradient-text">2026</span>
              </span>
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.25em] text-fest-label sm:inline">
              OFFICIAL REGISTRATION · VADODARA
            </span>
            <span className="rounded-md border border-white/80 bg-white/50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-fest-yellow shadow-sm backdrop-blur-md">
              {stepLabel}
            </span>
          </div>
        </header>
      )}

      {/* step card */}
      <main className="fest-scroll mx-auto w-full max-w-5xl flex-1 px-3 py-6 md:px-6 md:py-10">
        {!showHeader && (
          <div className="mb-4 flex items-center justify-between px-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-fest-label">
              SMJV VADODARA
            </span>
            <span className="rounded-md border border-white/80 bg-white/60 px-2.5 py-1 font-mono text-xs font-bold tracking-widest text-fest-yellow shadow-sm backdrop-blur-md">
              {stepLabel}
            </span>
          </div>
        )}
        {/* Saved registration session on localhost */}
        {s.completed && step !== "success" && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-fest-orange/30 bg-white/70 p-4 shadow-[0_10px_25px_rgba(28,36,56,0.05)] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-fest-orange/15 font-mono text-sm font-bold text-fest-orange">
                ✓
              </span>
              <div>
                <p className="font-display text-sm uppercase text-fest-deep">
                  Active Registration Saved: {[s.firstName, s.surname].filter(Boolean).join(" ")} ({s.passNo || s.grNo})
                </p>
                <p className="font-mono text-xs text-fest-label">
                  Your tournament accreditation pass is already issued on this browser.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => go("success")}
                className="rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-ink shadow-sm hover:brightness-110 active:scale-95"
              >
                View Stored Pass →
              </button>
              <button
                onClick={() => {
                  s.resetAll();
                  setStep(1);
                  toast({
                    title: "STORE CLEARED",
                    description: "Saved registration reset. Ready for a new registration.",
                  });
                }}
                className="rounded-xl border border-fest-border/80 bg-white/70 px-3 py-2 font-mono text-xs text-fest-label hover:border-fest-orange/40 hover:text-fest-deep active:scale-95"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/80 bg-white/50 p-4 shadow-[0_24px_60px_rgba(28,36,56,0.09),0_4px_16px_rgba(28,36,56,0.04),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.4)] backdrop-blur-2xl backdrop-saturate-200 md:p-10">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {step === 1 && (
                <SectionErrorBoundary name="Account Setup Form">
                  <Step1Account onNext={() => go(2)} />
                </SectionErrorBoundary>
              )}
              {step === 2 && (
                <SectionErrorBoundary name="Verification Step">
                  <Step2Verify onBack={() => go(1)} onNext={() => go(3)} />
                </SectionErrorBoundary>
              )}
              {step === 3 && (
                <SectionErrorBoundary name="Personal & Academic Profile">
                  <Step3General onBack={() => go(2)} onNext={() => go(4)} />
                </SectionErrorBoundary>
              )}
              {step === 4 && (
                <SectionErrorBoundary name="Sports Quota Selection">
                  <Step4Sports onBack={() => go(3)} onComplete={() => go("success")} />
                </SectionErrorBoundary>
              )}
              {step === "success" && (
                <SectionErrorBoundary name="Pass Generation & Success">
                  <SuccessScreen />
                </SectionErrorBoundary>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-auto border-t border-fest-border/60 py-4 text-center font-mono text-[10px] tracking-[0.25em] text-fest-label/70">
        SMJV YOUTH FESTIVAL 2026 · ORGANIZING COMMITTEE · VADODARA
      </footer>
    </div>
  );
}
