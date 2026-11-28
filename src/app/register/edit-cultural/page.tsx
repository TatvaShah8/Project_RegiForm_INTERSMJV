"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Loader2,
  Lock,
  RefreshCw,
  Ruler,
  Save,
  Upload,
  X,
} from "lucide-react";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { Field, PillGroup } from "@/components/register/ui-bits";
import { TrackPantSizeModal } from "@/components/register/TrackPantSizeModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BLOOD_GROUPS,
  EDIT_REGISTRATION_OPEN,
  RELATIONS,
  YEARS_OF_STUDY,
  getJerseySizeInfo,
  getTrackPantSizeInfo,
  getTrackPantSizesForGender,
  getTshirtSizesForGender,
} from "@/lib/fest";
import { auth } from "@/lib/firebase";
import { loadRegistration } from "@/lib/registration-api";
import { useRegister } from "@/lib/store";
import { cn } from "@/lib/utils";

async function compressPhotoToBlob(file: File): Promise<{ blob: Blob; previewUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 1600;
  let w = bitmap.width;
  let h = bitmap.height;
  if (w > maxDim || h > maxDim) {
    const ratio = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process image"))),
      "image/jpeg",
      0.85
    );
  });
  const previewUrl = URL.createObjectURL(blob);
  return { blob, previewUrl };
}

function toDateInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function EditCulturalRegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const s = useRegister();

  const isHydrated = s._hasHydrated;
  const isLoggedIn = isHydrated && s.completed && !!s.firstName;
  const isCultural = s.role === "cultural";

  const [initialized, setInitialized] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [dobStr, setDobStr] = React.useState("");
  const [bloodGroup, setBloodGroup] = React.useState("");
  const [homeTown, setHomeTown] = React.useState("");
  const [college, setCollege] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [year, setYear] = React.useState("");
  const [emergency, setEmergency] = React.useState("");
  const [relation, setRelation] = React.useState("");
  const [tshirt, setTshirt] = React.useState("");
  const [waist, setWaist] = React.useState("");

  const [newPhotoBlob, setNewPhotoBlob] = React.useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [sizeModalOpen, setSizeModalOpen] = React.useState(false);
  const [sizeModalCategory, setSizeModalCategory] = React.useState<"jersey" | "track-pants">("jersey");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  /* Live camera capture state */
  const [mounted, setMounted] = React.useState(false);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">("user");
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [cameraLoading, setCameraLoading] = React.useState(false);
  const [cameraReady, setCameraReady] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!cameraOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [cameraOpen]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraStream(null);
    setCameraReady(false);
  };

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  React.useEffect(() => {
    if (!cameraOpen || !cameraStream || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = cameraStream;
    const markReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setCameraReady(true);
        setCameraLoading(false);
      }
    };
    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("canplay", markReady);
    video.play().catch(() => {});
    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, [cameraOpen, cameraStream]);

  const openCamera = async (mode: "user" | "environment" = facingMode) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: "CAMERA UNAVAILABLE",
        description: "Camera access is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }
    stopCameraStream();
    setCameraOpen(true);
    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStream(stream);
    } catch {
      setCameraLoading(false);
      setCameraOpen(false);
      toast({
        title: "CAMERA PERMISSION DENIED",
        description: "Allow camera access in your browser or upload a photo instead.",
        variant: "destructive",
      });
    }
  };

  const closeCamera = () => {
    stopCameraStream();
    setCameraOpen(false);
  };

  const flipCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    void openCamera(next);
  };

  const snapPhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88)
    );
    if (!blob) return;
    setNewPhotoBlob(blob);
    setPhotoPreview(URL.createObjectURL(blob));
    closeCamera();
  };

  React.useEffect(() => {
    if (!isLoggedIn || initialized) return;
    setFirstName(s.firstName || "");
    setMiddleName(s.middleName || "");
    setSurname(s.surname || "");
    setMobile(s.mobile || "");
    setDobStr(toDateInputValue(s.dob));
    setBloodGroup(s.bloodGroup || "");
    setHomeTown(s.homeTown || "");
    setCollege(s.college || "");
    setCourse(s.course || "");
    setYear(s.year || "");
    setEmergency(s.emergency || "");
    setRelation(s.relation || "");
    setTshirt(s.tshirt || "");
    setWaist(s.waist || "");
    setPhotoPreview(s.photo || null);
    setInitialized(true);
  }, [isLoggedIn, initialized, s]);

  const jerseySizes = React.useMemo(() => getTshirtSizesForGender(s.gender), [s.gender]);
  const pantSizes = React.useMemo(() => getTrackPantSizesForGender(s.gender), [s.gender]);
  const jerseyInfo = getJerseySizeInfo(tshirt, s.gender);
  const pantInfo = getTrackPantSizeInfo(waist, s.gender);

  const nameChanged =
    firstName.trim() !== (s.firstName || "").trim() ||
    middleName.trim() !== (s.middleName || "").trim() ||
    surname.trim() !== (s.surname || "").trim();
  const requiresReverification = Boolean(s.isVerified) && (nameChanged || Boolean(newPhotoBlob));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        title: "UNSUPPORTED FILE",
        description: "Please upload a JPG, PNG, or WebP portrait image.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { blob, previewUrl } = await compressPhotoToBlob(file);
      setNewPhotoBlob(blob);
      setPhotoPreview(previewUrl);
    } catch {
      toast({
        title: "PHOTO ERROR",
        description: "Could not read that image. Please try another photo.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser) {
      toast({
        title: "SESSION REQUIRED",
        description: "Please sign in again to save changes.",
        variant: "destructive",
      });
      return;
    }

    if (!firstName.trim() || !surname.trim()) {
      toast({ title: "NAME REQUIRED", description: "First name and surname are required.", variant: "destructive" });
      return;
    }
    if (!dobStr) {
      toast({ title: "DOB REQUIRED", description: "Please enter your date of birth.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const form = new FormData();
      form.set("firstName", firstName.trim());
      form.set("middleName", middleName.trim());
      form.set("surname", surname.trim());
      form.set("mobile", mobile.trim());
      form.set("dob", new Date(`${dobStr}T00:00:00.000Z`).toISOString());
      form.set("bloodGroup", bloodGroup);
      form.set("homeTown", homeTown.trim());
      form.set("college", college.trim());
      form.set("course", course.trim());
      form.set("year", year);
      form.set("emergency", emergency.trim());
      form.set("relation", relation);
      form.set("tshirt", tshirt);
      form.set("waist", waist);
      if (newPhotoBlob) {
        form.set("image", newPhotoBlob, "portrait.jpg");
      }

      const res = await fetch("/api/registration/edit-cultural", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Could not update registration");
      }

      const refreshed = await loadRegistration();
      if (refreshed) {
        s.loginAccount(refreshed);
      }
      setNewPhotoBlob(null);

      toast({
        title: "REGISTRATION UPDATED ✓",
        description: json.reverificationRequired
          ? "Saved! Because you changed your name or photo, committee re-verification is required."
          : "All your updated cultural details are saved to the database and ID pass.",
      });
    } catch (err: any) {
      toast({
        title: "UPDATE FAILED",
        description: err?.message || "Could not save your changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <TournamentNav activeNav="edit" />

      <main className="fest-scroll mx-auto w-full max-w-4xl flex-1 px-4 pb-16 md:px-6">
        {!EDIT_REGISTRATION_OPEN ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-white/80 bg-white/75 p-8 text-center shadow-xl backdrop-blur-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-fest-orange/35 bg-fest-orange/15 text-fest-orange">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl uppercase text-fest-deep">
              FORM EDITING IS CLOSED
            </h1>
            <p className="mt-2 text-sm text-fest-label">
              Registration editing is currently closed. You can still log in and view or print your existing tournament ID pass.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-fest-deep px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        ) : !isHydrated ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-fest-orange" />
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-fest-label">
              Loading your registration...
            </p>
          </div>
        ) : !isLoggedIn ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-white/80 bg-white/75 p-8 text-center shadow-xl backdrop-blur-2xl">
            <h1 className="font-display text-2xl uppercase text-fest-deep">
              SIGN IN TO EDIT REGISTRATION
            </h1>
            <p className="mt-2 text-sm text-fest-label">
              Please log in to your registered account using the button in the top-right corner.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-fest-deep px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        ) : !isCultural ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-white/80 bg-white/75 p-8 text-center shadow-xl backdrop-blur-2xl">
            <h1 className="font-display text-2xl uppercase text-fest-deep">
              CULTURAL EDITING ONLY
            </h1>
            <p className="mt-2 text-sm text-fest-label">
              This editor is for Cultural participant registrations. Sports players can edit their registration on the Sports Edit page.
            </p>
            <Link
              href="/register/edit"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-fest-deep px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow"
            >
              <span>Go to Sports Edit Form</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-block rounded-full border border-purple-400/40 bg-white/75 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-purple-700">
                  CULTURAL TEAM · EDIT FORM
                </span>
                <h1 className="mt-2 font-display text-3xl uppercase tracking-wide text-fest-deep md:text-4xl">
                  EDIT <span className="fest-gradient-text">REGISTRATION</span>
                </h1>
              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:bg-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </button>
            </div>

            {/* Locked Account & Identity Summary */}
            <div className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                <Lock className="h-3.5 w-3.5 text-fest-orange" />
                <span>Locked Official Fields (Cannot Be Changed)</span>
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <span className="rounded-lg border border-black/10 bg-white/80 px-3 py-1.5">
                  GR: <b className="text-fest-deep">{s.grNo || "—"}</b>
                </span>
                <span className="rounded-lg border border-black/10 bg-white/80 px-3 py-1.5">
                  Branch: <b className="text-fest-deep">{s.branch || "—"}</b>
                </span>
                <span className="rounded-lg border border-black/10 bg-white/80 px-3 py-1.5">
                  Gender: <b className="text-fest-deep">{s.gender || "—"}</b>
                </span>
                <span className="rounded-lg border border-purple-400/40 bg-purple-500/10 px-3 py-1.5 font-bold text-purple-700">
                  Role: CULTURAL
                </span>
                <span className="rounded-lg border border-black/10 bg-white/80 px-3 py-1.5">
                  Email: <b className="text-fest-deep">{s.email || "—"}</b>
                </span>
              </div>
            </div>

            {/* Re-verification Warning */}
            {requiresReverification && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/15 p-4 text-xs text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p>
                  <strong>Re-verification Notice:</strong> Because you edited your <b>name</b> or <b>portrait photo</b>, your pass will return to <b>UNVERIFIED</b> until the committee re-verifies it.
                </p>
              </div>
            )}

            {/* Photo & Personal Details */}
            <div className="rounded-3xl border border-white/85 bg-white/70 p-6 shadow-md backdrop-blur-xl space-y-5">
              <h2 className="font-display text-lg uppercase tracking-wide text-fest-deep">
                1. Portrait Photo &amp; Personal Details
              </h2>

              <div className="flex flex-wrap items-center gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Portrait preview"
                    className="h-24 w-20 rounded-xl border border-black/15 object-cover shadow-xs"
                  />
                ) : (
                  <div className="flex h-24 w-20 items-center justify-center rounded-xl border border-dashed border-black/20 bg-white/60 text-xs text-fest-label">
                    No Photo
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-fest-orange/40 bg-fest-orange/10 px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-orange transition hover:bg-fest-orange hover:text-fest-ink"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{newPhotoBlob ? "Change Selected Photo" : "Upload New Photo (Optional)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openCamera()}
                      className="inline-flex items-center gap-2 rounded-xl bg-fest-deep px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-xs transition hover:bg-fest-deep/90"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Capture Live Photo</span>
                    </button>
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] text-fest-label">
                    Leave as-is to keep your current portrait photo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="First Name" required>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="bg-white/85"
                  />
                </Field>
                <Field label="Middle Name">
                  <Input
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Middle Name"
                    className="bg-white/85"
                  />
                </Field>
                <Field label="Surname" required>
                  <Input
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Surname"
                    className="bg-white/85"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Date of Birth" required>
                  <Input
                    type="date"
                    value={dobStr}
                    onChange={(e) => setDobStr(e.target.value)}
                    className="bg-white/85"
                  />
                </Field>
                <Field label="Blood Group" required>
                  <Select value={bloodGroup} onValueChange={setBloodGroup}>
                    <SelectTrigger className="bg-white/85">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Home Town" required>
                  <Input
                    value={homeTown}
                    onChange={(e) => setHomeTown(e.target.value)}
                    placeholder="Home Town"
                    className="bg-white/85"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="College / University" required>
                  <Input
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="College"
                    className="bg-white/85"
                  />
                </Field>
                <Field label="Course / Branch" required>
                  <Input
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Course"
                    className="bg-white/85"
                  />
                </Field>
                <Field label="Year of Study" required>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="bg-white/85">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS_OF_STUDY.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Contact & Emergency */}
            <div className="rounded-3xl border border-white/85 bg-white/70 p-6 shadow-md backdrop-blur-xl space-y-4">
              <h2 className="font-display text-lg uppercase tracking-wide text-fest-deep">
                2. Contact &amp; Emergency Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Mobile Number" required>
                  <Input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="bg-white/85"
                  />
                </Field>
                <Field label="Emergency Contact" required>
                  <Input
                    value={emergency}
                    onChange={(e) => setEmergency(e.target.value)}
                    placeholder="Emergency mobile"
                    className="bg-white/85"
                  />
                </Field>
                <Field label="Relation" required>
                  <Select value={relation} onValueChange={setRelation}>
                    <SelectTrigger className="bg-white/85">
                      <SelectValue placeholder="Select Relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Cultural Apparel Kit Sizes */}
            <div className="rounded-3xl border border-white/85 bg-white/70 p-6 shadow-md backdrop-blur-xl space-y-5">
              <h2 className="font-display text-lg uppercase tracking-wide text-fest-deep">
                3. Cultural Contingent Apparel Kit
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="Jersey / T-Shirt Size"
                  required
                  right={
                    <button
                      type="button"
                      onClick={() => {
                        setSizeModalCategory("jersey");
                        setSizeModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-fest-orange/40 bg-fest-orange/10 px-2.5 py-1 text-[11px] font-bold text-fest-orange"
                    >
                      <Ruler className="h-3 w-3" />
                      <span>Size Chart</span>
                    </button>
                  }
                >
                  <PillGroup
                    ariaLabel="Jersey size"
                    options={jerseySizes}
                    value={tshirt}
                    onChange={setTshirt}
                  />
                  {jerseyInfo && (
                    <p className="mt-2 font-mono text-[11px] text-fest-label">
                      Chest: <b className="text-fest-deep">{jerseyInfo.chest}&quot;</b> · Length:{" "}
                      <b className="text-fest-deep">{jerseyInfo.length}&quot;</b>
                    </p>
                  )}
                </Field>

                <Field
                  label="Track Pant Size"
                  required
                  right={
                    <button
                      type="button"
                      onClick={() => {
                        setSizeModalCategory("track-pants");
                        setSizeModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-fest-orange/40 bg-fest-orange/10 px-2.5 py-1 text-[11px] font-bold text-fest-orange"
                    >
                      <Ruler className="h-3 w-3" />
                      <span>Size Chart</span>
                    </button>
                  }
                >
                  <PillGroup
                    ariaLabel="Track pant size"
                    options={pantSizes}
                    value={waist}
                    onChange={setWaist}
                  />
                  {pantInfo && (
                    <p className="mt-2 font-mono text-[11px] text-fest-label">
                      Waist: <b className="text-fest-deep">{pantInfo.waist}&quot;</b> · Length:{" "}
                      <b className="text-fest-deep">{pantInfo.length}&quot;</b>
                    </p>
                  )}
                </Field>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow to-fest-orange px-7 py-3.5 font-display text-sm uppercase tracking-wider text-fest-ink shadow-lg shadow-fest-orange/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{saving ? "SAVING CHANGES..." : "SAVE REGISTRATION CHANGES"}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      <TrackPantSizeModal
        open={sizeModalOpen}
        onOpenChange={setSizeModalOpen}
        initialCategory={sizeModalCategory}
        gender={s.gender}
        selectedJerseySize={tshirt}
        selectedTrackPantSize={waist}
        onSelectJerseySize={setTshirt}
        onSelectTrackPantSize={setWaist}
      />

      {mounted &&
        cameraOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-fest-deep text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-fest-orange" />
                  <span className="font-display text-sm uppercase tracking-wider">
                    Capture Portrait Photo
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close camera"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative aspect-[4/3] w-full bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "h-full w-full object-cover",
                    facingMode === "user" && "scale-x-[-1]"
                  )}
                />
                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                    <Loader2 className="h-7 w-7 animate-spin text-fest-orange" />
                    <span className="mt-2 font-mono text-xs text-white/80">
                      Starting camera...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                <button
                  type="button"
                  onClick={flipCamera}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 font-mono text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Flip</span>
                </button>
                <button
                  type="button"
                  onClick={snapPhoto}
                  disabled={!cameraReady}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-5 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md transition hover:brightness-110 disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
