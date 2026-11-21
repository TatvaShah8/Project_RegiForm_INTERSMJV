"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  Check,
  RotateCcw,
  ShieldCheck,
  User,
  ExternalLink,
} from "lucide-react";
import {
  getSavedAccounts,
  setStudentVerification,
  findAccount,
} from "@/lib/auth-storage";
import { useRegister, type RegisterState } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fullName } from "@/lib/fest";

export function CommitteeVerificationModal({
  open,
  onOpenChange,
  onStudentSelected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentSelected?: (grNo: string) => void;
}) {
  const { toast } = useToast();
  const activeStudent = useRegister();

  const [accounts, setAccounts] = React.useState<Partial<RegisterState>[]>([]);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"ALL" | "UNVERIFIED" | "VERIFIED" | "SPORTS" | "CULTURAL">("ALL");

  const refreshAccounts = React.useCallback(() => {
    setAccounts(getSavedAccounts());
  }, []);

  React.useEffect(() => {
    if (open) {
      refreshAccounts();
    }
  }, [open, refreshAccounts]);

  const handleToggle = (account: Partial<RegisterState>) => {
    const grOrEmail = account.grNo || account.email;
    if (!grOrEmail) return;

    const nextState = !account.isVerified;
    setStudentVerification(grOrEmail, nextState);

    // If currently logged-in student in store matches, update live store too!
    if (
      (account.grNo && activeStudent.grNo?.toLowerCase() === account.grNo.toLowerCase()) ||
      (account.email && activeStudent.email?.toLowerCase() === account.email.toLowerCase())
    ) {
      activeStudent.set("isVerified", nextState);
    }

    refreshAccounts();

    const name = [account.firstName, account.surname].filter(Boolean).join(" ") || "Student";
    toast({
      title: nextState ? "STUDENT VERIFIED ✓" : "STATUS REVERTED",
      description: nextState
        ? `${name} (GR: ${account.grNo || "—"}) confirmed with official master list.`
        : `${name} marked as unverified.`,
    });
  };

  const filtered = accounts.filter((acc) => {
    const q = search.trim().toLowerCase();
    const nameMatch = [acc.firstName, acc.middleName, acc.surname]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
    const grMatch = (acc.grNo || "").toLowerCase().includes(q);
    const branchMatch = (acc.branch || "").toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || grMatch || branchMatch;

    if (!matchesSearch) return false;

    if (filter === "UNVERIFIED") return !acc.isVerified;
    if (filter === "VERIFIED") return !!acc.isVerified;
    if (filter === "SPORTS") return acc.role === "sports";
    if (filter === "CULTURAL") return acc.role === "cultural";
    return true;
  });

  const totalCount = accounts.length;
  const unverifiedCount = accounts.filter((a) => !a.isVerified).length;
  const verifiedCount = accounts.filter((a) => a.isVerified).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-[calc(100%-1rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-0 shadow-2xl backdrop-blur-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Committee Master Verification Roster</DialogTitle>
          <DialogDescription>
            Cross-check student GR number and name against the official list to mark verified.
          </DialogDescription>
        </DialogHeader>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-fest-border bg-gradient-to-r from-fest-yellow via-fest-orange to-fest-orange px-5 py-3.5 text-fest-ink">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-fest-ink" />
            <div>
              <h2 className="font-display text-lg uppercase tracking-wide text-fest-ink sm:text-xl">
                COMMITTEE ACCREDITATION &amp; VERIFICATION ROSTER
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-wider text-fest-ink/80">
                Match GR No. &amp; Full Name with official hostel list to turn Unverified into Verified
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-black/15 p-1 text-fest-ink transition hover:bg-black/25 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search, Filter & Quick Metrics */}
        <div className="border-b border-fest-border/60 bg-fest-bg/60 p-4 space-y-3">
          {/* Status summary badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fest-deep/20 bg-white/80 px-3 py-1 font-mono text-xs font-bold text-fest-deep shadow-xs">
              TOTAL ROSTER: {totalCount}
            </span>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold text-amber-800 shadow-xs">
              ⚠ UNVERIFIED (PENDING): {unverifiedCount}
            </span>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-800 shadow-xs">
              ✓ OFFICIALLY VERIFIED: {verifiedCount}
            </span>
          </div>

          {/* Search box & filter tabs */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fest-deep/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by GR Number (e.g. SMJV26-0142), Name, or Branch..."
                className="w-full rounded-xl border border-white/80 bg-white/90 py-2 pl-9 pr-4 font-mono text-xs text-fest-deep shadow-inner placeholder:text-fest-deep/45 focus:border-fest-orange focus:bg-white focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-fest-deep/60 hover:text-fest-deep"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: "ALL", label: "ALL" },
                  { id: "UNVERIFIED", label: "UNVERIFIED" },
                  { id: "VERIFIED", label: "VERIFIED" },
                  { id: "SPORTS", label: "PLAYERS" },
                  { id: "CULTURAL", label: "CULTURAL" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "rounded-xl px-2.5 py-1.5 font-mono text-[10.5px] font-bold uppercase transition active:scale-95",
                    filter === tab.id
                      ? "bg-fest-deep text-fest-yellow shadow-xs"
                      : "border border-fest-border/80 bg-white/70 text-fest-deep hover:bg-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="fest-scroll max-h-[50vh] overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-fest-deep/40" />
              <p className="mt-2 font-display text-sm uppercase text-fest-deep">
                NO MATCHING PARTICIPANTS FOUND
              </p>
              <p className="font-mono text-xs text-fest-deep/70">
                Try searching with another GR number, surname, or switch filter.
              </p>
            </div>
          ) : (
            filtered.map((acc, idx) => {
              const name = [acc.firstName, acc.middleName, acc.surname].filter(Boolean).join(" ") || "Student";
              const isSports = acc.role === "sports";
              const sportsList = [...(acc.outdoor || []), ...(acc.indoor || [])];

              return (
                <div
                  key={`${acc.grNo || acc.email}-${idx}`}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3 sm:p-3.5 transition-all shadow-xs backdrop-blur-md",
                    acc.isVerified
                      ? "border-emerald-500/30 bg-emerald-50/50 hover:bg-emerald-50/80"
                      : "border-amber-500/30 bg-amber-50/40 hover:bg-amber-50/70"
                  )}
                >
                  {/* Left: Photo and Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-10 sm:h-14 sm:w-11 shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-xs">
                      {acc.photo ? (
                        <img src={acc.photo} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-fest-bg font-mono text-[9px] text-fest-deep/60">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 right-0 text-[6.5px] font-bold text-center text-white py-0.2 uppercase tracking-wide",
                          acc.isVerified ? "bg-emerald-600" : "bg-amber-600"
                        )}
                      >
                        {acc.isVerified ? "VERIFIED" : "PENDING"}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display text-sm sm:text-base uppercase tracking-wide text-fest-deep truncate">
                          {name}
                        </span>

                        {/* Tag: PLAYER or CULTURAL */}
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                            isSports
                              ? "border-blue-400/50 bg-blue-500/15 text-blue-700"
                              : "border-purple-400/50 bg-purple-500/15 text-purple-700"
                          )}
                        >
                          {isSports ? "⚡ PLAYER" : "🎭 CULTURAL"}
                        </span>

                        {/* Verification Tag */}
                        {acc.isVerified ? (
                          <span className="rounded-md border border-emerald-500/50 bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
                            ✓ VERIFIED
                          </span>
                        ) : (
                          <span className="rounded-md border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-800">
                            ⚠ UNVERIFIED
                          </span>
                        )}
                      </div>

                      {/* GR, Branch, Contact, and Sports meta */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[11px] text-fest-deep/85">
                        <span className="font-bold text-fest-orange">
                          GR: {acc.grNo || "—"}
                        </span>
                        <span>•</span>
                        <span>{acc.branch?.toUpperCase() || "SMJV"}</span>
                        <span>•</span>
                        <span>🩸 {acc.bloodGroup || "—"}</span>
                        <span>•</span>
                        <span>+91 {acc.mobile || "—"}</span>
                      </div>

                      <p className="mt-0.5 font-mono text-[10.5px] text-fest-deep/70 truncate">
                        {isSports && sportsList.length > 0
                          ? `Sports: ${sportsList.join(", ")} ${acc.jerseyNumber ? `(Jersey #${acc.jerseyNumber})` : ""}`
                          : `Cultural: Stage & Arts contingent (Kit: ${acc.tshirt || "—"})`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Verification Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(acc)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-display text-xs uppercase tracking-wider shadow-xs transition active:scale-95",
                        acc.isVerified
                          ? "border border-red-300 bg-white/90 text-red-600 hover:bg-red-50 hover:border-red-400"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25"
                      )}
                    >
                      {acc.isVerified ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>REVERT TO UNVERIFIED</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          <span>VERIFY WITH LIST ✓</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-fest-border bg-white px-5 py-3">
          <p className="font-mono text-xs text-fest-deep/75">
            Tip: Changes persist automatically in browser storage. Students will immediately see their verified pass.
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-fest-border bg-fest-bg px-4 py-1.5 font-display text-xs uppercase tracking-wider text-fest-deep hover:bg-white active:scale-95"
          >
            CLOSE ROSTER
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
