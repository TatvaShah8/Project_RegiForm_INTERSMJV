"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Ruler, Shirt } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister, type Role } from "@/lib/store";
import {
  ROLE_META,
  TSHIRT_SIZES,
  WAIST_SIZES,
  OUTDOOR_SPORTS,
  INDOOR_SPORTS,
  QUOTA_RULE,
  AGREEMENT_TEXT,
  getOutdoorSportsForGender,
  getTshirtSizesForGender,
  getTrackPantSizesForGender,
  getTrackPantSizeInfo,
  getJerseySizeInfo,
  type Role as RoleT,
} from "@/lib/fest";
import { TrackPantSizeModal } from "./TrackPantSizeModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  StepHeading,
  Field,
  PillGroup,
  CTAButton,
  SectionLabel,
  staggerParent,
  staggerChild,
} from "./ui-bits";

const ROLES: RoleT[] = ["sports", "cultural", "visitor"];

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
  const [showSizeModal, setShowSizeModal] = React.useState(false);
  const [sizeModalCategory, setSizeModalCategory] = React.useState<"jersey" | "track-pants">("track-pants");
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

  const submit = () => {
    const e: Record<string, string> = {};
    if (!s.role) e.role = "Choose how you're participating";
    if (!s.tshirt) e.tshirt = "Select your T-shirt size";
    if (!s.waist) e.waist = "Select your track pant size";
    if (s.role === "sports" && !q.valid)
      e.sports = q.isBhavnagar
        ? "Please select at least 1 sport (no limit for Bhavnagar branch)"
        : "Select 1, 2, or 3 sports (for 3 sports: 2 Outdoor + 1 Indoor, or 1 Outdoor + 2 Indoor)";
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
    s.complete();
    toast({
      title: "REGISTRATION COMPLETE 🏅",
      description: "Generating your official INTER SMJV 2026 ID pass…",
    });
    onComplete();
  };

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show">
      <motion.div variants={staggerChild}>
        <StepHeading
          num="04"
          title="Participation Role & Sports Selection"
          subtitle="Choose your participation tier and select your events following the tournament quota rules."
        />
      </motion.div>

      <motion.div variants={staggerChild}>
        <Field label="ARE YOU PARTICIPATING IN A SPORTS TEAM, CULTURAL TEAM, OR AS A VISITOR?" required error={errs.role}>
          <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Participation role">
            {ROLES.map((r) => {
              const active = s.role === r;
              const meta = ROLE_META[r];
              return (
                <motion.button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    s.set("role", r as Role);
                    setErr("role");
                  }}
                  className={cn(
                    "rounded-2xl border p-5 text-left transition",
                    active
                      ? "border-fest-orange bg-gradient-to-br from-fest-orange/15 to-fest-orange/5 shadow-lg shadow-fest-orange/15 backdrop-blur-md"
                      : "border border-white/80 bg-white/40 text-fest-label shadow-[0_6px_20px_rgba(28,36,56,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-xl hover:border-fest-orange/60 hover:bg-white/65"
                  )}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span
                    className={cn(
                      "mt-2 block font-display text-lg uppercase tracking-wide",
                      active ? "text-fest-orange" : "text-fest-white"
                    )}
                  >
                    {meta.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-fest-label">
                    {meta.sub}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Field>
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
                View Measurements (Waist &amp; Length) →
              </button>
            </div>
          )}
        </Field>
      </motion.div>

      {s.role === "sports" && (
        <>
          <motion.div
            variants={staggerChild}
            className={cn(
              "mt-6 rounded-2xl border p-5 shadow-sm backdrop-blur-xl",
              q.isBhavnagar
                ? "border-fest-orange/50 bg-fest-orange/10"
                : q.tone === "ok"
                ? "border-fest-green/40 bg-fest-green/10"
                : "border-fest-yellow/50 bg-fest-yellow/10"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
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
                  : `${q.tone === "ok" ? "✓" : "⚠"} ${genderWord} Sports Quota Rule:`}
              </span>
              <span className="rounded-md border border-white/80 bg-white/60 px-2.5 py-1 font-mono text-[10px] tracking-wider text-fest-label shadow-sm backdrop-blur-sm">
                {q.isBhavnagar
                  ? `Selected: ${q.outdoor} Outdoor · ${q.indoor} Indoor (Total: ${q.total} · No Limit)`
                  : `Selected: ${q.outdoor} Outdoor · ${q.indoor} Indoor (Total: ${q.total}/3)`}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fest-label">
              {q.isBhavnagar ? (
                <span>
                  Students of <b className="text-fest-white">Bhavnagar SMJV Branch</b> have{" "}
                  <b className="text-fest-orange">no limit on sports selection</b>! You can register for as many indoor and outdoor sports as you wish (minimum 1 sport).
                </span>
              ) : (
                <span>
                  A player can choose <b className="text-fest-white">1, 2, or 3 sports</b>. If choosing 3 sports:{" "}
                  <b className="text-fest-white">either 2 Outdoor + 1 Indoor, or 1 Outdoor + 2 Indoor</b> (maximum 2 in either category).
                </span>
              )}
            </p>
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                q.isBhavnagar
                  ? q.valid ? "text-fest-mint" : "text-fest-orange"
                  : q.tone === "ok" ? "text-fest-mint" : "text-fest-yellow"
              )}
            >
              {q.tone === "ok" ? "✓" : "•"} {q.message}
            </p>
          </motion.div>

          <motion.div variants={staggerChild} className="mt-6">
            <SectionLabel
              emoji="🏟"
              title={
                q.isBhavnagar
                  ? `OUTDOOR SPORTS (${q.outdoor} SELECTED · NO LIMIT)`
                  : `OUTDOOR SPORTS (${q.outdoor}/2 SELECTED)`
              }
              right="MAIN GROUNDS"
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
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
                        : "border border-white/80 bg-white/40 text-fest-label shadow-sm backdrop-blur-md hover:border-fest-orange/60 hover:bg-white/70 hover:text-fest-white"
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
                  : `INDOOR SPORTS (${q.indoor}/2 SELECTED)`
              }
              right="INDOOR HALL & CHESS ROOM"
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
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
                        : "border border-white/80 bg-white/40 text-fest-label shadow-sm backdrop-blur-md hover:border-fest-orange/60 hover:bg-white/70 hover:text-fest-white"
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

      {s.role === "cultural" && (
        <motion.div variants={staggerChild} className="mt-6 rounded-2xl border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-fest-yellow">
            🎭 SPORTS SELECTION
          </span>
          <p className="mt-2 text-sm text-fest-label">
            Not applicable — the sports quota applies to Sports Team athletes only. Your stage
            events are coordinated by the cultural committee after registration.
          </p>
        </motion.div>
      )}

      {s.role === "visitor" && (
        <motion.div variants={staggerChild} className="mt-6 rounded-2xl border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-fest-yellow">
            🎟 SPORTS SELECTION
          </span>
          <p className="mt-2 text-sm text-fest-label">
            Not applicable — visitors receive a spectator & resident pass without sports ties.
          </p>
        </motion.div>
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
        <CTAButton variant="gradient" onClick={submit} className="px-7">
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
