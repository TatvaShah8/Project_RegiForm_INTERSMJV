"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Download } from "lucide-react";
import { useRegister } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;

export function GirlsScheduleView({
  onSwitchToRules,
  onProceed,
}: {
  onSwitchToRules: () => void;
  onProceed: () => void;
}) {
  const s = useRegister();
  const isLoggedIn = s._hasHydrated && s.completed && !!s.firstName;

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
        COMING SOON
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

      {!isLoggedIn && (
        <div className="mt-7 border-t border-fest-border/60 pt-5">
          <button
            onClick={onProceed}
            className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-wider text-fest-orange transition hover:underline"
          >
            <span>PROCEED TO REGISTRATION</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isLoggedIn && (
        <div className="mt-7 border-t border-fest-border/60 pt-5">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-wider text-fest-orange transition hover:underline"
          >
            <span>VIEW MY REGISTRATION PASS</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}
