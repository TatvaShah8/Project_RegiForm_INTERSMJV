"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRegister } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  StepHeading,
  CTAButton,
  staggerParent,
  staggerChild,
} from "./ui-bits";
import {
  registerWithEmailPassword,
  resendVerificationEmail,
  checkEmailVerified,
  signInWithGoogle,
} from "@/lib/auth-service";

export function Step2Verify({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const s = useRegister();
  const { toast } = useToast();

  const [sendingEmail, setSendingEmail] = React.useState(false);
  const [checkingEmail, setCheckingEmail] = React.useState(false);
  const [emailSentNotice, setEmailSentNotice] = React.useState(false);
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);

  const isCultural = s.role === "cultural";
  const bothVerified = s.emailVerified && s.mobileVerified;

  // Handle Firebase Email Link Dispatch
  const handleSendFirebaseLink = async () => {
    setSendingEmail(true);
    try {
      const res = await registerWithEmailPassword(s.email, s.password || "SMJV2026!pass");
      if (res.ok) {
        setEmailSentNotice(true);
        toast({
          title: "VERIFICATION EMAIL DISPATCHED",
          description: `An official verification email was sent to ${s.email}. Please check your inbox and click the link.`,
        });
      } else {
        const resendRes = await resendVerificationEmail();
        if (resendRes.ok) {
          setEmailSentNotice(true);
          toast({
            title: "VERIFICATION EMAIL RESENT",
            description: `Check your inbox at ${s.email}.`,
          });
        } else {
          toast({
            title: "NOTICE",
            description: res.error || "Could not dispatch verification email. You can verify using Google or code.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setSendingEmail(false);
    }
  };

  // Check if student clicked the email link
  const handleCheckStatus = async () => {
    setCheckingEmail(true);
    try {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        s.set("emailVerified", true);
        toast({
          title: "EMAIL VERIFIED ✓",
          description: `Your email (${s.email}) is officially verified and linked!`,
        });
      } else {
        toast({
          title: "NOT YET VERIFIED",
          description: "Verification link was not clicked yet. Please check your inbox (and Spam folder).",
          variant: "destructive",
        });
      }
    } finally {
      setCheckingEmail(false);
    }
  };

  // 1-Click Google Verification
  const handleGoogleVerify = async () => {
    setLoadingGoogle(true);
    try {
      const res = await signInWithGoogle();
      if (res.ok && res.email) {
        s.set("email", res.email);
        s.set("emailVerified", true);
        toast({
          title: "AUTHENTICATED VIA GOOGLE ✓",
          description: `Email ${res.email} verified!`,
        });
      } else if (res.error) {
        toast({
          title: "GOOGLE AUTH CANCELLED",
          description: res.error,
          variant: "destructive",
        });
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Mobile OTP verification
  const handleVerifyMobile = () => {
    const ok = s.verifyOtp("mobile", s.mobileOtp);
    if (ok) {
      toast({
        title: "MOBILE NUMBER VERIFIED ✓",
        description: `+91 ${s.mobile} authenticated successfully!`,
      });
    } else {
      toast({
        title: "INVALID MOBILE CODE",
        description: `The 6-digit code does not match. Try again or click fill sample code.`,
        variant: "destructive",
      });
    }
  };

  // Email numeric OTP fallback verification
  const handleVerifyEmailOtp = () => {
    const ok = s.verifyOtp("email", s.emailOtp);
    if (ok) {
      toast({
        title: "EMAIL VERIFIED ✓",
        description: `${s.email} verified successfully!`,
      });
    } else {
      toast({
        title: "INVALID CODE",
        description: `The 6-digit email code does not match.`,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show">
      {/* Top Bar with team indicator */}
      <motion.div variants={staggerChild} className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-fest-orange/40 bg-white/70 px-3.5 py-1.5 font-mono text-xs font-semibold text-fest-deep shadow-xs backdrop-blur-md transition hover:border-fest-orange hover:bg-white active:scale-95"
        >
          ← Back to Step 1
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-xs font-bold uppercase text-fest-orange">
            {isCultural ? "🎭 Cultural Team · Step 02 / 03" : "⚡ Sports Team · Step 02 / 04"}
          </span>
          {(s.emailVerified || s.mobileVerified) && (
            <button
              type="button"
              onClick={() => {
                s.set("emailVerified", false);
                s.set("mobileVerified", false);
                s.set("emailOtp", "");
                s.set("mobileOtp", "");
                toast({
                  title: "VERIFICATION RESET",
                  description: "You can now test the verification options again.",
                });
              }}
              className="rounded-xl border border-fest-border bg-white/80 px-2.5 py-1 font-mono text-[11px] text-fest-label hover:border-fest-orange hover:text-fest-deep"
              title="Reset verification status to test live Firebase options"
            >
              Reset to Test Again ↻
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={staggerChild}>
        <StepHeading
          num="02"
          title="Verify Email & Mobile Number"
          subtitle={
            isCultural
              ? "Cultural Team Security: Verify your email address via Google 1-Click or Firebase Email Link, and authenticate your mobile number."
              : "Sports Team Security: Verify your email address via Google 1-Click or Firebase Email Link, and authenticate your mobile number."
          }
        />
      </motion.div>

      {/* Main Two-Column Verification Grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* ── CARD 1: EMAIL AUTHENTICATION ── */}
        <motion.div
          variants={staggerChild}
          className={cn(
            "flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl transition-all",
            s.emailVerified
              ? "border-fest-green/50 bg-fest-green/[0.12] shadow-sm"
              : "border-white/85 bg-white/60 shadow-[0_12px_32px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)]"
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                📧 EMAIL AUTHENTICATION
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest",
                  s.emailVerified
                    ? "border-fest-green/40 bg-fest-green/20 text-fest-green"
                    : "border-fest-yellow/50 bg-fest-yellow/15 text-fest-yellow"
                )}
              >
                {s.emailVerified ? "VERIFIED ✓" : "PENDING"}
              </span>
            </div>

            <p className="mt-2.5 font-mono text-sm font-bold text-fest-deep">
              {s.email || "No email entered"}
            </p>

            {s.emailVerified ? (
              <div className="mt-4 rounded-xl border border-fest-green/40 bg-fest-green/10 p-3 text-xs text-fest-green">
                <p className="font-semibold">✓ Official Email Verified</p>
                <p className="mt-0.5 text-[11px] text-fest-label">
                  Your email is authenticated and linked to your festival pass.
                </p>
                <button
                  type="button"
                  onClick={() => s.set("emailVerified", false)}
                  className="mt-2 font-mono text-[10px] text-fest-orange underline underline-offset-2"
                >
                  Re-verify with another email / method
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3.5">
                {/* Method A: Google 1-Click Verification */}
                <div className="rounded-xl border border-fest-orange/30 bg-gradient-to-br from-amber-50/70 to-fest-orange/10 p-3.5">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
                    RECOMMENDED · 1-CLICK AUTH
                  </span>
                  <button
                    type="button"
                    disabled={loadingGoogle}
                    onClick={handleGoogleVerify}
                    className="mt-2 flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-fest-border bg-white px-3 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:border-fest-orange hover:bg-fest-orange/5 active:scale-95 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{loadingGoogle ? "AUTHENTICATING…" : "VERIFY WITH GOOGLE"}</span>
                  </button>
                  <p className="mt-1.5 text-[10px] text-fest-label">
                    Pre-verifies your email instantly. You will still fill official certificate details manually.
                  </p>
                </div>

                {/* Method B: Firebase Real Email Link */}
                <div className="rounded-xl border border-white/80 bg-white/70 p-3.5 shadow-xs">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    FIREBASE EMAIL VERIFICATION LINK
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={sendingEmail}
                      onClick={handleSendFirebaseLink}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-fest-orange px-3 font-display text-xs uppercase tracking-wider text-fest-ink shadow-xs transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                    >
                      <span>{sendingEmail ? "Sending…" : "📧 Send Verification Link"}</span>
                    </button>
                    {emailSentNotice && (
                      <button
                        type="button"
                        disabled={checkingEmail}
                        onClick={handleCheckStatus}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-fest-border bg-white px-3 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:border-fest-orange active:scale-95 disabled:opacity-60"
                      >
                        <span>{checkingEmail ? "Checking…" : "Check Status ↻"}</span>
                      </button>
                    )}
                  </div>
                  {emailSentNotice && (
                    <p className="mt-2 font-mono text-[10px] text-fest-green">
                      ✓ Verification email sent to {s.email}! Click the link in your inbox, then click Check Status.
                    </p>
                  )}
                </div>

                {/* Method C: Numeric 6-digit OTP code */}
                <div className="rounded-xl border border-white/80 bg-white/50 p-3 shadow-xs">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    OR ENTER 6-DIGIT CODE
                  </span>
                  <div className="mt-2">
                    <InputOTP
                      maxLength={6}
                      value={s.emailOtp}
                      onChange={(v) => s.set("emailOtp", v)}
                      containerClassName="justify-start"
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="h-9 w-9 border-white/80 bg-white/80 text-fest-deep shadow-xs first:rounded-l-lg last:rounded-r-lg data-[active=true]:border-fest-orange"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={s.emailOtp.length < 6}
                      onClick={handleVerifyEmailOtp}
                      className="rounded-lg bg-gradient-to-r from-fest-yellow to-fest-orange px-3 py-1 font-display text-xs uppercase tracking-wider text-fest-ink shadow-xs hover:brightness-110 disabled:opacity-50"
                    >
                      Verify Code
                    </button>
                    <button
                      type="button"
                      onClick={() => s.set("emailOtp", s.emailCode || "231783")}
                      className="font-mono text-[10px] text-fest-orange underline underline-offset-2"
                    >
                      Fill sample code ({s.emailCode || "231783"})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── CARD 2: MOBILE NUMBER VERIFICATION ── */}
        <motion.div
          variants={staggerChild}
          className={cn(
            "flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl transition-all",
            s.mobileVerified
              ? "border-fest-green/50 bg-fest-green/[0.12] shadow-sm"
              : "border-white/85 bg-white/60 shadow-[0_12px_32px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)]"
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                📱 MOBILE SMS VERIFICATION
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest",
                  s.mobileVerified
                    ? "border-fest-green/40 bg-fest-green/20 text-fest-green"
                    : "border-fest-yellow/50 bg-fest-yellow/15 text-fest-yellow"
                )}
              >
                {s.mobileVerified ? "VERIFIED ✓" : "PENDING"}
              </span>
            </div>

            <p className="mt-2.5 font-mono text-sm font-bold text-fest-deep">
              {s.mobile ? `+91 ${s.mobile}` : "No mobile number entered"}
            </p>

            {s.mobileVerified ? (
              <div className="mt-4 rounded-xl border border-fest-green/40 bg-fest-green/10 p-3 text-xs text-fest-green">
                <p className="font-semibold">✓ Mobile Number Authenticated</p>
                <p className="mt-0.5 text-[11px] text-fest-label">
                  Your phone number is authenticated for tournament alerts and notifications.
                </p>
                <button
                  type="button"
                  onClick={() => s.set("mobileVerified", false)}
                  className="mt-2 font-mono text-[10px] text-fest-orange underline underline-offset-2"
                >
                  Re-verify phone number
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3.5">
                <div className="rounded-xl border border-white/80 bg-white/70 p-3.5 shadow-xs">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    ENTER 6-DIGIT SMS CODE SENT TO +91 {s.mobile || "••••••••••"}
                  </span>
                  <div className="mt-3">
                    <InputOTP
                      maxLength={6}
                      value={s.mobileOtp}
                      onChange={(v) => s.set("mobileOtp", v)}
                      containerClassName="justify-start"
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="h-10 w-10 border-white/80 bg-white/90 text-fest-deep shadow-xs first:rounded-l-lg last:rounded-r-lg data-[active=true]:border-fest-orange data-[active=true]:ring-2 data-[active=true]:ring-fest-orange/20"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-3">
                    <CTAButton
                      variant="gradient"
                      disabled={s.mobileOtp.length < 6}
                      onClick={handleVerifyMobile}
                      className="h-9 px-4 text-xs"
                    >
                      VERIFY MOBILE
                    </CTAButton>
                    <button
                      type="button"
                      onClick={() => s.set("mobileOtp", s.mobileCode || "152864")}
                      className="font-mono text-[11px] text-fest-yellow underline underline-offset-4 transition hover:text-fest-gold"
                    >
                      Fill sample code ({s.mobileCode || "152864"})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <motion.div variants={staggerChild} className="mt-8 flex items-center justify-between gap-3">
        <CTAButton variant="dark" onClick={onBack}>
          ← BACK TO STEP 1
        </CTAButton>
        <CTAButton variant="gradient" disabled={!bothVerified} onClick={onNext}>
          {isCultural
            ? "PROCEED TO STEP 3 (PROFILE & APPAREL) →"
            : "PROCEED TO STEP 3 (GENERAL PROFILE) →"}
        </CTAButton>
      </motion.div>
    </motion.div>
  );
}
