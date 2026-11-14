"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { BOYS_SCHEDULE, TEAM_COLORS, type ScheduleMatch, type ScheduleSport } from "@/lib/schedule";
import { SPORT_ICONS } from "@/components/landing/SportsIcons";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { useRegister } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;

export function BoysScheduleView({
  onProceed,
}: {
  onProceed: () => void;
}) {
  const s = useRegister();
  const isLoggedIn = s._hasHydrated && s.completed && !!s.firstName;
  const [activeDay, setActiveDay] = React.useState(0);
  const day = BOYS_SCHEDULE[activeDay] ?? BOYS_SCHEDULE[0];

  return (
    <SectionErrorBoundary name="Boys Schedule Engine">
      {/* ── Day selector ── */}
      <div className="sticky top-[57px] z-30 mb-8 flex justify-center md:top-[65px]">
        <div className="flex gap-1.5 rounded-2xl border border-white/80 bg-white/50 p-1.5 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180 md:gap-2">
          {BOYS_SCHEDULE.map((d, i) => {
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
                    layoutId="dayTabBoys"
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
          key={`boys-day-${activeDay}`}
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
              style={{ color: "#0D7377" }}
            >
              {day.label} · BOYS DIVISION
            </span>
            <span className="h-px w-12 bg-fest-border md:w-20" />
          </div>

          {/* Sport fixture cards */}
          <div className="space-y-4 md:space-y-5">
            {day.sports.map((sport, sIdx) => (
              <SectionErrorBoundary
                key={`boys-${sport.name}-${sIdx}`}
                name={`${sport.name} Fixtures`}
              >
                <SportSection sport={sport} index={sIdx} />
              </SectionErrorBoundary>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Proceed to registration CTA (hidden if registered / logged in) ── */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
          className="mt-10 overflow-hidden rounded-2xl border border-fest-orange/30 bg-gradient-to-br from-fest-orange/10 via-white/70 to-fest-yellow/10 p-6 text-center shadow-[0_16px_40px_rgba(217,119,6,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:mt-12 md:p-8"
        >
          <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep md:text-2xl">
            Ready to Compete?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-fest-label">
            Pick your sport, choose your events, and register your team for INTER SMJV 2026.
          </p>
          <button
            onClick={onProceed}
            className="animate-cta-glow mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow via-fest-orange to-fest-orange px-8 py-4 font-display text-base uppercase tracking-wider text-fest-ink shadow-xl shadow-fest-orange/30 transition hover:brightness-110 active:scale-95 md:px-10 md:py-5 md:text-lg"
          >
            PROCEED TO REGISTRATION
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      )}
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
      transition={{ delay: 0.05 * index, duration: 0.45, ease: EASE }}
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
        <span className="font-mono text-sm font-bold tracking-wide" style={{ color: "#0D7377" }}>
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
          const colorA = TEAM_COLORS[teamA] ?? "#D97706";
          const colorB = TEAM_COLORS[teamB] ?? "#0D7377";

          return (
            <div
              key={pIdx}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/70 bg-white/40 px-3 py-2 text-xs md:text-sm"
            >
              <div className="flex items-center gap-2 font-bold text-fest-deep">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorA }} />
                <span>{teamA}</span>
              </div>

              <span className="rounded-full bg-fest-orange/10 px-2 py-0.5 font-mono text-[10px] font-bold text-fest-orange">
                VS
              </span>

              <div className="flex items-center gap-2 font-bold text-fest-deep">
                <span>{teamB}</span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorB }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
