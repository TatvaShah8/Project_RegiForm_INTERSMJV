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

type Step = "choose-team" | 1 | 2 | 3 | 4 | "success";

const stepOrder: Record<Step, number> = {
  "choose-team": 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  success: 5,
};

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
  const [step, setStep] = React.useState<Step>(() => (s.role ? 1 : "choose-team"));
  const [dir, setDir] = React.useState(1);
  const { toast } = useToast();

  const go = (n: Step) => {
    const cur = stepOrder[step];
    const nxt = stepOrder[n];
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

  const isCultural = s.role === "cultural";
  const totalSteps = isCultural ? 3 : 4;

  const stepLabel =
    step === "choose-team"
      ? "TEAM SELECTION"
      : step === "success"
      ? "COMPLETE ✓"
      : `STEP 0${step} / 0${totalSteps}`;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      {/* wordmark bar */}
      {showHeader && (
        <header className="sticky top-0 z-40 border-b border-white/75 bg-white/55 shadow-[0_4px_30px_rgba(28,36,56,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-180">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
            <span className="flex min-w-0 items-center gap-1.5 font-display text-xs uppercase tracking-wide text-fest-deep sm:gap-2.5 sm:text-base md:text-xl">
              <img
                src="/logo.jpg"
                alt="SMJV Youth Festival 2026 Logo"
                className="h-7 w-7 shrink-0 rounded-full border border-fest-orange/30 object-cover shadow-sm sm:h-8 sm:w-8 md:h-9 md:w-9"
              />
              <span className="truncate whitespace-nowrap">
                SMJV YOUTH FESTIVAL <span className="fest-gradient-text">2026</span>
              </span>
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.25em] text-fest-label sm:inline">
              OFFICIAL REGISTRATION · VADODARA
            </span>
            <span className="shrink-0 rounded-md border border-white/80 bg-white/50 px-2 py-1 sm:px-2.5 font-mono text-[10px] font-bold tracking-widest text-fest-yellow shadow-sm backdrop-blur-md">
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
                  setStep("choose-team");
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
              {step === "choose-team" && (
                <SectionErrorBoundary name="Choose Team Step">
                  <div className="py-2 md:py-6">
                    <div className="text-center">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-fest-orange">
                        SMJV YOUTH FESTIVAL 2026 · REGISTRATION
                      </span>
                      <h1 className="mt-2 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-4xl">
                        SELECT YOUR PARTICIPATION TEAM
                      </h1>
                      <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-fest-label">
                        Please select how you will participate in the festival. Choose either the Sports Team or Cultural Team to proceed.
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-8 max-w-3xl mx-auto">
                      {/* Option 1: Sports Team */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          s.set("role", "sports");
                          go(1);
                        }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-fest-orange/30 bg-white/80 p-6 text-left shadow-[0_16px_40px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl transition hover:border-fest-orange hover:shadow-[0_20px_50px_rgba(217,119,6,0.2)]"
                      >
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 blur-2xl transition group-hover:scale-125" />
                        <div>
                          <div className="mb-5 flex items-center justify-between">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fest-yellow to-fest-orange text-2xl shadow-md shadow-fest-orange/30">
                              ⚡
                            </div>
                            <span className="rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
                              ATHLETICS &amp; TIES
                            </span>
                          </div>
                          <h2 className="font-display text-2xl uppercase tracking-wide text-fest-deep group-hover:text-fest-orange transition-colors">
                            REGISTER FOR SPORTS TEAM
                          </h2>
                          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-fest-label">
                            Participate as a competing athlete in outdoor and indoor tournament sports (Cricket, Football, Volleyball, Pickleball, Table Tennis, Chess, Badminton, Carrom, Throwball, Tug of War, Kho Kho).
                          </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-fest-orange/15 pt-4">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                            Continue as Sports Team
                          </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange font-bold text-fest-ink shadow-sm group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </motion.button>

                      {/* Option 2: Cultural Team */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          s.set("role", "cultural");
                          go(1);
                        }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-fest-orange/30 bg-white/80 p-6 text-left shadow-[0_16px_40px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl transition hover:border-fest-orange hover:shadow-[0_20px_50px_rgba(217,119,6,0.2)]"
                      >
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-500/20 blur-2xl transition group-hover:scale-125" />
                        <div>
                          <div className="mb-5 flex items-center justify-between">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-2xl shadow-md shadow-rose-500/30">
                              🎭
                            </div>
                            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-700">
                              STAGE &amp; ARTS
                            </span>
                          </div>
                          <h2 className="font-display text-2xl uppercase tracking-wide text-fest-deep group-hover:text-fest-orange transition-colors">
                            REGISTER FOR CULTURAL TEAM
                          </h2>
                          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-fest-label">
                            Represent your hostel branch in Garba, stage drama, music, dance performances, and traditional cultural events.
                          </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-fest-orange/15 pt-4">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                            Continue as Cultural Team
                          </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange font-bold text-fest-ink shadow-sm group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </SectionErrorBoundary>
              )}
              {step === 1 && (
                <SectionErrorBoundary name="Account Setup Form">
                  <Step1Account onBack={() => go("choose-team")} onNext={() => go(2)} />
                </SectionErrorBoundary>
              )}
              {step === 2 && (
                <SectionErrorBoundary name="Verification Step">
                  <Step2Verify onBack={() => go(1)} onNext={() => go(3)} />
                </SectionErrorBoundary>
              )}
              {step === 3 && (
                <SectionErrorBoundary name="Personal & Academic Profile">
                  <Step3General
                    onBack={() => go(2)}
                    onNext={() => go(isCultural ? "success" : 4)}
                  />
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
