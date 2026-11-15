"use client";

import * as React from "react";
import { Ruler, Check, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TRACK_PANT_SIZE_CHART, type TrackPantSizeInfo } from "@/lib/fest";
import { cn } from "@/lib/utils";

interface TrackPantSizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
}

export function TrackPantSizeModal({
  open,
  onOpenChange,
  selectedSize,
  onSelectSize,
}: TrackPantSizeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-white/20 bg-fest-deep/95 p-0 text-white shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="border-b border-white/10 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fest-orange/20 text-fest-orange">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl uppercase tracking-wider text-fest-white">
                Official Track Pant Size Chart
              </DialogTitle>
              <DialogDescription className="text-xs text-fest-label">
                INTER SMJV 2026 Tournament Apparel Measurement Guide (Inches)
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Table Content matching user reference */}
        <div className="p-6 pt-2">
          <div className="overflow-hidden rounded-xl border border-white/15 bg-black/40 shadow-inner">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/15 bg-white/5 font-mono text-xs uppercase tracking-wider text-fest-orange">
                  <th className="px-4 py-3 font-bold">Size</th>
                  <th className="px-4 py-3 font-bold">Waist (Inches)</th>
                  <th className="px-4 py-3 font-bold">Length (Inches)</th>
                  <th className="px-3 py-3 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono">
                {TRACK_PANT_SIZE_CHART.map((row: TrackPantSizeInfo) => {
                  const isSelected =
                    selectedSize === row.size ||
                    (selectedSize && row.size.toLowerCase().includes(selectedSize.toLowerCase()));

                  return (
                    <tr
                      key={row.size}
                      onClick={() => {
                        if (onSelectSize) {
                          onSelectSize(row.size);
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
                      <td className="px-4 py-3.5 font-bold tracking-wide">
                        <span className={cn(isSelected ? "text-fest-orange" : "text-white")}>
                          {row.size}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-white/90">{row.waist}</td>
                      <td className="px-4 py-3.5 font-medium text-white/90">{row.length}</td>
                      <td className="px-3 py-3.5 text-right">
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
                })}
              </tbody>
            </table>
          </div>

          {/* Measuring Guide Footer */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs leading-relaxed text-fest-label">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-fest-orange" />
              <div className="space-y-1">
                <p>
                  <strong className="text-fest-white">Waist:</strong> Measured around natural waist circumference where your track pant elastic rests comfortably.
                </p>
                <p>
                  <strong className="text-fest-white">Length:</strong> Outer leg length measured from the waistband down to the bottom cuff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
