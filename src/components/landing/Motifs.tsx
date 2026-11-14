"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   INTER SMJV 2026 — landing visuals
   Hand-drawn geometric silhouettes: cultural (garba dancer, diya,
   dhol, rangoli) and sports (cricket, football, badminton) motifs
   that morph behind the headline throughout the intro.
   ───────────────────────────────────────────────────────────── */

const S = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 200 200" fill="none" className="h-full w-full" aria-hidden="true">
    {children}
  </svg>
);

/* cultural — garba dancer with raised arms and flared skirt */
const GarbaDancer = () => (
  <S>
    <circle cx="100" cy="42" r="14" fill="currentColor" />
    <path d="M92 58 C88 74 90 84 96 94 L104 94 C110 84 112 74 108 58 Z" fill="currentColor" />
    <path d="M92 62 C74 66 58 78 50 94 L60 102 C68 88 82 78 96 74 Z" fill="currentColor" />
    <path d="M108 62 C126 66 142 78 150 94 L140 102 C132 88 118 78 104 74 Z" fill="currentColor" />
    <path d="M96 92 L104 92 C118 112 128 138 124 164 L76 164 C72 138 82 112 96 92 Z" fill="currentColor" />
    <circle cx="70" cy="160" r="5" fill="currentColor" />
    <circle cx="86" cy="170" r="5" fill="currentColor" />
    <circle cx="102" cy="174" r="5" fill="currentColor" />
    <circle cx="118" cy="170" r="5" fill="currentColor" />
    <circle cx="132" cy="160" r="5" fill="currentColor" />
  </S>
);

/* cultural — diya lamp */
const Diya = () => (
  <S>
    <path d="M100 34 C112 52 118 62 100 78 C82 62 88 52 100 34 Z" fill="currentColor" />
    <circle cx="100" cy="88" r="7" fill="currentColor" opacity="0.7" />
    <path d="M52 118 C64 104 84 98 100 98 C116 98 136 104 148 118 C136 140 120 152 100 152 C80 152 64 140 52 118 Z" fill="currentColor" />
    <path d="M40 128 C46 152 70 166 100 166 C130 166 154 152 160 128 L148 124 C142 144 124 156 100 156 C76 156 58 144 52 124 Z" fill="currentColor" opacity="0.65" />
    <circle cx="42" cy="92" r="4" fill="currentColor" opacity="0.5" />
    <circle cx="158" cy="92" r="4" fill="currentColor" opacity="0.5" />
    <circle cx="100" cy="22" r="4" fill="currentColor" opacity="0.5" />
  </S>
);

/* cultural — dhol drum with crossed straps */
const Dhol = () => (
  <S>
    <ellipse cx="100" cy="62" rx="44" ry="16" fill="currentColor" />
    <path d="M56 62 L56 120 C56 136 76 146 100 146 C124 146 144 136 144 120 L144 62 L132 68 L132 118 C132 128 118 136 100 136 C82 136 68 128 68 118 L68 68 Z" fill="currentColor" opacity="0.75" />
    <path d="M64 70 L136 138 M136 70 L64 138" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity="0.5" />
    <ellipse cx="100" cy="140" rx="40" ry="14" fill="currentColor" />
    <path d="M150 44 C158 34 168 32 176 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 44 C42 34 32 32 24 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </S>
);

/* cultural — rangoli mandala (stroke style) */
const Rangoli = () => (
  <S>
    <circle cx="100" cy="100" r="14" fill="currentColor" />
    <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="5" />
    <circle cx="100" cy="100" r="52" stroke="currentColor" strokeWidth="5" opacity="0.7" />
    <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="5" opacity="0.45" />
    <circle cx="100" cy="26" r="7" fill="currentColor" />
    <circle cx="174" cy="100" r="7" fill="currentColor" />
    <circle cx="100" cy="174" r="7" fill="currentColor" />
    <circle cx="26" cy="100" r="7" fill="currentColor" />
    <circle cx="152" cy="48" r="6" fill="currentColor" opacity="0.8" />
    <circle cx="152" cy="152" r="6" fill="currentColor" opacity="0.8" />
    <circle cx="48" cy="152" r="6" fill="currentColor" opacity="0.8" />
    <circle cx="48" cy="48" r="6" fill="currentColor" opacity="0.8" />
  </S>
);

/* sports — cricket bat, ball and stumps */
const Cricket = () => (
  <S>
    <path d="M118 26 C132 34 138 48 132 64 L84 168 C80 178 70 182 62 178 C54 174 52 164 56 154 L104 50 C108 40 112 32 118 26 Z" fill="currentColor" />
    <path d="M118 26 C132 34 138 48 132 64 L126 76 L108 68 C112 52 114 38 118 26 Z" fill="currentColor" opacity="0.55" />
    <circle cx="56" cy="106" r="17" fill="currentColor" />
    <path d="M42 98 C50 108 62 108 70 98" stroke="currentColor" strokeWidth="4" opacity="0.7" />
    <path d="M150 60 L150 150 M158 66 L158 156 M166 72 L166 162" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <path d="M144 60 L172 54 M144 156 L172 164" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
  </S>
);

/* sports — football with pentagon seams */
const Football = () => (
  <S>
    <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="8" />
    <path d="M100 62 L132 86 L120 124 L80 124 L68 86 Z" fill="currentColor" />
    <path d="M100 62 L100 28 M132 86 L166 74 M120 124 L142 160 M80 124 L58 160 M68 86 L34 74" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
  </S>
);

/* sports — badminton racket and shuttle */
const Badminton = () => (
  <S>
    <ellipse cx="82" cy="72" rx="42" ry="52" stroke="currentColor" strokeWidth="8" transform="rotate(-24 82 72)" />
    <path d="M82 28 C104 30 122 46 124 68 M82 28 C60 30 42 46 40 68 M52 100 L112 44 M60 108 L124 50 M70 116 L134 58" stroke="currentColor" strokeWidth="4" opacity="0.65" transform="rotate(-24 82 72)" />
    <path d="M62 112 C56 128 48 144 42 158 L58 160 C64 146 72 132 78 120 Z" fill="currentColor" transform="rotate(-24 82 72)" />
    <path d="M148 128 L128 148 L136 156 L156 136 Z" fill="currentColor" />
    <path d="M128 148 L118 158 L127 164 Z" fill="currentColor" opacity="0.7" />
    <circle cx="164" cy="118" r="9" fill="currentColor" />
  </S>
);

/* fest — trophy */
const Trophy = () => (
  <S>
    <path d="M64 34 L136 34 L132 84 C132 106 118 120 100 124 C82 120 68 106 68 84 Z" fill="currentColor" />
    <path d="M64 42 C46 44 34 56 36 74 C38 90 52 98 66 96 L70 84 C60 84 50 78 50 68 C50 60 56 52 66 50 Z" fill="currentColor" opacity="0.7" />
    <path d="M136 42 C154 44 166 56 164 74 C162 90 148 98 134 96 L130 84 C140 84 150 78 150 68 C150 60 144 52 134 50 Z" fill="currentColor" opacity="0.7" />
    <path d="M92 122 L108 122 L112 148 L88 148 Z" fill="currentColor" />
    <path d="M72 152 L128 152 C134 152 138 158 138 164 L138 172 L62 172 L62 164 C62 158 66 152 72 152 Z" fill="currentColor" />
    <path d="M100 44 L100 116 M78 52 L122 52" stroke="#0A0E2A" strokeWidth="5" opacity="0.35" />
  </S>
);

const MOTIFS = [GarbaDancer, Cricket, Diya, Football, Dhol, Badminton, Rangoli, Trophy];

const ORBIT_CHIPS = ["🏏", "⚽", "🏐", "🏓", "🎭", "🪔", "🥁", "🏆"];

/**
 * Morphing motif stage: one large silhouette cross-fades / scales /
 * rotates into the next every 2.6 s, surrounded by an orbit ring of
 * fest emoji chips. Cultural and sports motifs alternate.
 */
export function MotifRing({ className }: { className?: string }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MOTIFS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const Current = MOTIFS[i];

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* soft halo */}
      <div className="absolute h-[min(78vw,540px)] w-[min(78vw,540px)] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.14)_0%,rgba(249,115,22,0.05)_45%,transparent_70%)]" />
      {/* morphing blob glow */}
      <div className="animate-blob absolute h-[min(56vw,380px)] w-[min(56vw,380px)] bg-gradient-to-br from-fest-orange/20 via-fest-pink/10 to-fest-teal/10 blur-3xl" />

      {/* center morphing silhouette */}
      <div className="relative h-[min(46vw,300px)] w-[min(46vw,300px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className="absolute inset-0 text-[#F4F6FF]/[0.05]"
            initial={{ opacity: 0, scale: 0.86, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.12, rotate: 8 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Current />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* orbiting fest chips — outer ring slowly spins, chips stay upright */}
      <div className="animate-orbit absolute h-[min(88vw,600px)] w-[min(88vw,600px)]">
        {ORBIT_CHIPS.map((chip, idx) => {
          const angle = (360 / ORBIT_CHIPS.length) * idx;
          return (
            <div
              key={idx}
              className="absolute inset-0"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <div style={{ transform: `rotate(${-angle}deg)` }} className="animate-orbit-rev">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2A3354]/70 bg-[#1B2040]/80 text-xl shadow-lg shadow-black/30 backdrop-blur-sm md:h-14 md:w-14 md:text-2xl">
                    {chip}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
