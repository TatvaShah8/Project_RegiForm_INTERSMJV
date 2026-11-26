"use client";

import * as React from "react";
import QRCode from "qrcode";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Printer,
  User,
  ExternalLink,
  Users,
  Check,
} from "lucide-react";
import {
  fetchSavedAccounts,
  setStudentVerification,
} from "@/lib/auth-storage";
import { useRegister, type RegisterState, selectAge } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { printPassCard } from "@/lib/print-pass";
import { formatDob, fullName } from "@/lib/fest";
import { IdPass, useFestQr } from "@/components/register/IdPass";

export function CommitteeVerificationDashboard() {
  const { toast } = useToast();
  const activeStudent = useRegister();

  const [accounts, setAccounts] = React.useState<Partial<RegisterState>[]>([]);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"ALL" | "UNVERIFIED" | "VERIFIED" | "SPORTS" | "CULTURAL">("ALL");
  const [branchFilter, setBranchFilter] = React.useState<string>("ALL");
  const [mounted, setMounted] = React.useState(false);

  const refreshAccounts = React.useCallback(async () => {
    try { setAccounts(await fetchSavedAccounts()); }
    catch (error) { toast({ title: "ROSTER UNAVAILABLE", description: error instanceof Error ? error.message : "Please sign in as a committee member", variant: "destructive" }); }
  }, [toast]);

  React.useEffect(() => {
    setMounted(true);
    refreshAccounts();
  }, [refreshAccounts]);

  const handleToggleVerification = async (account: Partial<RegisterState>) => {
    const grOrEmail = account.grNo || account.email;
    if (!grOrEmail) return;

    const nextState = !account.isVerified;
    try { await setStudentVerification(grOrEmail, nextState); }
    catch (error) {
      toast({ title: "VERIFICATION NOT SAVED", description: error instanceof Error ? error.message : "Please retry", variant: "destructive" });
      return;
    }

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

  const handlePrintStudent = async (account: Partial<RegisterState>) => {
    const age = account.dob ? selectAge(account.dob) : null;
    const sports = [...(account.outdoor || []), ...(account.indoor || [])];
    const isCultural = account.role === "cultural";

    let qr: string;
    const passId = (account.passNo || "").replace(/^#/, "").trim();
    const qrPayload = passId && typeof window !== "undefined"
      ? `${window.location.origin}/pass/${encodeURIComponent(passId)}`
      : "SMJV_VERIFIED_" + (account.grNo || "000");
    try { qr = await QRCode.toDataURL(qrPayload, { width: 300 }); }
    catch { toast({ title: "Could not prepare ID pass", description: "Please try again.", variant: "destructive" }); return; }
    printPassCard({
      name: [account.firstName, account.middleName, account.surname].filter(Boolean).join(" ") || "SMJVIAN",
      grNo: account.grNo || "—",
      branch: (account.branch || "SMJV").toUpperCase(),
      bloodGroup: account.bloodGroup || "—",
      age: age ? `${age} yrs` : "—",
      gender: account.gender ? account.gender.charAt(0) + account.gender.slice(1).toLowerCase() : "—",
      dob: formatDob(account.dob || null),
      mobile: account.mobile || "—",
      email: account.email || "—",
      college: account.college || "—",
      course: account.course || "—",
      year: account.year || "—",
      role: isCultural ? "CULTURAL" : "PLAYER",
      isVerified: !!account.isVerified,
      sports,
      kit: isCultural ? (account.tshirt || "—") : `${account.tshirt || "—"} / ${account.waist || "—"}`,
      jerseyNumber: !isCultural ? account.jerseyNumber : undefined,
      photo: account.photo,
      qr,
    });
  };

  const branches = Array.from(new Set(accounts.map((a) => a.branch).filter(Boolean))) as string[];

  const filtered = accounts.filter((acc) => {
    const q = search.trim().toLowerCase();
    const nameMatch = [acc.firstName, acc.middleName, acc.surname]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
    const grMatch = (acc.grNo || "").toLowerCase().includes(q);
    const mobileMatch = (acc.mobile || "").toLowerCase().includes(q);
    const branchMatch = (acc.branch || "").toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || grMatch || mobileMatch || branchMatch;

    if (!matchesSearch) return false;

    if (branchFilter !== "ALL" && (acc.branch || "").toLowerCase() !== branchFilter.toLowerCase()) {
      return false;
    }

    if (filter === "UNVERIFIED") return !acc.isVerified;
    if (filter === "VERIFIED") return !!acc.isVerified;
    if (filter === "SPORTS") return acc.role === "sports";
    if (filter === "CULTURAL") return acc.role === "cultural";
    return true;
  });

  const totalCount = accounts.length;
  const unverifiedCount = accounts.filter((a) => !a.isVerified).length;
  const verifiedCount = accounts.filter((a) => a.isVerified).length;
  const playerCount = accounts.filter((a) => a.role === "sports").length;
  const culturalCount = accounts.filter((a) => a.role === "cultural").length;

  if (!mounted) return null;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-fest-bg font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-white/80 bg-white/70 shadow-xs backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-fest-orange/30 bg-white/80 px-3 py-1.5 font-mono text-xs font-semibold text-fest-deep shadow-xs transition hover:border-fest-orange hover:bg-white active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Portal</span>
            </Link>
            <div className="hidden sm:block h-5 w-px bg-fest-border" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-fest-orange" />
              <h1 className="font-display text-base uppercase tracking-wide text-fest-deep sm:text-lg">
                SMJV YOUTH FESTIVAL 2026 · ACCREDITATION VERIFICATION
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-1.5 rounded-xl border border-fest-deep/20 bg-white/80 px-3 py-1.5 font-mono text-xs font-semibold text-fest-deep shadow-xs transition hover:bg-white active:scale-95"
            >
              <span>Support Helpdesk</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 space-y-6">
        {/* Title and Instruction Banner */}
        <section className="rounded-3xl border border-white/90 bg-white/85 p-6 shadow-sm backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
                OFFICIAL COMMITTEE MASTER ROSTER
              </span>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl">
                PARTICIPANT VERIFICATION &amp; ACCREDITATION
              </h2>
              <p className="mt-1 font-mono text-xs text-fest-deep/80 max-w-2xl leading-relaxed">
                Match each student&apos;s <b>GR Number</b> and <b>Full Name</b> with the hostel branch record. Once verified, click the verify button to convert the pass from <b>UNVERIFIED</b> to <b>VERIFIED ✓</b>.
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-fest-deep/70">
                TOTAL REGISTERED
              </span>
              <p className="mt-1 font-display text-2xl text-fest-deep">{totalCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/70 p-3.5 shadow-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-800">
                ⚠ UNVERIFIED
              </span>
              <p className="mt-1 font-display text-2xl text-amber-700">{unverifiedCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-3.5 shadow-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                ✓ VERIFIED
              </span>
              <p className="mt-1 font-display text-2xl text-emerald-700">{verifiedCount}</p>
            </div>
            <div className="rounded-2xl border border-blue-400/30 bg-blue-50/70 p-3.5 shadow-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-800">
                ⚡ PLAYERS (SPORTS)
              </span>
              <p className="mt-1 font-display text-2xl text-blue-700">{playerCount}</p>
            </div>
            <div className="rounded-2xl border border-purple-400/30 bg-purple-50/70 p-3.5 shadow-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-purple-800">
                🎭 CULTURAL TEAM
              </span>
              <p className="mt-1 font-display text-2xl text-purple-700">{culturalCount}</p>
            </div>
          </div>
        </section>

        {/* Search, Filter Tabs and Branch Selector */}
        <section className="rounded-3xl border border-white/90 bg-white/80 p-5 shadow-sm backdrop-blur-2xl space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fest-deep/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Student Name, GR Number (e.g. SMJV26-0142), Mobile, or Branch..."
                className="w-full rounded-2xl border border-white/85 bg-white/90 py-3 pl-10 pr-4 font-mono text-xs text-fest-deep shadow-inner placeholder:text-fest-deep/45 focus:border-fest-orange focus:bg-white focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-fest-deep/60 hover:text-fest-deep"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Branch dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs font-bold uppercase text-fest-deep/70">
                BRANCH:
              </span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="rounded-xl border border-white/90 bg-white py-2 px-3 font-mono text-xs font-semibold text-fest-deep shadow-xs focus:border-fest-orange focus:outline-hidden"
              >
                <option value="ALL">All Branches ({accounts.length})</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-fest-border/50 pt-3">
            {(
              [
                { id: "ALL", label: `ALL STUDENTS (${accounts.length})` },
                { id: "UNVERIFIED", label: `⚠ UNVERIFIED (${unverifiedCount})` },
                { id: "VERIFIED", label: `✓ VERIFIED (${verifiedCount})` },
                { id: "SPORTS", label: `⚡ PLAYERS (${playerCount})` },
                { id: "CULTURAL", label: `🎭 CULTURAL (${culturalCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-xl px-3 py-1.5 font-mono text-xs font-bold uppercase transition active:scale-95",
                  filter === tab.id
                    ? "bg-fest-deep text-fest-yellow shadow-xs"
                    : "border border-fest-border/70 bg-white/70 text-fest-deep hover:bg-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Student Cards Roster */}
        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/90 bg-white/80 p-12 text-center shadow-xs">
              <AlertCircle className="mx-auto h-10 w-10 text-fest-deep/30" />
              <h3 className="mt-3 font-display text-lg uppercase tracking-wide text-fest-deep">
                NO MATCHING PARTICIPANTS FOUND
              </h3>
              <p className="mt-1 font-mono text-xs text-fest-deep/70">
                Try modifying your search criteria or changing the filter.
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
                    "flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border p-4 sm:p-5 transition-all shadow-xs backdrop-blur-xl",
                    acc.isVerified
                      ? "border-emerald-500/35 bg-white/90 hover:border-emerald-500/60"
                      : "border-amber-500/35 bg-white/90 hover:border-amber-500/60"
                  )}
                >
                  {/* Left Column: Photo & Student Bio */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <div className="relative h-18 w-15 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm">
                      {acc.photo ? (
                        <img src={acc.photo} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-fest-bg font-mono text-xs text-fest-deep/60">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 right-0 text-[7px] font-bold text-center text-white py-0.5 uppercase tracking-wide",
                          acc.isVerified ? "bg-emerald-600" : "bg-amber-600"
                        )}
                      >
                        {acc.isVerified ? "VERIFIED" : "UNVERIFIED"}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-lg uppercase tracking-wide text-fest-deep truncate">
                          {name}
                        </h4>

                        {/* Role tag: PLAYER or CULTURAL */}
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider",
                            isSports
                              ? "border-blue-400/50 bg-blue-500/15 text-blue-700"
                              : "border-purple-400/50 bg-purple-500/15 text-purple-700"
                          )}
                        >
                          {isSports ? "⚡ PLAYER" : "🎭 CULTURAL"}
                        </span>

                        {/* Verification Tag */}
                        {acc.isVerified ? (
                          <span className="rounded-full border border-emerald-500/50 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-800 flex items-center gap-1">
                            ✓ VERIFIED
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-2.5 py-0.5 font-mono text-[9.5px] font-bold text-amber-800 flex items-center gap-1">
                            ⚠ UNVERIFIED
                          </span>
                        )}
                      </div>

                      {/* Official Identifiers */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-xs text-fest-deep">
                        <span className="font-bold text-fest-orange">
                          GR: {acc.grNo || "—"}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-fest-yellow">
                          BRANCH: {acc.branch?.toUpperCase() || "SMJV"}
                        </span>
                        <span>•</span>
                        <span className="text-red-700">🩸 {acc.bloodGroup || "—"}</span>
                        <span>•</span>
                        <span>+91 {acc.mobile || "—"}</span>
                      </div>

                      {/* College & Sports Info */}
                      <div className="font-mono text-[11px] text-fest-deep/80 space-y-0.5">
                        <p className="truncate">
                          {acc.college || "—"} · <b className="text-fest-deep">{acc.course || "—"} ({acc.year || "—"})</b>
                        </p>
                        <p className="truncate font-semibold text-fest-deep/90">
                          {isSports && sportsList.length > 0
                            ? `Sports: ${sportsList.join(", ")} ${acc.jerseyNumber ? `(Jersey #${acc.jerseyNumber})` : ""} · Kit: ${acc.tshirt || "—"}`
                            : `Cultural: Stage & Arts Contingent · Kit: ${acc.tshirt || "—"}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Verification & Print Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-fest-border/60">
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(acc)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-display text-xs uppercase tracking-wider shadow-xs transition active:scale-95",
                        acc.isVerified
                          ? "border border-red-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-400"
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
                          <Check className="h-4 w-4" strokeWidth={3} />
                          <span>VERIFY WITH LIST ✓</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintStudent(acc)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-fest-deep/20 bg-white px-3.5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep hover:border-fest-orange hover:bg-white active:scale-95 shadow-xs"
                      title="Print Official Accreditation Pass"
                    >
                      <Printer className="h-3.5 w-3.5 text-fest-orange" />
                      <span>PRINT PASS</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
