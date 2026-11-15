"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRegister, selectAge } from "@/lib/store";
import { ROLE_META, fullName, OUTDOOR_SPORTS, INDOOR_SPORTS, formatDob } from "@/lib/fest";
import { useToast } from "@/hooks/use-toast";
import { printPassCard } from "@/lib/print-pass";
import { useFestQr, IdPass } from "./IdPass";
import { CTAButton } from "./ui-bits";

export function SuccessScreen() {
  const s = useRegister();
  const { toast } = useToast();
  const qr = useFestQr();
  const [passOpen, setPassOpen] = React.useState(false);
  const age = selectAge(s.dob);
  const sports = [...s.outdoor, ...s.indoor];
  const roleMeta = s.role ? ROLE_META[s.role] : null;

  const printPass = () => {
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
      role: roleMeta?.passLabel ?? "PARTICIPANT",
      sports: sports.map((name) => {
        const all = [...OUTDOOR_SPORTS, ...INDOOR_SPORTS];
        const found = all.find((sp) => sp.name === name);
        return found ? `${found.emoji} ${found.name}` : name;
      }),
      kit: `${s.tshirt || "—"} / ${s.waist || "—"}`,
      photo: s.photo,
      qr,
    });
  };

  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-10 text-center"
      >
        {/* green check */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-fest-green bg-fest-green/15"
        >
          <Check className="h-10 w-10 text-fest-mint" strokeWidth={3} />
        </motion.div>

        <p className="mt-6 font-mono text-xs font-bold tracking-[0.3em] text-fest-mint">
          OFFICIAL ACCREDITATION CONFIRMED
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-fest-white md:text-6xl">
          REGISTRATION{" "}
          <span className="fest-gradient-text">SUCCESSFUL!</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fest-label md:text-base">
          Welcome,{" "}
          <b className="text-fest-yellow">{fullName(s) || "SMJVian"}</b>! Your official digital
          tournament ID pass with scannable QR Code has been generated.
        </p>

        {/* login saved pill */}
        <div className="mt-6 max-w-md rounded-2xl border border-fest-yellow/40 bg-fest-yellow/10 px-5 py-3.5 text-sm text-fest-label shadow-sm backdrop-blur-md">
          <b className="text-fest-yellow">🍪 Login Saved in Browser:</b> You will remain
          automatically logged in on this device.
        </div>

        {/* mini ID card */}
        <div className="mt-8 w-full max-w-xl rounded-2xl border border-white/80 bg-white/50 p-5 text-left shadow-[0_16px_40px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-lg uppercase tracking-wide text-fest-white">
              SMJV YOUTH FESTIVAL 2026
            </span>
            <span className="rounded-full border border-fest-orange/50 bg-fest-orange/15 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-fest-orange">
              {roleMeta?.passLabel ?? "PARTICIPANT"}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            {s.photo ? (
              <img
                src={s.photo}
                alt="Pass portrait"
                className="h-16 w-14 rounded-lg border border-fest-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-14 items-center justify-center rounded-lg border border-dashed border-fest-border bg-fest-input font-mono text-[9px] text-fest-label">
                PHOTO
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg uppercase text-fest-white">
                {fullName(s) || "SMJVIAN"}
              </p>
              <p className="mt-0.5 font-mono text-xs text-fest-label">
                GR: <span className="text-fest-gold">{s.grNo || "—"}</span> · {s.branch || "—"} ·{" "}
                {age ?? "—"} yrs
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-fest-yellow">
                {s.role === "sports" && sports.length > 0
                  ? sports.join(", ")
                  : roleMeta
                    ? `${roleMeta.emoji} ${roleMeta.title}`
                    : "—"}
              </p>
            </div>
            {qr && (
              <div className="rounded-lg bg-white p-1.5">
                <img src={qr} alt="Pass QR code" className="h-16 w-16" />
              </div>
            )}
          </div>
        </div>

        {/* actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CTAButton variant="gradient" onClick={() => setPassOpen(true)} className="px-7">
            🖥 VIEW OFFICIAL ID CARD
          </CTAButton>
          <CTAButton variant="dark" onClick={printPass}>
            🖨 PRINT PASS
          </CTAButton>
          <CTAButton
            variant="ghost"
            className="font-display text-fest-white"
            onClick={() =>
              toast({
                title: "🚀 DASHBOARD COMING SOON",
                description: "The participant dashboard arrives in the next phase. Stay tuned!",
              })
            }
          >
            GO TO DASHBOARD →
          </CTAButton>
        </div>
      </motion.div>

      <IdPass open={passOpen} onOpenChange={setPassOpen} qr={qr} />
    </section>
  );
}
