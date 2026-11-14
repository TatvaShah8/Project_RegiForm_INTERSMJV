"use client";

import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   INTER SMJV 2026 — Storyboard illustrations
   Hand-crafted SVG assets for the hostel-tournament intro:
   - Torch (the summons flame)
   - Hostel crests (4 rival shields)
   - Sports grid icons (the events)
   - Trophy + laurel (the prize)
   ───────────────────────────────────────────────────────────── */

/* ── Torch with animated flame ──────────────────────────────
   Silver metallic Olympic-style torch with a REALISTIC flame:
   asymmetric tapered mass + secondary lick tongue, flame-shaped
   glow halo (not circular), base anchored into the bowl, prominent
   blue combustion at the nozzle, internal convection streaks,
   all warped by animated SVG turbulence. Reference: real torch. */
export function Torch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 220" className={className} fill="none" aria-hidden="true">
      {/* FLAME-SHAPED GLOW HALO — a blurred copy of the outer flame
          silhouette, scaled up. Hugs the flame shape instead of being
          a perfect circle. Sits behind everything. */}
      <g filter="url(#bigGlow)" opacity="0.4">
        <path
          d="M28 117 C30 100, 32 76, 40 58 C36 44, 46 34, 56 30 C66 34, 76 44, 72 58 C84 76, 88 100, 90 117 Z"
          fill="#FF7A1A"
        />
      </g>
      {/* tighter inner glow — warmer, slightly smaller */}
      <g filter="url(#softGlow)" opacity="0.4">
        <path
          d="M34 116 C36 98, 38 76, 44 62 C42 52, 50 44, 56 42 C64 44, 72 52, 70 62 C78 76, 82 98, 82 116 Z"
          fill="#FFA00C"
        />
      </g>

      {/* metallic body — funnel shape (wide bowl top → narrow base) */}
      <path d="M36 116 L84 116 L67 198 L53 198 Z" fill="url(#torchMetal)" />
      <path d="M40 118 L44 118 L55 196 L51 196 Z" fill="url(#torchHighlight)" opacity="0.7" />
      <path d="M76 118 L80 118 L69 196 L65 196 Z" fill="#6A6A6A" opacity="0.35" />

      {/* decorative rings on body — elliptical bands that wrap the handle */}
      <ellipse cx="60" cy="142" rx="19" ry="2.5" fill="none" stroke="#606060" strokeWidth="0.8" opacity="0.7" />
      <ellipse cx="60" cy="168" rx="14" ry="2" fill="none" stroke="#606060" strokeWidth="0.8" opacity="0.6" />

      {/* bowl rim — flared top edge (wider than body) */}
      <ellipse cx="60" cy="116" rx="30" ry="6.5" fill="url(#torchRim)" />
      {/* inner bowl — dark opening where fire sits */}
      <ellipse cx="60" cy="114" rx="25" ry="4.5" fill="#2A2A30" />
      {/* warm rim-light from the flame licking the bowl lip */}
      <ellipse cx="60" cy="114" rx="25" ry="4.5" fill="none" stroke="#FF7A1A" strokeWidth="0.8" opacity="0.45" />

      {/* base foot */}
      <ellipse cx="60" cy="199" rx="10" ry="3" fill="#888888" />
      <ellipse cx="60" cy="198" rx="8" ry="2" fill="#A0A0A0" />

      {/* REALISTIC FLAME — asymmetric tapered mass anchored INTO the bowl.
          Base sits at y=115 (inside the bowl rim at y=116), so the flame
          emerges from inside the bowl, not floating above it. Peak is
          offset left of center (x=55) for asymmetry. A secondary small
          "lick" tongue breaks off to the right at mid-height. Internal
          convection streaks give vertical structure. Layers use
          mix-blend-mode: screen for additive light blending. */}
      <motion.g
        animate={{
          scaleY: [1, 1.06, 0.96, 1.04, 1],
          scaleX: [1, 0.96, 1.04, 0.97, 1],
          rotate: [0, -1.5, 1, -0.5, 0],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "60px 115px" }}
      >
        {/* OUTER flame — large asymmetric tapered mass, blurred + displaced.
            Peak offset left (x=55), right side bulges slightly higher.
            Cool red-orange with alpha-faded tips that dissolve into air. */}
        <g filter="url(#flameOuterWarp)" style={{ mixBlendMode: "screen" as const }}>
          {/* main flame body — base anchored at y=115 (inside bowl) */}
          <path
            d="M34 115 C36 100, 36 78, 42 62 C40 52, 48 44, 55 42 C64 44, 72 52, 70 62 C78 78, 80 100, 82 115 Z"
            fill="url(#flameOuterGrad)"
          />
          {/* secondary "lick" tongue — breaks off to the right at mid-height,
              slightly lower than main peak. Adds asymmetry and naturalism. */}
          <path
            d="M68 100 C72 92, 82 84, 88 80 C92 84, 90 92, 86 98 C82 102, 76 105, 72 105 Z"
            fill="url(#flameOuterGrad)"
            opacity="0.85"
          />
        </g>

        {/* MID flame — medium tapered mass, less blur, yellow-orange */}
        <g filter="url(#flameMidWarp)" style={{ mixBlendMode: "screen" as const }}>
          <path
            d="M42 114 C42 102, 42 84, 46 72 C44 62, 50 56, 55 54 C62 56, 68 62, 66 72 C72 84, 74 102, 72 114 Z"
            fill="url(#flameMidGrad)"
          />
        </g>

        {/* INNER hot core — smallest tapered mass, subtle blur, white-yellow.
            Strong brightness contrast against the darker outer layer. */}
        <g filter="url(#flameInnerWarp)" style={{ mixBlendMode: "screen" as const }}>
          <path
            d="M48 113 C46 104, 48 90, 52 80 C50 72, 54 66, 56 64 C58 66, 62 72, 60 80 C64 90, 68 104, 64 113 Z"
            fill="url(#flameInnerGrad)"
          />
        </g>

        {/* CONVECTION STREAKS — 3 vertical elongated bright shapes inside
            the flame mass, suggesting internal updraft columns. Asymmetric
            heights for naturalistic variation. */}
        <g filter="url(#streakWarp)" style={{ mixBlendMode: "screen" as const }}>
          {/* left streak — shorter, golden yellow */}
          <ellipse cx="49" cy="88" rx="2.5" ry="14" fill="#FFD029" opacity="0.55" />
          {/* center streak — tallest, brightest (white-hot updraft) */}
          <ellipse cx="55" cy="80" rx="3" ry="22" fill="#FFF3B0" opacity="0.7" />
          {/* right streak — medium, golden yellow, slightly higher than left */}
          <ellipse cx="63" cy="84" rx="2.5" ry="17" fill="#FFD029" opacity="0.55" />
        </g>

        {/* white-hot spot just above the bowl (hottest point of flame) */}
        <ellipse cx="55" cy="98" rx="5" ry="9" fill="#FFFFFF" opacity="0.8" filter="url(#softGlow)" style={{ mixBlendMode: "screen" as const }} />

        {/* BLUE combustion zone at the nozzle — saturated, anchored IN the
            bowl rim. Two layers: wide soft crescent + tight bright core. */}
        <ellipse cx="60" cy="113" rx="16" ry="4" fill="#3A6CFF" opacity="0.6" filter="url(#softGlow)" style={{ mixBlendMode: "screen" as const }} />
        <ellipse cx="60" cy="113" rx="9" ry="2.5" fill="#7BA8FF" opacity="0.8" filter="url(#softGlow)" />
      </motion.g>

      <defs>
        {/* metallic body gradient — left dark → center bright → right dark
            creates the illusion of a curved silver surface */}
        <linearGradient id="torchMetal" x1="36" y1="0" x2="84" y2="0">
          <stop offset="0%" stopColor="#8A8A8A" />
          <stop offset="30%" stopColor="#D8D8D8" />
          <stop offset="50%" stopColor="#F5F5F5" />
          <stop offset="70%" stopColor="#C8C8C8" />
          <stop offset="100%" stopColor="#787878" />
        </linearGradient>
        <linearGradient id="torchHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="torchRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="50%" stopColor="#F8F8F8" />
          <stop offset="100%" stopColor="#A0A0A0" />
        </linearGradient>

        {/* ── FLAME WARP FILTERS — blur + animated turbulence + displacement ──
            Each filter: (1) softens source via gaussian blur, (2) generates
            fractal noise with animated `seed` for live flicker, (3) displaces
            the softened source using the noise. */}
        {/* Outer — moderate blur + high displacement for tapered soft mass */}
        <filter id="flameOuterWarp" x="-60%" y="-25%" width="220%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" />
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.04" numOctaves="2" seed="3" result="noise">
            <animate attributeName="seed" values="3;22;9;17;28;3" dur="2.6s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="blurred" in2="noise" scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Mid — less blur, medium displacement */}
        <filter id="flameMidWarp" x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blurred" />
          <feTurbulence type="fractalNoise" baseFrequency="0.025 0.05" numOctaves="2" seed="11" result="noise">
            <animate attributeName="seed" values="11;5;19;8;23;11" dur="2s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="blurred" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Inner — subtle blur, low displacement for hot core */}
        <filter id="flameInnerWarp" x="-40%" y="-15%" width="180%" height="130%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blurred" />
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.07" numOctaves="2" seed="5" result="noise">
            <animate attributeName="seed" values="5;17;9;14;21;5" dur="1.6s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="blurred" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Convection streaks — light blur + medium displacement */}
        <filter id="streakWarp" x="-50%" y="-15%" width="200%" height="130%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blurred" />
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.06" numOctaves="2" seed="7" result="noise">
            <animate attributeName="seed" values="7;18;11;15;24;7" dur="1.7s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="blurred" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* soft gaussian blurs for glow halos and hot spots */}
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <filter id="bigGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" />
        </filter>

        {/* ── FLAME GRADIENTS — realistic color physics with alpha falloff ──
            Hot base (yellow/white) → cooler tips (red), with stop-opacity
            fading to 0 at the very edge so tips dissolve into air. */}
        <radialGradient id="flameOuterGrad" gradientUnits="userSpaceOnUse" cx="58" cy="112" r="68">
          <stop offset="0%" stopColor="#FFD029" stopOpacity="1" />
          <stop offset="25%" stopColor="#FFA00C" stopOpacity="1" />
          <stop offset="55%" stopColor="#FF7A1A" stopOpacity="0.92" />
          <stop offset="78%" stopColor="#E85D04" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9B1B0C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameMidGrad" gradientUnits="userSpaceOnUse" cx="55" cy="108" r="48">
          <stop offset="0%" stopColor="#FFF3B0" stopOpacity="1" />
          <stop offset="35%" stopColor="#FFD029" stopOpacity="1" />
          <stop offset="70%" stopColor="#FFA00C" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameInnerGrad" gradientUnits="userSpaceOnUse" cx="55" cy="106" r="36">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="30%" stopColor="#FFF3B0" stopOpacity="1" />
          <stop offset="65%" stopColor="#FFD029" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFA00C" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Hostel crest (shield with letter + mascot) ───────────── */
export interface Hostel {
  letter: string;
  name: string;
  color: string;
  mascot: string;
}

export const HOSTELS: Hostel[] = [
  { letter: "A", name: "BLOCK A", color: "#D97706", mascot: "🦁" },
  { letter: "B", name: "BLOCK B", color: "#0D7377", mascot: "🦅" },
  { letter: "C", name: "BLOCK C", color: "#B91C1C", mascot: "🐂" },
  { letter: "D", name: "BLOCK D", color: "#7C3AED", mascot: "🐆" },
];

export function Crest({ hostel, className }: { hostel: Hostel; className?: string }) {
  const { letter, color, mascot } = hostel;
  return (
    <svg viewBox="0 0 140 160" className={className} fill="none" aria-hidden="true">
      {/* shield */}
      <path
        d="M70 6 L128 26 L128 78 C128 114 104 138 70 154 C36 138 12 114 12 78 L12 26 Z"
        fill="rgba(10,14,42,0.92)"
        stroke={color}
        strokeWidth="3"
      />
      {/* inner border */}
      <path
        d="M70 16 L118 32 L118 76 C118 106 98 126 70 140 C42 126 22 106 22 76 L22 32 Z"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.4"
      />
      {/* top banner */}
      <path d="M30 34 L110 34" stroke={color} strokeWidth="2" opacity="0.6" />
      {/* letter */}
      <text
        x="70"
        y="80"
        textAnchor="middle"
        fontSize="48"
        fontWeight="900"
        fill={color}
        style={{ fontFamily: "var(--font-anton), sans-serif" }}
      >
        {letter}
      </text>
      {/* mascot */}
      <text x="70" y="118" textAnchor="middle" fontSize="28">
        {mascot}
      </text>
      {/* glow accents */}
      <circle cx="70" cy="6" r="3" fill={color} />
      <circle cx="128" cy="26" r="3" fill={color} opacity="0.6" />
      <circle cx="12" cy="26" r="3" fill={color} opacity="0.6" />
    </svg>
  );
}

/* ── Sports event tile (for the battles grid) ─────────────── */
export interface SportTile {
  emoji: string;
  name: string;
}

export const SPORTS_GRID: SportTile[] = [
  { emoji: "🏏", name: "CRICKET" },
  { emoji: "⚽", name: "FOOTBALL" },
  { emoji: "🏐", name: "VOLLEYBALL" },
  { emoji: "🥎", name: "PICKLEBALL" },
  { emoji: "🏃", name: "KHO-KHO" },
  { emoji: "🏉", name: "THROW BALL" },
  { emoji: "➰", name: "TUG OF WAR" },
  { emoji: "🏸", name: "BADMINTON" },
  { emoji: "🏓", name: "TABLE TENNIS" },
  { emoji: "♟️", name: "CHESS" },
];

/* ── Trophy (large, detailed, elegant) ────────────────────── */
export function TrophyLarge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 240" className={className} fill="none" aria-hidden="true">
      {/* glow halo */}
      <circle cx="90" cy="80" r="70" fill="url(#trophyGlow)" opacity="0.35" />

      {/* cup — flared rim, elegant body, narrow waist */}
      <path
        d="M48 28 L132 28 L128 38 L124 42 L120 90 C120 116 106 134 90 138 C74 134 60 116 60 90 L56 42 L52 38 Z"
        fill="url(#trophyGold)"
      />
      {/* cup inner shadow (rim depth) */}
      <path
        d="M52 28 L128 28 L126 36 L54 36 Z"
        fill="#7A4010"
        opacity="0.5"
      />
      {/* decorative band near rim */}
      <path
        d="M56 42 L124 42 L122 50 L58 50 Z"
        fill="#FEF3C7"
        opacity="0.3"
      />
      <path
        d="M56 42 L124 42"
        stroke="#92400E"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <path
        d="M58 50 L122 50"
        stroke="#92400E"
        strokeWidth="0.8"
        opacity="0.6"
      />
      {/* gemstones on decorative band — red, teal, purple */}
      <circle cx="70" cy="46" r="2.5" fill="#EF4444" opacity="0.85" />
      <circle cx="70" cy="45.5" r="1" fill="#FCA5A5" opacity="0.6" />
      <circle cx="90" cy="46" r="2.5" fill="#2DD4BF" opacity="0.85" />
      <circle cx="90" cy="45.5" r="1" fill="#A7F3D0" opacity="0.6" />
      <circle cx="110" cy="46" r="2.5" fill="#A78BFA" opacity="0.85" />
      <circle cx="110" cy="45.5" r="1" fill="#DDD6FE" opacity="0.6" />

      {/* left handle — sculpted, fully opaque */}
      <path
        d="M48 38 C26 40 14 56 16 78 C18 96 34 108 52 104 L56 90 C42 90 32 84 32 70 C32 58 38 50 50 48 Z"
        fill="url(#trophyGold)"
      />
      <path
        d="M50 44 C34 46 24 58 26 74 C28 88 38 96 50 92"
        stroke="#FEF3C7"
        strokeWidth="1.5"
        opacity="0.3"
        fill="none"
      />

      {/* right handle — sculpted, fully opaque */}
      <path
        d="M132 38 C154 40 166 56 164 78 C162 96 146 108 128 104 L124 90 C138 90 148 84 148 70 C148 58 142 50 130 48 Z"
        fill="url(#trophyGold)"
      />
      <path
        d="M130 44 C146 46 156 58 154 74 C152 88 142 96 130 92"
        stroke="#FEF3C7"
        strokeWidth="1.5"
        opacity="0.3"
        fill="none"
      />

      {/* star emblem — larger with rays */}
      <g transform="translate(90, 78)">
        {/* rays */}
        <path d="M0 -22 L2 -16 L0 -14 L-2 -16 Z" fill="#FEF3C7" opacity="0.4" />
        <path d="M0 22 L2 16 L0 14 L-2 16 Z" fill="#FEF3C7" opacity="0.4" />
        <path d="M-22 0 L-16 2 L-14 0 L-16 -2 Z" fill="#FEF3C7" opacity="0.4" />
        <path d="M22 0 L16 2 L14 0 L16 -2 Z" fill="#FEF3C7" opacity="0.4" />
        {/* star */}
        <path
          d="M0 -14 L4 -4 L14 -4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4 L-4 -4 Z"
          fill="#FEF3C7"
          opacity="0.9"
        />
        <path
          d="M0 -14 L4 -4 L14 -4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4 L-4 -4 Z"
          stroke="#FBBF24"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </g>

      {/* engraved name plate */}
      <rect x="70" y="104" width="40" height="16" rx="2" fill="#92400E" opacity="0.6" />
      <rect x="72" y="106" width="36" height="12" rx="1" fill="none" stroke="#FEF3C7" strokeWidth="0.5" opacity="0.3" />
      <text
        x="90"
        y="115"
        textAnchor="middle"
        fontSize="6"
        fontWeight="bold"
        fill="#FEF3C7"
        opacity="0.5"
        style={{ fontFamily: "var(--font-anton), sans-serif" }}
      >
        CHAMPION
      </text>

      {/* stem — tapered with decorative rings */}
      <path d="M78 138 L102 138 L106 168 L74 168 Z" fill="url(#trophyGold)" />
      {/* ring 1 */}
      <ellipse cx="90" cy="148" rx="14" ry="3" fill="#FEF3C7" opacity="0.2" />
      <ellipse cx="90" cy="148" rx="14" ry="3" fill="none" stroke="#92400E" strokeWidth="0.6" opacity="0.5" />
      {/* ring 2 */}
      <ellipse cx="90" cy="160" rx="16" ry="3" fill="#FEF3C7" opacity="0.15" />
      <ellipse cx="90" cy="160" rx="16" ry="3" fill="none" stroke="#92400E" strokeWidth="0.6" opacity="0.5" />

      {/* podium base — 3 layered steps */}
      {/* top step */}
      <path d="M62 168 L118 168 L116 178 L64 178 Z" fill="url(#trophyBase)" />
      <path d="M62 168 L118 168" stroke="#FEF3C7" strokeWidth="0.8" opacity="0.2" />
      {/* middle step */}
      <path d="M56 178 L124 178 L122 190 L58 190 Z" fill="url(#trophyBase)" opacity="0.9" />
      <path d="M56 178 L124 178" stroke="#FEF3C7" strokeWidth="0.8" opacity="0.15" />
      {/* bottom step */}
      <path d="M48 190 L132 190 L130 204 L50 204 Z" fill="url(#trophyBase)" opacity="0.8" />
      <path d="M48 190 L132 190" stroke="#FEF3C7" strokeWidth="0.8" opacity="0.1" />

      {/* shine highlights — polished metal */}
      <path d="M64 32 L64 90 C64 108 72 122 80 128" stroke="#FEF3C7" strokeWidth="2.5" opacity="0.35" fill="none" strokeLinecap="round" />
      <path d="M70 32 L70 70" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" fill="none" strokeLinecap="round" />

      <defs>
        <linearGradient id="trophyGold" x1="44" y1="28" x2="136" y2="204">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="25%" stopColor="#FBBF24" />
          <stop offset="55%" stopColor="#D97706" />
          <stop offset="85%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="trophyBase" x1="48" y1="168" x2="132" y2="204">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="50%" stopColor="#7A5020" />
          <stop offset="100%" stopColor="#4A2A10" />
        </linearGradient>
        <radialGradient id="trophyGlow">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Laurel wreath (frame for the prize) ──────────────────── */
export function Laurel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} fill="none" aria-hidden="true">
      {/* left laurel */}
      <g fill="#15803D" opacity="0.7">
        <ellipse cx="30" cy="60" rx="6" ry="14" transform="rotate(-30 30 60)" />
        <ellipse cx="38" cy="44" rx="6" ry="14" transform="rotate(-50 38 44)" />
        <ellipse cx="48" cy="32" rx="6" ry="14" transform="rotate(-70 48 32)" />
        <ellipse cx="60" cy="24" rx="6" ry="14" transform="rotate(-85 60 24)" />
      </g>
      {/* right laurel */}
      <g fill="#15803D" opacity="0.7">
        <ellipse cx="170" cy="60" rx="6" ry="14" transform="rotate(30 170 60)" />
        <ellipse cx="162" cy="44" rx="6" ry="14" transform="rotate(50 162 44)" />
        <ellipse cx="152" cy="32" rx="6" ry="14" transform="rotate(70 152 32)" />
        <ellipse cx="140" cy="24" rx="6" ry="14" transform="rotate(85 140 24)" />
      </g>
    </svg>
  );
}
