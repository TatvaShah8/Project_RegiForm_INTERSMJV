"use client";

import * as React from "react";
import { Ruler, Check, Info, Shirt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  JERSEY_SIZE_CHART,
  TRACK_PANT_SIZE_CHART,
  type JerseySizeInfo,
  type TrackPantSizeInfo,
} from "@/lib/fest";
import { cn } from "@/lib/utils";

export interface TrackPantSizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: "jersey" | "track-pants";
  gender?: "MALE" | "FEMALE" | "";
  selectedJerseySize?: string;
  selectedTrackPantSize?: string;
  onSelectJerseySize?: (size: string) => void;
  onSelectTrackPantSize?: (size: string) => void;
  // Backward compatibility alias for single track pant selection
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
}

export function TrackPantSizeModal({
  open,
  onOpenChange,
  initialCategory = "track-pants",
  gender = "MALE",
  selectedJerseySize,
  selectedTrackPantSize,
  onSelectJerseySize,
  onSelectTrackPantSize,
  selectedSize,
  onSelectSize,
}: TrackPantSizeModalProps) {
  const [category, setCategory] = React.useState<"jersey" | "track-pants">(initialCategory);
  const [pantView, setPantView] = React.useState<"table" | "diagram">("table");

  // Sync state whenever modal opens or initial values change
  React.useEffect(() => {
    if (open) {
      setCategory(initialCategory);
    }
  }, [open, initialCategory]);

  const effectiveTrackPantSize = selectedTrackPantSize || selectedSize;
  const effectiveSelectTrackPant = onSelectTrackPantSize || onSelectSize;

  const isJersey = category === "jersey";

  const chartTitle = isJersey
    ? "Jersey Size Chart"
    : "Pant Size Chart";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-white/20 bg-fest-deep/95 p-0 text-white shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="border-b border-white/10 p-5 sm:p-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fest-orange/20 text-fest-orange">
                {isJersey ? <Shirt className="h-5 w-5" /> : <Ruler className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="font-display text-lg sm:text-xl uppercase tracking-wider text-fest-white">
                  {chartTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-fest-label">
                  SMJV Youth Festival 2026 · All measurements are in inches (Boys &amp; Girls)
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Category Tabs: Jersey vs Track Pants */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
            <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setCategory("jersey")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition",
                  isJersey
                    ? "bg-fest-orange text-fest-ink shadow-sm"
                    : "text-fest-label hover:text-white"
                )}
              >
                <Shirt className="h-3.5 w-3.5" />
                <span>Jersey / T-Shirt</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory("track-pants")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition",
                  !isJersey
                    ? "bg-fest-orange text-fest-ink shadow-sm"
                    : "text-fest-label hover:text-white"
                )}
              >
                <Ruler className="h-3.5 w-3.5" />
                <span>Pant / Lower</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {!isJersey && (
                <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPantView("table")}
                    className={cn(
                      "rounded px-2.5 py-0.5 text-[11px] font-bold transition",
                      pantView === "table" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setPantView("diagram")}
                    className={cn(
                      "rounded px-2.5 py-0.5 text-[11px] font-bold transition",
                      pantView === "diagram" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    Diagram 🖼️
                  </button>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 rounded-md border border-fest-orange/30 bg-fest-orange/10 px-2.5 py-1 text-[11px] font-bold text-fest-orange">
                <span>👥 Both Boys &amp; Girls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content matching user reference */}
        <div className="p-5 sm:p-6 pt-2">
          <div className="overflow-hidden rounded-xl border border-white/15 bg-black/50 shadow-inner">
            {isJersey ? (
              /* Jersey Table */
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/15 bg-white/5 font-mono text-xs uppercase tracking-wider text-fest-orange">
                    <th className="px-4 py-3 font-bold">Size</th>
                    <th className="px-4 py-3 font-bold">Chest (inches)</th>
                    <th className="px-4 py-3 font-bold">Length (inches)</th>
                    <th className="px-3 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  {JERSEY_SIZE_CHART.map((row: JerseySizeInfo) => {
                    const isSelected =
                      selectedJerseySize === row.size ||
                      (selectedJerseySize &&
                        row.size.toLowerCase() === selectedJerseySize.toLowerCase());

                    return (
                      <tr
                        key={row.size}
                        onClick={() => {
                          if (onSelectJerseySize) {
                            onSelectJerseySize(row.size);
                            onOpenChange(false);
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors duration-150",
                          isSelected
                            ? "bg-fest-orange/20 text-white font-bold"
                            : "hover:bg-white/10 text-white/90"
                        )}
                      >
                        <td className="px-4 py-2.5 font-bold tracking-wide">
                          <span className={cn(isSelected ? "text-fest-orange" : "text-white")}>
                            {row.size}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium text-white/90">{row.chest}</td>
                        <td className="px-4 py-2.5 font-medium text-white/90">{row.length}</td>
                        <td className="px-3 py-2.5 text-right">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-fest-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fest-ink shadow-xs">
                              <Check className="h-3 w-3" /> Selected
                            </span>
                          ) : (
                            <span className="text-[11px] text-fest-label/60 transition hover:text-fest-orange">
                              Select →
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : pantView === "diagram" ? (
              /* Track Pants Visual Diagram from official guide */
              <div className="flex flex-col items-center justify-center p-3 text-center bg-black/60">
                <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white p-2 shadow-2xl max-w-sm w-full">
                  <img
                    src="/images/pant-size-chart.jpg"
                    alt="Official Size Chart Pants for Boys and Girls"
                    className="w-full h-auto max-h-[340px] rounded-lg object-contain mx-auto"
                  />
                </div>
                <p className="mt-3 text-xs text-fest-label font-mono">
                  Waist &amp; Length measurements in inches · Switch to <b className="text-fest-orange">Table</b> above to select size
                </p>
              </div>
            ) : (
              /* Track Pants Table */
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/15 bg-white/5 font-mono text-xs uppercase tracking-wider text-fest-orange">
                    <th className="px-4 py-3 font-bold">Size</th>
                    <th className="px-4 py-3 font-bold">Waist (inches)</th>
                    <th className="px-4 py-3 font-bold">Length (inches)</th>
                    <th className="px-3 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  {TRACK_PANT_SIZE_CHART.map((row: TrackPantSizeInfo) => {
                    const isSelected =
                      effectiveTrackPantSize === row.size ||
                      (effectiveTrackPantSize &&
                        row.size.toLowerCase() === effectiveTrackPantSize.toLowerCase());

                    return (
                      <tr
                        key={row.size}
                        onClick={() => {
                          if (effectiveSelectTrackPant) {
                            effectiveSelectTrackPant(row.size);
                            onOpenChange(false);
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors duration-150",
                          isSelected
                            ? "bg-fest-orange/20 text-white font-bold"
                            : "hover:bg-white/10 text-white/90"
                        )}
                      >
                        <td className="px-4 py-2.5 font-bold tracking-wide">
                          <span className={cn(isSelected ? "text-fest-orange" : "text-white")}>
                            {row.size}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium text-white/90">{row.waist}&quot;</td>
                        <td className="px-4 py-2.5 font-medium text-white/90">{row.length}&quot;</td>
                        <td className="px-3 py-2.5 text-right">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-fest-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fest-ink shadow-xs">
                              <Check className="h-3 w-3" /> Selected
                            </span>
                          ) : (
                            <span className="text-[11px] text-fest-label/60 transition hover:text-fest-orange">
                              Select →
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Measuring Guide Footer matching image instructions */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs leading-relaxed text-fest-label">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-fest-orange" />
              <div className="space-y-1">
                {isJersey ? (
                  <>
                    <p>
                      <strong className="text-fest-white">Chest:</strong> Measure around the fullest part of your chest for best fit.
                    </p>
                    <p>
                      <strong className="text-fest-white">Length:</strong> Length measured from shoulder seam straight down to hem.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-fest-white">Waist:</strong> Measure around your natural waistline.
                    </p>
                    <p>
                      <strong className="text-fest-white">Length:</strong> Outseam length measured from top of waistband straight down to bottom hem.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
