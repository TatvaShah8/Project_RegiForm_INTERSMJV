"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[Next.js Page Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/80 bg-white/60 p-8 text-center shadow-[0_20px_60px_rgba(28,36,56,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl md:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-fest-orange/30 bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 text-fest-orange shadow-inner">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <span className="inline-block rounded-full border border-fest-orange/35 bg-white/70 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-fest-orange shadow-sm">
          ISOLATED PAGE RECOVERY
        </span>

        <h2 className="mt-4 font-display text-2xl uppercase tracking-wide text-fest-deep md:text-3xl">
          Something went wrong
        </h2>

        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-fest-label md:text-sm">
          A client component encountered an unexpected error. You can retry this page or return to the main portal.
        </p>

        {error.message && (
          <p className="mx-auto mt-4 max-w-md truncate rounded-lg border border-fest-orange/20 bg-fest-orange/5 px-3 py-1.5 font-mono text-[11px] text-fest-label">
            {error.message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/25 transition hover:brightness-110 active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>TRY AGAIN</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-sm backdrop-blur-md transition hover:border-fest-orange/60 hover:bg-white"
          >
            <Home className="h-3.5 w-3.5" />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
