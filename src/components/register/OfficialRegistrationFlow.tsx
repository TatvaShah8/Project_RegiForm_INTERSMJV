"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  MailCheck,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Shirt,
  Upload,
  X,
} from "lucide-react";
import {
  BOYS_BRANCHES,
  GIRLS_BRANCHES,
  MONTHS,
  getJerseySizeInfo,
  getTrackPantSizeInfo,
  getTrackPantSizesForGender,
  getTshirtSizesForGender,
  isPhone,
} from "@/lib/fest";
import { compressImageToMaxKB } from "@/lib/image-compress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrackPantSizeModal } from "./TrackPantSizeModal";
import {
  CTAButton,
  FestInput,
  Field,
  PillGroup,
  SectionLabel,
  StepHeading,
  selectTriggerCls,
  staggerChild,
  staggerParent,
} from "./ui-bits";
import { cn } from "@/lib/utils";

type OfficialRole = "Hostel Rector" | "Trustee";
type Gender = "MALE" | "FEMALE";
type Step = 1 | 2 | 3 | "submitted";

interface OfficialFormState {
  role: OfficialRole | "";
  firstName: string;
  middleName: string;
  surname: string;
  gender: Gender | "";
  mobile: string;
  email: string;
  password: string;
  emailVerified: boolean;
  photo: string | null;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  tshirt: string;
  waist: string;
  branch: string;
  companyName: string;
  position: string;
  industry: string;
  allowMentorshipShare: boolean;
  agreeTerms: boolean;
}

const INITIAL_STATE: OfficialFormState = {
  role: "",
  firstName: "",
  middleName: "",
  surname: "",
  gender: "",
  mobile: "",
  email: "",
  password: "",
  emailVerified: false,
  photo: null,
  dobDay: "",
  dobMonth: "",
  dobYear: "",
  tshirt: "",
  waist: "",
  branch: "",
  companyName: "",
  position: "",
  industry: "",
  allowMentorshipShare: false,
  agreeTerms: false,
};

const stepVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir >= 0 ? 48 : -48,
    filter: "blur(4px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir >= 0 ? -48 : 48,
    filter: "blur(4px)",
    transition: { duration: 0.24, ease: "easeIn" as const },
  }),
};

export function getOfficialBranches(gender: Gender | "", role: OfficialRole | ""): string[] {
  const base =
    gender === "FEMALE"
      ? [...GIRLS_BRANCHES, "Bombay HO"]
      : gender === "MALE"
      ? [...BOYS_BRANCHES, "Bombay HO"]
      : ["Bombay HO"];
  if (role === "Trustee") {
    return [...base, "All / Central Committee"];
  }
  return base;
}

export function OfficialRegistrationFlow() {
  const [form, setForm] = React.useState<OfficialFormState>(INITIAL_STATE);
  const [step, setStep] = React.useState<Step>(1);
  const [dir, setDir] = React.useState(1);
  const [errs, setErrs] = React.useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = React.useState(false);

  /* Step 2 frontend-only email verification preview state */
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpInput, setOtpInput] = React.useState("");

  /* Step 3 photo & size chart state */
  const [compressingPhoto, setCompressingPhoto] = React.useState(false);
  const [showSizeModal, setShowSizeModal] = React.useState(false);
  const [sizeModalCategory, setSizeModalCategory] = React.useState<"jersey" | "track-pants">("jersey");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  /* Live camera state */
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">("user");
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [cameraLoading, setCameraLoading] = React.useState(false);
  const [cameraReady, setCameraReady] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!cameraOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [cameraOpen]);

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

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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
        setErrs((prev) => ({
          ...prev,
          photo: "Live camera is not supported on this browser. Please use Choose File instead.",
        }));
        setCameraOpen(false);
        setCameraLoading(false);
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      setCameraStream(stream);
    } catch {
      setErrs((prev) => ({
        ...prev,
        photo: "Camera permission denied or unavailable. Please allow camera access or use Choose File.",
      }));
      setCameraOpen(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const openCamera = () => {
    setErrs((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });
    setCameraOpen(true);
    startStream(facingMode);
  };

  const switchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startStream(nextMode);
  };

  React.useEffect(() => {
    const video = videoRef.current;
    if (!cameraOpen || !video || !cameraStream) return;
    video.srcObject = cameraStream;
    video.muted = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    const onReady = () => {
      setCameraReady(true);
      video.play().catch(() => {});
    };
    if (video.readyState >= 2) {
      onReady();
    } else {
      video.addEventListener("loadedmetadata", onReady, { once: true });
    }
  }, [cameraOpen, cameraStream]);

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
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

    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();

    setCompressingPhoto(true);
    try {
      const compressed = await compressImageToMaxKB(rawDataUrl, 350);
      setField("photo", compressed.dataUrl);
    } catch {
      setField("photo", rawDataUrl);
    } finally {
      setCompressingPhoto(false);
    }
  };

  const setField = <K extends keyof OfficialFormState>(key: K, value: OfficialFormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "email" && value !== prev.email) {
        next.emailVerified = false;
      }
      if (key === "gender" || key === "role") {
        const validBranches = getOfficialBranches(
          key === "gender" ? (value as Gender | "") : prev.gender,
          key === "role" ? (value as OfficialRole | "") : prev.role
        );
        if (prev.branch && !validBranches.includes(prev.branch)) {
          next.branch = "";
        }
      }
      return next;
    });
    setErrs((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const go = (target: Step) => {
    const order: Record<Step, number> = { 1: 1, 2: 2, 3: 3, submitted: 4 };
    setDir(order[target] >= order[step] ? 1 : -1);
    setStep(target);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const branchOptions = React.useMemo(
    () => getOfficialBranches(form.gender, form.role),
    [form.gender, form.role]
  );

  const jerseySizes = React.useMemo(() => getTshirtSizesForGender(form.gender), [form.gender]);
  const trackPantSizes = React.useMemo(() => getTrackPantSizesForGender(form.gender), [form.gender]);
  const jerseyInfo = getJerseySizeInfo(form.tshirt, form.gender);
  const pantInfo = getTrackPantSizeInfo(form.waist, form.gender);

  const yearOpts = React.useMemo(() => Array.from({ length: 85 }, (_, i) => 2010 - i), []);
  const dayOpts = React.useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")), []);

  const pw = form.password || "";
  const pwRules = React.useMemo(
    () => [
      { label: "8+ characters", met: pw.length >= 8 },
      { label: "1 number (0-9)", met: /\d/.test(pw) },
      { label: "1 lowercase (a-z)", met: /[a-z]/.test(pw) },
      { label: "1 uppercase (A-Z)", met: /[A-Z]/.test(pw) },
      { label: "1 special char (!@#...)", met: /[^a-zA-Z0-9]/.test(pw) },
    ],
    [pw]
  );

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.role) e.role = "Please select Hostel Rector or Trustee";
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.middleName.trim()) e.middleName = "Middle name is required";
    if (!form.surname.trim()) e.surname = "Surname is required";
    if (!form.gender) e.gender = "Please select Male or Female";
    if (!isPhone(form.mobile)) e.mobile = "Enter a valid 10-digit WhatsApp mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address";
    }
    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters";
    } else if (!/[a-z]/.test(form.password)) {
      e.password = "Include at least one lowercase letter (a-z)";
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = "Include at least one uppercase letter (A-Z)";
    } else if (!/\d/.test(form.password)) {
      e.password = "Include at least one number (0-9)";
    } else if (!/[^a-zA-Z0-9]/.test(form.password)) {
      e.password = "Include at least one special character (!@#...)";
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handlePhotoUpload = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrs((prev) => ({ ...prev, photo: "Please upload a valid image file (JPG or PNG)" }));
      return;
    }
    setCompressingPhoto(true);
    try {
      const compressed = await compressImageToMaxKB(file, 350);
      setField("photo", compressed.dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setField("photo", reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressingPhoto(false);
    }
  };

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.photo) e.photo = "Profile photo is required for your pass";
    if (!form.dobDay || !form.dobMonth || !form.dobYear) e.dob = "Date of birth is required";
    if (!form.tshirt) e.tshirt = "Please select a T-shirt size";
    if (!form.waist) e.waist = "Please select a pant size";
    if (!form.branch) e.branch = "Please select your SMJV Branch / Hostel";

    if (form.role === "Trustee") {
      if (!form.companyName.trim()) e.companyName = "Company / Organization name is required for Trustees";
      if (!form.position.trim()) e.position = "Position / Designation is required for Trustees";
      if (!form.industry.trim()) e.industry = "Industry / Sector is required for Trustees";
    }

    if (!form.agreeTerms) {
      e.agreeTerms = "You must agree to the Organizing Committee terms and conditions";
    }

    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const stepLabel =
    step === "submitted" ? "PREVIEW READY ✓" : `STEP 0${step} / 03`;

  const isTrustee = form.role === "Trustee";

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      {/* Unlisted standalone header (no navigation links to/from main site) */}
      <header className="sticky top-0 z-40 border-b border-white/75 bg-white/55 shadow-[0_4px_30px_rgba(28,36,56,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-180">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
          <span className="flex min-w-0 items-center gap-1.5 font-display text-xs uppercase tracking-wide text-fest-deep sm:gap-2.5 sm:text-base md:text-xl">
            <img
              src="/logo.jpg"
              alt="SMJV Youth Festival 2026 Logo"
              className="h-7 w-7 shrink-0 rounded-full border border-fest-orange/30 object-cover shadow-sm sm:h-8 sm:w-8 md:h-9 md:w-9"
            />
            <span className="truncate whitespace-nowrap">
              SMJV YOUTH FESTIVAL <span className="fest-gradient-text">2026</span>
            </span>
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.22em] text-fest-label sm:inline">
            RECTOR &amp; TRUSTEE REGISTRATION · VADODARA
          </span>
          <span className="shrink-0 rounded-md border border-white/80 bg-white/50 px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-fest-yellow shadow-sm backdrop-blur-md sm:px-2.5">
            {stepLabel}
          </span>
        </div>
      </header>

      <main className="fest-scroll mx-auto w-full max-w-4xl flex-1 px-3 py-6 md:px-6 md:py-10">
        {/* Progress bar */}
        {step !== "submitted" && (
          <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  step >= n
                    ? "bg-gradient-to-r from-fest-yellow to-fest-orange shadow-sm shadow-fest-orange/30"
                    : "bg-white/60"
                )}
              />
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-white/80 bg-white/55 p-5 shadow-[0_20px_60px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180 md:p-8">
          <AnimatePresence mode="wait" custom={dir}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <StepHeading
                  num="01 //"
                  title="IDENTITY & ROLE"
                  subtitle="Invite-only registration for SMJV Hostel Rectors and Trustees. Enter your official role, name, and login credentials."
                />

                <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-6">
                  {/* Role / Designation */}
                  <motion.div variants={staggerChild}>
                    <Field label="Role / Designation" required error={errs.role}>
                      <PillGroup
                        options={["Hostel Rector", "Trustee"]}
                        value={form.role}
                        onChange={(v) => setField("role", v as OfficialRole)}
                        ariaLabel="Role or Designation"
                      />
                    </Field>
                  </motion.div>

                  {/* Full Name */}
                  <motion.div variants={staggerChild} className="grid gap-4 md:grid-cols-3">
                    <Field label="First Name" htmlFor="off-first" required error={errs.firstName}>
                      <FestInput
                        id="off-first"
                        value={form.firstName}
                        onChange={(e) => setField("firstName", e.target.value)}
                        placeholder="First name"
                        error={!!errs.firstName}
                      />
                    </Field>
                    <Field label="Middle Name" htmlFor="off-middle" required error={errs.middleName}>
                      <FestInput
                        id="off-middle"
                        value={form.middleName}
                        onChange={(e) => setField("middleName", e.target.value)}
                        placeholder="Middle name"
                        error={!!errs.middleName}
                      />
                    </Field>
                    <Field label="Surname" htmlFor="off-surname" required error={errs.surname}>
                      <FestInput
                        id="off-surname"
                        value={form.surname}
                        onChange={(e) => setField("surname", e.target.value)}
                        placeholder="Surname"
                        error={!!errs.surname}
                      />
                    </Field>
                  </motion.div>

                  {/* Gender & Mobile */}
                  <motion.div variants={staggerChild} className="grid gap-4 md:grid-cols-2">
                    <Field label="Gender" required error={errs.gender}>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gender">
                        {(
                          [
                            { value: "MALE", label: "Male" },
                            { value: "FEMALE", label: "Female" },
                          ] as const
                        ).map((opt) => {
                          const active = form.gender === opt.value;
                          return (
                            <motion.button
                              key={opt.value}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => setField("gender", opt.value)}
                              className={cn(
                                "rounded-xl border px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition backdrop-blur-md",
                                active
                                  ? "border-transparent bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-lg shadow-fest-orange/25"
                                  : "border-white/75 bg-white/45 text-fest-label shadow-[0_4px_12px_rgba(28,36,56,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-fest-orange/60 hover:bg-white/70 hover:text-fest-white"
                              )}
                            >
                              {opt.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field
                      label="Mobile Number (WhatsApp-enabled)"
                      htmlFor="off-mobile"
                      required
                      hint="Used for tournament coordination & updates"
                      error={errs.mobile}
                    >
                      <FestInput
                        id="off-mobile"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.mobile}
                        onChange={(e) => setField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit WhatsApp number"
                        error={!!errs.mobile}
                      />
                    </Field>
                  </motion.div>

                  {/* Email & Password */}
                  <motion.div variants={staggerChild} className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Email Address"
                      htmlFor="off-email"
                      required
                      hint="Used to log in later and view/download your pass"
                      error={errs.email}
                    >
                      <FestInput
                        id="off-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="name@example.com"
                        error={!!errs.email}
                      />
                    </Field>

                    <Field
                      label="Password"
                      htmlFor="off-password"
                      required
                      hint="Used to log in later and view/download your pass"
                      error={errs.password}
                    >
                      <div className="relative">
                        <FestInput
                          id="off-password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => setField("password", e.target.value)}
                          placeholder="Min. 8 chars (e.g. Pass@123)"
                          className="pr-11"
                          error={!!errs.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-fest-label hover:text-fest-deep"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password requirements checklist */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5 font-mono text-[10.5px]">
                        {pwRules.map((rule) => (
                          <span
                            key={rule.label}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 transition-all duration-150",
                              rule.met
                                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 font-bold shadow-xs"
                                : "border-white/80 bg-white/50 text-fest-label/70"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors",
                                rule.met
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "border border-fest-label/40 text-transparent"
                              )}
                            >
                              ✓
                            </span>
                            <span>{rule.label}</span>
                          </span>
                        ))}
                      </div>
                    </Field>
                  </motion.div>

                  <div className="flex justify-end pt-3">
                    <CTAButton
                      type="button"
                      onClick={() => {
                        if (validateStep1()) go(2);
                      }}
                    >
                      Continue to Email Verification →
                    </CTAButton>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <StepHeading
                  num="02 //"
                  title="VERIFY EMAIL ADDRESS"
                  subtitle="Confirm your email address so you can reliably access and download your official accreditation pass."
                />

                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fest-orange/15 text-fest-orange">
                          <MailCheck className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-fest-label">
                            REGISTERED EMAIL
                          </p>
                          <p className="text-base font-bold text-fest-deep">{form.email}</p>
                        </div>
                      </div>

                      {form.emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          VERIFIED
                        </span>
                      ) : (
                        <CTAButton
                          type="button"
                          variant="dark"
                          onClick={() => {
                            setOtpSent(true);
                            setErrs({});
                          }}
                        >
                          {otpSent ? "Resend Verification Code" : "Send Verification Code"}
                        </CTAButton>
                      )}
                    </div>

                    {otpSent && !form.emailVerified && (
                      <div className="mt-5 space-y-4 border-t border-fest-border/60 pt-5">
                        <p className="text-xs font-medium text-fest-label">
                          Frontend preview mode: enter any 6-digit code (e.g. <code className="font-mono font-bold text-fest-deep">123456</code>) and click Verify.
                        </p>
                        <div className="flex flex-wrap items-end gap-3">
                          <Field
                            label="6-Digit Verification Code"
                            htmlFor="off-otp"
                            error={errs.otp}
                            className="w-full max-w-xs"
                          >
                            <FestInput
                              id="off-otp"
                              inputMode="numeric"
                              maxLength={6}
                              value={otpInput}
                              onChange={(e) => {
                                setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                                setErrs({});
                              }}
                              placeholder="Enter 6-digit code"
                              className="font-mono tracking-[0.25em]"
                              error={!!errs.otp}
                            />
                          </Field>
                          <CTAButton
                            type="button"
                            onClick={() => {
                              if (otpInput.length !== 6) {
                                setErrs({ otp: "Please enter a 6-digit verification code" });
                                return;
                              }
                              setField("emailVerified", true);
                            }}
                          >
                            Verify Email ✓
                          </CTAButton>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <CTAButton type="button" variant="dark" onClick={() => go(1)}>
                      ← Back
                    </CTAButton>
                    <CTAButton
                      type="button"
                      disabled={!form.emailVerified}
                      onClick={() => go(3)}
                    >
                      Continue to Profile &amp; Details →
                    </CTAButton>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <StepHeading
                  num="03 //"
                  title="PROFILE, KIT & PROFESSIONAL INFO"
                  subtitle="Upload your pass photo, select your kit size and represented SMJV branch/hostel, and share your professional details."
                />

                <div className="space-y-7">
                  {/* Profile Photo + DOB */}
                  <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                    <Field label="Profile Photo" required error={errs.photo} hint="Used on your official pass">
                      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-fest-orange/40 bg-white/50 p-4 text-center">
                        {form.photo ? (
                          <div className="relative h-36 w-36 overflow-hidden rounded-2xl border-2 border-fest-orange/50 shadow-md">
                            <img src={form.photo} alt="Profile preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setField("photo", null)}
                              aria-label="Remove photo"
                              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/60 text-fest-label">
                            {compressingPhoto ? (
                              <RefreshCw className="h-7 w-7 animate-spin text-fest-orange" />
                            ) : (
                              <Camera className="h-7 w-7 text-fest-orange/75" />
                            )}
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                              {compressingPhoto ? "Processing..." : "Camera or File"}
                            </span>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            handlePhotoUpload(e.target.files?.[0]);
                            e.currentTarget.value = "";
                          }}
                        />
                        <div className="grid w-full grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={openCamera}
                            disabled={compressingPhoto}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-fest-orange/40 bg-fest-orange/10 px-2.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange transition hover:bg-fest-orange/20 disabled:opacity-50"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            <span>{form.photo ? "Retake" : "Camera"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={compressingPhoto}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/80 bg-white/80 px-2.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-deep shadow-xs transition hover:border-fest-orange/50 hover:bg-white disabled:opacity-50"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Files</span>
                          </button>
                        </div>
                      </div>
                    </Field>

                    <div className="space-y-5">
                      {/* DOB */}
                      <Field label="Date of Birth" required error={errs.dob}>
                        <div className="grid grid-cols-3 gap-2.5">
                          <Select value={form.dobDay} onValueChange={(v) => setField("dobDay", v)}>
                            <SelectTrigger className={selectTriggerCls(!!errs.dob)}>
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                              {dayOpts.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={form.dobMonth} onValueChange={(v) => setField("dobMonth", v)}>
                            <SelectTrigger className={selectTriggerCls(!!errs.dob)}>
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTHS.map((m, idx) => (
                                <SelectItem key={m} value={String(idx + 1).padStart(2, "0")}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={form.dobYear} onValueChange={(v) => setField("dobYear", v)}>
                            <SelectTrigger className={selectTriggerCls(!!errs.dob)}>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {yearOpts.map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </Field>

                      {/* SMJV Branch / Hostel Represented */}
                      <Field
                        label="SMJV Branch / Hostel Represented"
                        required
                        hint={
                          form.gender === "FEMALE"
                            ? "Showing Female hostels & Bombay HO"
                            : form.gender === "MALE"
                            ? "Showing Male hostels & Bombay HO"
                            : "Filtered by your gender"
                        }
                        error={errs.branch}
                      >
                        <Select value={form.branch} onValueChange={(v) => setField("branch", v)}>
                          <SelectTrigger className={selectTriggerCls(!!errs.branch)}>
                            <SelectValue placeholder="Select SMJV Branch / Hostel" />
                          </SelectTrigger>
                          <SelectContent>
                            {branchOptions.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>

                  {/* Kit Sizes */}
                  <div className="rounded-2xl border border-white/80 bg-white/45 p-4 md:p-5">
                    <SectionLabel
                      emoji="👕"
                      title="OFFICIAL KIT SIZES"
                      right={
                        <button
                          type="button"
                          onClick={() => {
                            setSizeModalCategory("jersey");
                            setShowSizeModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-fest-orange/35 bg-white/80 px-2.5 py-1 font-mono text-[11px] font-bold text-fest-orange hover:bg-white"
                        >
                          <Ruler className="h-3.5 w-3.5" />
                          SIZE CHART
                        </button>
                      }
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="T-Shirt Size"
                        required
                        hint={
                          jerseyInfo
                            ? `Chest: ${jerseyInfo.chest}" · Length: ${jerseyInfo.length}"`
                            : undefined
                        }
                        error={errs.tshirt}
                      >
                        <Select value={form.tshirt} onValueChange={(v) => setField("tshirt", v)}>
                          <SelectTrigger className={selectTriggerCls(!!errs.tshirt)}>
                            <SelectValue placeholder="Select T-Shirt size" />
                          </SelectTrigger>
                          <SelectContent>
                            {jerseySizes.map((sz) => (
                              <SelectItem key={sz} value={sz}>
                                <span className="inline-flex items-center gap-2">
                                  <Shirt className="h-3.5 w-3.5 text-fest-orange" />
                                  {sz}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field
                        label="Pant Size"
                        required
                        hint={
                          pantInfo
                            ? `Waist: ${pantInfo.waist}" · Length: ${pantInfo.length}"`
                            : undefined
                        }
                        error={errs.waist}
                      >
                        <Select value={form.waist} onValueChange={(v) => setField("waist", v)}>
                          <SelectTrigger className={selectTriggerCls(!!errs.waist)}>
                            <SelectValue placeholder="Select Pant size" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackPantSizes.map((sz) => (
                              <SelectItem key={sz} value={sz}>
                                {sz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="rounded-2xl border border-white/80 bg-white/45 p-4 md:p-5">
                    <SectionLabel
                      emoji="💼"
                      title="PROFESSIONAL INFORMATION"
                      right={isTrustee ? "REQUIRED FOR TRUSTEES" : "OPTIONAL FOR RECTORS"}
                    />
                    <p className="mb-4 text-xs text-fest-label">
                      Helps SMJV students discover and connect with leaders working in their field of interest.
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field
                        label="Company / Organization"
                        htmlFor="off-company"
                        required={isTrustee}
                        error={errs.companyName}
                      >
                        <FestInput
                          id="off-company"
                          value={form.companyName}
                          onChange={(e) => setField("companyName", e.target.value)}
                          placeholder="e.g. ABC Industries Pvt. Ltd."
                          error={!!errs.companyName}
                        />
                      </Field>

                      <Field
                        label="Position in Company"
                        htmlFor="off-position"
                        required={isTrustee}
                        error={errs.position}
                      >
                        <FestInput
                          id="off-position"
                          value={form.position}
                          onChange={(e) => setField("position", e.target.value)}
                          placeholder="e.g. Managing Director / Partner"
                          error={!!errs.position}
                        />
                      </Field>

                      <Field
                        label="Industry"
                        htmlFor="off-industry"
                        required={isTrustee}
                        error={errs.industry}
                      >
                        <FestInput
                          id="off-industry"
                          value={form.industry}
                          onChange={(e) => setField("industry", e.target.value)}
                          placeholder="e.g. Finance, IT, Textiles, Healthcare"
                          error={!!errs.industry}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Consents & Terms */}
                  <div className="space-y-3 rounded-2xl border border-fest-orange/25 bg-white/60 p-4 md:p-5">
                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-fest-deep sm:text-sm">
                      <Checkbox
                        checked={form.allowMentorshipShare}
                        onCheckedChange={(v) => setField("allowMentorshipShare", v === true)}
                        className="mt-0.5 border-fest-orange/60 data-[state=checked]:bg-fest-orange data-[state=checked]:text-white"
                      />
                      <span>
                        Allow SMJV organizing team to share my professional profile with students for career/industry mentorship.
                      </span>
                    </label>

                    <div className="h-px bg-fest-border/60" />

                    <div>
                      <label className="flex cursor-pointer items-start gap-3 text-xs font-medium leading-relaxed text-fest-deep sm:text-sm">
                        <Checkbox
                          checked={form.agreeTerms}
                          onCheckedChange={(v) => setField("agreeTerms", v === true)}
                          className="mt-0.5 border-fest-orange/60 data-[state=checked]:bg-fest-orange data-[state=checked]:text-white"
                        />
                        <span>
                          I agree to the terms and conditions of the SMJV Youth Festival 2026 Organizing Committee.{" "}
                          <span className="text-fest-orange">*</span>
                        </span>
                      </label>
                      {errs.agreeTerms && (
                        <p className="mt-1.5 pl-7 text-xs font-medium text-red-500" role="alert">
                          {errs.agreeTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <CTAButton type="button" variant="dark" onClick={() => go(2)}>
                      ← Back
                    </CTAButton>
                    <CTAButton
                      type="button"
                      onClick={() => {
                        if (validateStep3()) go("submitted");
                      }}
                    >
                      Complete Registration →
                    </CTAButton>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "submitted" && (
              <motion.div
                key="submitted"
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fest-border/60 pb-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="inline-block rounded-full border border-fest-orange/40 bg-fest-orange/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange">
                        FRONTEND PREVIEW ONLY · NO BACKEND CONNECTED YET
                      </span>
                      <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fest-deep">
                        {[form.firstName, form.middleName, form.surname].filter(Boolean).join(" ")}
                      </h2>
                    </div>
                  </div>
                  <span className="rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-1.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-sm">
                    {form.role}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                  {form.photo && (
                    <img
                      src={form.photo}
                      alt="Submitted profile"
                      className="h-40 w-40 rounded-2xl border-2 border-fest-orange/40 object-cover shadow-md"
                    />
                  )}
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">Gender</dt>
                      <dd className="font-semibold text-fest-deep">{form.gender === "MALE" ? "Male" : "Female"}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">Date of Birth</dt>
                      <dd className="font-semibold text-fest-deep">
                        {form.dobDay}/{form.dobMonth}/{form.dobYear}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">WhatsApp Mobile</dt>
                      <dd className="font-semibold text-fest-deep">{form.mobile}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">Email (Verified)</dt>
                      <dd className="font-semibold text-fest-deep">{form.email}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">SMJV Branch / Hostel</dt>
                      <dd className="font-semibold text-fest-deep">{form.branch}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">Kit Sizes</dt>
                      <dd className="font-semibold text-fest-deep">
                        T-Shirt: {form.tshirt} · Pant: {form.waist}
                      </dd>
                    </div>
                    {(form.companyName || form.position || form.industry) && (
                      <div className="sm:col-span-2">
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">
                          Professional Details
                        </dt>
                        <dd className="font-semibold text-fest-deep">
                          {[form.position, form.companyName, form.industry].filter(Boolean).join(" · ")}
                        </dd>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-fest-label">
                        Mentorship Directory Consent
                      </dt>
                      <dd className="font-semibold text-fest-deep">
                        {form.allowMentorshipShare ? "Yes — profile may be shared with students" : "No"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-fest-border/60 pt-4">
                  <CTAButton type="button" variant="dark" onClick={() => go(3)}>
                    ← Edit Details
                  </CTAButton>
                  <CTAButton
                    type="button"
                    variant="dark"
                    onClick={() => {
                      setForm(INITIAL_STATE);
                      setOtpSent(false);
                      setOtpInput("");
                      setErrs({});
                      go(1);
                    }}
                  >
                    Start Another Entry
                  </CTAButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <TrackPantSizeModal
        open={showSizeModal}
        onOpenChange={setShowSizeModal}
        gender={form.gender}
        initialCategory={sizeModalCategory}
        selectedJerseySize={form.tshirt}
        selectedTrackPantSize={form.waist}
        onSelectJerseySize={(sz) => setField("tshirt", sz)}
        onSelectTrackPantSize={(sz) => setField("waist", sz)}
      />

      {mounted &&
        cameraOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-slate-900 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
                <div>
                  <h3 className="font-display text-base uppercase tracking-wider text-white">
                    Live Camera Capture
                  </h3>
                  <p className="text-xs text-slate-300">Center your face clearly in the frame</p>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  aria-label="Close camera"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative aspect-square w-full bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "h-full w-full object-cover",
                    facingMode === "user" && "-scale-x-100"
                  )}
                />
                {(cameraLoading || !cameraReady) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-xs font-mono text-slate-200">
                    <RefreshCw className="h-6 w-6 animate-spin text-fest-orange" />
                    <span>Starting camera...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/15 px-5 py-4">
                <button
                  type="button"
                  onClick={switchCamera}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 font-mono text-xs font-bold uppercase text-white hover:bg-white/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Flip</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-xl border border-white/20 px-4 py-2.5 font-mono text-xs font-bold uppercase text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!cameraReady}
                    onClick={capturePhoto}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-5 py-2.5 font-display text-xs uppercase tracking-wider text-slate-950 shadow-lg disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Capture</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <footer className="mt-auto border-t border-fest-border/60 py-4 text-center font-mono text-xs tracking-[0.25em] text-fest-label">
        SMJV YOUTH FESTIVAL 2026 · ORGANIZING COMMITTEE · VADODARA
      </footer>
    </div>
  );
}
