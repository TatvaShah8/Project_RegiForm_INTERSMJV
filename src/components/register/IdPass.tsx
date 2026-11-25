"use client";

import * as React from "react";
import QRCode from "qrcode";
import { X, QrCode } from "lucide-react";
import { useRegister, selectAge } from "@/lib/store";
import {
  FEST_NAME,
  FEST_ORG,
  BOYS_OUTDOOR_SPORTS,
  GIRLS_OUTDOOR_SPORTS,
  OUTDOOR_SPORTS,
  INDOOR_SPORTS,
  ROLE_META,
  fullName,
  formatDob,
} from "@/lib/fest";
import { cn } from "@/lib/utils";
import { printPassCard } from "@/lib/print-pass";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Real scannable QR generated locally from the registration payload.
 * Strictly includes only student networking info (NO GR number, NO pass ID, NO blood group).
 */
export function useFestQr() {
  const s = useRegister();
  const [url, setUrl] = React.useState("");
  React.useEffect(() => {
    const payload = JSON.stringify({
      fest: FEST_NAME,
      fn: s.firstName || "Aarav",
      mn: s.middleName || "",
      sn: s.surname || "Mehta",
      mob: s.mobile || "9825040142",
      ht: s.homeTown || "Vadodara",
      br: s.branch || "Vadodara",
      co: s.course || "B.Tech Computer Science",
      cl: s.college || "Faculty of Technology & Engineering, MSU",
      yr: s.year || "3rd Year",
      jn: s.jerseyNumber || "",
    });
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 360,
      color: { dark: "#0A0E2A", light: "#FFFFFF" },
    })
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [
    s.firstName,
    s.middleName,
    s.surname,
    s.mobile,
    s.homeTown,
    s.branch,
    s.course,
    s.college,
    s.year,
    s.jerseyNumber,
  ]);
  return url;
}

function sportChip(name: string) {
  const all = [...BOYS_OUTDOOR_SPORTS, ...GIRLS_OUTDOOR_SPORTS, ...INDOOR_SPORTS];
  const found = all.find((sp) => sp.name === name);
  return found ? `${found.emoji} ${found.name}` : `⚡ ${name}`;
}

export function IdPass({
  open,
  onOpenChange,
  qr,
  onLogout,
  onOpenScanner,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  qr: string;
  onLogout?: () => void;
  onOpenScanner?: () => void;
}) {
  const s = useRegister();

  const age = selectAge(s.dob);
  const sports = [...s.outdoor, ...s.indoor];
  const roleMeta = s.role ? ROLE_META[s.role] : null;

  const handlePrint = () => {
    printPassCard({
      name: fullName(s) || "SMJVIAN",
      grNo: s.grNo || "—",
      branch: s.branch?.toUpperCase() || "SMJV",
      bloodGroup: s.bloodGroup || "—",
      age: age ? `${age} yrs` : "—",
      gender: s.gender ? s.gender.charAt(0) + s.gender.slice(1).toLowerCase() : "—",
      dob: formatDob(s.dob),
      mobile: s.mobile || "—",
      email: s.email || "—",
      college: s.college || "—",
      course: s.course || "—",
      year: s.year || "—",
      role: s.role === "cultural" ? "CULTURAL" : "PLAYER",
      isVerified: !!s.isVerified,
      sports: sports.map((name) => sportChip(name)),
      kit: s.role === "cultural" ? (s.tshirt || "—") : `${s.tshirt || "—"} / ${s.waist || "—"}`,
      jerseyNumber: s.role === "sports" ? s.jerseyNumber : undefined,
      photo: s.photo,
      qr,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 w-[calc(100%-1rem)] max-w-[460px] sm:max-w-[540px] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/85 bg-white/95 p-0 shadow-[0_24px_64px_rgba(28,36,56,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Official SMJV Youth Festival 2026 ID pass</DialogTitle>
          <DialogDescription>Tournament accreditation pass with QR verification.</DialogDescription>
        </DialogHeader>

        {/* printable card container */}
        <div className="print-area font-sans text-fest-white">
          {/* gradient header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-fest-yellow via-fest-orange to-fest-orange px-3.5 py-2 sm:px-5 sm:py-3 text-fest-ink">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <img
                src="/logo.jpg"
                alt="SMJV Youth Festival 2026 Logo"
                className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 rounded-full border border-black/20 object-cover shadow-xs"
              />
              <div className="min-w-0">
                <p className="font-display text-base sm:text-xl uppercase leading-none tracking-wide text-fest-ink">
                  SMJV YOUTH FESTIVAL 2026
                </p>
                <p className="mt-0.5 font-mono text-[8.5px] sm:text-[10px] font-bold tracking-[0.2em] text-fest-ink/80">
                  VADODARA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="whitespace-nowrap rounded-full bg-black/85 px-2 py-0.5 sm:px-3 sm:py-1 font-mono text-[8.5px] sm:text-[10px] font-bold tracking-widest text-white shadow-xs">
                {s.role === "cultural" ? "CULTURAL" : "PLAYER"}
              </span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full bg-black/15 p-1 text-fest-ink transition hover:bg-black/25 active:scale-95 shrink-0"
                title="Close"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {/* card body */}
          <div className="space-y-2 sm:space-y-2.5 p-3 sm:p-4 font-sans">
            {/* identity row */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="relative shrink-0">
                {s.photo ? (
                  <img
                    src={s.photo}
                    alt="Pass portrait"
                    className="h-18 w-15 sm:h-22 sm:w-18 rounded-xl border-2 border-fest-white/25 object-cover shadow-xs"
                  />
                ) : (
                  <div className="flex h-18 w-15 sm:h-22 sm:w-18 items-center justify-center rounded-xl border-2 border-dashed border-white/80 bg-white/60 font-mono text-[9px] tracking-[0.2em] text-fest-label backdrop-blur-sm">
                    PHOTO
                  </div>
                )}
                {s.isVerified ? (
                  <span className="absolute bottom-0.5 left-0.5 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[6.5px] sm:text-[7.5px] font-bold tracking-wider text-white shadow">
                    ✓ VERIFIED
                  </span>
                ) : (
                  <span className="absolute bottom-0.5 left-0.5 rounded-full bg-red-600 px-1.5 py-0.2 text-[6.5px] sm:text-[7.5px] font-bold tracking-wider text-white shadow">
                    UNVERIFIED
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <span className="rounded-md border border-fest-yellow/40 bg-fest-yellow/10 px-1.5 py-0.2 font-mono text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-fest-yellow">
                    {s.branch.toUpperCase() || "SMJV"}
                  </span>
                  <span className="rounded-md border border-red-500/40 bg-red-500/15 px-1.5 py-0.2 font-mono text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-red-700">
                    🩸 {s.bloodGroup || "—"}
                  </span>
                </div>
                <p className="font-display text-base sm:text-xl uppercase leading-tight text-fest-white break-words">
                  {fullName(s) || "SMJVIAN"}
                </p>
                <p className="font-mono text-[9px] sm:text-xs text-fest-label">
                  Age: {age ?? "—"} yrs · {s.gender ? s.gender.charAt(0) + s.gender.slice(1).toLowerCase() : "—"} · DOB: {formatDob(s.dob)} · GR: <span className="font-bold text-fest-gold">{s.grNo || "—"}</span>
                </p>
              </div>
            </div>

            {/* info panel */}
            <div className="space-y-1 rounded-xl border border-white/80 bg-white/60 p-2 sm:p-2.5 text-xs shadow-xs backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                <span className="shrink-0 font-mono text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-fest-label">CONTACT</span>
                <span className="font-mono text-[9px] sm:text-[10.5px] text-fest-white/95 break-all">
                  +91 {s.mobile || "—"} · {s.email || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-t border-fest-border/40 pt-1">
                <span className="font-mono text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-fest-label">COLLEGE / COURSE</span>
                <span className="font-mono text-[9px] sm:text-[10.5px] leading-snug text-fest-white/95">
                  {s.college || "—"} · <span className="font-bold text-fest-gold">{s.course || "—"} ({s.year || "—"})</span>
                </span>
              </div>
            </div>

            {/* sports + kit */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 rounded-xl border border-white/80 bg-white/60 px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-xs backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="font-mono text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-fest-label mr-0.5">
                  {s.role === "sports" ? "SPORTS:" : "ROLE:"}
                </span>
                {s.role === "sports" && sports.length > 0 ? (
                  sports.map((sp) => (
                    <span
                      key={sp}
                      className="whitespace-nowrap rounded-full border border-fest-yellow/40 bg-fest-yellow/10 px-2 py-0.2 font-mono text-[8.5px] sm:text-[9.5px] font-bold text-fest-yellow"
                    >
                      {sportChip(sp)}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-fest-yellow/40 bg-fest-yellow/10 px-2 py-0.2 font-mono text-[8.5px] sm:text-[9.5px] font-bold text-fest-yellow">
                    {roleMeta?.emoji} {roleMeta?.title ?? "PARTICIPANT"}
                  </span>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-1 rounded-md border border-fest-border/50 bg-white/60 px-2 py-0.5">
                <span className="font-mono text-[8px] sm:text-[9px] font-bold tracking-wider text-fest-label">
                  {s.role === "cultural" ? "JERSEY:" : "KIT:"}
                </span>
                <span className="font-mono text-[9.5px] sm:text-[11px] font-bold text-fest-gold">
                  {s.role === "cultural" ? (s.tshirt || "—") : `${s.tshirt || "—"} / ${s.waist || "—"}`}
                </span>
                {s.role === "sports" && s.jerseyNumber && (
                  <span className="ml-1 rounded bg-fest-orange/15 px-1.5 py-0.2 font-mono text-[9.5px] sm:text-[11px] font-bold text-fest-orange">
                    #{s.jerseyNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Centered QR Code */}
            {qr && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/80 bg-white/70 py-1.5 sm:py-2 shadow-xs backdrop-blur-md">
                <div className="rounded-xl border border-black/10 bg-white p-1.5 sm:p-2 shadow-xs">
                  <img
                    src={qr}
                    alt="Official Accreditation QR Code"
                    className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* actions */}
        <div className={cn("flex items-center gap-1.5 sm:gap-2.5 border-t border-white/70 bg-white/85 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md")}>
          <button
            type="button"
            onClick={handlePrint}
            className="h-8.5 sm:h-9.5 flex-1 whitespace-nowrap rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-2 sm:px-3 font-display text-[10px] sm:text-xs uppercase tracking-wider text-fest-ink shadow-xs transition hover:brightness-110 active:scale-[0.98]"
          >
            🖨 PRINT / SAVE PASS
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="h-8.5 sm:h-9.5 shrink-0 whitespace-nowrap rounded-xl border border-red-200 bg-red-50/70 px-2.5 sm:px-3.5 font-display text-[10px] sm:text-xs uppercase tracking-wider text-red-600 shadow-xs transition hover:bg-red-100 hover:border-red-300 active:scale-[0.98]"
              title="Log Out of this student account"
            >
              LOG OUT
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8.5 sm:h-9.5 shrink-0 whitespace-nowrap rounded-xl border border-white/80 bg-white/60 px-3 sm:px-4 font-display text-[10px] sm:text-xs uppercase tracking-wider text-fest-label shadow-xs backdrop-blur-md transition hover:border-fest-orange/60 hover:bg-white/80 hover:text-fest-white active:scale-[0.98]"
          >
            CLOSE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
