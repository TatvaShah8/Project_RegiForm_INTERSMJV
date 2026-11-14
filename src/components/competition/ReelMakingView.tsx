"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Film,
  Sparkles,
  Smartphone,
  Users,
  Clock,
  Languages,
  Share2,
  UploadCloud,
  ShieldAlert,
  ShieldCheck,
  Award,
  Flame,
  Wand2,
  Compass,
  Globe,
  UserCheck,
  CheckCircle2,
  Trophy,
  Calendar,
  Video,
} from "lucide-react";
import { REEL_COMPETITION, type ReelRule } from "@/lib/reel-competition";

const EASE = [0.22, 1, 0.36, 1] as const;

function getRuleIcon(iconName: string) {
  switch (iconName) {
    case "UserCheck":
      return <UserCheck className="h-4 w-4" />;
    case "Users":
      return <Users className="h-4 w-4" />;
    case "Clock":
      return <Clock className="h-4 w-4" />;
    case "Smartphone":
      return <Smartphone className="h-4 w-4" />;
    case "Sparkles":
      return <Sparkles className="h-4 w-4" />;
    case "Flame":
      return <Flame className="h-4 w-4" />;
    case "Compass":
      return <Compass className="h-4 w-4" />;
    case "Globe":
      return <Globe className="h-4 w-4" />;
    case "Wand2":
      return <Wand2 className="h-4 w-4" />;
    case "Share2":
      return <Share2 className="h-4 w-4" />;
    case "UploadCloud":
      return <UploadCloud className="h-4 w-4" />;
    case "ShieldAlert":
      return <ShieldAlert className="h-4 w-4" />;
    case "ShieldCheck":
      return <ShieldCheck className="h-4 w-4" />;
    case "Award":
      return <Award className="h-4 w-4" />;
    default:
      return <CheckCircle2 className="h-4 w-4" />;
  }
}

function getSpecIcon(icon: string) {
  switch (icon) {
    case "Smartphone":
      return <Smartphone className="h-5 w-5" />;
    case "Clock":
      return <Clock className="h-5 w-5" />;
    case "Users":
      return <Users className="h-5 w-5" />;
    case "Languages":
      return <Languages className="h-5 w-5" />;
    case "Share2":
      return <Share2 className="h-5 w-5" />;
    case "CalendarAlert":
      return <Calendar className="h-5 w-5" />;
    default:
      return <Video className="h-5 w-5" />;
  }
}

export function ReelMakingView() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const categories = [
    { id: "all", label: "ALL RULES (14)" },
    { id: "eligibility", label: "ELIGIBILITY" },
    { id: "format", label: "VIDEO & SPECS" },
    { id: "content", label: "CONTENT & THEME" },
    { id: "submission", label: "SUBMISSION" },
    { id: "fairplay", label: "FAIR PLAY" },
  ];

  const filteredRules = React.useMemo(() => {
    if (selectedCategory === "all") return REEL_COMPETITION.rules;
    return REEL_COMPETITION.rules.filter((r) => r.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-8 md:space-y-12">
      {/* ── Hero Presentation Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/90 via-white/70 to-fest-yellow/20 p-6 shadow-[0_20px_60px_rgba(28,36,56,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-10"
      >
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fest-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-fest-yellow/25 blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-fest-orange/40 bg-fest-orange/10 px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-fest-orange backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{REEL_COMPETITION.presenter}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl uppercase leading-tight tracking-wide text-fest-deep sm:text-4xl md:text-6xl">
            BEFORE THE GAME BEGINS, <br />
            <span className="fest-gradient-text">THE REEL BATTLE BEGINS!</span>
          </h1>

          <p className="mt-2 font-display text-base uppercase tracking-wider text-fest-orange sm:text-lg md:text-xl">
            {REEL_COMPETITION.title}
          </p>
          <p className="mt-1 font-mono text-xs font-bold tracking-[0.25em] text-fest-label uppercase sm:text-sm">
            {REEL_COMPETITION.subtitle}
          </p>
        </div>
      </motion.div>

      {/* ── Key Competition Specifications ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Video className="h-5 w-5 text-fest-orange" />
          <h2 className="font-display text-lg uppercase tracking-wide text-fest-deep sm:text-xl">
            QUICK SPECIFICATIONS
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {REEL_COMPETITION.quickSpecs.map((spec, i) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: EASE }}
              className="flex flex-col justify-between rounded-2xl border border-white/80 bg-white/60 p-3.5 shadow-sm backdrop-blur-xl transition hover:border-fest-orange/40 hover:bg-white/80"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9.5px] font-bold tracking-widest text-fest-label uppercase">
                  {spec.label}
                </span>
                <span className="text-fest-orange">{getSpecIcon(spec.icon)}</span>
              </div>
              <div className="mt-3">
                <p className="font-display text-sm uppercase leading-tight text-fest-deep sm:text-base">
                  {spec.value}
                </p>
                <p className="mt-0.5 font-mono text-[9px] text-fest-label">
                  {spec.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 14 Rules & Regulations Section ── */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-fest-orange" />
            <h2 className="font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
              RULES & REGULATIONS
            </h2>
          </div>
          <span className="rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
            14 OFFICIAL RULES
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/80 bg-white/50 p-1.5 shadow-xs backdrop-blur-xl">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 font-display text-[11px] uppercase tracking-wider transition ${
                  active
                    ? "bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-xs font-bold"
                    : "text-fest-label hover:bg-white/60 hover:text-fest-deep"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {filteredRules.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.03, ease: EASE }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition hover:border-fest-orange/50 hover:bg-white/90 hover:shadow-md md:p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fest-deep font-mono text-xs font-bold text-fest-yellow shadow-xs">
                      {r.number}
                    </span>
                    <span className="rounded-md border border-fest-orange/25 bg-fest-orange/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-fest-orange">
                      {r.badge}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/80 p-1.5 text-fest-label group-hover:text-fest-orange transition shadow-2xs">
                    {getRuleIcon(r.iconName)}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-base uppercase tracking-wide text-fest-deep group-hover:text-fest-orange transition">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-fest-label sm:text-sm">
                  {r.summary}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 100-Point Transparent Scorecard ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: EASE }}
        className="rounded-3xl border border-fest-orange/35 bg-white/60 p-5 shadow-[0_16px_48px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-fest-orange" />
              <h2 className="font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
                HOW WILL THE WINNER BE CHOSEN?
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-fest-label sm:text-sm">
              Every entry will be evaluated using a transparent 100-point scorecard. The focus is on creativity and the quality of the idea—not simply on who has the most followers.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-fest-orange/40 bg-gradient-to-r from-fest-yellow/20 to-fest-orange/20 px-4 py-2 text-fest-deep shadow-xs">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-fest-label">
              TOTAL SCORE:
            </span>
            <span className="font-display text-2xl text-fest-orange">100</span>
          </div>
        </div>

        {/* Scorecard Table / Grid */}
        <div className="mt-6 divide-y divide-fest-border/40 overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-xs">
          <div className="hidden grid-cols-12 bg-fest-deep/5 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label md:grid">
            <div className="col-span-4">JUDGING PARAMETER</div>
            <div className="col-span-6">WHAT THE JUDGES WILL LOOK FOR</div>
            <div className="col-span-2 text-right">MAX MARKS</div>
          </div>

          {REEL_COMPETITION.judgingScorecard.map((item, idx) => (
            <div
              key={item.parameter}
              className="grid grid-cols-1 items-center gap-2 p-3.5 transition hover:bg-fest-yellow/5 sm:p-4 md:grid-cols-12 md:gap-4"
            >
              <div className="flex items-center justify-between md:col-span-4 md:justify-start md:gap-2">
                <span className="font-display text-sm uppercase tracking-wide text-fest-deep sm:text-base">
                  {item.parameter}
                </span>
                <span className="rounded-full border border-fest-orange/30 bg-fest-orange/10 px-2 py-0.5 font-mono text-[10px] font-bold text-fest-orange md:hidden">
                  {item.marks} MARKS
                </span>
              </div>
              <div className="text-xs text-fest-label md:col-span-6 sm:text-sm">
                {item.whatJudgesLookFor}
              </div>
              <div className="hidden items-center justify-end md:col-span-2 md:flex">
                <span className="rounded-xl border border-fest-orange/30 bg-gradient-to-r from-fest-yellow/15 to-fest-orange/15 px-3 py-1 font-display text-sm font-bold text-fest-deep">
                  {item.marks} MARKS
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Fair Judging Guarantee */}
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs leading-relaxed text-blue-900 shadow-xs backdrop-blur-sm sm:text-sm">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-800">
                FAIR JUDGING GUARANTEE
              </p>
              <p className="mt-1">{REEL_COMPETITION.fairJudgingNote}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Competition Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: EASE }}
        className="rounded-3xl border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-2xl md:p-8"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-fest-orange" />
          <h2 className="font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
            UPDATED COMPETITION TIMELINE
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REEL_COMPETITION.timeline.map((event, i) => (
            <div
              key={event.title}
              className={`relative flex flex-col justify-between rounded-2xl border p-4.5 shadow-xs backdrop-blur-xl transition ${
                event.highlight
                  ? "border-fest-orange/60 bg-gradient-to-br from-fest-yellow/20 via-white/80 to-fest-orange/20 shadow-fest-orange/10"
                  : "border-white/80 bg-white/70 hover:bg-white/90"
              }`}
            >
              <div>
                <span
                  className={`inline-block rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
                    event.highlight
                      ? "bg-red-500/15 border border-red-500/30 text-red-700"
                      : "bg-fest-deep/10 text-fest-deep"
                  }`}
                >
                  {event.date}
                </span>
                <h3 className="mt-2.5 font-display text-sm uppercase tracking-wide text-fest-deep sm:text-base">
                  {event.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-fest-label">
                  {event.description}
                </p>
              </div>
              <div className="mt-4 font-mono text-[9px] text-fest-label/60">
                PHASE 0{i + 1}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Inspiring Closing Callout ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: EASE }}
        className="rounded-3xl border-2 border-fest-orange/50 bg-gradient-to-r from-fest-yellow/25 via-fest-orange/20 to-fest-orange/30 p-6 text-center shadow-lg shadow-fest-orange/15 backdrop-blur-2xl md:p-10"
      >
        <p className="font-display text-lg uppercase tracking-wider text-fest-deep sm:text-2xl md:text-3xl">
          {REEL_COMPETITION.quoteBanner.primary}
        </p>
        <p className="mt-2 font-display text-base uppercase tracking-widest text-fest-orange sm:text-xl md:text-2xl">
          {REEL_COMPETITION.quoteBanner.secondary}
        </p>
        <div className="mx-auto mt-4 max-w-xl rounded-xl border border-white/70 bg-white/75 p-3 font-mono text-[10.5px] text-fest-label shadow-xs backdrop-blur-sm sm:text-xs">
          📢 {REEL_COMPETITION.quoteBanner.notice}
        </div>
      </motion.div>
    </div>
  );
}
