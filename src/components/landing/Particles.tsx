"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Cinematic particle engine (canvas)
   Refined for serious energy + positive vibe + smooth motion:
   - burst(): golden ember burst — warm sparks radiate outward
     with gentle float and graceful fade (no chaotic explosion)
   - confetti(): soft golden rain — light orbs drift down gently
   - ambient: subtle golden dust always drifting upward
   Palette is warm-only (gold / saffron / warm white) to feel
   like embers and light rather than colorful powder.
   ───────────────────────────────────────────────────────────── */

/* refined warm palette — embers & light, not color powder */
const EMBER = ["#FBBF24", "#D97706", "#FEF3C7", "#F59E0B"];
const AMBIENT = ["#FBBF24", "#D97706", "#FEF3C7"];

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  shape: "dot" | "spark";
  life: number;
  maxLife: number;
  gravity: number;
  drag: number;
  glow: number;
}

export interface ParticleHandle {
  burst: () => void;
  confetti: () => void;
}

export const Particles = React.forwardRef<ParticleHandle, { className?: string }>(
  function Particles({ className }, ref) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const reduced = useReducedMotion();
    const particles = React.useRef<P[]>([]);
    const spawner = React.useRef<{ mode: "none" | "confetti"; until: number }>({
      mode: "none",
      until: 0,
    });

    React.useImperativeHandle(ref, () => ({
      burst() {
        if (reduced) return;
        const c = canvasRef.current;
        const w = c?.clientWidth ?? 800;
        const h = c?.clientHeight ?? 600;
        const cx = w * 0.5;
        const cy = h * 0.42;
        /* 40 refined embers — fewer, more intentional */
        for (let i = 0; i < 40; i++) {
          const ang = Math.random() * Math.PI * 2;
          /* gentle velocity — smooth radiate, not explosive */
          const spd = 1.2 + Math.random() * 4.5;
          const size = 1.5 + Math.random() * 2.8;
          particles.current.push({
            x: cx + (Math.random() - 0.5) * 20,
            y: cy + (Math.random() - 0.5) * 12,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 1.2,
            size,
            rot: 0,
            vr: 0,
            color: EMBER[Math.floor(Math.random() * EMBER.length)],
            shape: "dot",
            life: 0,
            /* longer life — graceful fade, not quick disappear */
            maxLife: 90 + Math.random() * 70,
            /* gentle gravity — float, don't drop */
            gravity: 0.05,
            /* higher drag — smooth deceleration */
            drag: 0.965,
            glow: size * 2.5,
          });
        }
      },
      confetti() {
        if (reduced) return;
        /* soft golden rain — 1.8s of gentle drift */
        spawner.current = { mode: "confetti", until: performance.now() + 1800 };
      },
    }));

    React.useEffect(() => {
      if (reduced) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let raf = 0;
      let last = performance.now();
      let dustClock = 0;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      const step = (now: number) => {
        const dt = Math.min((now - last) / 16.667, 3);
        last = now;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        /* ambient golden dust — subtle, always alive */
        dustClock += dt * 16.667;
        if (dustClock > 320 && particles.current.length < 180) {
          dustClock = 0;
          const size = 0.8 + Math.random() * 1.4;
          particles.current.push({
            x: Math.random() * w,
            y: h + 6,
            vx: (Math.random() - 0.5) * 0.15,
            vy: -(0.1 + Math.random() * 0.22),
            size,
            rot: 0,
            vr: 0,
            color: AMBIENT[Math.floor(Math.random() * AMBIENT.length)],
            shape: "dot",
            life: 0,
            maxLife: 800,
            gravity: 0,
            drag: 1,
            glow: size * 2,
          });
        }

        /* soft golden rain spawner — gentle, 1 orb per frame */
        const sp = spawner.current;
        if (sp.mode === "confetti" && now < sp.until) {
          if (particles.current.length < 200) {
            const size = 1.5 + Math.random() * 2.5;
            particles.current.push({
              x: Math.random() * w,
              y: -8,
              /* gentle drift, not fast fall */
              vx: (Math.random() - 0.5) * 0.6,
              vy: 0.8 + Math.random() * 1.2,
              size,
              rot: 0,
              vr: 0,
              color: EMBER[Math.floor(Math.random() * EMBER.length)],
              shape: "dot",
              life: 0,
              maxLife: 280,
              /* very gentle gravity — floats down */
              gravity: 0.012,
              drag: 0.998,
              glow: size * 2.5,
            });
          }
        } else if (sp.mode === "confetti" && now >= sp.until) {
          sp.mode = "none";
        }

        ctx.clearRect(0, 0, w, h);
        const list = particles.current;
        const keep: P[] = [];

        for (const p of list) {
          p.life += dt;
          if (p.life >= p.maxLife) continue;

          /* smooth physics */
          p.vx *= Math.pow(p.drag, dt);
          p.vy = p.vy * Math.pow(p.drag, dt) + p.gravity * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          /* smooth alpha curve — gentle fade in, long sustain, graceful fade out */
          const t = p.life / p.maxLife;
          let alpha: number;
          if (t < 0.15) {
            /* fade in — first 15% */
            alpha = t / 0.15;
          } else if (t < 0.65) {
            /* full visibility — sustained */
            alpha = 1;
          } else {
            /* graceful fade out — last 35% */
            alpha = 1 - Math.pow((t - 0.65) / 0.35, 1.4);
          }

          ctx.globalAlpha = Math.max(0, Math.min(1, alpha)) * 0.85;

          /* glow halo for ember effect — only on larger particles for perf */
          if (p.glow > 4) {
            ctx.shadowBlur = p.glow;
            ctx.shadowColor = p.color;
          } else {
            ctx.shadowBlur = 0;
          }

          /* all dots — soft circular light orbs, no rectangles */
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();

          if (p.y < h + 30 && p.x > -40 && p.x < w + 40) keep.push(p);
        }

        /* reset shadow for next frame */
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        particles.current = keep;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        particles.current = [];
      };
    }, [reduced]);

    if (reduced) return null;

    return (
      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
        aria-hidden="true"
      />
    );
  }
);
