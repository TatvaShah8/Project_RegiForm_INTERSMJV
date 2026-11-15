"use client";

import * as React from "react";

/* ═════════════════════════════════════════════════════════════
   SMJV YOUTH FESTIVAL 2026 — Custom Sports Icon Set
   Hand-crafted line-art SVG icons for tournament sports.
   Redrawn based on real sports equipment reference for
   accurate, recognizable shapes. Unified design language:
   stroke-based, 64×64 viewBox, 4px stroke, rounded caps,
   currentColor fill.
   ═════════════════════════════════════════════════════════════ */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const S = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
    {children}
  </svg>
);

/* Cricket — bat (diagonal blade + handle) and ball with seam.
   Reference: classic cricket bat is a long flat blade with a
   thinner cylindrical handle wrapped in grip. */
export const CricketIcon = () => (
  <S>
    {/* bat blade — long rectangle angled diagonally */}
    <path d="M44 6 L50 8 L54 16 L34 56 L26 54 L22 48 L42 10 Z" {...stroke} />
    {/* handle grip lines */}
    <path d="M42 10 L46 12 M38 18 L42 20" {...stroke} opacity={0.6} />
    {/* ball */}
    <circle cx="14" cy="46" r="6" {...stroke} />
    {/* ball seam */}
    <path d="M9 45 C12 48 16 48 19 45" {...stroke} strokeWidth={2.5} opacity={0.7} />
  </S>
);

/* Football — soccer ball with central pentagon and radiating seams.
   Reference: classic truncated-icosahedron pattern — central
   pentagon with hexagons around it. */
export const FootballIcon = () => (
  <S>
    <circle cx="32" cy="32" r="24" {...stroke} />
    {/* central pentagon */}
    <path d="M32 22 L39 27 L36 35 L28 35 L25 27 Z" {...stroke} />
    {/* radiating seams to edge */}
    <path d="M32 22 L32 12 M39 27 L48 24 M36 35 L43 41 M28 35 L21 41 M25 27 L16 24" {...stroke} />
  </S>
);

/* Volleyball — ball with three curved panel seams.
   Reference: volleyballs have 3 leather panels that curve
   across the ball surface in a distinctive pattern. */
export const VolleyballIcon = () => (
  <S>
    <circle cx="32" cy="32" r="24" {...stroke} />
    {/* panel 1 — vertical-ish curve */}
    <path d="M32 8 C26 20 26 44 32 56" {...stroke} />
    {/* panel 2 — upper-left to lower-right curve */}
    <path d="M12 22 C22 30 38 30 54 18" {...stroke} />
    {/* panel 3 — lower-left to upper-right curve */}
    <path d="M10 42 C24 36 40 36 56 46" {...stroke} opacity={0.8} />
  </S>
);

/* Pickleball — solid paddle (rounded head + short handle) and
   wiffle ball (with holes). Reference: pickleball paddles are
   solid, hard paddles with a short handle; the ball is plastic
   with holes. */
export const PickleballIcon = () => (
  <S>
    {/* paddle head — rounded rectangle/oval */}
    <path d="M18 8 C26 6 36 6 40 12 C44 18 44 28 38 34 L26 34 C20 30 16 22 18 8 Z" {...stroke} />
    {/* handle */}
    <path d="M28 34 L26 50 M34 34 L36 50" {...stroke} />
    <path d="M26 50 L36 50" {...stroke} strokeWidth={2.5} opacity={0.6} />
    {/* wiffle ball with holes */}
    <circle cx="50" cy="48" r="8" {...stroke} />
    <circle cx="48" cy="46" r="1" fill="currentColor" />
    <circle cx="52" cy="46" r="1" fill="currentColor" />
    <circle cx="50" cy="50" r="1" fill="currentColor" />
    <circle cx="54" cy="50" r="1" fill="currentColor" />
  </S>
);

/* Kho-Kho — two poles with a runner between them.
   Reference: Kho-Kho is played on a court with central poles;
   chasers run between them. Simplified to poles + runner. */
export const KhoKhoIcon = () => (
  <S>
    {/* left pole */}
    <path d="M12 10 L12 54" {...stroke} />
    <circle cx="12" cy="8" r="2" {...stroke} />
    {/* right pole */}
    <path d="M52 10 L52 54" {...stroke} />
    <circle cx="52" cy="8" r="2" {...stroke} />
    {/* runner figure between poles */}
    <circle cx="32" cy="18" r="4" {...stroke} />
    <path d="M32 22 L32 36 M32 36 L26 48 M32 36 L38 48" {...stroke} />
    {/* ground line */}
    <path d="M6 56 L58 56" {...stroke} opacity={0.4} strokeWidth={2} />
  </S>
);

/* Throw Ball — ball arcing over a net line.
   Reference: throwball is like volleyball but the ball is
   thrown (not hit) over a net. */
export const ThrowballIcon = () => (
  <S>
    {/* net — vertical line with top bar */}
    <path d="M32 6 L32 58" {...stroke} />
    <path d="M10 16 L54 16" {...stroke} opacity={0.5} strokeWidth={2.5} />
    {/* net mesh dots */}
    <path d="M20 16 L20 24 M44 16 L44 24 M14 24 L26 24 M38 24 L50 24" {...stroke} opacity={0.3} strokeWidth={2} />
    {/* ball — arcing trajectory */}
    <path d="M8 40 C16 20 48 20 56 40" {...stroke} strokeDasharray="3 4" opacity={0.5} />
    <circle cx="32" cy="24" r="7" {...stroke} />
    {/* ball seam */}
    <path d="M26 22 C30 26 34 26 38 22" {...stroke} strokeWidth={2.5} opacity={0.6} />
  </S>
);

/* Tug of War — rope pulled from both sides with center marker.
   Reference: two teams pulling a rope, with a center ribbon
   marker on the rope. */
export const TugOfWarIcon = () => (
  <S>
    {/* rope — taut horizontal line with slight sag */}
    <path d="M6 32 C20 28 44 36 58 32" {...stroke} />
    {/* center ribbon marker */}
    <path d="M32 26 L30 38 M32 26 L34 38" {...stroke} strokeWidth={2.5} />
    <path d="M30 38 L34 38" {...stroke} strokeWidth={2.5} />
    {/* left grip — fist pulling left */}
    <path d="M6 32 C4 30 4 26 8 24 C12 22 14 26 12 30" {...stroke} />
    <path d="M4 28 L2 30 M4 26 L2 26" {...stroke} strokeWidth={2.5} opacity={0.6} />
    {/* right grip — fist pulling right */}
    <path d="M58 32 C60 30 60 26 56 24 C52 22 50 26 52 30" {...stroke} />
    <path d="M60 28 L62 30 M60 26 L62 26" {...stroke} strokeWidth={2.5} opacity={0.6} />
    {/* ground */}
    <path d="M4 50 L60 50" {...stroke} opacity={0.3} strokeWidth={2} />
  </S>
);

/* Badminton — shuttlecock (cork base + conical feather skirt).
   Reference: shuttlecock has a rounded cork top and a cone-
   shaped skirt of feathers/plastic. */
export const BadmintonIcon = () => (
  <S>
    {/* cork (rounded top) */}
    <circle cx="32" cy="12" r="6" {...stroke} />
    {/* cork band */}
    <path d="M27 14 L37 14" {...stroke} strokeWidth={2.5} opacity={0.5} />
    {/* feather skirt — conical shape opening downward */}
    <path d="M28 17 L18 52 M32 17 L32 54 M36 17 L46 52" {...stroke} />
    {/* skirt outline — cone shape */}
    <path d="M27 17 L37 17 L48 54 L16 54 Z" {...stroke} opacity={0.4} strokeWidth={2.5} />
    {/* feather detail lines */}
    <path d="M24 30 L40 30 M22 42 L42 42" {...stroke} opacity={0.3} strokeWidth={2} />
  </S>
);

/* Table Tennis — paddle (round head + handle) and small ball.
   Reference: table tennis paddle has a round/oval blade with
   a short thin handle; the ball is small and lightweight. */
export const TableTennisIcon = () => (
  <S>
    {/* paddle head — round */}
    <circle cx="24" cy="24" r="14" {...stroke} />
    {/* paddle center line (sweet spot) */}
    <path d="M18 24 L30 24" {...stroke} strokeWidth={2} opacity={0.3} />
    {/* handle */}
    <path d="M22 38 L18 54 M26 38 L30 54" {...stroke} />
    <path d="M18 54 L30 54" {...stroke} strokeWidth={2.5} opacity={0.6} />
    {/* ball */}
    <circle cx="48" cy="42" r="7" {...stroke} />
    {/* ball motion arc */}
    <path d="M40 38 C36 34 34 30 34 26" {...stroke} strokeWidth={2} strokeDasharray="2 3" opacity={0.4} />
  </S>
);

/* Chess — knight piece silhouette.
   Reference: the knight is the horse-head chess piece. */
export const ChessIcon = () => (
  <S>
    {/* knight head — horse silhouette */}
    <path d="M22 48 L22 28 C22 22 24 18 28 14 L32 10 L36 12 L34 18 L40 22 C44 26 46 30 46 36 L46 48" {...stroke} />
    {/* ear */}
    <path d="M28 14 L26 8 L30 12" {...stroke} />
    {/* eye */}
    <circle cx="34" cy="22" r="1.5" fill="currentColor" />
    {/* muzzle detail */}
    <path d="M30 28 L26 32" {...stroke} strokeWidth={2.5} opacity={0.5} />
    {/* mane */}
    <path d="M28 14 C24 20 22 24 22 30" {...stroke} opacity={0.4} strokeWidth={2.5} />
    {/* base */}
    <path d="M18 48 L50 48 L52 56 L16 56 Z" {...stroke} />
  </S>
);

/* Carrom — square board with corner pockets and center coins.
   Reference: carrom board is a square wooden board with
   pockets in each corner and coins (pieces) arranged in the
   center. */
export const CarromIcon = () => (
  <S>
    {/* board outline — square */}
    <rect x="8" y="8" width="48" height="48" rx="3" {...stroke} />
    {/* inner border (playing surface) */}
    <rect x="14" y="14" width="36" height="36" rx="2" {...stroke} strokeWidth={2.5} opacity={0.5} />
    {/* center circle (queen area) */}
    <circle cx="32" cy="32" r="8" {...stroke} strokeWidth={2.5} />
    {/* four corner pockets */}
    <circle cx="12" cy="12" r="3" {...stroke} strokeWidth={2.5} />
    <circle cx="52" cy="12" r="3" {...stroke} strokeWidth={2.5} />
    <circle cx="12" cy="52" r="3" {...stroke} strokeWidth={2.5} />
    <circle cx="52" cy="52" r="3" {...stroke} strokeWidth={2.5} />
    {/* center coins — the "C-coin" arrangement */}
    <circle cx="28" cy="28" r="2.5" fill="currentColor" opacity={0.7} />
    <circle cx="36" cy="28" r="2.5" fill="currentColor" opacity={0.7} />
    <circle cx="28" cy="36" r="2.5" fill="currentColor" opacity={0.7} />
    <circle cx="36" cy="36" r="2.5" fill="currentColor" opacity={0.7} />
    {/* queen (center, larger) */}
    <circle cx="32" cy="32" r="3" {...stroke} strokeWidth={2} />
  </S>
);

/* Icon registry — maps sport name to component.
   Includes both "PICKLEBALL" and "PICKLE BALL" keys to handle
   the naming mismatch between StoryboardArt and schedule.ts.
   CARROM added for schedule.ts compatibility. */
export const SPORT_ICONS: Record<string, React.ComponentType> = {
  CRICKET: CricketIcon,
  FOOTBALL: FootballIcon,
  VOLLEYBALL: VolleyballIcon,
  PICKLEBALL: PickleballIcon,
  "PICKLE BALL": PickleballIcon,
  "KHO-KHO": KhoKhoIcon,
  "KHO KHO": KhoKhoIcon,
  "THROW BALL": ThrowballIcon,
  THROWBALL: ThrowballIcon,
  "TUG OF WAR": TugOfWarIcon,
  BADMINTON: BadmintonIcon,
  "TABLE TENNIS": TableTennisIcon,
  CHESS: ChessIcon,
  CARROM: CarromIcon,
};
