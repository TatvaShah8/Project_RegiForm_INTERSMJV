"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Torch, Crest, TrophyLarge, Laurel, HOSTELS, SPORTS_GRID } from "./StoryboardArt";
import { SPORT_ICONS } from "./SportsIcons";

/* ═════════════════════════════════════════════════════════════
   SMJV YOUTH FESTIVAL 2026 — Cinematic Animated Film Intro
   A 5-scene narrative sequence for the hostel-tournament,
   directed like an animated film: ambient atmosphere, screen
   impacts, kinetic typography, film-cut transitions, and a
   progressive energy build from mysterious darkness to a
   climactic call to arms.
   ═════════════════════════════════════════════════════════════ */

const SCENE_DURATIONS = [3500, 3000, 3000, 3500, 999999];
const EASE = [0.22, 1, 0.36, 1] as const;

/* scene color moods — each scene has its own atmospheric color */
const SCENE_GLOWS = ["#D97706", "#0D7377", "#B91C1C", "#FBBF24", "#D97706"];

export function Landing({ onEnter, startScene = 0 }: { onEnter: () => void; startScene?: number }) {
  const [scene, setScene] = React.useState(startScene);
  const reduced = useReducedMotion();

  /* scene timeline */
  React.useEffect(() => {
    if (scene >= 4) return;
    const t = setTimeout(() => setScene((s) => s + 1), SCENE_DURATIONS[scene]);
    return () => clearTimeout(t);
  }, [scene]);

  return (
    <section
      className="scene-stage relative h-[100dvh] w-full overflow-hidden bg-transparent"
      aria-label="SMJV Youth Festival 2026 — Hostel Championship cinematic intro"
    >
      <p className="sr-only">
        The torch is lit for SMJV Youth Festival 2026. Four hostels assemble. Ten battles
        await. Glory calls. Are you ready, SMJVian?
      </p>

      {/* ── persistent atmospheric layers ────────────────────── */}
      {/* translucent cream gradient base so the background video shines through */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_40%,#FFFFFF_0%,#FBF8F1_50%,#F5F0E6_100%)] opacity-75" />

      {/* liquid glass blobs — soft warm pastels from the form
          palette, heavily blurred for a subtle gaussian-blur
          atmosphere. Low opacity so they stay whisper-soft on
          the cream background. Blur radii kept at 40/40/30/30
          for 60fps (only `transform`/`opacity` animate). */}
      <div className="pointer-events-none absolute -left-20 top-[10%] h-[45vh] w-[45vw] rounded-full bg-fest-orange/15 blur-[40px]" />
      <div className="pointer-events-none absolute -right-20 bottom-[10%] h-[45vh] w-[45vw] rounded-full bg-fest-gold/12 blur-[40px]" />
      <div className="pointer-events-none absolute left-[30%] top-[45%] h-[35vh] w-[35vw] rounded-full bg-fest-green/10 blur-[30px]" />
      <div className="pointer-events-none absolute right-[25%] top-[15%] h-[25vh] w-[25vw] rounded-full bg-fest-mint/10 blur-[30px]" />

      {/* scene-colored atmospheric tint — soft hue wash on cream.
          Lower alpha (1A vs 33) and higher opacity range so the
          scene mood reads gently on the light background. */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px]"
        style={{ background: `radial-gradient(circle, ${SCENE_GLOWS[scene]}1A 0%, transparent 70%)`, willChange: "opacity" }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── scene content (full-screen, no frame) ──────────────
          Scenes MORPH into each other: no opacity fade, no flash,
          no scale wrapper. Each scene's own internal entrance
          animations (slam-in, scale-in) play instantly on mount,
          so one scene's elements transform directly into the
          next — a hard cinematic cut with kinetic typography. */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        {scene === 0 && <SceneSummons reduced={reduced} key="s0" />}
        {scene === 1 && <SceneContenders key="s1" />}
        {scene === 2 && <SceneBattles key="s2" />}
        {scene === 3 && <ScenePrize key="s3" />}
        {scene === 4 && <SceneCall onEnter={onEnter} key="s4" />}
      </div>

      {/* ── film grain texture (part of background, below overlay blur) ── */}
      <div className="film-grain pointer-events-none absolute inset-0 z-[3]" />

      {/* ── scene annotation (top-left, subtle) ──────────────── */}
      <div className="absolute left-5 top-[4vh] z-40 font-mono text-[9px] tracking-[0.3em] text-fest-deep/50 md:left-8 md:text-[10px]">
        SCN.{String(scene + 1).padStart(2, "0")} / 05
      </div>

      {/* ── wordmark (top-right, subtle) ─────────────────────── */}
      <div className="absolute right-5 top-[4vh] z-40 font-mono text-[9px] tracking-[0.3em] text-fest-deep/50 md:right-8 md:text-[10px]">
        SMJV YOUTH FESTIVAL 2026
      </div>

      {/* ── progress bar (bottom edge, film timeline) ────────── */}
      <div className="absolute bottom-[4vh] left-1/2 z-40 h-0.5 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-fest-deep/15 md:w-56">
        <motion.div
          className="h-full bg-gradient-to-r from-fest-yellow to-fest-orange"
          initial={{ width: "0%" }}
          animate={{ width: `${((scene + 1) / 5) * 100}%` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      {/* ── skip intro ───────────────────────────────────────── */}
      <motion.button
        onClick={onEnter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-[4vh] right-5 z-40 rounded-full border border-white/80 bg-white/60 px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-fest-orange shadow-sm backdrop-blur-md transition hover:bg-white/85 hover:text-fest-deep md:right-8"
      >
        SKIP →
      </motion.button>

      {reduced && <span className="sr-only">Animations reduced for accessibility.</span>}
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════
   SCENE 1 — THE SUMMONS (Atmospheric & Dramatic)
   Darkness → torch ignites → rising embers → ground light pool
   → lens flare → expanding light rays → kinetic text → date seal
   A rich, layered opening that establishes the arena at night.
   ═════════════════════════════════════════════════════════════ */

/* rising ember positions — staggered upward from torch */
const EMBERS = [
  { x: -8, delay: 0, dur: 2.5, drift: 6 },
  { x: 4, delay: 0.4, dur: 3, drift: -4 },
  { x: -3, delay: 0.8, dur: 2.2, drift: 8 },
  { x: 10, delay: 1.2, dur: 2.8, drift: -6 },
  { x: -12, delay: 1.6, dur: 3.2, drift: 5 },
  { x: 7, delay: 2.0, dur: 2.6, drift: -8 },
  { x: 0, delay: 2.4, dur: 3, drift: 3 },
  { x: -5, delay: 2.8, dur: 2.4, drift: -5 },
];

function SceneSummons({ reduced }: { reduced: boolean | null }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* rotating light rays behind torch */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0.15, 0.08], scale: 1.8 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className="animate-rays h-[500px] w-[500px] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.12) 8deg, transparent 16deg, transparent 40deg, rgba(251,191,36,0.08) 48deg, transparent 56deg, transparent 80deg, rgba(251,191,36,0.1) 88deg, transparent 96deg, transparent 130deg, rgba(251,191,36,0.06) 138deg, transparent 146deg, transparent 180deg, rgba(251,191,36,0.1) 188deg, transparent 196deg, transparent 230deg, rgba(251,191,36,0.08) 238deg, transparent 246deg, transparent 280deg, rgba(251,191,36,0.06) 288deg, transparent 296deg, transparent 320deg, rgba(251,191,36,0.08) 328deg, transparent 336deg)",
            }}
          />
        </motion.div>
      )}

      {/* ignition flash burst */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 2.5, 3] }}
          transition={{ duration: 0.6, times: [0, 0.25, 1], ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-[42%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.8) 0%, transparent 70%)" }}
        />
      )}

      {/* lens flare — cross-pattern light burst on torch */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.3, 0.15], scale: [0, 1.2, 1] }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="pointer-events-none absolute left-1/2 top-[42%] h-32 w-32 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-fest-yellow/40 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-24 w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-fest-yellow/40 to-transparent" />
        </motion.div>
      )}

      {/* rising embers from the torch */}
      {!reduced && (
        <div className="pointer-events-none absolute left-1/2 top-[42%] h-48 w-32 -translate-x-1/2">
          {EMBERS.map((e, i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 h-1 w-1 rounded-full bg-fest-yellow"
              style={{ left: `calc(50% + ${e.x}px)`, boxShadow: "0 0 4px rgba(251,191,36,0.8)" }}
              initial={{ opacity: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -120],
                x: [0, e.drift],
                scale: [0, 1, 0.3],
              }}
              transition={{
                delay: e.delay,
                duration: e.dur,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* torch with entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
        className="relative z-10"
        style={{ filter: "drop-shadow(0 12px 24px rgba(28,36,56,0.35))" }}
      >
        <Torch className="h-48 w-24 md:h-56 md:w-28" />
      </motion.div>

      {/* ground light pool — torch light reflecting on ground */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="pointer-events-none absolute bottom-[-20px] left-1/2 h-16 w-48 -translate-x-1/2 rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.4) 0%, transparent 70%)" }}
      />

      {/* kinetic text — slam in */}
      <motion.p
        initial={{ opacity: 0, y: 30, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: [0.7, 1.15, 1] }}
        transition={{ delay: 0.35, duration: 0.35, ease: EASE }}
        className="relative z-10 mt-4 font-display text-2xl uppercase tracking-[0.3em] text-fest-orange md:text-3xl"
      >
        THE TORCH IS LIT
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="relative z-10 mt-2 font-mono text-[10px] tracking-[0.3em] text-fest-deep/70 md:text-xs"
      >
        SMJV YOUTH FESTIVAL 2026 · HOSTEL CHAMPIONSHIP
      </motion.p>

      {/* date seal — decorative */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative z-10 mt-3 flex items-center gap-2"
      >
        <span className="h-px w-6 bg-fest-orange/40" />
        <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-fest-orange/70">
          24 DECEMBER · VADODARA
        </span>
        <span className="h-px w-6 bg-fest-orange/40" />
      </motion.div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   SCENE 2 — THE CONTENDERS
   Four crests SLAM in from corners with impact shake,
   energy beams connect them, continuous float + glow pulse
   ═════════════════════════════════════════════════════════════ */
function SceneContenders() {
  const offsets = [
    { x: -200, y: -140 },
    { x: 200, y: -140 },
    { x: -200, y: 140 },
    { x: 200, y: 140 },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* energy beams connecting crests (SVG overlay) */}
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0.2] }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute h-[300px] w-[400px] md:h-[360px] md:w-[500px]"
        viewBox="0 0 400 300"
        fill="none"
      >
        <motion.path
          d="M80 60 L320 60 L320 240 L80 240 Z"
          stroke="#FBBF24"
          strokeWidth="1"
          strokeDasharray="4 6"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M80 60 L320 240 M320 60 L80 240"
          stroke="#D97706"
          strokeWidth="0.5"
          opacity="0.3"
          strokeDasharray="3 8"
          animate={{ strokeDashoffset: [0, 22] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.svg>

      <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-5">
        {HOSTELS.map((h, i) => (
          <motion.div
            key={h.letter}
            initial={{ opacity: 0, x: offsets[i].x, y: offsets[i].y, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: [0.5, 1.15, 1] }}
            transition={{
              delay: 0.08 * i,
              duration: 0.35,
              ease: EASE,
            }}
            className="relative"
          >
            {/* pulsing color glow */}
            <motion.div
              className="absolute inset-0 rounded-full blur-xl"
              style={{ background: h.color }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
            />
            {/* floating crest */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 8px 16px rgba(28,36,56,0.3))" }}
            >
              <Crest hostel={h} className="relative h-24 w-20 md:h-28 md:w-24" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + 0.08 * i }}
              className="mt-2 text-center font-mono text-[9px] tracking-[0.2em]"
              style={{ color: h.color }}
            >
              {h.name}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: [0.8, 1.1, 1] }}
        transition={{ delay: 0.5, duration: 0.35, ease: EASE }}
        className="mt-8 font-display text-xl uppercase tracking-[0.25em] text-fest-deep md:text-2xl"
      >
        FOUR HOSTELS · <span className="cinematic-gold-text">ONE CROWN</span>
      </motion.p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   SCENE 3 — THE BATTLES (Circular Arena Layout)
   10 sports arranged in a symmetric ring around a central VS badge.
   Custom SVG icons (not emoji) for a designed, unified look.
   Sports stamp in sequentially around the circle, then the ring
   settles with a subtle breathing pulse.
   ═════════════════════════════════════════════════════════════ */
function SceneBattles() {
  /* calculate circular positions — 10 items at 36° intervals from top */
  const radius = 36; // % from center
  const positions = SPORTS_GRID.map((_, i) => {
    const angle = (360 / SPORTS_GRID.length) * i - 90;
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  });

  return (
    <div className="flex flex-col items-center">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="font-mono text-[10px] tracking-[0.35em] text-fest-deep/70 md:text-xs"
      >
        THE EVENTS DECIDED
      </motion.p>

      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: [0.5, 1.15, 1] }}
        transition={{ delay: 0.1, duration: 0.3, ease: EASE }}
        className="mb-3 mt-1 font-display text-base uppercase tracking-[0.25em] text-fest-orange md:text-lg"
      >
        TEN ARENAS · ONE CHAMPION
      </motion.p>

      {/* circular arena container */}
      <div className="relative h-[min(72vw,340px)] w-[min(72vw,340px)]">
        {/* guide ring (subtle) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-[10%] rounded-full border border-dashed border-fest-deep/15"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute inset-[5%] rounded-full border border-fest-deep/10"
        />

        {/* central VS badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [0, 1.2, 1] }}
          transition={{ delay: 0.5, duration: 0.35, ease: EASE }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-fest-yellow/40 bg-gradient-to-br from-[#1B2040]/90 to-[#0D1130]/90 shadow-2xl shadow-fest-deep/25 md:h-20 md:w-20"
          >
            {/* glow */}
            <div className="absolute inset-0 rounded-full bg-fest-yellow/20 blur-lg" />
            <span className="relative font-display text-2xl uppercase tracking-wider text-fest-yellow md:text-3xl">
              VS
            </span>
          </motion.div>
        </motion.div>

        {/* 10 sport badges positioned around the circle */}
        {SPORTS_GRID.map((sp, i) => {
          const Icon = SPORT_ICONS[sp.name];
          const pos = positions[i];
          return (
            /* positioning wrapper — static, handles centering */
            <div
              key={sp.name}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* animation wrapper — motion handles scale/opacity only */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: [0, 1.2, 1],
                }}
                transition={{
                  delay: 0.06 * i + 0.15,
                  duration: 0.3,
                  ease: EASE,
                }}
              >
                {/* badge circle — icon on top, name inside below */}
                <div className="relative flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-fest-yellow/40 bg-[#1B2040]/90 shadow-2xl shadow-fest-deep/25 md:h-[72px] md:w-[72px]">
                  {/* inner ring */}
                  <div className="absolute inset-1 rounded-full border border-fest-orange/25" />
                  {/* custom SVG icon */}
                  {Icon && (
                    <span className="relative h-7 w-7 text-fest-yellow md:h-8 md:w-8">
                      <Icon />
                    </span>
                  )}
                  {/* sport name — inside badge, no overlap possible */}
                  <span className="relative px-1 text-center font-mono text-[6px] font-bold leading-[1.1] tracking-[0.02em] text-fest-yellow/90 md:text-[6.5px]">
                    {sp.name}
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   SCENE 4 — THE PRIZE (Colorful & Dramatic)
   Multi-colored sunburst rays + cycling aura + twinkling sparkles
   + trophy rise + laurel + spotlight beam + gold shimmer text.
   A vibrant, celebratory climax moment.
   ═════════════════════════════════════════════════════════════ */

/* sparkle positions around the trophy — bigger, evenly distributed */
const SPARKLES = [
  { x: 10, y: 12, color: "#FBBF24", size: 14, delay: 0 },
  { x: 90, y: 12, color: "#A78BFA", size: 12, delay: 0.3 },
  { x: 3, y: 35, color: "#2DD4BF", size: 11, delay: 0.6 },
  { x: 97, y: 35, color: "#FBBF24", size: 13, delay: 0.9 },
  { x: 8, y: 88, color: "#F59E0B", size: 12, delay: 0.45 },
  { x: 92, y: 88, color: "#A78BFA", size: 10, delay: 0.15 },
  { x: 30, y: 5, color: "#FBBF24", size: 10, delay: 0.75 },
  { x: 70, y: 5, color: "#2DD4BF", size: 11, delay: 1.05 },
  { x: 20, y: 95, color: "#FBBF24", size: 9, delay: 0.5 },
  { x: 80, y: 95, color: "#F59E0B", size: 10, delay: 0.2 },
];

function ScenePrize() {
  return (
    <div className="relative flex flex-col items-center">
      {/* multi-colored rotating sunburst rays — higher contrast */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2"
        style={{ maskImage: "radial-gradient(circle, black 50%, transparent 85%)", WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 85%)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="h-full w-full rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(251,191,36,0.25) 0deg, transparent 12deg, rgba(217,119,6,0.2) 24deg, transparent 36deg, rgba(245,158,11,0.2) 48deg, transparent 60deg, rgba(167,139,250,0.2) 72deg, transparent 84deg, rgba(45,212,191,0.2) 96deg, transparent 108deg, rgba(251,191,36,0.25) 120deg, transparent 132deg, rgba(217,119,6,0.2) 144deg, transparent 156deg, rgba(245,158,11,0.2) 168deg, transparent 180deg, rgba(167,139,250,0.2) 192deg, transparent 204deg, rgba(45,212,191,0.2) 216deg, transparent 228deg, rgba(251,191,36,0.25) 240deg, transparent 252deg, rgba(217,119,6,0.2) 264deg, transparent 276deg, rgba(245,158,11,0.2) 288deg, transparent 300deg, rgba(167,139,250,0.2) 312deg, transparent 324deg, rgba(45,212,191,0.2) 336deg, transparent 360deg)",
          }}
        />
      </motion.div>

      {/* cycling aura — larger, stronger glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)" }}
          animate={{ opacity: [1, 0, 0, 0, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%)" }}
          animate={{ opacity: [0, 1, 0, 0, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)" }}
          animate={{ opacity: [0, 0, 1, 0, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(45,212,191,0.5) 0%, transparent 70%)" }}
          animate={{ opacity: [0, 0, 0, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* golden radial shockwave on reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0, 2, 3] }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)" }}
      />

      {/* twinkling colorful sparkles around the trophy */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2">
        {SPARKLES.map((sp, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.3, 1, 0.2], scale: [0, 1, 0.8, 1, 0.7] }}
              transition={{
                delay: sp.delay + 0.4,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
              }}
              style={{
                color: sp.color,
                fontSize: `${sp.size}px`,
                textShadow: `0 0 ${sp.size}px ${sp.color}`,
              }}
            >
              ✦
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* spotlight beam — soft glow, no hard edges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="pointer-events-none absolute left-1/2 top-[35%] h-[180px] w-[100px] -translate-x-1/2"
        style={{
          background: "linear-gradient(to top, rgba(251,191,36,0.4) 0%, transparent 100%)",
          clipPath: "polygon(30% 100%, 70% 100%, 90% 0%, 10% 0%)",
          filter: "blur(6px)",
        }}
      />

      {/* trophy + laurel */}
      <motion.div className="relative z-10">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
          style={{ filter: "drop-shadow(0 15px 30px rgba(217,119,6,0.4))" }}
        >
          <TrophyLarge className="h-60 w-44 md:h-72 md:w-56" />
        </motion.div>

        {/* rotating laurel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{
            opacity: { delay: 0.35, duration: 0.35 },
            scale: { delay: 0.35, duration: 0.35 },
          }}
          className="absolute -top-10 left-1/2 h-24 w-56 -translate-x-1/2"
        >
          <Laurel className="h-full w-full" />
        </motion.div>
      </motion.div>

      {/* gold shimmer headline with colorful glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="pointer-events-none absolute left-1/2 top-[58%] h-8 w-64 -translate-x-1/2 rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.5) 0%, transparent 70%)" }}
      />
      <motion.p
        initial={{ opacity: 0, y: 25, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: [0.7, 1.15, 1] }}
        transition={{ delay: 0.4, duration: 0.35, ease: EASE }}
        className="relative z-10 mt-5 font-display text-2xl uppercase tracking-[0.3em] md:text-3xl"
        style={{ filter: "drop-shadow(0 4px 10px rgba(251,191,36,0.35))" }}
      >
        <span style={{ color: "#D97706", fontWeight: 700 }}>GLORY AWAITS</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="relative z-10 mt-2 font-mono text-[10px] tracking-[0.3em] text-fest-deep/70 md:text-xs"
      >
        THE TROPHY AWAITS ITS BEARER
      </motion.p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   SCENE 5 — THE CALL
   Full energy release: massive text slam, confetti + Holi burst,
   pulsing CTA, maximum ambient activity
   ═════════════════════════════════════════════════════════════ */
function SceneCall({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* expanding energy ring */}
      <motion.div
        initial={{ opacity: 0.4, scale: 0 }}
        animate={{ opacity: [0.4, 0, 0], scale: [0, 2.5, 3] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3, ease: "easeOut" }}
        className="pointer-events-none absolute h-48 w-48 rounded-full border-2 border-fest-orange/40"
      />

      {/* Official SMJV Youth Festival 2026 Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: -15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.45, ease: EASE }}
        className="relative z-10 mb-3"
      >
        <img
          src="/logo.jpg"
          alt="SMJV Youth Festival 2026 Official Logo"
          className="h-24 w-24 rounded-full border-2 border-fest-orange/50 object-cover shadow-[0_10px_30px_rgba(217,119,6,0.35)] md:h-28 md:w-28"
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="font-mono text-[10px] font-bold tracking-[0.4em] text-fest-orange md:text-xs"
      >
        THE ARENA IS READY
      </motion.p>

      {/* massive headline slam with overshoot */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: [0.3, 1.2, 1] }}
        transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
        className="mt-3 font-display uppercase leading-[0.9] tracking-wide"
      >
        <span className="block text-[clamp(1.6rem,5vw,2.8rem)] text-fest-deep/90">
          ARE YOU READY,
        </span>
        <span className="fest-gradient-text mt-1 block text-[clamp(3.2rem,11vw,7rem)]">
          SMJVIAN?
        </span>
      </motion.h1>

      {/* CTA with breathing glow */}
      <motion.button
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: [0.8, 1.1, 1] }}
        transition={{ delay: 0.4, duration: 0.35, ease: EASE }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEnter}
        className="animate-cta-glow mt-8 rounded-2xl bg-gradient-to-r from-fest-yellow via-fest-orange to-fest-orange px-8 py-4 font-display text-base uppercase tracking-wider text-fest-ink shadow-2xl shadow-fest-orange/60 md:px-12 md:py-5 md:text-xl"
      >
        ENTER REGISTRATION{" "}
        <span className="inline-block">→</span>
      </motion.button>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="mt-5 font-mono text-[11px] font-bold tracking-[0.3em] text-fest-deep/70"
      >
        ONE FEST · ONE FAMILY · ONE PASS
      </motion.span>
    </div>
  );
}
