"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useRegister, type Gender } from "@/lib/store";
import { isEmail, isPhone } from "@/lib/fest";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  StepHeading,
  Field,
  FestInput,
  CTAButton,
  staggerParent,
  staggerChild,
} from "./ui-bits";

const GENDERS: { key: Gender; label: string; emoji: string }[] = [
  { key: "MALE", label: "MALE", emoji: "🧑" },
  { key: "FEMALE", label: "FEMALE", emoji: "👩" },
];

export function Step1Account({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack?: () => void;
}) {
  const s = useRegister();
  const { toast } = useToast();
  const [errs, setErrs] = React.useState<Record<string, string>>({});
  const [showPw, setShowPw] = React.useState(false);

  const setErr = (k: string, v?: string) =>
    setErrs((e) => {
      const n = { ...e };
      if (v) n[k] = v;
      else delete n[k];
      return n;
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!s.firstName.trim()) e.firstName = "First name is required";
    if (!s.surname.trim()) e.surname = "Surname is required";
    if (!isEmail(s.email)) e.email = "Enter a valid email address";
    if (!s.emailVerified && s.password.length < 6) e.password = "Minimum 6 characters";
    if (!isPhone(s.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!s.grNo.trim()) e.grNo = "G.R. No. is required";
    if (!s.gender) e.gender = "Select a category";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast({
        title: "MISSING REQUIRED FIELDS",
        description: "Please complete the highlighted fields to proceed.",
        variant: "destructive",
      });
      return;
    }
    onNext();
  };

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show">
      {onBack && (
        <motion.div variants={staggerChild} className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-fest-orange/40 bg-white/70 px-3.5 py-1.5 font-mono text-xs font-semibold text-fest-deep shadow-xs backdrop-blur-md transition hover:border-fest-orange hover:bg-white active:scale-95"
          >
            ← Change Participation Team
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-xs font-bold uppercase text-fest-orange">
            {s.role === "cultural" ? "🎭 Cultural Team" : "⚡ Sports Team"}
          </span>
        </motion.div>
      )}

      <motion.div variants={staggerChild}>
        <StepHeading
          num="01"
          title="Account Setup & Personal Identity"
          subtitle="Please provide your fundamental details. We will verify your email in the next step."
        />

        {s.emailVerified && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-fest-green/50 bg-fest-green/10 p-3.5 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fest-green text-sm font-bold text-fest-ink">
                ✓
              </span>
              <div>
                <p className="font-display text-xs uppercase tracking-wide text-fest-deep">
                  Email Authenticated: <span className="font-mono text-fest-orange">{s.email}</span>
                </p>
                <p className="text-[11px] text-fest-label">
                  Email verified. Please fill your official name and details manually below for certificate generation.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-fest-green/40 bg-fest-green/20 px-2.5 py-1 font-mono text-[10px] font-bold text-fest-mint">
              VERIFIED ✓
            </span>
          </div>
        )}
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        <motion.div variants={staggerChild}>
          <Field label="FIRST NAME" required error={errs.firstName}>
            <FestInput
              error={!!errs.firstName}
              placeholder="e.g. Aarav"
              value={s.firstName}
              onChange={(e) => {
                s.set("firstName", e.target.value);
                setErr("firstName");
              }}
            />
          </Field>
        </motion.div>
        <motion.div variants={staggerChild}>
          <Field label="MIDDLE NAME">
            <FestInput
              placeholder="e.g. Rajeshbhai"
              value={s.middleName}
              onChange={(e) => s.set("middleName", e.target.value)}
            />
          </Field>
        </motion.div>
        <motion.div variants={staggerChild}>
          <Field label="SURNAME" required error={errs.surname}>
            <FestInput
              error={!!errs.surname}
              placeholder="e.g. Mehta"
              value={s.surname}
              onChange={(e) => {
                s.set("surname", e.target.value);
                setErr("surname");
              }}
            />
          </Field>
        </motion.div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <motion.div variants={staggerChild}>
          <Field label="EMAIL ID (FOR VERIFICATION & LOGIN)" required error={errs.email}>
            <FestInput
              error={!!errs.email}
              type="email"
              inputMode="email"
              placeholder="aarav.mehta@smjv.edu"
              value={s.email}
              onChange={(e) => {
                s.set("email", e.target.value);
                s.set("emailVerified", false);
                setErr("email");
              }}
            />
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field
            label="PASSWORD (EMAIL SIGN-IN)"
            required
            error={errs.password}
            right={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-fest-yellow transition hover:text-fest-gold"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPw ? "HIDE" : "SHOW"}
              </button>
            }
          >
            <FestInput
              error={!!errs.password}
              type={showPw ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={s.password}
              onChange={(e) => {
                s.set("password", e.target.value);
                setErr("password");
              }}
            />
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="MOBILE NUMBER (CONTACT)" required error={errs.mobile}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-fest-yellow">
                +91
              </span>
              <FestInput
                error={!!errs.mobile}
                inputMode="numeric"
                maxLength={10}
                className="pl-14"
                placeholder="98250 40142"
                value={s.mobile}
                onChange={(e) => {
                  s.set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10));
                  setErr("mobile");
                }}
              />
            </div>
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="HOSTEL G.R. NO. (STUDENT ROLL NUMBER)" required error={errs.grNo}>
            <FestInput
              error={!!errs.grNo}
              className="font-mono"
              placeholder="e.g. SMJV26-0142"
              value={s.grNo}
              onChange={(e) => {
                s.set("grNo", e.target.value.toUpperCase());
                setErr("grNo");
              }}
            />
          </Field>
        </motion.div>
      </div>

      <motion.div variants={staggerChild} className="mt-5">
        <Field
          label="GENDER (DETERMINES SPORTS CATEGORIES)"
          required
          error={errs.gender}
        >
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Gender">
            {GENDERS.map((g) => {
              const active = s.gender === g.key;
              return (
                <motion.button
                  key={g.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    s.set("gender", g.key);
                    setErr("gender");
                  }}
                  className={cn(
                    "rounded-2xl border px-5 py-4 text-left transition",
                    active
                      ? "border-transparent bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-lg shadow-fest-orange/25"
                      : "border border-white/80 bg-white/40 text-fest-label shadow-[0_6px_20px_rgba(28,36,56,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-xl hover:border-fest-orange/60 hover:bg-white/65 hover:text-fest-white"
                  )}
                >
                  <span className="text-sm font-bold uppercase tracking-widest">{g.label}</span>
                </motion.button>
              );
            })}
          </div>
        </Field>
      </motion.div>

      <motion.div variants={staggerChild} className="mt-8 flex justify-end">
        <CTAButton variant="gradient" onClick={submit}>
          PROCEED TO VERIFICATION →
        </CTAButton>
      </motion.div>
    </motion.div>
  );
}
