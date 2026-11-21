"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRegister } from "@/lib/store";
import { auth } from "@/lib/firebase";
import { registrationRequest } from "@/lib/registration-api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
  const [savingSignup, setSavingSignup] = React.useState(false);

  const isCultural = s.role === "cultural";
  // Only email verification is required to proceed!
  const canProceed = s.emailVerified;

  // Handle Firebase Email Link Dispatch
  const handleSendFirebaseLink = async () => {
    setSendingEmail(true);
    try {
      const res = await registerWithEmailPassword(s.email, s.password);
      if (res.ok) {
        setEmailSentNotice(true);
        toast({
          title: "VERIFICATION EMAIL DISPATCHED",
          description: `An official verification email was sent to ${s.email}. Please check your inbox and click the link.`,
        });
      } else {
        toast({ title: "VERIFICATION FAILED", description: res.error, variant: "destructive" });
      }
    } finally {
      setSendingEmail(false);
    }
  };

  // Check if student clicked the email link
  const handleCheckStatus = async () => {
    setCheckingEmail(true);
    try {
      const isVerified = auth?.currentUser?.email?.toLowerCase() === s.email.trim().toLowerCase() && await checkEmailVerified();
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
        s.set("emailVerified", !!res.user?.emailVerified);
        toast({
          title: "AUTHENTICATED VIA GOOGLE ✓",
          description: `Email ${res.email} verified!`,
        });
      } else if (res.error) {
        if (res.code === "auth/popup-closed-by-user" || res.code === "auth/cancelled-popup-request") {
          toast({
            title: "VERIFICATION CANCELLED",
            description: "The Google sign-in window was closed.",
          });
        } else {
          toast({
            title: "GOOGLE AUTH FAILED",
            description: res.error,
            variant: "destructive",
          });
        }
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleProceed = async () => {
    setSavingSignup(true);
    try {
      const firebaseUser = auth?.currentUser;
      if (!firebaseUser) throw new Error("Please sign in with Firebase first");
      await firebaseUser.reload();
      if (!firebaseUser.emailVerified) throw new Error("Verify your email first");
      if (firebaseUser.email?.trim().toLowerCase() !== s.email.trim().toLowerCase()) {
        throw new Error("The verified Firebase email differs from the email in your form");
      }
      await registrationRequest("signup", "POST", {
        firstName: s.firstName,
        middleName: s.middleName,
        surname: s.surname,
        mobile: s.mobile,
        grNo: s.grNo,
        gender: s.gender,
      });
      // 'mobileVerified' should only be set by a real phone verification service.
      onNext();
    } catch (error) {
      toast({ title: "SIGNUP NOT SAVED", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
    } finally {
      setSavingSignup(false);
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
          {s.emailVerified && (
            <button
              type="button"
              onClick={() => {
                s.set("emailVerified", false);
                setEmailSentNotice(false);
                toast({
                  title: "VERIFICATION RESET",
                  description: "You can test the authentication options again.",
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
          title="Student Email Authentication"
          subtitle={
            isCultural
              ? "Cultural Team Security: Verify your email address via Google 1-Click or Firebase Email Verification Link to activate your tournament ID pass."
              : "Sports Team Security: Verify your email address via Google 1-Click or Firebase Email Verification Link to activate your tournament ID pass."
          }
        />
      </motion.div>

      {/* Centered Email Authentication Container */}
      <div className="mt-6 max-w-2xl mx-auto">
        {/* ── EMAIL AUTHENTICATION ── */}
        <motion.div
          variants={staggerChild}
          className={cn(
            "rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl transition-all",
            s.emailVerified
              ? "border-fest-green/50 bg-fest-green/[0.12] shadow-sm"
              : "border-white/85 bg-white/70 shadow-[0_16px_40px_rgba(28,36,56,0.07),inset_0_1.5px_2px_rgba(255,255,255,0.95)]"
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                📧 OFFICIAL STUDENT EMAIL AUTHENTICATION
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest",
                  s.emailVerified
                    ? "border-fest-green/40 bg-fest-green/20 text-fest-green"
                    : "border-fest-yellow/50 bg-fest-yellow/15 text-fest-yellow"
                )}
              >
                {s.emailVerified ? "VERIFIED ✓" : "ACTION REQUIRED"}
              </span>
            </div>

            <p className="mt-2.5 font-mono text-base font-bold text-fest-deep">
              {s.email || "No email entered"}
            </p>

            {s.emailVerified ? (
              <div className="mt-5 rounded-2xl border border-fest-green/40 bg-fest-green/10 p-4 text-xs text-fest-green">
                <p className="font-semibold text-sm">✓ Official Email Verified &amp; Authenticated</p>
                <p className="mt-1 text-xs text-fest-deep">
                  Your email address is securely verified and linked to your festival ID pass. Click below to continue.
                </p>
                <button
                  type="button"
                  onClick={() => s.set("emailVerified", false)}
                  className="mt-3 font-mono text-[11px] text-fest-orange underline underline-offset-2"
                >
                  Change Email / Re-verify
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {/* Method 1: Google 1-Click Verification */}
                <div className="rounded-2xl border-2 border-fest-orange/40 bg-gradient-to-br from-amber-50/80 to-fest-orange/15 p-4 sm:p-5 shadow-sm">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
                    RECOMMENDED · 1-CLICK INSTANT AUTHENTICATION
                  </span>
                  <button
                    type="button"
                    disabled={loadingGoogle}
                    onClick={handleGoogleVerify}
                    className="mt-2.5 flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-fest-border bg-white px-4 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:border-fest-orange hover:bg-fest-orange/5 active:scale-95 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{loadingGoogle ? "AUTHENTICATING…" : "VERIFY WITH GOOGLE"}</span>
                  </button>
                  <p className="mt-2 text-[11px] text-fest-label leading-relaxed">
                    Instantly pre-verifies your email address via Google. You will still enter your official certificate name &amp; details manually.
                  </p>
                </div>

                {/* Method 2: Firebase Real Email Verification Link */}
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4 sm:p-5 shadow-xs">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    OFFICIAL FIREBASE EMAIL VERIFICATION LINK
                  </span>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={sendingEmail}
                      onClick={handleSendFirebaseLink}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-fest-orange px-4 font-display text-xs uppercase tracking-wider text-fest-ink shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                    >
                      <span>{sendingEmail ? "Sending…" : "📧 Send Verification Link"}</span>
                    </button>
                    {emailSentNotice && (
                      <button
                        type="button"
                        disabled={checkingEmail}
                        onClick={handleCheckStatus}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-fest-border bg-white px-3.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:border-fest-orange active:scale-95 disabled:opacity-60"
                      >
                        <span>{checkingEmail ? "Checking…" : "Check Status ↻"}</span>
                      </button>
                    )}
                  </div>
                  {emailSentNotice ? (
                    <p className="mt-3 font-mono text-[11px] text-fest-green">
                      ✓ Verification email sent to <b>{s.email}</b>! Click the link in your email inbox, then click <b>Check Status ↻</b>.
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-fest-label leading-relaxed">
                      Click to receive an official verification email link in your inbox.
                    </p>
                  )}
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
        <CTAButton variant="gradient" disabled={!canProceed || savingSignup} onClick={handleProceed}>
          {isCultural
            ? "PROCEED TO STEP 3 (PROFILE & APPAREL) →"
            : "PROCEED TO STEP 3 (GENERAL PROFILE) →"}
        </CTAButton>
      </motion.div>
    </motion.div>
  );
}
