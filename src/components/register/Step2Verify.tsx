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
  Field,
  CTAButton,
  staggerParent,
  staggerChild,
} from "./ui-bits";

function VerifyCard({
  channel,
}: {
  channel: "email" | "mobile";
}) {
  const s = useRegister();
  const { toast } = useToast();
  const isEmail = channel === "email";
  const verified = isEmail ? s.emailVerified : s.mobileVerified;
  const code = isEmail ? s.emailCode : s.mobileCode;
  const otp = isEmail ? s.emailOtp : s.mobileOtp;
  const setOtp = (v: string) => s.set(isEmail ? "emailOtp" : "mobileOtp", v);
  const dest = isEmail ? s.email : `+91 ${s.mobile}`;
  const title = isEmail ? "📧 EMAIL VERIFICATION" : "📱 MOBILE VERIFICATION";
  const successToast = isEmail ? "EMAIL VERIFIED" : "MOBILE VERIFIED";
  const successMsg = isEmail
    ? "Email verified and linked to student account."
    : "Mobile number verified successfully!";

  const tryVerify = () => {
    const ok = s.verifyOtp(channel, otp);
    if (ok) {
      toast({ title: successToast, description: successMsg });
    } else {
      toast({
        title: "INVALID CODE",
        description: `That doesn't match the ${isEmail ? "email" : "mobile"} code. Try again or fill the sample code.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-colors backdrop-blur-xl",
        verified ? "border-fest-green/50 bg-fest-green/[0.12]" : "border-white/80 bg-white/45 shadow-[0_8px_24px_rgba(28,36,56,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-fest-white/90">
          {title}
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest",
            verified
              ? "border-fest-green/40 bg-fest-green/15 text-fest-mint"
              : "border-fest-yellow/40 bg-fest-yellow/10 text-fest-yellow"
          )}
        >
          {verified ? "VERIFIED ✓" : "PENDING"}
        </span>
      </div>

      <p className="mt-3 font-mono text-sm text-fest-white/90">{dest || "—"}</p>
      <p className={cn("mt-1 text-xs", verified ? "text-fest-mint" : "text-fest-label/80")}>
        {verified
          ? isEmail
            ? "✓ Verified and linked to student account."
            : "✓ Mobile number authenticated."
          : "Waiting for the 6-digit code…"}
      </p>

      {!verified && (
        <>
          <div className="mt-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-start"
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-10 w-10 border-white/80 bg-white/45 backdrop-blur-md text-fest-white shadow-[inset_0_2px_4px_rgba(28,36,56,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] first:rounded-l-lg last:rounded-r-lg data-[active=true]:border-fest-orange data-[active=true]:ring-4 data-[active=true]:ring-fest-orange/20"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CTAButton
              variant="gradient"
              disabled={otp.length < 6}
              onClick={tryVerify}
              className="h-10 px-5"
            >
              VERIFY
            </CTAButton>
            <button
              type="button"
              onClick={() => setOtp(code)}
              className="font-mono text-[11px] text-fest-yellow underline underline-offset-4 transition hover:text-fest-gold"
            >
              Fill sample code ({code})
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Step2Verify({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const s = useRegister();
  const { toast } = useToast();
  const both = s.emailVerified && s.mobileVerified;

  const quickVerifyBoth = () => {
    s.set("emailVerified", true);
    s.set("mobileVerified", true);
    toast({
      title: "VERIFIED ✓",
      description: "Email and mobile both authenticated.",
    });
  };

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show">
      <motion.div variants={staggerChild}>
        <StepHeading
          num="02"
          title="Verify Email & Mobile Number"
          subtitle="We take student security seriously. Please verify your contact information to activate your portal pass."
        />
      </motion.div>

      {/* simulator panel */}
      <motion.div
        variants={staggerChild}
        className="rounded-2xl border border-fest-orange/30 bg-gradient-to-r from-fest-orange/[0.08] to-fest-yellow/[0.08] p-5 shadow-sm backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-fest-yellow">
            🔔 Security Verification Simulator
          </span>
          <CTAButton
            variant="dark"
            onClick={quickVerifyBoth}
            className="h-10 border-fest-yellow/40 bg-fest-yellow/10 px-4 text-fest-yellow hover:border-fest-yellow hover:bg-fest-yellow/20 hover:text-fest-ink"
          >
            ⚡ QUICK VERIFY BOTH
          </CTAButton>
        </div>
        <p className="mt-3 text-sm text-fest-label">
          Simulated OTPs sent:{" "}
          <span className="rounded-md border border-white/80 bg-white/70 px-2 py-1 font-mono text-xs text-fest-gold shadow-sm backdrop-blur-sm">
            Email Code: {s.emailCode}
          </span>{" "}
          <span className="rounded-md border border-white/80 bg-white/70 px-2 py-1 font-mono text-xs text-fest-gold shadow-sm backdrop-blur-sm">
            Mobile Code: {s.mobileCode}
          </span>
        </p>
      </motion.div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <motion.div variants={staggerChild}>
          <VerifyCard channel="email" />
        </motion.div>
        <motion.div variants={staggerChild}>
          <VerifyCard channel="mobile" />
        </motion.div>
      </div>

      <motion.div variants={staggerChild} className="mt-8 flex items-center justify-between gap-3">
        <CTAButton variant="dark" onClick={onBack}>
          ← BACK
        </CTAButton>
        <CTAButton variant="gradient" disabled={!both} onClick={onNext}>
          PROCEED TO GENERAL QUESTIONS →
        </CTAButton>
      </motion.div>
    </motion.div>
  );
}
