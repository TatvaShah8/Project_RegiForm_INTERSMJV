"use client";

import * as React from "react";
import { Flame } from "lucide-react";

// Target: 24 December 2026, 00:05 hours (12:05 AM IST)
// In UTC: 2026-12-23T18:35:00.000Z
const TARGET_TIMESTAMP = new Date("2026-12-24T00:05:00+05:30").getTime();

interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

function calculateTimeLeft(): TimeUnits {
  const diff = TARGET_TIMESTAMP - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isComplete: false,
  };
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = React.useState<TimeUnits>(calculateTimeLeft);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Instant calculate on mount
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format2 = (val: number) => String(val).padStart(2, "0");

  const units = [
    { label: "DAYS", value: mounted ? format2(timeLeft.days) : "--" },
    { label: "HOURS", value: mounted ? format2(timeLeft.hours) : "--" },
    { label: "MINUTES", value: mounted ? format2(timeLeft.minutes) : "--" },
    { label: "SECONDS", value: mounted ? format2(timeLeft.seconds) : "--" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Glow highlight under timer */}
      <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-fest-yellow/20 via-fest-orange/20 to-fest-gold/20 blur-xl" />

      <div className="relative overflow-hidden rounded-3xl border border-white/90 bg-white/70 p-4 shadow-[0_16px_48px_rgba(28,36,56,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-6 md:p-8">
        {timeLeft.isComplete ? (
          <div className="py-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-fest-orange/20 text-fest-orange">
              <Flame className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="mt-4 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl">
              THE TOURNAMENT HAS BEGUN!
            </h3>
            <p className="mt-2 text-sm text-fest-label">
              Welcome to INTER SMJV 2026 Vadodara. Head over to the schedule to check live match fixtures.
            </p>
          </div>
        ) : (
          /* 4 Cards Grid */
          <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {units.map((unit) => (
              <div
                key={unit.label}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/90 bg-white/75 px-2 py-4 shadow-[0_8px_24px_rgba(28,36,56,0.05),inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-fest-orange/50 hover:bg-white/90 sm:px-4 sm:py-6 md:py-7"
              >
                {/* Digit */}
                <span className="font-display text-3xl font-bold tracking-wider text-fest-deep transition group-hover:text-fest-orange sm:text-5xl md:text-6xl lg:text-7xl">
                  {unit.value}
                </span>

                {/* Label */}
                <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange sm:mt-2 sm:text-xs">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
