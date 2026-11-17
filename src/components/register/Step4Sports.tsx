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
  checkJerseyAvailability,
  getTakenJerseyNumbers,
  normalizeJerseyNumber,
} from "@/lib/auth-storage";
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

  const jerseyCheck = React.useMemo(() => {
    if (!s.jerseyNumber.trim()) return null;
    return checkJerseyAvailability(s.jerseyNumber, s.branch, s.gender, {
      email: s.email,
      grNo: s.grNo,
    });
  }, [s.jerseyNumber, s.branch, s.gender, s.email, s.grNo]);

  const takenNumbers = React.useMemo(() => {
    return getTakenJerseyNumbers(s.branch, s.gender, {
      email: s.email,
      grNo: s.grNo,
    });
  }, [s.branch, s.gender, s.email, s.grNo]);

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
    if (!s.jerseyNumber?.trim()) {
      e.jerseyNumber = "Please enter your desired jersey number (e.g. 7, 10, 18, 99)";
    } else {
      const check = checkJerseyAvailability(s.jerseyNumber, s.branch, s.gender, {
        email: s.email,
        grNo: s.grNo,
      });
      if (!check.available) {
        e.jerseyNumber = check.reason || "This jersey number is already taken.";
      }
    }
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
      description: "Generating your official SMJV Youth Festival 2026 ID pass…",
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

      {/* ── Official Tournament Jersey Number Field ── */}
      <motion.div variants={staggerChild} className="mt-5">
        <Field
          label="OFFICIAL TOURNAMENT JERSEY NUMBER (PRINTED ON APPAREL)"
          required
          error={errs.jerseyNumber}
          right={
            <span className="font-mono text-[10.5px] font-bold text-fest-label">
              Allocation: <b className="text-fest-orange">First-come, first-served</b>
            </span>
          }
        >
          <div className="relative rounded-2xl border border-white/80 bg-white/40 p-4 shadow-[0_6px_20px_rgba(28,36,56,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {/* Visual Jersey Preview Badge */}
                  <div className="relative flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-fest-orange/40 bg-gradient-to-br from-fest-yellow/20 via-fest-orange/20 to-fest-orange/10 shadow-inner">
                    <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-fest-orange">
                      JERSEY
                    </span>
                    <span className="font-display text-xl font-bold text-fest-deep leading-none">
                      {s.jerseyNumber.trim() ? `#${normalizeJerseyNumber(s.jerseyNumber)}` : "#—"}
                    </span>
                  </div>

                  {/* Input field */}
                  <div className="flex-1">
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
                      className="w-full rounded-xl border border-white/90 bg-white/80 px-4 py-2.5 font-mono text-base font-bold text-fest-deep shadow-inner placeholder:text-fest-label/50 focus:border-fest-orange focus:bg-white focus:outline-hidden"
                    />
                    <p className="mt-1 font-mono text-[11px] text-fest-label">
                      Unique per <b>{s.branch || "Branch"}</b> ({s.gender === "FEMALE" ? "Female" : "Male"} division).
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time Status Feedback */}
              <div className="sm:max-w-[280px]">
                {jerseyCheck ? (
                  jerseyCheck.available ? (
                    <div className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/15 px-3 py-2 text-xs font-semibold text-green-700">
                      <span className="text-base leading-none">✓</span>
                      <span>
                        Jersey <b>#{jerseyCheck.normalized}</b> is available for {s.branch || "your branch"} ({s.gender === "FEMALE" ? "Female" : "Male"} division)!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-700">
                      <span className="text-base leading-none">✗</span>
                      <span>
                        Jersey <b>#{jerseyCheck.normalized}</b> is already claimed by <b>{jerseyCheck.claimedBy}</b> for {s.branch} ({s.gender === "FEMALE" ? "Female" : "Male"}). Please pick another.
                      </span>
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border border-fest-border/50 bg-white/50 px-3 py-2 font-mono text-[10.5px] text-fest-label">
                    🔒 First-come, first-served per branch &amp; division.
                  </div>
                )}
              </div>
            </div>

            {/* List of already taken numbers in this division */}
            {takenNumbers.length > 0 && (
              <div className="mt-3 border-t border-fest-border/40 pt-2.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                  Already claimed for {s.branch || "Branch"} ({s.gender === "FEMALE" ? "Female" : "Male"} division):
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {takenNumbers.map((t) => (
                    <span
                      key={t.number}
                      className="inline-flex items-center gap-1 rounded-md border border-fest-border/60 bg-white/70 px-2 py-0.5 font-mono text-[10px] font-bold text-fest-deep shadow-2xs"
                      title={`Claimed by ${t.takenBy}`}
                    >
                      <span className="text-red-600">#{t.number}</span>
                      <span className="text-[9px] text-fest-label">({t.takenBy})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
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
