"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Ruler, Shirt } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/lib/store";
import {
  TSHIRT_SIZES,
  WAIST_SIZES,
  INDOOR_SPORTS,
  AGREEMENT_TEXT,
  getOutdoorSportsForGender,
  getTshirtSizesForGender,
  getTrackPantSizesForGender,
  getTrackPantSizeInfo,
  getJerseySizeInfo,
} from "@/lib/fest";
import { TrackPantSizeModal } from "./TrackPantSizeModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { loadRegistration, registrationRequest, finalRegistrationForm, addPhotoToForm } from "@/lib/registration-api";
import {
  StepHeading,
  Field,
  PillGroup,
  CTAButton,
  SectionLabel,
  staggerParent,
  staggerChild,
} from "./ui-bits";

export function Step4Sports({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: () => void;
}) {
  const s = useRegister();
  const { toast } = useToast();
  const [errs, setErrs] = React.useState<Record<string, string>>({});
  const [savingRegistration, setSavingRegistration] = React.useState(false);
  const [showSizeModal, setShowSizeModal] = React.useState(false);
  const [sizeModalCategory, setSizeModalCategory] = React.useState<"jersey" | "track-pants">("track-pants");
  const [showQuotaInfo, setShowQuotaInfo] = React.useState(false);
  const q = s.quotaStatus();

  const jerseySizes = React.useMemo(() => getTshirtSizesForGender(s.gender), [s.gender]);
  const trackPantSizes = React.useMemo(() => getTrackPantSizesForGender(s.gender), [s.gender]);
  const jerseyInfo = getJerseySizeInfo(s.tshirt, s.gender);
  const pantInfo = getTrackPantSizeInfo(s.waist, s.gender);

  const openSizeChart = (cat: "jersey" | "track-pants") => {
    setSizeModalCategory(cat);
    setShowSizeModal(true);
  };

  const setErr = (k: string, v?: string) =>
    setErrs((e) => {
      const n = { ...e };
      if (v) n[k] = v;
      else delete n[k];
      return n;
    });

  const genderWord =
    s.gender === "MALE" ? "Male Player" : s.gender === "FEMALE" ? "Female Player" : "Player";

  const onSport = (kind: "outdoor" | "indoor", name: string) => {
    const res = s.toggleSport(kind, name);
    if (!res.ok)
      toast({ title: "SPORTS QUOTA", description: res.reason, variant: "destructive" });
  };

  const submit = async () => {
    if (savingRegistration) return;
    const e: Record<string, string> = {};
    if (!s.role) {
      s.set("role", "sports");
    }
    if (!s.jerseyNumber?.trim()) {
      e.jerseyNumber = "Please enter your desired jersey number (e.g. 7, 10, 18, 99)";
    } else if (!/^\d{1,3}$/.test(s.jerseyNumber)) {
      e.jerseyNumber = "Enter a jersey number from 0 to 999";
    }
    if (!s.tshirt) e.tshirt = "Select your T-shirt size";
    if (!s.waist) e.waist = "Select your track pant size";
    if (s.role === "sports" && !q.valid) {
      e.sports = q.isBhavnagar
        ? "Please select at least 1 sport (no limit for Bhavnagar branch)"
        : "Select 1, 2, or 3 sports (for 3 sports: 2 Outdoor + 1 Indoor, or 1 Outdoor + 2 Indoor)";
      setShowQuotaInfo(true);
    }
    if (!s.agreement) e.agreement = "Please accept the tournament regulations";
    setErrs(e);

    if (Object.keys(e).length > 0) {
      toast({
        title: "ALMOST THERE!",
        description: Object.values(e)[0] + " — then generate your pass.",
        variant: "destructive",
      });
      return;
    }
    setSavingRegistration(true);
    try {
      // Advisory check. The MongoDB compound unique index handles races.
      const availability = await registrationRequest(
        `jersey-availability?jerseyNumber=${encodeURIComponent(s.jerseyNumber)}`,
        "GET",
      );
      if (!availability.available) throw new Error("This jersey is already taken in your branch and gender");
      const form = finalRegistrationForm({ ...s, role: "sports" });
      await addPhotoToForm(form, s.photo);
      await registrationRequest("finish", "POST", form);
      const account = await loadRegistration();
        if (!account?.completed) throw new Error("Saved registration could not be confirmed. Please retry.");
        s.loginAccount(account);
      toast({ title: "REGISTRATION SAVED 🏅", description: "MongoDB saved your details and Supabase received your image." });
      onComplete();
    } catch (error) {
      toast({ title: "REGISTRATION NOT SAVED", description: error instanceof Error ? error.message : "Please retry", variant: "destructive" });
    } finally {
      setSavingRegistration(false);
    }
  };

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show">
      <motion.div variants={staggerChild}>
        <StepHeading
          num="04"
          title={s.role === "cultural" ? "Apparel & Kit Details" : "Apparel & Sports Selection"}
          subtitle={
            s.role === "cultural"
              ? "Confirm your kit sizes and jersey number for the cultural team."
              : "Confirm your kit sizes, jersey number, and select your tournament sports."
          }
        />
      </motion.div>

      <motion.div variants={staggerChild} className="mt-5 grid gap-5 md:grid-cols-2">
        <Field
          label="OFFICIAL TOURNAMENT T-SHIRT / JERSEY SIZE"
          required
          error={errs.tshirt}
          right={
            <button
              type="button"
              onClick={() => openSizeChart("jersey")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-fest-orange/40 bg-fest-orange/10 px-2.5 py-1 text-[11px] font-bold text-fest-orange shadow-xs transition hover:bg-fest-orange hover:text-fest-ink"
            >
              <Shirt className="h-3 w-3" />
              <span>Size Chart</span>
            </button>
          }
        >
          <PillGroup
            ariaLabel="T-shirt size"
            options={jerseySizes}
            value={s.tshirt}
            onChange={(v) => {
              s.set("tshirt", v);
              setErr("tshirt");
            }}
          />

          {jerseyInfo ? (
            <div className="mt-2.5 flex items-center justify-between rounded-xl border border-fest-orange/30 bg-fest-orange/10 px-3 py-1.5 text-xs">
              <span className="font-semibold text-fest-white">
                Selected: <span className="text-fest-orange font-bold">{jerseyInfo.size}</span>
              </span>
              <span className="font-mono text-[11px] text-fest-label">
                Chest: <b className="text-fest-white">{jerseyInfo.chest}&quot;</b> · Length:{" "}
                <b className="text-fest-white">{jerseyInfo.length}&quot;</b>
              </span>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between text-[11px] text-fest-label/70">
              <span>Standard athletic fit</span>
              <button
                type="button"
                onClick={() => openSizeChart("jersey")}
                className="font-semibold text-fest-orange hover:underline"
              >
                View Measurements (Chest &amp; Length) →
              </button>
            </div>
          )}
        </Field>
        <Field
          label="OFFICIAL TRACK PANT SIZE (LOWER)"
          required
          error={errs.waist}
          right={
            <button
              type="button"
              onClick={() => openSizeChart("track-pants")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-fest-orange/40 bg-fest-orange/10 px-2.5 py-1 text-[11px] font-bold text-fest-orange shadow-xs transition hover:bg-fest-orange hover:text-fest-ink"
            >
              <Ruler className="h-3 w-3" />
              <span>Size Chart</span>
            </button>
          }
        >
          <PillGroup
            ariaLabel="Track pant size"
            options={trackPantSizes}
            value={s.waist}
            onChange={(v) => {
              s.set("waist", v);
              setErr("waist");
            }}
          />

          {pantInfo ? (
            <div className="mt-2.5 flex items-center justify-between rounded-xl border border-fest-orange/30 bg-fest-orange/10 px-3 py-1.5 text-xs">
              <span className="font-semibold text-fest-white">
                Selected: <span className="text-fest-orange font-bold">{pantInfo.size}</span>
              </span>
              <span className="font-mono text-[11px] text-fest-label">
                Waist: <b className="text-fest-white">{pantInfo.waist}&quot;</b> · Length:{" "}
                <b className="text-fest-white">{pantInfo.length}&quot;</b>
                {pantInfo.rise && pantInfo.rise !== "—" ? (
                  <> · Rise: <b className="text-fest-white">{pantInfo.rise}&quot;</b></>
                ) : null}
              </span>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between text-[11px] text-fest-label/70">
              <span>Standard athletic fit</span>
              <button
                type="button"
                onClick={() => openSizeChart("track-pants")}
                className="font-semibold text-fest-orange hover:underline"
              >
                View Measurements (Waist, Length &amp; Rise) →
              </button>
            </div>
          )}
        </Field>
      </motion.div>

      {/* ── Official Tournament Jersey Number Field ── */}
      <motion.div variants={staggerChild} className="mt-5">
        <Field
          label="OFFICIAL TOURNAMENT JERSEY NUMBER (PRINTED ON APPAREL)"
          required
          error={errs.jerseyNumber}
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            value={s.jerseyNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 3);
              s.set("jerseyNumber", val);
              setErr("jerseyNumber");
            }}
            placeholder="e.g. 7, 10, 18, 99"
            className="h-11 w-full rounded-xl border border-white/75 bg-white/40 px-4 font-mono text-sm font-bold text-fest-deep shadow-[inset_0_2px_4px_rgba(28,36,56,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.9)] backdrop-blur-xl placeholder:font-mono placeholder:text-fest-label/50 transition-all hover:bg-white/60 hover:border-fest-orange/50 focus-visible:bg-white/80 focus-visible:border-fest-orange focus-visible:outline-hidden"
          />
        </Field>
      </motion.div>

      {s.role === "sports" && (
        <>
          <motion.div variants={staggerChild} className="mt-6">
            <SectionLabel
              emoji="🏟"
              title={
                q.isBhavnagar
                  ? `OUTDOOR SPORTS (${q.outdoor} SELECTED · NO LIMIT)`
                  : `OUTDOOR SPORTS (${q.outdoor}/${q.maxOutdoor} SELECTED)`
              }
              right={
                <div className="flex items-center gap-2">
                  {q.total > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        s.set("outdoor", []);
                        s.set("indoor", []);
                        toast({
                          title: "SPORTS SELECTION RESET",
                          description: "All selected sports cleared. You can now select your desired sports.",
                        });
                      }}
                      className="rounded-full border border-red-300 bg-red-50/80 px-2.5 py-1 font-mono text-[10px] font-bold text-red-600 hover:bg-red-100 transition active:scale-95"
                    >
                      ✕ Reset Sports ({q.total})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowQuotaInfo((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full border border-fest-orange/50 bg-white/75 px-2.5 py-1 text-xs font-bold text-fest-deep shadow-xs backdrop-blur-md transition hover:border-fest-orange hover:bg-white active:scale-95"
                    title="Click to view Sports Quota Rules & Current Status"
                    aria-label="View Sports Quota Rules"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-fest-orange font-mono text-[10px] font-black text-fest-ink shadow-xs">
                      i
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-fest-label hover:text-fest-deep">
                      Quota Rules
                    </span>
                  </button>
                </div>
              }
            />

            {/* Sports Quota Rules and Live Status (Toggled via i button) */}
            {showQuotaInfo && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={cn(
                  "mb-4 rounded-2xl border p-4 shadow-md backdrop-blur-xl",
                  q.isBhavnagar
                    ? "border-fest-orange/50 bg-fest-orange/10"
                    : q.tone === "ok"
                    ? "border-fest-green/40 bg-fest-green/10"
                    : "border-fest-yellow/50 bg-fest-yellow/10"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-[0.14em]",
                      q.isBhavnagar
                        ? "text-fest-orange"
                        : q.tone === "ok"
                        ? "text-fest-mint"
                        : "text-fest-yellow"
                    )}
                  >
                    {q.isBhavnagar
                      ? "🌟 BHAVNAGAR BRANCH SPECIAL EXCEPTION"
                      : `${q.tone === "ok" ? "✓" : "ℹ"} ${genderWord} Sports Quota Rule:`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-white/80 bg-white/70 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-fest-label shadow-xs backdrop-blur-sm">
                      {q.isBhavnagar
                        ? `Selected: ${q.outdoor} Outdoor · ${q.indoor} Indoor (Total: ${q.total} · No Limit)`
                        : `Selected: ${q.outdoor} Outdoor · ${q.indoor} Indoor (Total: ${q.total}/3)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQuotaInfo(false)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-fest-deep/10 text-xs font-bold text-fest-label hover:bg-fest-deep/20 hover:text-fest-deep"
                      aria-label="Close quota info"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-fest-label">
                  {q.isBhavnagar ? (
                    <span>
                      Students of <b className="text-fest-deep">Bhavnagar SMJV Branch</b> have{" "}
                      <b className="text-fest-orange">no limit on sports selection</b>! You can register for as many indoor and outdoor sports as you wish (minimum 1 sport).
                    </span>
                  ) : s.gender === "FEMALE" ? (
                    <span>
                      Girls Sports Quota: You can choose <b className="text-fest-deep">1, 2, or 3 sports</b>. All 3 can be outdoor sports, all 3 can be indoor sports, or any combination!
                    </span>
                  ) : (
                    <span>
                      A player can choose <b className="text-fest-deep">1, 2, or 3 sports</b>. If choosing 3 sports:{" "}
                      <b className="text-fest-deep">either 2 Outdoor + 1 Indoor, or 1 Outdoor + 2 Indoor</b> (maximum 2 in either category).
                    </span>
                  )}
                </p>
                <p
                  className={cn(
                    "mt-2 text-xs sm:text-sm font-medium",
                    q.isBhavnagar
                      ? q.valid ? "text-fest-mint" : "text-fest-orange"
                      : q.tone === "ok" ? "text-fest-mint" : "text-fest-yellow"
                  )}
                >
                  {q.tone === "ok" ? "✓" : "•"} {q.message}
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {getOutdoorSportsForGender(s.gender).map((sp) => {
                const active = s.outdoor.includes(sp.name);
                return (
                  <motion.button
                    key={sp.name}
                    type="button"
                    aria-pressed={active}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onSport("outdoor", sp.name)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm font-bold transition",
                      active
                        ? "border-transparent bg-fest-yellow text-fest-ink shadow-lg shadow-fest-yellow/20"
                        : "border border-white/80 bg-white/40 text-fest-label shadow-sm backdrop-blur-md hover:border-fest-orange/60 hover:bg-white/70 hover:text-fest-deep"
                    )}
                  >
                    {sp.emoji} {sp.name}
                    <span className="ml-1.5">{active ? "✓" : "+"}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={staggerChild} className="mt-6">
            <SectionLabel
              emoji="🏸"
              title={
                q.isBhavnagar
                  ? `INDOOR SPORTS (${q.indoor} SELECTED · NO LIMIT)`
                  : `INDOOR SPORTS (${q.indoor}/${q.maxIndoor} SELECTED)`
              }
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {INDOOR_SPORTS.map((sp) => {
                const active = s.indoor.includes(sp.name);
                return (
                  <motion.button
                    key={sp.name}
                    type="button"
                    aria-pressed={active}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onSport("indoor", sp.name)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-[13px] font-bold transition",
                      active
                        ? "border-transparent bg-fest-yellow text-fest-ink shadow-lg shadow-fest-yellow/20"
                        : "border border-white/80 bg-white/40 text-fest-label shadow-sm backdrop-blur-md hover:border-fest-orange/60 hover:bg-white/70 hover:text-fest-deep"
                    )}
                  >
                    {sp.emoji} {sp.name}
                    <span className="ml-1.5">{active ? "✓" : "+"}</span>
                  </motion.button>
                );
              })}
            </div>
            {errs.sports && <p className="mt-2 text-xs font-medium text-red-400">{errs.sports}</p>}
          </motion.div>
        </>
      )}

      <motion.div variants={staggerChild} className="mt-7 flex items-start gap-3 rounded-2xl border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-md">
        <Checkbox
          id="agreement"
          checked={s.agreement}
          onCheckedChange={(v) => {
            s.set("agreement", v === true);
            setErr("agreement");
          }}
          className="mt-0.5 h-5 w-5 rounded-md border-fest-border data-[state=checked]:border-fest-orange data-[state=checked]:bg-fest-orange"
        />
        <label htmlFor="agreement" className="text-sm leading-relaxed text-fest-label">
          {AGREEMENT_TEXT}
          {errs.agreement && <span className="mt-1 block text-xs text-red-400">{errs.agreement}</span>}
        </label>
      </motion.div>

      <motion.div variants={staggerChild} className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <CTAButton variant="dark" onClick={onBack}>
          ← BACK
        </CTAButton>
        <CTAButton variant="gradient" onClick={submit} disabled={savingRegistration} className="px-7">
          COMPLETE REGISTRATION & GENERATE ID PASS 🏅
        </CTAButton>
      </motion.div>

      <TrackPantSizeModal
        open={showSizeModal}
        onOpenChange={setShowSizeModal}
        initialCategory={sizeModalCategory}
        gender={s.gender}
        selectedJerseySize={s.tshirt}
        selectedTrackPantSize={s.waist}
        onSelectJerseySize={(val) => {
          s.set("tshirt", val);
          setErr("tshirt");
        }}
        onSelectTrackPantSize={(val) => {
          s.set("waist", val);
          setErr("waist");
        }}
      />
    </motion.div>
  );
}
