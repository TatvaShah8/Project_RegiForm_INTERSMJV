"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Camera, X, RefreshCw, Shirt, Ruler } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister, selectAge } from "@/lib/store";
import { loadRegistration, registrationRequest, finalRegistrationForm, addPhotoToForm } from "@/lib/registration-api";
import {
  getBranchesForGender,
  BLOOD_GROUPS,
  YEARS_OF_STUDY,
  RELATIONS,
  MONTHS,
  isPhone,
  getTshirtSizesForGender,
  getTrackPantSizesForGender,
  getJerseySizeInfo,
  getTrackPantSizeInfo,
  AGREEMENT_TEXT,
} from "@/lib/fest";
import { TrackPantSizeModal } from "./TrackPantSizeModal";
import { compressImageToMaxKB } from "@/lib/image-compress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  StepHeading,
  Field,
  FestInput,
  CTAButton,
  PillGroup,
  selectTriggerCls,
  staggerParent,
  staggerChild,
} from "./ui-bits";

const DOB_TABS = [
  { key: "dropdown", label: "🔤 SELECT DAY / MONTH / YEAR" },
] as const;

export function Step3General({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const s = useRegister();
  const { toast } = useToast();
  const [errs, setErrs] = React.useState<Record<string, string>>({});
  const [savingRegistration, setSavingRegistration] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [calOpen, setCalOpen] = React.useState(false);
  const [showSizeModal, setShowSizeModal] = React.useState(false);
  const [sizeModalCategory, setSizeModalCategory] = React.useState<"jersey" | "track-pants">("jersey");
  const [compressingPhoto, setCompressingPhoto] = React.useState(false);

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

  const age = selectAge(s.dob);
  const maxYear = 2026;
  const yearOpts = Array.from({ length: 101 }, (_, i) => maxYear - i);

  /* live camera state */
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">("user");
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [cameraLoading, setCameraLoading] = React.useState(false);
  const [cameraReady, setCameraReady] = React.useState(false);
  const nativeCameraInputRef = React.useRef<HTMLInputElement | null>(null);

  const startStream = async (mode: "user" | "environment") => {
    setCameraLoading(true);
    setCameraReady(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraStream(null);
      }
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        toast({
          title: "CAMERA UNAVAILABLE",
          description: "Live camera is not supported on this browser. Please use Choose File to upload.",
          variant: "destructive",
        });
        setCameraOpen(false);
        setCameraLoading(false);
        return;
      }

      let stream: MediaStream | null = null;

      // Strategy 1: Ideal 720p with facingMode (supported natively by iOS & Android camera HAL)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Strategy 2: Simple facingMode constraint
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch {
          // Strategy 3: Any video track
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!stream) throw new Error("Could not initialize camera stream");

      streamRef.current = stream;
      setCameraStream(stream);
    } catch (err: any) {
      console.error("Camera error:", err);
      toast({
        title: "CAMERA ACCESS DENIED",
        description: "Could not access camera. Please allow camera permissions or upload an image file.",
        variant: "destructive",
      });
      setCameraOpen(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const openCamera = () => {
    setCameraOpen(true);
    startStream(facingMode);
  };

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraStream(null);
    setCameraReady(false);
    setCameraLoading(false);
    setCameraOpen(false);
  }, []);

  const switchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startStream(nextMode);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast({
        title: "CAMERA NOT READY",
        description: "Please wait a moment for the camera feed to start.",
        variant: "destructive",
      });
      return;
    }
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight, 640);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.90);
    stopCamera();

    try {
      setCompressingPhoto(true);
      const res = await compressImageToMaxKB(rawDataUrl, 200);
      s.set("photo", res.dataUrl);
      setErr("photo");
      toast({
        title: "PHOTO READY",
        description: "Your photo is ready for registration.",
      });
    } catch (err) {
      console.error("Camera photo compression error:", err);
      s.set("photo", rawDataUrl);
      setErr("photo");
    } finally {
      setCompressingPhoto(false);
    }
  };

  React.useEffect(() => {
    const video = videoRef.current;
    if (!cameraOpen || !video || !cameraStream) return;

    video.srcObject = cameraStream;
    video.muted = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    const markReadyAndPlay = () => {
      setCameraReady(true);
      video.play().catch((err) => {
        console.warn("Video play interrupted/denied:", err);
      });
    };

    video.addEventListener("loadedmetadata", markReadyAndPlay);
    video.addEventListener("canplay", markReadyAndPlay);

    // Initial play attempt
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadedmetadata", markReadyAndPlay);
      video.removeEventListener("canplay", markReadyAndPlay);
    };
  }, [cameraOpen, cameraStream]);

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const branchOptions = React.useMemo(() => getBranchesForGender(s.gender), [s.gender]);

  /* If gender was switched and current branch is not in options, reset it */
  React.useEffect(() => {
    if (s.branch && !branchOptions.includes(s.branch as any)) {
      s.set("branch", "");
    }
  }, [branchOptions, s.branch, s]);

  /* local DOB parts — survive partial day/month/year picks,
     re-synced whenever the store dob changes (calendar/typed modes) */
  const [parts, setParts] = React.useState<{ d?: number; m?: number; y?: number }>(
    () =>
      s.dob
        ? { d: s.dob.getDate(), m: s.dob.getMonth(), y: s.dob.getFullYear() }
        : {}
  );
  const dobTs = s.dob?.getTime();
  React.useEffect(() => {
    if (s.dob) setParts({ d: s.dob.getDate(), m: s.dob.getMonth(), y: s.dob.getFullYear() });
     
  }, [dobTs]);

  const setPart = (key: "d" | "m" | "y", raw: number) => {
    const p = { ...parts, [key]: raw };
    setParts(p);
    if (!p.d || p.m === undefined || !p.y) return;
    const date = new Date(p.y, p.m, p.d);
    if (date.getDate() !== p.d || date.getMonth() !== p.m) {
      toast({ title: "INVALID DATE", description: "That day doesn't exist in the selected month.", variant: "destructive" });
      return;
    }
    s.set("dob", date);
    setErr("dob");
  };

  const parseTyped = (v: string) => {
    setTyped(v);
    const m = v.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return;
    const d = +m[1];
    const mo = +m[2] - 1;
    const y = +m[3];
    const date = new Date(y, mo, d);
    if (date.getDate() === d && date.getMonth() === mo && y > 1900) {
      s.set("dob", date);
      setErr("dob");
    }
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    if (!/image\/(jpeg|jpg|png|webp)/i.test(f.type) && !/\.(jpe?g|png|webp)$/i.test(f.name)) {
      toast({
        title: "INVALID FORMAT",
        description: "Photo must be a JPG or PNG image file.",
        variant: "destructive",
      });
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      toast({
        title: "FILE EXCEEDS 25MB",
        description: "Please choose a photo under 25MB.",
        variant: "destructive",
      });
      return;
    }
    try {
      setCompressingPhoto(true);
      const res = await compressImageToMaxKB(f, 200);
      s.set("photo", res.dataUrl);
      setErr("photo");
      toast({
        title: "PHOTO READY",
        description: "Your photo is ready for registration.",
      });
    } catch (err: any) {
      console.error("Image compression error:", err);
      toast({
        title: "PHOTO COULD NOT BE PROCESSED",
        description: "Could not prepare this image. Please try another image file.",
        variant: "destructive",
      });
    } finally {
      setCompressingPhoto(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!s.photo) e.photo = "Please upload or capture a photo";
    if (age === null || age < 0 || age > 120) e.dob = "Pick a valid date of birth";
    if (!s.bloodGroup) e.bloodGroup = "Select your blood group";
    if (!s.branch) e.branch = "Select your SMJV branch";
    if (!s.homeTown.trim()) e.homeTown = "Home town is required";
    if (!s.college.trim()) e.college = "College / university is required";
    if (!s.course.trim()) e.course = "Course is required";
    if (!s.year) e.year = "Select your year";
    if (!isPhone(s.emergency)) e.emergency = "Enter a valid 10-digit guardian number";
    if (!s.relation) e.relation = "Select the relation";

    if (s.role === "cultural") {
      if (!s.tshirt) e.tshirt = "Select your tournament jersey size";
      if (!s.waist) e.waist = "Select your track pant size";
      if (!s.agreement) e.agreement = "Please accept the tournament regulations";
    }

    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || savingRegistration) {
      if (!savingRegistration) toast({ title: "MISSING REQUIRED FIELDS", description: "Please complete the highlighted fields to proceed.", variant: "destructive" });
      return;
    }
    setSavingRegistration(true);
    try {
      await registrationRequest("general", "PATCH", {
        branch: s.branch,
        bloodGroup: s.bloodGroup,
        dob: s.dob?.toISOString(),
        homeTown: s.homeTown,
        college: s.college,
        course: s.course,
        year: s.year,
        emergency: s.emergency,
        relation: s.relation,
      });
      if (s.role === "cultural") {
        const form = finalRegistrationForm(s);
        await addPhotoToForm(form, s.photo);
        await registrationRequest("finish", "POST", form);
        const account = await loadRegistration();
        if (!account?.completed) throw new Error("Saved registration could not be confirmed. Please retry.");
        s.loginAccount(account);
        toast({ title: "REGISTRATION SAVED", description: "Your registration is complete. Your ID pass is ready." });
      }
      onNext();
    } catch (error) {
      toast({ title: "COULD NOT SAVE", description: error instanceof Error ? error.message : "Try again", variant: "destructive" });
    } finally {
      setSavingRegistration(false);
    }
  };

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show">
      <motion.div variants={staggerChild}>
        <StepHeading
          num="03"
          title={s.role === "cultural" ? "Student Profile & Apparel Sizes" : "General Student Information"}
          subtitle={
            s.role === "cultural"
              ? "Complete your profile details and select your tournament jersey & track pant sizes to finalize registration."
              : "All details below appear on your official accreditation badge and tournament records."
          }
        />
      </motion.div>

      {/* photo + DOB/age */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <motion.div variants={staggerChild}>
          <Field label="UPLOAD PHOTO" required error={errs.photo}>
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-fest-orange px-4 text-xs font-bold uppercase tracking-wider text-fest-ink shadow-sm transition hover:brightness-110 active:scale-95">
                📁 Choose File
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => onPhoto(e.target.files?.[0])}
                />
              </label>

              <button
                type="button"
                onClick={openCamera}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-fest-orange/50 bg-white/75 px-4 text-xs font-bold uppercase tracking-wider text-fest-deep shadow-sm backdrop-blur-md transition hover:border-fest-orange hover:bg-white active:scale-95"
              >
                <Camera className="h-4 w-4 text-fest-orange" />
                Take Photo
              </button>

              <span className="text-xs font-mono text-fest-label">
                {compressingPhoto ? (
                  <span className="inline-flex items-center gap-1.5 text-fest-orange font-bold">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Preparing photo…
                  </span>
                ) : s.photo ? (
                  <span className="inline-flex items-center gap-1 text-fest-green font-bold">
                    ✓ Photo ready
                  </span>
                ) : (
                  "No photo chosen"
                )}
              </span>
            </div>
            <p className="mt-2 text-xs text-fest-label/70">
              Upload a clear JPG or PNG photo, or take a photo.
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div
                className={cn(
                  "group relative flex h-36 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed shadow-sm backdrop-blur-md",
                  errs.photo ? "border-red-500/60" : "border-fest-yellow/60",
                  "bg-white/60"
                )}
              >
                {compressingPhoto ? (
                  <div className="flex flex-col items-center gap-2 p-2 text-center text-fest-orange">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                      Preparing photo…
                    </span>
                  </div>
                ) : s.photo ? (
                  <>
                    <img src={s.photo} alt="Uploaded portrait" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        s.set("photo", null);
                        setErr("photo", "Please upload or capture a photo");
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/65 font-mono text-[10px] font-bold tracking-wider text-white opacity-0 transition group-hover:opacity-100"
                    >
                      REMOVE
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-fest-label">
                    <Camera className="h-8 w-8 opacity-70" />
                    <span className="font-mono text-[10px] tracking-[0.3em]">NO PHOTO</span>
                  </div>
                )}
              </div>

              {s.photo && !compressingPhoto && (
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-fest-green/40 bg-fest-green/10 px-2.5 py-1 font-mono text-[11px] font-bold text-fest-green shadow-xs">
                    <span>✓</span>
                    <span>Photo ready</span>
                  </div>
                  <p className="font-mono text-[10px] text-fest-label">
                    Ready for your ID pass
                  </p>
                </div>
              )}
            </div>
          </Field>
        </motion.div>

        <motion.div variants={staggerChild} className="min-w-0">
          <Field label="DATE OF BIRTH" required error={errs.dob}>
            <div className="mb-3 flex flex-wrap gap-2" role="tablist">
              {DOB_TABS.map((t) => {
                const active = s.dobMode === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => s.set("dobMode", t.key)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-[11px] font-bold tracking-wide transition",
                      active
                        ? "border-transparent bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-md shadow-fest-orange/20"
                        : "border-white/75 bg-white/55 text-fest-label shadow-sm backdrop-blur-md hover:border-fest-orange/60 hover:bg-white/80 hover:text-fest-white"
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {s.dobMode === "dropdown" && (
              <div className="grid grid-cols-3 gap-3">
                <Select
                  value={parts.d ? String(parts.d) : ""}
                  onValueChange={(v) => setPart("d", +v)}
                >
                  <SelectTrigger className={selectTriggerCls(!!errs.dob)} aria-label="Day">
                    <SelectValue placeholder="DD" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-fest-border bg-fest-panel text-fest-white">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)} className="text-fest-white focus:bg-fest-inner/70">
                        {String(d).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={parts.m !== undefined ? String(parts.m) : ""}
                  onValueChange={(v) => setPart("m", +v)}
                >
                  <SelectTrigger className={selectTriggerCls(!!errs.dob)} aria-label="Month">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-fest-border bg-fest-panel text-fest-white">
                    {MONTHS.map((name, i) => (
                      <SelectItem key={name} value={String(i)} className="text-fest-white focus:bg-fest-inner/70">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={parts.y ? String(parts.y) : ""}
                  onValueChange={(v) => setPart("y", +v)}
                >
                  <SelectTrigger className={selectTriggerCls(!!errs.dob)} aria-label="Year">
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-fest-border bg-fest-panel text-fest-white">
                    {yearOpts.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-fest-white focus:bg-fest-inner/70">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {s.dobMode === "calendar" && (
              <div className="rounded-xl border border-white/80 bg-white/65 p-3 shadow-sm backdrop-blur-md">
                <Calendar
                  mode="single"
                  selected={s.dob ?? undefined}
                  defaultMonth={s.dob ?? new Date(2006, 0, 1)}
                  onSelect={(d) => {
                    s.set("dob", d ?? null);
                    setErr("dob");
                  }}
                  className="bg-transparent p-0 text-fest-white [--cell-size:34px]"
                />
              </div>
            )}

            {s.dobMode === "typed" && (
              <FestInput
                error={!!errs.dob}
                className="font-mono"
                placeholder="DD/MM/YYYY"
                inputMode="numeric"
                value={typed}
                onChange={(e) => parseTyped(e.target.value)}
              />
            )}

            {s.dobMode === "dropdown" && (
              <p className="mt-2.5 text-xs text-fest-label/80">
                Select your birth date from the 3 dropdowns above, or{" "}
                <Popover open={calOpen} onOpenChange={setCalOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="font-medium text-fest-yellow underline underline-offset-4 transition hover:text-fest-gold"
                    >
                      📅 Open Calendar Picker
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-fest-border bg-fest-panel p-3" align="start">
                    <Calendar
                      mode="single"
                      selected={s.dob ?? undefined}
                      defaultMonth={s.dob ?? new Date(2006, 0, 1)}
                      onSelect={(d) => {
                        s.set("dob", d ?? null);
                        setErr("dob");
                        setCalOpen(false);
                      }}
                      className="bg-transparent p-0 text-fest-white [--cell-size:34px]"
                    />
                  </PopoverContent>
                </Popover>
              </p>
            )}
          </Field>

          <div className="mt-5">
            <Field label="AGE (YEARS)" required hint="Auto-computed from birthdate">
              <FestInput
                disabled
                value={age ? String(age) : ""}
                placeholder="Auto-calculated from DOB"
                className="font-mono text-fest-gold placeholder:text-fest-label/50"
              />
            </Field>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <motion.div variants={staggerChild}>
          <Field label="BLOOD GROUP" required error={errs.bloodGroup}>
            <Select
              value={s.bloodGroup}
              onValueChange={(v) => {
                s.set("bloodGroup", v);
                setErr("bloodGroup");
              }}
            >
              <SelectTrigger className={selectTriggerCls(!!errs.bloodGroup)}>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="border-fest-border bg-fest-panel text-fest-white">
                {BLOOD_GROUPS.map((b) => (
                  <SelectItem key={b} value={b} className="text-fest-white focus:bg-fest-inner/70">
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="WHICH SMJV BRANCH ARE YOU FROM?" required error={errs.branch}>
            <Select
              value={s.branch}
              onValueChange={(v) => {
                s.set("branch", v);
                setErr("branch");
              }}
            >
              <SelectTrigger className={selectTriggerCls(!!errs.branch)}>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent className="border-fest-border bg-fest-panel text-fest-white">
                {branchOptions.map((b) => (
                  <SelectItem key={b} value={b} className="text-fest-white focus:bg-fest-inner/70">
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="HOME TOWN" required error={errs.homeTown}>
            <FestInput
              error={!!errs.homeTown}
              placeholder="e.g. Surat / Rajkot"
              value={s.homeTown}
              onChange={(e) => {
                s.set("homeTown", e.target.value);
                setErr("homeTown");
              }}
            />
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="COLLEGE / UNIVERSITY NAME" required error={errs.college}>
            <FestInput
              error={!!errs.college}
              placeholder="e.g. MSU Baroda / Parul Univ"
              value={s.college}
              onChange={(e) => {
                s.set("college", e.target.value);
                setErr("college");
              }}
            />
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="COURSE PURSUING" required error={errs.course}>
            <FestInput
              error={!!errs.course}
              placeholder="e.g. B.Tech Computer / B.Com"
              value={s.course}
              onChange={(e) => {
                s.set("course", e.target.value);
                setErr("course");
              }}
            />
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="CURRENT YEAR OF STUDY" required error={errs.year}>
            <Select
              value={s.year}
              onValueChange={(v) => {
                s.set("year", v);
                setErr("year");
              }}
            >
              <SelectTrigger className={selectTriggerCls(!!errs.year)}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="border-fest-border bg-fest-panel text-fest-white">
                {YEARS_OF_STUDY.map((y) => (
                  <SelectItem key={y} value={y} className="text-fest-white focus:bg-fest-inner/70">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="EMERGENCY CONTACT NUMBER" required error={errs.emergency}>
            <FestInput
              error={!!errs.emergency}
              inputMode="numeric"
              maxLength={10}
              placeholder="Parent / Guardian 10-digit number"
              value={s.emergency}
              onChange={(e) => {
                s.set("emergency", e.target.value.replace(/\D/g, "").slice(0, 10));
                setErr("emergency");
              }}
            />
          </Field>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Field label="RELATION TO EMERGENCY CONTACT" required error={errs.relation}>
            <Select
              value={s.relation}
              onValueChange={(v) => {
                s.set("relation", v);
                setErr("relation");
              }}
            >
              <SelectTrigger className={selectTriggerCls(!!errs.relation)}>
                <SelectValue placeholder="Select relation" />
              </SelectTrigger>
              <SelectContent className="border-fest-border bg-fest-panel text-fest-white">
                {RELATIONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-fest-white focus:bg-fest-inner/70">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </motion.div>
      </div>

      {/* ── Cultural Team Specific: Jersey Size & Track Pant Size ── */}
      {s.role === "cultural" && (
        <>
          <motion.div
            variants={staggerChild}
            className="mt-6 rounded-2xl border border-white/80 bg-white/50 p-5 shadow-[0_8px_24px_rgba(28,36,56,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-xl"
          >
            <div className="mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-fest-orange">
                CULTURAL CONTINGENT APPAREL KIT
              </span>
              <h3 className="font-display text-lg uppercase tracking-wide text-fest-deep">
                Official Tournament Jersey &amp; Track Pant Size
              </h3>
              <p className="mt-1 text-xs text-fest-label">
                Select your tournament jersey and track pant sizes. All registered cultural team members receive an official customized festival apparel kit (Jersey + Track Pant).
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Field 1: Jersey Size */}
              <Field
                label="OFFICIAL TOURNAMENT JERSEY SIZE"
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
                  ariaLabel="Jersey size"
                  options={jerseySizes}
                  value={s.tshirt}
                  onChange={(v) => {
                    s.set("tshirt", v);
                    setErr("tshirt");
                  }}
                />

                {jerseyInfo ? (
                  <div className="mt-2.5 flex items-center justify-between rounded-xl border border-fest-orange/30 bg-fest-orange/10 px-3 py-1.5 text-xs">
                    <span className="font-semibold text-fest-deep">
                      Selected: <span className="text-fest-orange font-bold">{jerseyInfo.size}</span>
                    </span>
                    <span className="font-mono text-[11px] text-fest-label">
                      Chest: <b className="text-fest-deep">{jerseyInfo.chest}&quot;</b> · Length:{" "}
                      <b className="text-fest-deep">{jerseyInfo.length}&quot;</b>
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

              {/* Field 2: Track Pant Size */}
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
                    <span className="font-semibold text-fest-deep">
                      Selected: <span className="text-fest-orange font-bold">{pantInfo.size}</span>
                    </span>
                    <span className="font-mono text-[11px] text-fest-label">
                      Waist: <b className="text-fest-deep">{pantInfo.waist}&quot;</b> · Length:{" "}
                      <b className="text-fest-deep">{pantInfo.length}&quot;</b>
                      {pantInfo.rise && pantInfo.rise !== "—" ? (
                        <> · Rise: <b className="text-fest-deep">{pantInfo.rise}&quot;</b></>
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
            </div>
          </motion.div>

          <motion.div
            variants={staggerChild}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-md"
          >
            <Checkbox
              id="cultural-agreement"
              checked={s.agreement}
              onCheckedChange={(v) => {
                s.set("agreement", v === true);
                setErr("agreement");
              }}
              className="mt-0.5 h-5 w-5 rounded-md border-fest-border data-[state=checked]:border-fest-orange data-[state=checked]:bg-fest-orange"
            />
            <label htmlFor="cultural-agreement" className="text-sm leading-relaxed text-fest-label">
              {AGREEMENT_TEXT}
              {errs.agreement && <span className="mt-1 block text-xs text-red-400">{errs.agreement}</span>}
            </label>
          </motion.div>
        </>
      )}

      <motion.div variants={staggerChild} className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        <CTAButton variant="dark" onClick={onBack} className="w-full sm:w-auto justify-center text-center">
          ← BACK
        </CTAButton>
        <CTAButton
          variant="gradient"
          onClick={submit}
          disabled={savingRegistration}
          className={cn(
            "w-full sm:w-auto justify-center text-center",
            s.role === "cultural" ? "px-4 sm:px-7" : ""
          )}
        >
          {savingRegistration ? (
            "SAVING..."
          ) : s.role === "cultural" ? (
            <>
              <span className="sm:hidden">COMPLETE REGISTRATION 🏅</span>
              <span className="hidden sm:inline">COMPLETE REGISTRATION & GENERATE ID PASS 🏅</span>
            </>
          ) : (
            "NEXT: APPAREL & SPORTS →"
          )}
        </CTAButton>
      </motion.div>

      {/* ── Live Camera Modal ── */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-fest-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fest-orange/15 font-mono text-xs font-bold text-fest-orange">
                  <Camera className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm uppercase tracking-wide text-fest-deep md:text-base">
                  Take Live Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-lg p-1.5 text-fest-label hover:bg-fest-inner/60 hover:text-fest-deep"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-black shadow-inner flex items-center justify-center">
              {(!cameraReady || cameraLoading) && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/85 text-white">
                  <RefreshCw className="h-7 w-7 animate-spin text-fest-orange" />
                  <span className="font-mono text-xs text-fest-label">Starting camera feed…</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => setCameraReady(true)}
                onCanPlay={() => setCameraReady(true)}
                className="h-full w-full object-cover"
                style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[75%] w-[65%] rounded-full border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            </div>

            <p className="mt-2.5 text-center font-mono text-xs text-fest-label">
              Align your face inside the guide and click capture.
            </p>

            <div className="mt-4 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={switchCamera}
                className="inline-flex items-center gap-1.5 rounded-xl border border-fest-border bg-white/80 px-3 py-2 font-mono text-xs font-bold text-fest-label shadow-sm transition hover:border-fest-orange/40 hover:text-fest-deep"
                title="Switch Front/Back Camera"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Flip
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady || compressingPhoto}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                {compressingPhoto ? "Saving…" : !cameraReady ? "Starting…" : "Capture Photo"}
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="rounded-xl border border-fest-border bg-white/80 px-3.5 py-2 font-mono text-xs font-bold text-fest-label shadow-sm hover:text-fest-deep"
              >
                Cancel
              </button>
            </div>

            {/* Direct Device Camera / File Option */}
            <div className="mt-3 border-t border-fest-border/60 pt-2.5 text-center">
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="font-mono text-xs text-fest-orange underline underline-offset-2 hover:text-fest-deep transition"
              >
                📱 Or open device camera directly
              </button>
              <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    stopCamera();
                    onPhoto(file);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Apparel Size Modal for Cultural Team ── */}
      {s.role === "cultural" && (
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
      )}
    </motion.div>
  );
}
