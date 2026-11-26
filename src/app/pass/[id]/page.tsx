"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { ShieldCheck, Lock, AlertCircle, LogIn, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface PassProfile {
  firstName?: string;
  middleName?: string;
  surname?: string;
  gender?: string;
  branch?: string;
  college?: string;
  course?: string;
  year?: string;
  role?: string;
  tshirt?: string;
  waist?: string;
  jerseyNumber?: string;
  outdoor?: string[];
  indoor?: string[];
  alsoParticipatesInCultural?: boolean;
  isVerified?: boolean;
  photo?: string | null;
  mobile?: string;
  email?: string;
  passNo?: string;
  grNo?: string;
}

interface PassApiResponse {
  valid: boolean;
  access?: "public" | "committee";
  status?: "verified" | "registered";
  staffDenied?: boolean;
  profile?: PassProfile;
  error?: string;
}

export default function PassVerificationPage() {
  const params = useParams<{ id: string }>();
  const passId = typeof params?.id === "string" ? params.id : "";

  const [user, setUser] = React.useState<User | null>(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [authBusy, setAuthBusy] = React.useState(false);
  const [data, setData] = React.useState<PassApiResponse | null>(null);

  React.useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const fetchPass = React.useCallback(async () => {
    if (!passId) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`/api/pass/${encodeURIComponent(passId)}`, {
        headers,
        cache: "no-store",
      });
      const json = (await res.json()) as PassApiResponse;
      setData(json);
    } catch {
      setData({ valid: false, error: "Could not verify pass right now." });
    } finally {
      setLoading(false);
    }
  }, [passId, user]);

  React.useEffect(() => {
    if (authReady) {
      void fetchPass();
    }
  }, [authReady, fetchPass]);

  const handleStaffLogin = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) return;
    setAuthBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      // User closed popup or cancelled
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    setAuthBusy(true);
    try {
      await signOut(auth);
    } finally {
      setAuthBusy(false);
    }
  };

  const profile = data?.profile;
  const fullName = profile
    ? [profile.firstName, profile.middleName, profile.surname].filter(Boolean).join(" ")
    : "";
  const sports = profile ? [...(profile.outdoor || []), ...(profile.indoor || [])] : [];

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <TournamentNav activeNav="home" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full overflow-hidden rounded-3xl border border-white/85 bg-white/80 shadow-[0_24px_60px_rgba(28,36,56,0.12)] backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#d98412] via-[#e29119] to-[#df8a14] px-5 py-4 text-white">
            <div>
              <h1 className="font-display text-lg uppercase tracking-wide sm:text-xl">
                SMJV YOUTH FESTIVAL 2026
              </h1>
              <p className="font-mono text-[10px] tracking-[0.2em] text-white/85 uppercase">
                OFFICIAL PASS VERIFICATION · VADODARA
              </p>
            </div>
            <ShieldCheck className="h-7 w-7 shrink-0 text-white/95" />
          </div>

          {/* Body */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-fest-orange" />
                <p className="mt-3 font-mono text-xs uppercase tracking-wider text-fest-label">
                  Verifying Official Pass...
                </p>
              </div>
            ) : !data?.valid ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <h2 className="mt-4 font-display text-xl uppercase text-fest-deep">
                  PASS NOT FOUND
                </h2>
                <p className="mt-2 max-w-sm text-sm text-fest-label">
                  {data?.error || "This pass ID could not be verified."}
                </p>
              </div>
            ) : data.access === "committee" && profile ? (
              /* Authenticated Committee / Staff Full View */
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt={fullName}
                      className="h-24 w-20 shrink-0 rounded-xl border border-black/10 object-cover shadow-xs"
                    />
                  ) : (
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-black/5 font-display text-2xl text-fest-deep">
                      {(profile.firstName?.[0] || "S") + (profile.surname?.[0] || "")}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                          profile.isVerified
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700"
                            : "border-red-500/35 bg-red-500/10 text-red-700"
                        )}
                      >
                        {profile.isVerified ? "VERIFIED" : "UNVERIFIED"}
                      </span>
                      {profile.branch && (
                        <span className="rounded-full border border-fest-orange/35 bg-fest-orange/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-fest-orange">
                          {profile.branch}
                        </span>
                      )}
                      <span className="rounded-full bg-fest-deep px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-fest-yellow">
                        {profile.role === "cultural" ? "CULTURAL" : "PLAYER"}
                      </span>
                    </div>

                    <h2 className="mt-2 font-display text-2xl uppercase tracking-wide text-fest-deep">
                      {fullName}
                    </h2>
                    <p className="font-mono text-xs text-fest-label">
                      {profile.gender || "—"} · GR: <b className="text-fest-deep">{profile.grNo || "—"}</b>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/70 p-3.5 text-xs space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-fest-label uppercase">College / Course</span>
                    <span className="text-right font-semibold text-fest-deep">
                      {profile.college || "—"} · {profile.course || "—"} ({profile.year || "—"})
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-fest-label uppercase">Contact</span>
                    <span className="text-right font-mono text-fest-deep">
                      {profile.mobile ? `+91 ${profile.mobile}` : "—"} · {profile.email || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-fest-label uppercase">Kit / Jersey</span>
                    <span className="text-right font-mono font-bold text-fest-deep">
                      {profile.role === "cultural"
                        ? profile.tshirt || "—"
                        : `${profile.tshirt || "—"} / ${profile.waist || "—"}${profile.jerseyNumber ? ` · #${profile.jerseyNumber}` : ""}`}
                    </span>
                  </div>
                </div>

                {sports.length > 0 && (
                  <div className="rounded-2xl border border-black/10 bg-white/70 p-3.5">
                    <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                      Registered Sports
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sports.map((sp) => (
                        <span
                          key={sp}
                          className="rounded-lg border border-fest-orange/30 bg-fest-orange/10 px-2.5 py-1 font-mono text-[11px] font-bold text-fest-deep"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-black/10 pt-3">
                  <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                    ✓ Committee Access Unlocked
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={authBusy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-fest-deep transition hover:bg-black/5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Public Privacy-Safe View (No personal details exposed) */
              <div className="flex flex-col items-center py-4 text-center">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner",
                    data.status === "verified"
                      ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-700"
                      : "border-fest-orange/35 bg-fest-orange/15 text-fest-orange"
                  )}
                >
                  <ShieldCheck className="h-8 w-8" />
                </div>

                <span
                  className={cn(
                    "mt-4 rounded-full border px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-widest",
                    data.status === "verified"
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700"
                      : "border-fest-orange/40 bg-fest-orange/15 text-fest-orange"
                  )}
                >
                  {data.status === "verified" ? "ACTIVE · VERIFIED PASS" : "ACTIVE · REGISTERED PASS"}
                </span>

                <h2 className="mt-3 font-display text-2xl uppercase tracking-wide text-fest-deep">
                  OFFICIAL FESTIVAL PASS
                </h2>

                <div className="mt-4 flex w-full items-start gap-2.5 rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-left text-xs text-fest-label">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-fest-orange" />
                  <p className="leading-relaxed">
                    Participant personal details are protected and hidden from public scanners. Authorized Committee &amp; Festival Staff can sign in below to inspect pass details.
                  </p>
                </div>

                {data.staffDenied && user && (
                  <p className="mt-3 font-mono text-xs font-semibold text-red-600">
                    Signed in as {user.email} — this account does not have committee access.
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {!user ? (
                    <button
                      type="button"
                      onClick={handleStaffLogin}
                      disabled={authBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>COMMITTEE / STAFF SIGN IN</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={authBusy}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-deep transition hover:bg-black/5"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>SIGN OUT</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-black/10 pt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-fest-orange hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to SMJV Youth Festival 2026</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
