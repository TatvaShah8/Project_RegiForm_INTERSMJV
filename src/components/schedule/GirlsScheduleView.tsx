"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Download, ShieldCheck, Sparkles } from "lucide-react";
import {
  GIRLS_SCHEDULE,
  GIRLS_BYES,
  TEAM_COLORS,
  type ScheduleMatch,
  type ScheduleSport,
} from "@/lib/schedule";
import { SPORT_ICONS } from "@/components/landing/SportsIcons";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { useRegister } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;

function getTeamColor(teamName: string): string {
  const clean = teamName.replace(/\s*\([^)]*\)/g, "").trim();
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (
      clean.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(clean.toLowerCase())
    ) {
      return color;
    }
  }
  return "#D97706";
}

export function GirlsScheduleView({
  onSwitchToRules,
  onProceed,
}: {
  onSwitchToRules: () => void;
  onProceed: () => void;
}) {
  const s = useRegister();
  const isLoggedIn = s._hasHydrated && s.completed && !!s.firstName;
  const [activeDay, setActiveDay] = React.useState(0);
  const day = GIRLS_SCHEDULE[activeDay] ?? GIRLS_SCHEDULE[0];

  return (
    <SectionErrorBoundary name="Girls Schedule Engine">
      {/* ── Official Byes Summary Banner (Page 4) ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mb-8 overflow-hidden rounded-2xl border border-fest-orange/30 bg-gradient-to-br from-white/70 via-white/50 to-fest-orange/10 p-5 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fest-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-fest-orange/30 bg-fest-orange/10 text-fest-orange shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-sm uppercase tracking-wider text-fest-deep md:text-base">
                Official Tournament Byes (Seeding Distribution)
              </h3>
              <p className="font-mono text-xs text-fest-label">
                Seeded teams advance directly into Semifinal 1 for their designated sport.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-fest-orange/35 bg-white/70 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange shadow-sm">
            5 TEAMS · 9 SPORTS · OFFICIAL DRAW
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {GIRLS_BYES.map((b) => (
            <div
              key={b.team}
              className="flex items-center justify-between rounded-xl border border-white/75 bg-white/55 px-3.5 py-2.5 shadow-sm backdrop-blur-md transition hover:border-fest-orange/40 hover:bg-white/80"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: b.color }}
                />
                <div>
                  <div className="font-display text-xs uppercase tracking-wide text-fest-deep">
                    {b.team}
                  </div>
                  <div className="font-mono text-[11px] text-fest-label">
                    {b.branch} Branch
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-bold text-fest-orange">
                  {b.sports.join(" & ")}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-fest-label">
                  Bye Seed
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Day selector ── */}
      <div className="sticky top-[57px] z-30 mb-8 flex justify-center md:top-[65px]">
        <div className="flex gap-1.5 rounded-2xl border border-white/80 bg-white/50 p-1.5 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180 md:gap-2">
          {GIRLS_SCHEDULE.map((d, i) => {
            const active = i === activeDay;
            return (
              <button
                key={d.day}
                onClick={() => setActiveDay(i)}
                className={`relative rounded-xl px-4 py-2.5 text-center transition md:px-6 md:py-3 ${
                  active ? "text-fest-ink" : "text-fest-label hover:text-fest-deep"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dayTabGirls"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange shadow-md shadow-fest-orange/25"
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  />
                )}
                <span className="relative block font-display text-sm uppercase tracking-wide md:text-base">
                  {d.day}
                </span>
                <span
                  className={`relative block font-mono text-xs tracking-wide ${
                    active ? "text-fest-ink/80" : "text-fest-label"
                  }`}
                >
                  {d.date}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Day content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`girls-day-${activeDay}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {/* Day label */}
          <div className="mb-5 flex items-center justify-center gap-3 text-center">
            <span className="h-px w-12 bg-fest-border md:w-20" />
            <span
              className="font-mono text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: "#B45309" }}
            >
              {day.label} · GIRLS DIVISION
            </span>
            <span className="h-px w-12 bg-fest-border md:w-20" />
          </div>

          {/* Sport fixture cards */}
          <div className="space-y-4 md:space-y-5">
            {day.sports.map((sport, sIdx) => (
              <SectionErrorBoundary
                key={`girls-${sport.name}-${sIdx}`}
                name={`${sport.name} Fixtures`}
              >
                <SportSection sport={sport} index={sIdx} />
              </SectionErrorBoundary>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Quick links & CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
        className="mt-10 overflow-hidden rounded-2xl border border-fest-orange/30 bg-gradient-to-br from-fest-orange/10 via-white/70 to-fest-yellow/10 p-6 text-center shadow-[0_16px_40px_rgba(217,119,6,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:mt-12 md:p-8"
      >
        <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep md:text-2xl">
          Ready to Represent Your Branch?
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-fest-label">
          Choose your sports quota (2 Outdoor + 1 Indoor, or 1 Outdoor + 2 Indoor) and secure your official digital pass.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onSwitchToRules}
            className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-5 py-3 font-display text-xs uppercase tracking-wider text-fest-deep shadow-sm backdrop-blur-md transition hover:border-fest-orange/50 hover:bg-white"
          >
            <BookOpen className="h-4 w-4 text-fest-orange" />
            <span>VIEW GIRLS RULES (9 DISCIPLINES)</span>
          </button>
          <a
            href="/rule-books-and-schedules/girls-tournament-schedule.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-fest-orange/30 bg-white/75 px-5 py-3 font-display text-xs uppercase tracking-wider text-fest-orange shadow-sm backdrop-blur-md transition hover:border-fest-orange/60 hover:bg-white"
          >
            <Download className="h-4 w-4 text-fest-orange" />
            <span>DOWNLOAD GIRLS SCHEDULE (PDF)</span>
          </a>
          {!isLoggedIn && (
            <button
              onClick={onProceed}
              className="animate-cta-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow via-fest-orange to-fest-orange px-6 py-3 font-display text-xs uppercase tracking-wider text-fest-ink shadow-lg shadow-fest-orange/30 transition hover:brightness-110 active:scale-95"
            >
              PROCEED TO REGISTRATION
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    </SectionErrorBoundary>
  );
}

function SportSection({
  sport,
  index,
}: {
  sport: ScheduleSport;
  index: number;
}) {
  const Icon = SPORT_ICONS[sport.name];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.45, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-white/80 bg-white/50 shadow-[0_16px_40px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180"
    >
      {/* Sport Header */}
      <div className="flex items-center gap-3 border-b border-fest-border/60 bg-white/40 px-4 py-3 backdrop-blur-md md:px-5">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-fest-orange/20 bg-fest-orange/10 text-fest-orange backdrop-blur-sm md:h-10 md:w-10">
            <Icon />
          </span>
        ) : (
          <span className="text-xl">{sport.emoji}</span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base uppercase tracking-wide text-fest-deep md:text-lg">
            {sport.name}
          </h2>
          <p className="font-mono text-xs tracking-wide text-fest-label">
            {sport.matches.length} {sport.matches.length === 1 ? "fixture" : "fixtures"}
          </p>
        </div>
        <span className="rounded-md border border-white/80 bg-white/60 px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-fest-orange shadow-sm backdrop-blur-sm">
          {sport.matches.length} MATCH{sport.matches.length > 1 ? "ES" : ""}
        </span>
      </div>

      {/* Match rows */}
      <div className="divide-y divide-fest-border/60">
        {sport.matches.map((m, mIdx) => (
          <MatchRow key={mIdx} match={m} />
        ))}
      </div>
    </motion.div>
  );
}

function MatchRow({ match }: { match: ScheduleMatch }) {
  const hasMultiple = match.pairings.length > 1;

  return (
    <div className="px-4 py-3 md:px-5 md:py-4">
      <div className="mb-2 flex items-center gap-2 md:gap-3">
        <span className="shrink-0 rounded-md bg-fest-deep px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-fest-yellow md:text-sm">
          {match.no}
        </span>
        <span className="font-mono text-sm font-bold tracking-wide" style={{ color: "#B45309" }}>
          {match.time}
        </span>
        {hasMultiple && (
          <span className="ml-auto rounded-full border border-fest-orange/30 bg-fest-orange/5 px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-fest-orange">
            CONCURRENT ×{match.pairings.length}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {match.pairings.map((p, pIdx) => {
          const isVs = p.label.includes(" VS ");
          if (!isVs) {
            return (
              <div
                key={pIdx}
                className="flex items-center gap-2 rounded-lg border border-fest-border/60 bg-fest-inner/50 px-3 py-2 text-sm font-bold text-fest-deep"
              >
                <span className="h-2 w-2 rounded-full bg-fest-orange" />
                <span className="font-display tracking-wide">{p.label}</span>
              </div>
            );
          }

          const [teamA, teamB] = p.label.split(" VS ");
          const colorA = getTeamColor(teamA);
          const colorB = getTeamColor(teamB);
          const isByeA = teamA.includes("(Bye)");
          const isByeB = teamB.includes("(Bye)");

          return (
            <div
              key={pIdx}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/70 bg-white/40 px-3 py-2 text-xs md:text-sm"
            >
              <div className="flex items-center gap-2 font-bold text-fest-deep">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorA }} />
                <span>{teamA}</span>
                {isByeA && (
                  <span className="rounded bg-fest-yellow/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-fest-deep">
                    BYE
                  </span>
                )}
              </div>

              <span className="rounded-full bg-fest-orange/10 px-2 py-0.5 font-mono text-[10px] font-bold text-fest-orange">
                VS
              </span>

              <div className="flex items-center gap-2 font-bold text-fest-deep">
                <span>{teamB}</span>
                {isByeB && (
                  <span className="rounded bg-fest-yellow/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-fest-deep">
                    BYE
                  </span>
                )}
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorB }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
