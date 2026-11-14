"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { BoysScheduleView } from "@/components/schedule/BoysScheduleView";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { Calendar, MapPin, Download } from "lucide-react";

export default function BoysSchedulePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <TournamentNav activeNav="schedule" activeGender="boys" />

      <main className="fest-scroll mx-auto w-full max-w-5xl flex-1 px-4 pb-12 md:px-6">
        {/* Title Section */}
        <div className="mb-8 text-center md:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange shadow-sm backdrop-blur-sm">
              BOYS DIVISION
            </span>
          </div>
          <h1 className="font-display text-3xl uppercase leading-tight tracking-wide text-fest-deep md:text-5xl">
            TOURNAMENT <span className="fest-gradient-text">SCHEDULE</span>
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
            Three days of competition across 8 sports and 7 branch teams (Boys Division). Review tournament fixtures and match schedules.
          </p>
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="/rule-books-and-schedules/tournament-schedule.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-fest-orange/30 bg-white/65 px-4 py-1.5 font-mono text-xs font-bold text-fest-orange shadow-sm backdrop-blur-md transition hover:border-fest-orange/60 hover:bg-white/90"
            >
              <Download className="h-3.5 w-3.5" />
              <span>DOWNLOAD OFFICIAL BOYS SCHEDULE (PDF)</span>
            </a>
          </div>
        </div>

        {/* Schedule Content */}
        <SectionErrorBoundary name="Boys Fixtures Engine">
          <BoysScheduleView onProceed={() => router.push("/register")} />
        </SectionErrorBoundary>
      </main>

      <footer className="mt-auto border-t border-fest-border/60 py-4 text-center font-mono text-xs tracking-[0.25em] text-fest-label">
        INTER SMJV 2026 · ORGANIZING COMMITTEE · VADODARA
      </footer>
    </div>
  );
}
