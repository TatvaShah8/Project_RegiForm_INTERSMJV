"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  LogIn,
  LogOut,
  Loader2,
  ArrowLeft,
  UserCheck,
  BedDouble,
  Trophy,
  Moon,
} from "lucide-react";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { FEST_NAME, ROLE_META, formatDob } from "@/lib/fest";
import { selectAge } from "@/lib/store";
import { cn } from "@/lib/utils";

interface PassProfile {
  firstName?: string;
  middleName?: string;
  surname?: string;
  email?: string;
  mobile?: string;
  gender?: string;
  bloodGroup?: string;
  dob?: string | null;
  branch?: string;
  homeTown?: string;
  college?: string;
  course?: string;
  year?: string;
  grNo?: string;
  role?: "sports" | "cultural";
  tshirt?: string;
  waist?: string;
  jerseyNumber?: string;
  outdoor?: string[];
  indoor?: string[];
  alsoParticipatesInCultural?: boolean;
  photo?: string | null;
  passNo?: string;
  isVerified?: boolean;
}

interface PassLookupResponse {
  valid?: boolean;
  authenticated?: boolean;
  verified?: boolean;
  passRole?: string;
  authDenied?: boolean;
  pass?: PassProfile;
  error?: string;
}

export default function PassVerificationPage() {
  const params = useParams<{ id: string }>();
  const passId = params?.id ?? "";

  const [user, setUser] = React.useState<User | null>(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [signingIn, setSigningIn] = React.useState(false);
  const [data, setData] = React.useState<PassLookupResponse | null>(null);

  React.useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, (current) => {
      setUser(current);
      setAuthReady(true);
    });
  }, []);

  const loadPass = React.useCallback(async () => {
    if (!passId || !authReady) return;
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
      const json = (await res.json()) as PassLookupResponse;
      setData(json);
    } catch {
      setData({ valid: false, error: "Could not verify pass right now." });
    } finally {
      setLoading(false);
    }
  }, [passId, user, authReady]);

  React.useEffect(() => {
    void loadPass();
  }, [loadPass]);

  const handleStaffLogin = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) return;
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      // User closed popup or sign-in failed
    } finally {
      setSigningIn(false);
    }
  };

  const handleStaffLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const pass = data?.pass;
  const fullName = pass
    ? [pass.firstName, pass.middleName, pass.surname].filter(Boolean).join(" ")
    : "";
  const dobDate = pass?.dob ? new Date(pass.dob) : null;
  const age = dobDate && !Number.isNaN(dobDate.getTime()) ? selectAge(dobDate) : null;
  const sports = pass ? [...(pass.outdoor || []), ...(pass.indoor || [])] : [];
  const roleMeta = ROLE_META[pass?.role || "sports"];

  return (
    <div className="min-h-[100dvh] w-full px-4 py-8 md:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/75 px-3 py-1.5 font-mono text-xs font-bold text-fest-deep shadow-xs backdrop-blur-md transition hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>HOME</span>
          </Link>

          {user && (
            <button
              type="button"
              onClick={handleStaffLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white/80 px-3 py-1.5 font-mono text-xs font-bold text-red-600 shadow-xs transition hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>SIGN OUT</span>
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/85 bg-white/80 shadow-[0_24px_60px_rgba(28,36,56,0.12)] backdrop-blur-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-fest-yellow to-fest-orange px-6 py-4 text-fest-ink">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">
              OFFICIAL PASS VERIFICATION
            </p>
            <h1 className="font-display text-xl uppercase tracking-wide sm:text-2xl">
              {FEST_NAME}
            </h1>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-fest-orange" />
                <p className="mt-3 font-mono text-xs text-fest-label">
                  VERIFYING OFFICIAL PASS...
                </p>
              </div>
            ) : !data?.valid ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <h2 className="mt-4 font-display text-xl uppercase text-fest-deep">
                  PASS NOT FOUND
                </h2>
                <p className="mt-2 max-w-sm text-sm text-fest-label">
                  This QR code does not match an active registration for {FEST_NAME}.
                </p>
              </div>
            ) : !data.authenticated || !pass ? (
              /* Public / Non-Staff View — Zero personal details exposed */
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl border",
                    data.verified
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      : "border-fest-orange/30 bg-fest-orange/10 text-fest-orange"
                  )}
                >
                  <ShieldCheck className="h-8 w-8" />
                </div>

                <span
                  className={cn(
                    "mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider",
                    data.verified
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  )}
                >
                  {data.verified ? "VERIFIED PASS" : "VALID REGISTRATION · PENDING VERIFICATION"}
                </span>

                <p className="mt-2 font-mono text-xs font-bold uppercase tracking-widest text-fest-label">
                  CATEGORY: {data.passRole || "PARTICIPANT"}
                </p>

                <div className="mt-6 w-full rounded-2xl border border-fest-border/70 bg-white/70 p-4 text-left">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-fest-orange" />
                    <div className="text-xs leading-relaxed text-fest-label">
                      <p className="font-bold text-fest-deep">
                        Participant details are protected
                      </p>
                      <p className="mt-1">
                        Personal information, sports eligibility, accommodation, and attendance actions are restricted to authorized Committee &amp; Team Staff.
                      </p>
                    </div>
                  </div>
                </div>

                {data.authDenied && (
                  <p className="mt-3 font-mono text-xs font-semibold text-red-600">
                    Signed-in account does not have Committee / Staff access.
                  </p>
                )}

                {isFirebaseConfigured && (
                  <button
                    type="button"
                    onClick={handleStaffLogin}
                    disabled={signingIn}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-fest-deep px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-sm transition hover:bg-fest-deep/90 disabled:opacity-60"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{signingIn ? "SIGNING IN..." : "COMMITTEE / STAFF SIGN IN"}</span>
                  </button>
                )}
              </div>
            ) : (
              /* Authorized Committee / Staff View */
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {pass.photo ? (
                    <img
                      src={pass.photo}
                      alt={fullName}
                      className="h-24 w-20 shrink-0 rounded-2xl border-2 border-fest-orange/40 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-2xl border border-fest-border bg-white text-fest-label">
                      <UserCheck className="h-7 w-7" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-fest-deep px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-yellow">
                        {roleMeta.passLabel}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                          pass.isVerified
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                            : "border-red-500/30 bg-red-500/10 text-red-700"
                        )}
                      >
                        {pass.isVerified ? "VERIFIED" : "UNVERIFIED"}
                      </span>
                    </div>

                    <h2 className="mt-1.5 font-display text-2xl uppercase tracking-wide text-fest-deep">
                      {fullName || "SMJVian"}
                    </h2>
                    <p className="font-mono text-xs text-fest-label">
                      {(pass.branch || "SMJV").toUpperCase()} · {pass.bloodGroup || "—"} ·{" "}
                      {age ? `${age} yrs` : "—"} · GR: <b className="text-fest-deep">{pass.grNo || "—"}</b>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-fest-border/70 bg-white/75 p-4 font-mono text-xs sm:grid-cols-2">
                  <div>
                    <span className="text-[10px] uppercase text-fest-label">Contact</span>
                    <p className="font-bold text-fest-deep">{pass.mobile || "—"}</p>
                    <p className="truncate text-[11px] text-fest-label">{pass.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-fest-label">Academic</span>
                    <p className="font-bold text-fest-deep">{pass.college || "—"}</p>
                    <p className="text-[11px] text-fest-label">
                      {pass.course || "—"} {pass.year ? `(${pass.year})` : ""}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-fest-label">Eligible Sports</span>
                    <p className="font-bold text-fest-deep">
                      {sports.length > 0 ? sports.join(", ") : "Cultural Only"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-fest-label">Kit &amp; Jersey</span>
                    <p className="font-bold text-fest-deep">
                      {pass.tshirt || "—"} / {pass.waist || "—"}
                      {pass.jerseyNumber ? ` · #${pass.jerseyNumber}` : ""}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-fest-label">DOB / Gender</span>
                    <p className="font-bold text-fest-deep">
                      {formatDob(dobDate)} · {pass.gender || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-fest-label">Pass ID</span>
                    <p className="font-bold text-fest-deep">{pass.passNo || "—"}</p>
                  </div>
                </div>

                {/* Role-Based Dashboard Modules Ready Indicator */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                  <div className="rounded-xl border border-fest-border/60 bg-white/60 p-2.5 text-fest-label">
                    <BedDouble className="mx-auto mb-1 h-4 w-4 text-fest-orange" />
                    <span>Accommodation</span>
                  </div>
                  <div className="rounded-xl border border-fest-border/60 bg-white/60 p-2.5 text-fest-label">
                    <Trophy className="mx-auto mb-1 h-4 w-4 text-fest-orange" />
                    <span>Referee / Points</span>
                  </div>
                  <div className="rounded-xl border border-fest-border/60 bg-white/60 p-2.5 text-fest-label">
                    <Moon className="mx-auto mb-1 h-4 w-4 text-fest-orange" />
                    <span>Night Attendance</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
