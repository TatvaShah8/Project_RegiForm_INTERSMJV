"use client";

import * as React from "react";

import { AnimatePresence, motion } from "framer-motion";

import { ArrowLeft, ArrowRight, Calendar, MapPin, BookOpen, Clock, Download, ShieldCheck } from "lucide-react";

import { BOYS_SCHEDULE, GIRLS_SCHEDULE, GIRLS_BYES, TEAM_COLORS, type ScheduleMatch } from "@/lib/schedule";

import { SPORT_ICONS } from "@/components/landing/SportsIcons";

import { RulesView } from "./RulesView";

import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

/* ─────────────────────────────────────────────────────────────

   SMJV YOUTH FESTIVAL 2026 — Tournament Schedule & Rules View

   Features:

   - Horizontal top navigation bar: Rules | Schedule | Register

   - Secondary gender toggle: Boys | Girls (Boys selected by default)

   - Dynamic 3-day fixture view for Boys & Girls divisions

   - Full tournament rulebook and sports quota regulations

   ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

type NavTab = "rules" | "schedule" | "register";

type GenderTab = "boys" | "girls";

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

export function ScheduleView({ onProceed, onBack }: { onProceed: () => void; onBack: () => void }) {

  const [navTab, setNavTab] = React.useState<NavTab>("schedule");

  const [gender, setGender] = React.useState<GenderTab>("boys");

  const [activeDay, setActiveDay] = React.useState(0);

  const currentSchedule = gender === "boys" ? BOYS_SCHEDULE : GIRLS_SCHEDULE;

  const day = currentSchedule[activeDay] ?? currentSchedule[0];

  return (

    <div className="flex min-h-[100dvh] w-full flex-col">

      {/* header bar */}

      <header className="sticky top-0 z-40 border-b border-white/75 bg-white/55 shadow-[0_4px_30px_rgba(28,36,56,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-180">

        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">

          <button

            onClick={onBack}

            className="flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/50 px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-fest-label shadow-sm backdrop-blur-md transition hover:border-fest-orange/50 hover:bg-white/75 hover:text-fest-deep"

          >

            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">BACK</span>

          </button>

          <span className="flex items-center gap-2.5 font-display text-lg uppercase tracking-wide text-fest-deep md:text-xl">


            <img


              src="/logo.jpg"


              alt="SMJV Youth Festival 2026 Logo"


              className="h-8 w-8 rounded-full border border-fest-orange/30 object-cover shadow-sm md:h-9 md:w-9"


            />


            <span>


              SMJV YOUTH FESTIVAL <span className="fest-gradient-text">2026</span>


            </span>


          </span>

          <button

            onClick={onProceed}

            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-fest-yellow to-fest-orange px-3.5 py-1.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-95 md:px-4"

          >

            REGISTER

            <ArrowRight className="h-4 w-4" />

          </button>

        </div>

      </header>

      {/* main content */}

      <main className="fest-scroll mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-6 md:py-12">

        {/* ── Primary Top Navigation Bar & Gender Selector ── */}

        <div className="mb-8 flex flex-col items-center md:mb-10">

          {/* Main Horizontal Nav Bar: Rules | Schedule | Register */}

          <nav

            aria-label="Tournament navigation"

            className="flex items-center gap-1.5 rounded-2xl border border-white/80 bg-white/50 p-1.5 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180 md:gap-2"

          >

            {(

              [

                { id: "rules", label: "RULES" },

                { id: "schedule", label: "SCHEDULE" },

                { id: "register", label: "REGISTER" },

              ] as const

            ).map((tab) => {

              const active = navTab === tab.id;

              return (

                <button

                  key={tab.id}

                  onClick={() => {

                    if (tab.id === "register") {

                      onProceed();

                    } else {

                      setNavTab(tab.id);

                    }

                  }}

                  className={`relative rounded-xl px-5 py-2 font-display text-xs uppercase tracking-wider transition md:px-7 md:py-2.5 md:text-sm ${

                    active ? "text-fest-ink" : "text-fest-label hover:text-fest-deep"

                  }`}

                >

                  {active && (

                    <motion.span

                      layoutId="mainNavPill"

                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange shadow-md shadow-fest-orange/25"

                      transition={{ type: "spring", stiffness: 320, damping: 28 }}

                    />

                  )}

                  <span className="relative z-10 block font-bold">{tab.label}</span>

                </button>

              );

            })}

          </nav>

          {/* Secondary Horizontal Nav Bar: Boys | Girls (appears when Schedule or Rules is selected) */}

          {(navTab === "schedule" || navTab === "rules") && (

            <motion.div

              initial={{ opacity: 0, y: 6 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.25, ease: EASE }}

              className="mt-4 flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/45 p-1 shadow-[0_6px_20px_rgba(28,36,56,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-xl md:mt-5"

            >

              {(

                [

                  { id: "boys", label: "BOYS" },

                  { id: "girls", label: "GIRLS" },

                ] as const

              ).map((g) => {

                const active = gender === g.id;

                return (

                  <button

                    key={g.id}

                    onClick={() => setGender(g.id)}

                    className={`relative rounded-lg px-5 py-1.5 font-display text-xs uppercase tracking-wider transition md:px-6 md:py-2 ${

                      active ? "text-fest-yellow" : "text-fest-label hover:text-fest-deep"

                    }`}

                  >

                    {active && (

                      <motion.span

                        layoutId="genderNavPill"

                        className="absolute inset-0 rounded-lg bg-fest-deep shadow-sm"

                        transition={{ type: "spring", stiffness: 360, damping: 30 }}

                      />

                    )}

                    <span

                      className={`relative z-10 block font-bold ${

                        active ? "text-fest-yellow" : ""

                      }`}

                    >

                      {g.label}

                    </span>

                  </button>

                );

              })}

            </motion.div>

          )}

        </div>

        {/* ── Title Section ── */}

        <motion.div

          key={`${navTab}-${gender}`}

          initial={{ opacity: 0, y: 14 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.45, ease: EASE }}

          className="mb-8 text-center md:mb-10"

        >

          <div className="mb-2 flex items-center justify-center gap-2">

            <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange shadow-sm backdrop-blur-sm">

              {gender.toUpperCase()} DIVISION

            </span>

          </div>

          <h1 className="font-display text-3xl uppercase leading-tight tracking-wide text-fest-deep md:text-5xl">

            TOURNAMENT{" "}

            <span className="fest-gradient-text">

              {navTab === "rules" ? "RULES" : "SCHEDULE"}

            </span>

          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-fest-label">

            <span className="flex items-center gap-1.5">

              <Calendar className="h-4 w-4" style={{ color: "#B45309" }} />

              24–26 December 2026

            </span>

            <span className="flex items-center gap-1.5">

              <MapPin className="h-4 w-4" style={{ color: "#B45309" }} />

              Vadodara

            </span>

          </div>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fest-label">

            {navTab === "rules"

              ? `Official tournament regulations, quota limits, and sport-specific rules for ${gender === "boys" ? "Boys (8 sports)" : "Girls (9 sports)"} ties.`

              : gender === "girls"

              ? "Three days of championship competition across 9 sports and 5 branch teams (Girls Division). Review fixtures and seeded byes before registering."

              : `Three days of competition across ${day?.sports.length ?? 8} sports and 7 branch teams (Boys Division). Review fixtures before registering.`}

          </p>

          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">

            <a

              href={

                navTab === "rules"

                  ? gender === "boys"

                    ? "/rule-books-and-schedules/boys-sports-rules.pdf"

                    : "/rule-books-and-schedules/girls-sports-rules.pdf"

                  : gender === "boys"

                  ? "/rule-books-and-schedules/tournament-schedule.pdf"

                  : "/rule-books-and-schedules/girls-tournament-schedule.pdf"

              }

              target="_blank"

              rel="noopener noreferrer"

              className="inline-flex items-center gap-1.5 rounded-full border border-fest-orange/30 bg-white/65 px-4 py-1.5 font-mono text-xs font-bold text-fest-orange shadow-sm backdrop-blur-md transition hover:border-fest-orange/60 hover:bg-white/90"

            >

              <Download className="h-3.5 w-3.5" />

              <span>

                {navTab === "rules"

                  ? `DOWNLOAD OFFICIAL ${gender.toUpperCase()} RULEBOOK (PDF)`

                  : `DOWNLOAD OFFICIAL ${gender.toUpperCase()} SCHEDULE (PDF)`}

              </span>

            </a>

          </div>

        </motion.div>

        {/* ── Content View: RULES or SCHEDULE ── */}

        {navTab === "rules" ? (

          <AnimatePresence mode="wait">

            <motion.div

              key={`rules-view-${gender}`}

              initial={{ opacity: 0, y: 12 }}

              animate={{ opacity: 1, y: 0 }}

              exit={{ opacity: 0, y: -12 }}

              transition={{ duration: 0.3, ease: EASE }}

            >

              <RulesView gender={gender} onProceed={onProceed} />

            </motion.div>

          </AnimatePresence>

        ) : (

          <>

            {/* Girls Byes Seeding Card (Page 4) */}

            {gender === "girls" && (

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

                      className="flex items-center justify-between rounded-xl border border-white/75 bg-white/55 px-3.5 py-2.5 shadow-sm backdrop-blur-md"

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

            )}

            {/* day selector */}

            <div className="sticky top-[57px] z-30 mb-8 flex justify-center md:top-[65px]">

              <div className="flex gap-1.5 rounded-2xl border border-white/80 bg-white/50 p-1.5 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180 md:gap-2">

                {currentSchedule.map((d, i) => {

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

                          layoutId="dayTab"

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

            {/* day content */}

            <AnimatePresence mode="wait">

              <motion.div

                key={`${gender}-${activeDay}`}

                initial={{ opacity: 0, y: 12 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -12 }}

                transition={{ duration: 0.3, ease: EASE }}

              >

                {/* day label */}

                <div className="mb-5 flex items-center justify-center gap-3 text-center">

                  <span className="h-px w-12 bg-fest-border md:w-20" />

                  <span

                    className="font-mono text-xs font-bold uppercase tracking-[0.3em]"

                    style={{ color: "#0D7377" }}

                  >

                    {day.label} · {gender.toUpperCase()}

                  </span>

                  <span className="h-px w-12 bg-fest-border md:w-20" />

                </div>

                {/* sport sections */}

                <div className="space-y-4 md:space-y-5">

                  {day.sports.map((sport, sIdx) => (

                    <SectionErrorBoundary key={`${gender}-${sport.name}`} name={`${sport.name} Fixtures`}>

                      <SportSection sport={sport} index={sIdx} />

                    </SectionErrorBoundary>

                  ))}

                </div>

              </motion.div>

            </AnimatePresence>

            {/* proceed to registration */}

            <motion.div

              initial={{ opacity: 0, y: 24 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ delay: 0.3, duration: 0.5, ease: EASE }}

              className="mt-10 overflow-hidden rounded-2xl border border-fest-orange/30 bg-gradient-to-br from-fest-orange/10 via-white/70 to-fest-yellow/10 p-6 text-center shadow-[0_16px_40px_rgba(217,119,6,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:mt-12 md:p-8"

            >

              <h3 className="font-display text-xl uppercase tracking-wide text-fest-deep md:text-2xl">

                Ready to Compete?

              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-fest-label">

                Pick your sport, choose your events, and register your team for SMJV Youth Festival 2026.

              </p>

              <button

                onClick={onProceed}

                className="animate-cta-glow mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow via-fest-orange to-fest-orange px-8 py-4 font-display text-base uppercase tracking-wider text-fest-ink shadow-xl shadow-fest-orange/30 transition hover:brightness-110 active:scale-95 md:px-10 md:py-5 md:text-lg"

              >

                PROCEED TO REGISTRATION

                <ArrowRight className="h-5 w-5" />

              </button>

              <button

                onClick={onBack}

                className="mt-4 flex items-center gap-1.5 font-mono text-xs tracking-wide text-fest-label underline underline-offset-4 transition hover:text-fest-deep"

              >

                <ArrowLeft className="h-3.5 w-3.5" />

                BACK TO INTRO

              </button>

            </motion.div>

          </>

        )}

      </main>

      <footer className="mt-auto border-t border-fest-border/60 py-4 text-center font-mono text-xs tracking-[0.25em] text-fest-label">

        SMJV YOUTH FESTIVAL 2026 · ORGANIZING COMMITTEE · VADODARA

      </footer>

    </div>

  );

}

/* ── Sport section card ─────────────────────────────────────── */

function SportSection({

  sport,

  index,

}: {

  sport: { name: string; emoji: string; matches: ScheduleMatch[] };

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

      {/* sport header */}

      <div className="flex items-center gap-3 border-b border-fest-border/60 bg-white/40 px-4 py-3 backdrop-blur-md md:px-5">

        {/* sport SVG icon */}

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

      {/* match rows */}

      <div className="divide-y divide-fest-border/60">

        {sport.matches.map((m, mIdx) => (

          <MatchRow key={mIdx} match={m} />

        ))}

      </div>

    </motion.div>

  );

}

/* ── Single match row ───────────────────────────────────────── */

function MatchRow({ match }: { match: ScheduleMatch }) {

  const hasMultiple = match.pairings.length > 1;

  return (

    <div className="px-4 py-3 md:px-5 md:py-4">

      {/* match header: number + time */}

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

      {/* pairings list */}

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

              {/* Team A */}

              <div className="flex items-center gap-2 font-bold text-fest-deep">

                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorA }} />

                <span>{teamA}</span>

                {isByeA && (

                  <span className="rounded bg-fest-yellow/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-fest-deep">

                    BYE

                  </span>

                )}

              </div>

              {/* VS badge */}

              <span className="rounded-full bg-fest-orange/10 px-2 py-0.5 font-mono text-[10px] font-bold text-fest-orange">

                VS

              </span>

              {/* Team B */}

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

/* ── Girls Schedule Coming Soon Card ────────────────────────── */

function GirlsScheduleComingSoon({

  onSwitchToRules,

  onProceed,

}: {

  onSwitchToRules: () => void;

  onProceed: () => void;

}) {

  return (

    <motion.div

      initial={{ opacity: 0, y: 18 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.45, ease: EASE }}

      className="mx-auto max-w-2xl rounded-3xl border border-white/80 bg-white/55 p-8 text-center shadow-[0_20px_50px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-12"

    >

      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-fest-orange/30 bg-gradient-to-br from-fest-yellow/25 to-fest-orange/25 text-fest-orange shadow-inner">

        <Clock className="h-8 w-8 text-fest-orange animate-pulse" />

      </div>

      <span className="inline-block rounded-full border border-fest-orange/35 bg-white/70 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-fest-orange shadow-sm">

        GIRLS DIVISION

      </span>

      <h2 className="mt-4 font-display text-2xl uppercase tracking-wide text-fest-deep md:text-3xl">

        SCHEDULE COMING SOON

      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fest-label md:text-base">

        The official tournament fixtures and match timetable for the <strong>Girls Division</strong> are currently being prepared by the organizing committee and will be announced shortly.

      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">

        <button

          onClick={onSwitchToRules}

          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/25 transition hover:brightness-110 active:scale-95"

        >

          <BookOpen className="h-4 w-4" />

          <span>VIEW GIRLS RULES (9 DISCIPLINES)</span>

        </button>

        <a

          href="/rule-books-and-schedules/girls-sports-rules.pdf"

          target="_blank"

          rel="noopener noreferrer"

          className="inline-flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-sm backdrop-blur-md transition hover:border-fest-orange/60 hover:bg-white"

        >

          <Download className="h-4 w-4 text-fest-orange" />

          <span>DOWNLOAD GIRLS RULEBOOK (PDF)</span>

        </a>

      </div>

      <div className="mt-8 rounded-2xl border border-fest-border/60 bg-white/45 p-4 text-left font-mono text-xs text-fest-label shadow-sm">

        <p className="font-bold text-fest-deep">✦ Official Girls Rulebook is Published:</p>

        <p className="mt-1 leading-relaxed">

          The 9 disciplines for Women's ties (Cricket, Throwball, Tug of War, Kho Kho, Badminton, Table Tennis, Carrom, Chess, Pickleball) are available in the Rules tab.

        </p>

      </div>

      <div className="mt-6">

        <button

          onClick={onProceed}

          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-fest-orange underline underline-offset-4 hover:text-fest-deep"

        >

          <span>PROCEED TO GIRLS REGISTRATION →</span>

        </button>

      </div>

    </motion.div>

  );

}

