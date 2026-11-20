"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Award, Info, AlertTriangle, Clock, Download, BookOpen, Users } from "lucide-react";
import { BOYS_RULES, GIRLS_RULES, type RuleDetail } from "@/lib/rules";
import { SPORT_ICONS } from "@/components/landing/SportsIcons";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { useRegister } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;

export function RulesView({
  gender,
  onProceed,
}: {
  gender: "boys" | "girls";
  onProceed: () => void;
}) {
  const s = useRegister();
  const isLoggedIn = s._hasHydrated && s.completed && !!s.firstName;
  const rules = gender === "boys" ? BOYS_RULES : GIRLS_RULES;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── Official PDF Download Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-fest-orange/35 bg-white/55 p-4 shadow-[0_8px_24px_rgba(217,119,6,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 text-fest-orange border border-fest-orange/25">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-fest-deep md:text-base">
              OFFICIAL {gender.toUpperCase()} SPORTS RULEBOOK
            </h3>
            <p className="font-mono text-xs text-fest-label">
              Official circular published by SMJV Vadodara Organizing Committee
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={rules.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/25 transition hover:brightness-110 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>DOWNLOAD {gender.toUpperCase()} RULES (PDF)</span>
          </a>
        </div>
      </motion.div>

      {/* ── Quota Rule Highlight Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="rounded-3xl border border-fest-orange/40 bg-gradient-to-br from-fest-orange/15 via-white/50 to-fest-yellow/15 p-5 shadow-[0_12px_36px_rgba(217,119,6,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fest-orange/20 text-fest-orange">
              <Award className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-fest-orange">
              OFFICIAL PARTICIPATION QUOTA RULE
            </span>
          </div>
          <span className="rounded-full border border-fest-orange/40 bg-white/70 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-fest-deep shadow-sm backdrop-blur-md">
            EXACTLY 3 SPORTS
          </span>
        </div>
        <p className="mt-4 text-base font-medium leading-relaxed text-fest-deep md:text-lg">
          {rules.quotaRule}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-fest-label">
          <span className="rounded-lg border border-white/80 bg-white/60 px-3 py-1.5 shadow-sm">
            Option A: 2 Outdoor + 1 Indoor
          </span>
          <span className="rounded-lg border border-white/80 bg-white/60 px-3 py-1.5 shadow-sm">
            Option B: 1 Outdoor + 2 Indoor
          </span>
          <span className="rounded-lg border border-white/80 bg-white/60 px-3 py-1.5 text-fest-alert shadow-sm">
            Maximum 2 sports in any single category
          </span>
        </div>
      </motion.div>

      {/* ── General Eligibility & ID Cards ── */}
      <div className="grid gap-5 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45, ease: EASE }}
          className="rounded-2xl border border-white/80 bg-white/50 p-5 shadow-[0_12px_30px_rgba(28,36,56,0.04),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-6"
        >
          <div className="flex items-center gap-2.5 text-fest-deep">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fest-teal/15 text-fest-teal">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base uppercase tracking-wide md:text-lg">
              Eligibility & Verification
            </h3>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-fest-label md:text-sm">
            {rules.eligibility.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-fest-orange" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: EASE }}
          className="rounded-2xl border border-white/80 bg-white/50 p-5 shadow-[0_12px_30px_rgba(28,36,56,0.04),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-6"
        >
          <div className="flex items-center gap-2.5 text-fest-deep">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fest-yellow/20 text-fest-orange">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base uppercase tracking-wide md:text-lg">
              Fair Play & Code of Conduct
            </h3>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-fest-label md:text-sm">
            {rules.codeOfConduct.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-fest-yellow" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Sport Specific Rule Cards ── */}
      <div className="space-y-4 md:space-y-5">
        <div className="flex items-center justify-between border-b border-fest-border/70 pb-3">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-fest-label">
            SPORT-BY-SPORT SPECIFIC RULES ({rules.sportsRules.length} DISCIPLINES)
          </span>
          <span className="rounded-md border border-white/80 bg-white/60 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange shadow-sm backdrop-blur-sm">
            {gender.toUpperCase()} DIVISION
          </span>
        </div>

        {rules.sportsRules.map((sport, index) => (
          <SectionErrorBoundary key={`${gender}-${sport.sport}-${index}`} name={`${sport.sport} Rules`}>
            <SportRuleCard sport={sport} index={index} />
          </SectionErrorBoundary>
        ))}
      </div>

      {/* ── Bottom CTA (hidden if logged in / registered) ── */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
          className="mt-10 overflow-hidden rounded-3xl border border-fest-orange/30 bg-gradient-to-br from-fest-orange/10 via-white/60 to-fest-yellow/10 p-6 text-center shadow-[0_16px_40px_rgba(217,119,6,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:mt-12 md:p-8"
        >
          <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep md:text-2xl">
            Understood the Rules?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm sm:text-base font-medium text-fest-deep">
            Complete your registration, select your sports according to the quota, and generate your official pass.
          </p>
          <button
            onClick={onProceed}
            className="animate-cta-glow mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow via-fest-orange to-fest-orange px-8 py-4 font-display text-base uppercase tracking-wider text-fest-ink shadow-xl shadow-fest-orange/30 transition hover:brightness-110 active:scale-95 md:px-10 md:py-4.5 md:text-lg"
          >
            PROCEED TO REGISTRATION
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

function SportRuleCard({ sport, index }: { sport: RuleDetail; index: number }) {
  const Icon = SPORT_ICONS[sport.sport] || SPORT_ICONS["CRICKET"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.45, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-white/80 bg-white/50 shadow-[0_12px_36px_rgba(28,36,56,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180"
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fest-border/60 bg-white/40 px-4 py-3.5 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-fest-orange/20 bg-fest-orange/10 text-fest-orange shadow-sm backdrop-blur-sm md:h-11 md:w-11">
            {Icon ? <Icon /> : <span className="text-xl">{sport.emoji}</span>}
          </span>
          <div>
            <h4 className="font-display text-lg uppercase tracking-wide text-fest-deep md:text-xl">
              {sport.sport}
            </h4>
            <p className="font-mono text-xs tracking-wide text-fest-label">{sport.tag}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sport.squad && (
            <div className="flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/60 px-2.5 py-1 font-mono text-xs font-semibold text-fest-deep shadow-sm backdrop-blur-sm">
              <Users className="h-3.5 w-3.5 text-fest-teal" />
              <span>{sport.squad}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/60 px-3 py-1 font-mono text-xs font-bold text-fest-orange shadow-sm backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>{sport.duration}</span>
          </div>
        </div>
      </div>

      {/* rule points */}
      <div className="p-4 md:p-6">
        <ul className="space-y-2.5">
          {sport.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-fest-label md:text-sm">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-fest-orange/15 font-mono text-[10px] font-bold text-fest-orange">
                {idx + 1}
              </span>
              <span className="text-fest-deep/90">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
