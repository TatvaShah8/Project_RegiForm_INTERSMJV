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
  GIRLS_JERSEY_SIZE_CHART,
  GIRLS_TRACK_PANT_SIZE_CHART,
  BOYS_TRACK_PANT_SIZE_CHART,
  BOYS_JERSEY_SIZE_CHART,
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
  const [activeGender, setActiveGender] = React.useState<"FEMALE" | "MALE">(
    gender === "FEMALE" ? "FEMALE" : "MALE"
  );

  // Sync state whenever modal opens or initial values change
  React.useEffect(() => {
    if (open) {
      setCategory(initialCategory);
      setActiveGender(gender === "FEMALE" ? "FEMALE" : "MALE");
    }
  }, [open, initialCategory, gender]);

  const effectiveTrackPantSize = selectedTrackPantSize || selectedSize;
  const effectiveSelectTrackPant = onSelectTrackPantSize || onSelectSize;

  const isGirls = activeGender === "FEMALE";
  const isJersey = category === "jersey";

  // Determine current chart title matching the official documents
  const chartTitle = isJersey
    ? isGirls
      ? "Standardized Girls Sports Jersey Size Chart"
      : "Standardized Boys Sports Jersey Size Chart"
    : isGirls
    ? "Standardized Girls Track Pants Size Chart"
    : "Standardized Boys Track Pants Size Chart";

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
                  INTER SMJV 2026 Tournament Apparel Measurement Guide (Inches)
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Dual Tabs: Category + Division */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
            {/* Category Tabs: Jersey vs Track Pants */}
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
                <span>Track Pants</span>
              </button>
            </div>

            {/* Division Switcher: Girls vs Boys */}
            <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveGender("FEMALE")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold transition",
                  isGirls
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-fest-label hover:text-white"
                )}
              >
                👩 Girls Division
              </button>
              <button
                type="button"
                onClick={() => setActiveGender("MALE")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold transition",
                  !isGirls
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-fest-label hover:text-white"
                )}
              >
                👨 Boys Division
              </button>
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
                  {(isGirls ? GIRLS_JERSEY_SIZE_CHART : BOYS_JERSEY_SIZE_CHART).map(
                    (row: JerseySizeInfo) => {
                      const isSelected =
                        selectedJerseySize === row.size ||
                        (selectedJerseySize &&
                          row.size.toLowerCase().includes(selectedJerseySize.toLowerCase()));

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
                          <td className="px-4 py-3 font-bold tracking-wide">
                            <span className={cn(isSelected ? "text-fest-orange" : "text-white")}>
                              {row.size}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-white/90">{row.chest}</td>
                          <td className="px-4 py-3 font-medium text-white/90">{row.length}</td>
                          <td className="px-3 py-3 text-right">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-fest-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fest-ink shadow-xs">
                                <Check className="h-3 w-3" /> Selected
                              </span>
                            ) : (
                              <span className="text-[11px] text-fest-label/60 transition group-hover:text-fest-orange">
                                Select →
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
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
                  {(isGirls ? GIRLS_TRACK_PANT_SIZE_CHART : BOYS_TRACK_PANT_SIZE_CHART).map(
                    (row: TrackPantSizeInfo) => {
                      const isSelected =
                        effectiveTrackPantSize === row.size ||
                        (effectiveTrackPantSize &&
                          row.size.toLowerCase().includes(effectiveTrackPantSize.toLowerCase()));

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
                          <td className="px-4 py-3 font-bold tracking-wide">
                            <span className={cn(isSelected ? "text-fest-orange" : "text-white")}>
                              {row.size}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-white/90">{row.waist}</td>
                          <td className="px-4 py-3 font-medium text-white/90">{row.length}</td>
                          <td className="px-3 py-3 text-right">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-fest-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fest-ink shadow-xs">
                                <Check className="h-3 w-3" /> Selected
                              </span>
                            ) : (
                              <span className="text-[11px] text-fest-label/60 transition group-hover:text-fest-orange">
                                Select →
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Measuring Guide Footer */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs leading-relaxed text-fest-label">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-fest-orange" />
              <div className="space-y-1">
                {isJersey ? (
                  <>
                    <p>
                      <strong className="text-fest-white">Chest:</strong> Measured horizontally around the fullest part of the chest under arms.
                    </p>
                    <p>
                      <strong className="text-fest-white">Length:</strong> Measured from the highest point of shoulder straight down to the bottom hem.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-fest-white">Waist:</strong> Measured around natural waist circumference where the waistband rests comfortably.
                    </p>
                    <p>
                      <strong className="text-fest-white">Length:</strong> Total outer length measured from waistband down to bottom ankle cuff.
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
