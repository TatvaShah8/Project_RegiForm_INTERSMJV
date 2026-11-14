"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────────────────────
   INTER SMJV 2026 — shared form atoms
   Styled to match the reference app: dark navy panels, lavender
   uppercase labels, yellow→orange gradient CTAs, mono chips.
   ───────────────────────────────────────────────────────────── */

export function StepHeading({
  num,
  title,
  subtitle,
}: {
  num: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl uppercase leading-tight tracking-wide text-fest-orange md:text-4xl">
        {num} {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-fest-label">{subtitle}</p>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-fest-orange/70 via-white/80 to-transparent" />
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  error,
  right,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <label className="text-[11px] font-bold uppercase leading-snug tracking-[0.1em] text-fest-label">
          {label}
          {required && <span className="ml-1 text-fest-orange">*</span>}
          {hint && <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-fest-label/60">{hint}</span>}
        </label>
        {right}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const baseInput =
  "h-11 w-full rounded-xl border border-white/75 bg-white/40 backdrop-blur-xl px-4 text-sm text-fest-white shadow-[inset_0_2px_4px_rgba(28,36,56,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.9)] placeholder:font-mono placeholder:text-fest-label/50 transition-all hover:bg-white/60 hover:border-fest-orange/50 focus-visible:bg-white/80 focus-visible:border-fest-orange focus-visible:ring-4 focus-visible:ring-fest-orange/20 disabled:cursor-not-allowed disabled:opacity-60";

export function FestInput({
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { error?: boolean }) {
  return (
    <Input
      {...props}
      className={cn(
        baseInput,
        error && "border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25",
        !error && "border-white/75",
        className
      )}
    />
  );
}

/** Select trigger styled like the reference dropdowns. */
export const selectTriggerCls = (error?: boolean) =>
  cn(
    "h-11 w-full rounded-xl border bg-white/40 backdrop-blur-xl px-4 text-sm text-fest-white shadow-[inset_0_2px_4px_rgba(28,36,56,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.9)] transition-all hover:bg-white/60 focus-visible:bg-white/80 focus-visible:border-fest-orange focus-visible:ring-4 focus-visible:ring-fest-orange/20 [&>span]:text-fest-white",
    error ? "border-red-500/70" : "border-white/75"
  );

export function PillGroup({
  options,
  value,
  onChange,
  affix,
  ariaLabel,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  affix?: "check-plus";
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = value === o;
        return (
          <motion.button
            key={o}
            type="button"
            role="radio"
            aria-checked={active}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-xl border px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition backdrop-blur-md",
              active
                ? "border-transparent bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-lg shadow-fest-orange/25"
                : "border-white/75 bg-white/45 text-fest-label shadow-[0_4px_12px_rgba(28,36,56,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-fest-orange/60 hover:bg-white/70 hover:text-fest-white"
            )}
          >
            {o}
            {affix === "check-plus" && (active ? " ✓" : " +")}
          </motion.button>
        );
      })}
    </div>
  );
}

export function CTAButton({
  variant = "gradient",
  disabled,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant"> & {
  variant?: "gradient" | "dark" | "ghost";
}) {
  return (
    <Button
      {...props}
      disabled={disabled}
      className={cn(
        "h-12 rounded-xl px-6 font-display text-sm uppercase tracking-wider transition-all md:text-base",
        variant === "gradient" &&
          "bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-lg shadow-fest-orange/30 hover:brightness-110 active:scale-[0.98]",
        variant === "gradient" && disabled && "pointer-events-none border-fest-border bg-fest-panel2 from-fest-panel2 to-fest-panel2 text-fest-label opacity-70 shadow-none",
        variant === "dark" &&
          "border border-white/80 bg-white/60 backdrop-blur-md text-fest-label shadow-sm hover:border-fest-orange/60 hover:bg-white/80 hover:text-fest-white active:scale-[0.98]",
        variant === "ghost" && "text-fest-white underline-offset-4 hover:underline",
        className
      )}
    >
      {children}
    </Button>
  );
}

export function SectionLabel({
  emoji,
  title,
  right,
}: {
  emoji: string;
  title: string;
  right?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-fest-white/90">
        {emoji} {title}
      </span>
      {right && (
        <span className="rounded-md border border-white/80 bg-white/60 px-2 py-0.5 font-mono text-[10px] tracking-wider text-fest-label shadow-sm backdrop-blur-sm">
          {right}
        </span>
      )}
    </div>
  );
}

/** Entrance animation wrapper — staggers fields as each step mounts. */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export const staggerChild = {
  hidden: { y: 16, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};
