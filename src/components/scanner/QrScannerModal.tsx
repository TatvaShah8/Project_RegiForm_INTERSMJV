"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  X,
  FlipHorizontal,
  Upload,
  Phone,
  MessageCircle,
  Download,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  MapPin,
  Building,
  GraduationCap,
  School,
  RefreshCw,
  QrCode,
  Trash2,
  Lock,
  LogIn,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import jsQR from "@/lib/jsqr";
import { auth } from "@/lib/firebase";
import { useRegister } from "@/lib/store";
import {
  type ScannedStudent,
  SAMPLE_STUDENTS,
  parseScannedQr,
  extractPassIdFromQr,
  studentFromPassData,
  getScannedConnections,
  saveScannedConnection,
  removeScannedConnection,
  downloadVCard,
} from "@/lib/student-scanner";

interface QrScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAuth?: () => void;
}

/**
 * Universal multi-pass QR decoder from an image element.
 * Works on every browser without requiring BarcodeDetector.
 */
async function decodeQrFromImage(img: HTMLImageElement): Promise<string | null> {
  // 1. Try native BarcodeDetector if available
  if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ["qr_code"],
      });
      const barcodes = await barcodeDetector.detect(img);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue;
      }
    } catch {
      // Fall through to jsQR
    }
  }

  const scanCanvas = (canvas: HTMLCanvasElement): string | null => {
    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, canvas.width, canvas.height, {
        inversionAttempts: "attemptBoth",
      });
      return code?.data || null;
    } catch {
      return null;
    }
  };

  // 2. Full-resolution canvas (bounded to max 1600px for speed & memory)
  const maxDim = 1600;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > maxDim || h > maxDim) {
    const ratio = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, w, h);
  const result1 = scanCanvas(canvas);
  if (result1) return result1;

  // 3. Scaled down to 800px (helps locate small QR codes in large high-res phone screenshots)
  if (w > 800 || h > 800) {
    const scaleCanvas = document.createElement("canvas");
    const sRatio = Math.min(800 / w, 800 / h);
    scaleCanvas.width = Math.round(w * sRatio);
    scaleCanvas.height = Math.round(h * sRatio);
    const sCtx = scaleCanvas.getContext("2d", { willReadFrequently: true });
    if (sCtx) {
      sCtx.drawImage(canvas, 0, 0, scaleCanvas.width, scaleCanvas.height);
      const result2 = scanCanvas(scaleCanvas);
      if (result2) return result2;
    }
  }

  // 4. Center crop (middle 70% where tournament pass QR is located)
  const cropCanvas = document.createElement("canvas");
  const cropW = Math.round(w * 0.7);
  const cropH = Math.round(h * 0.7);
  const cropX = Math.round((w - cropW) / 2);
  const cropY = Math.round((h - cropH) / 2);
  cropCanvas.width = cropW;
  cropCanvas.height = cropH;
  const cCtx = cropCanvas.getContext("2d", { willReadFrequently: true });
  if (cCtx) {
    cCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const result3 = scanCanvas(cropCanvas);
    if (result3) return result3;
  }

  return null;
}

export function QrScannerModal({ open, onOpenChange, onOpenAuth }: QrScannerModalProps) {
  const { toast } = useToast();
  const s = useRegister();
  const isHydrated = s._hasHydrated;
  const isLoggedIn = isHydrated && s.completed && !!s.firstName;

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const offscreenCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [activeTab, setActiveTab] = React.useState<"scanner" | "connections">("scanner");
  const [facingMode, setFacingMode] = React.useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scannedResult, setScannedResult] = React.useState<ScannedStudent | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [connections, setConnections] = React.useState<ScannedStudent[]>([]);
  const [isProcessingImage, setIsProcessingImage] = React.useState(false);

  const cameraGeneration = React.useRef(0);
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    const generation = cameraGeneration.current;

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported by your browser. You can upload a QR image instead.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (generation !== cameraGeneration.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsScanning(true);
        startDetectionLoop();
      }
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in browser settings or upload a QR image.");
      } else {
        setCameraError("Unable to start camera. Please verify device camera or try uploading an image.");
      }
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    cameraGeneration.current++;
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Continuous frame scanning loop: BarcodeDetector + jsQR fallback
  const startDetectionLoop = () => {
    let active = true;

    const detect = async () => {
      if (!active || !videoRef.current || videoRef.current.readyState < 2) {
        if (active) requestAnimationFrame(detect);
        return;
      }

      try {
        // Method A: Native BarcodeDetector (fastest)
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ["qr_code"],
            });
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleSuccessfulScan(barcodes[0].rawValue);
              return;
            }
          } catch {}
        }

        // Method B: jsQR canvas frame capture
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement("canvas");
        }
        const canvas = offscreenCanvasRef.current;
        const v = videoRef.current;
        const vw = v.videoWidth || 480;
        const vh = v.videoHeight || 480;

        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, 0, 0, vw, vh);
          const imgData = ctx.getImageData(0, 0, vw, vh);
          const code = jsQR(imgData.data, vw, vh, {
            inversionAttempts: "dontInvert",
          });
          if (code && code.data) {
            handleSuccessfulScan(code.data);
            return;
          }
        }
      } catch (e) {
        // Continue loop if single frame detection fails
      }

      if (active) {
        requestAnimationFrame(detect);
      }
    };

    requestAnimationFrame(detect);

    return () => {
      active = false;
    };
  };

  const applyScannedStudent = (parsed: ScannedStudent) => {
    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {}
    }

    stopCamera();
    setScannedResult(parsed);

    // Auto-check if already saved
    const saved = getScannedConnections();
    const exists = saved.some(
      (s) =>
        (s.mobile && s.mobile === parsed.mobile) ||
        (s.firstName.toLowerCase() === parsed.firstName.toLowerCase() &&
          s.surname.toLowerCase() === parsed.surname.toLowerCase())
    );
    setIsSaved(exists);

    toast({
      title: "QR PASS SCANNED!",
      description: `Connected with ${parsed.firstName} ${parsed.surname} (${parsed.branch} branch).`,
    });
  };

  const handleSuccessfulScan = async (rawText: string) => {
    const legacyParsed = parseScannedQr(rawText);
    if (legacyParsed) {
      applyScannedStudent(legacyParsed);
      return;
    }

    const passId = extractPassIdFromQr(rawText);
    if (passId) {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        toast({
          title: "SIGN IN REQUIRED",
          description: "Please log in to your account to scan a friend's pass.",
          variant: "destructive",
        });
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`/api/pass/${encodeURIComponent(passId)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        const source = json.profile || json.student;
        if (res.ok && json.valid && source) {
          applyScannedStudent(studentFromPassData(source));
          return;
        }
      } catch {
        // Fall through to unrecognized toast
      }
    }

    toast({
      title: "UNRECOGNIZED QR CODE",
      description: "This QR code does not contain valid student information.",
      variant: "destructive",
    });
  };

  // Robust Image Upload handler (uses jsQR + multi-pass)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);

    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const decodedText = await decodeQrFromImage(img);

      if (decodedText) {
        handleSuccessfulScan(decodedText);
      } else {
        toast({
          title: "NO QR CODE DETECTED",
          description: "Could not find a QR code in the image. Please make sure the QR code is clearly visible and not blurry.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "IMAGE ERROR",
        description: "Failed to process image file. Please try another image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleSaveConnection = () => {
    if (!scannedResult) return;
    saveScannedConnection(scannedResult);
    setIsSaved(true);
    setConnections(getScannedConnections());
    toast({
      title: "CONNECTION SAVED!",
      description: `${scannedResult.firstName} ${scannedResult.surname} added to your Scanned Friends list.`,
    });
  };

  const handleRemoveConnection = (id: string, name: string) => {
    removeScannedConnection(id);
    setConnections(getScannedConnections());
    toast({
      title: "CONNECTION REMOVED",
      description: `Removed ${name} from your contacts.`,
    });
  };

  const resumeScanning = () => {
    setScannedResult(null);
    setIsSaved(false);
    startCamera();
  };

  // If user is not registered or logged in, show authentication required screen
  // Reload connections whenever modal opens
  React.useEffect(() => {
    if (open && isLoggedIn) {
      setConnections(getScannedConnections());
      setScannedResult(null);
      setIsSaved(false);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [open, isLoggedIn]);

  // Start camera stream when in scanner tab with no active result
  React.useEffect(() => {
    if (open && isLoggedIn && activeTab === "scanner" && !scannedResult) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, isLoggedIn, activeTab, facingMode, scannedResult]);

  if (!isLoggedIn) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Login Required to Scan Passes</DialogTitle>
            <DialogDescription>Only registered students can scan QR passes.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-fest-orange/20 text-fest-orange shadow-inner">
              <Lock className="h-8 w-8 text-fest-orange" />
            </div>

            <span className="mt-4 rounded-full border border-fest-orange/30 bg-fest-orange/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
              ACCREDITED ACCESS ONLY
            </span>

            <h3 className="mt-3 font-display text-2xl uppercase tracking-wide text-fest-deep">
              LOGIN TO SCAN PASS
            </h3>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-fest-label">
              Pass scanning is exclusively available to registered and logged-in students of SMJV Youth Festival 2026. Please log in or complete your registration to scan athlete passes.
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenAuth?.();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange py-3 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                <span>LOG IN / REGISTER NOW</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-xl border border-fest-deep/20 bg-white/70 py-2.5 font-display text-xs uppercase tracking-wider text-fest-label transition hover:bg-white"
              >
                CLOSE
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-1rem)] max-w-[480px] sm:max-w-[540px] flex flex-col gap-0 overflow-hidden rounded-3xl border border-white/85 bg-white/95 p-0 shadow-[0_24px_64px_rgba(28,36,56,0.22),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>SMJV Youth Festival Student QR Code Scanner</DialogTitle>
          <DialogDescription>Scan student ID passes and connect during the tournament.</DialogDescription>
        </DialogHeader>

        {/* ── Modal Header Bar ── */}
        <div className="flex items-center justify-between border-b border-fest-border/40 bg-gradient-to-r from-fest-yellow/20 via-white/80 to-fest-orange/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-fest-yellow to-fest-orange text-fest-ink shadow-xs">
              <QrCode className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base uppercase leading-none tracking-wide text-fest-deep sm:text-lg">
                SMJV QR SCANNER
              </h2>
              <p className="mt-0.5 font-mono text-[9px] font-bold tracking-wider text-fest-label sm:text-[10px]">
                STUDENT NETWORKING & CONNECT
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-black/10 p-1.5 text-fest-deep transition hover:bg-black/20 active:scale-95"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tab Switcher: Scanner vs My Scanned Friends ── */}
        <div className="flex border-b border-fest-border/40 bg-white/70 px-4 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("scanner");
              if (!scannedResult) startCamera();
            }}
            className={`relative flex items-center gap-2 border-b-2 px-4 py-2 font-display text-xs uppercase tracking-wider transition ${
              activeTab === "scanner"
                ? "border-fest-orange text-fest-orange font-bold"
                : "border-transparent text-fest-label hover:text-fest-deep"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>CAMERA SCANNER</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("connections");
              stopCamera();
            }}
            className={`relative flex items-center gap-2 border-b-2 px-4 py-2 font-display text-xs uppercase tracking-wider transition ${
              activeTab === "connections"
                ? "border-fest-orange text-fest-orange font-bold"
                : "border-transparent text-fest-label hover:text-fest-deep"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>MY CONNECTIONS ({connections.length})</span>
          </button>
        </div>

        {/* ── Main Tab Content ── */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto fest-scroll font-sans">
          {activeTab === "scanner" ? (
            <div>
              <AnimatePresence mode="wait">
                {scannedResult ? (
                  // ════════════════════════════════════════════════════════════
                  // SCANNED STUDENT PROFILE CARD
                  // Strictly shared info only: Name, Surname, Photo, Mobile, Home Town, Branch, Course, College
                  // NO GR number, NO pass ID, NO blood group!
                  // ════════════════════════════════════════════════════════════
                  <motion.div
                    key="scanned-result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    {/* Identity Hero */}
                    <div className="relative overflow-hidden rounded-2xl border border-fest-orange/35 bg-gradient-to-br from-fest-yellow/15 via-white to-fest-orange/15 p-4 shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={scannedResult.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"}
                            alt={`${scannedResult.firstName} ${scannedResult.surname}`}
                            className="h-20 w-20 rounded-2xl border-2 border-fest-orange object-cover shadow-sm"
                          />
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-green-600 p-1 text-white shadow-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md border border-fest-orange/30 bg-fest-orange/10 px-2 py-0.5 font-mono text-[9px] font-bold text-fest-orange uppercase">
                              {scannedResult.branch} BRANCH
                            </span>
                            <span className="rounded-md border border-fest-yellow/40 bg-fest-yellow/15 px-2 py-0.5 font-mono text-[9px] font-bold text-fest-deep uppercase">
                              📍 {scannedResult.homeTown}
                            </span>
                          </div>

                          {/* Full Name & Surname */}
                          <h3 className="mt-1 font-display text-xl uppercase leading-tight text-fest-deep sm:text-2xl break-words">
                            {scannedResult.firstName} {scannedResult.middleName ? `${scannedResult.middleName} ` : ""}{scannedResult.surname}
                          </h3>

                          <p className="font-mono text-[10px] text-fest-label uppercase tracking-wider">
                            SMJV STUDENT ATHLETE · CONNECTED
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Information Grid */}
                    <div className="divide-y divide-fest-border/40 rounded-2xl border border-white/80 bg-white/80 p-3.5 text-xs shadow-xs backdrop-blur-md">
                      {/* Name & Surname breakdown */}
                      <div className="grid grid-cols-2 gap-2 pb-2.5">
                        <div>
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label">
                            FIRST NAME
                          </span>
                          <p className="font-semibold text-fest-deep text-sm">{scannedResult.firstName}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label">
                            SURNAME
                          </span>
                          <p className="font-semibold text-fest-deep text-sm">{scannedResult.surname}</p>
                        </div>
                      </div>

                      {/* Mobile Number & Actions */}
                      <div className="py-2.5">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label">
                          MOBILE NUMBER
                        </span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-fest-deep">
                            +91 {scannedResult.mobile}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:+91${scannedResult.mobile}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-fest-border/60 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-fest-deep shadow-2xs hover:border-fest-orange hover:bg-fest-orange/10"
                            >
                              <Phone className="h-3 w-3 text-fest-orange" />
                              <span>CALL</span>
                            </a>
                            <a
                              href={`https://wa.me/91${scannedResult.mobile}?text=Hi%20${encodeURIComponent(scannedResult.firstName)},%20great%20connecting%20at%20SMJV%20Youth%20Festival%202026!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 font-mono text-[10px] font-bold text-white shadow-2xs hover:bg-green-700"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WHATSAPP</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Home Town & SMJV Branch */}
                      <div className="grid grid-cols-2 gap-2 py-2.5">
                        <div>
                          <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label">
                            <MapPin className="h-3 w-3 text-fest-orange" />
                            <span>HOME TOWN</span>
                          </span>
                          <p className="mt-0.5 font-medium text-fest-deep">{scannedResult.homeTown || "—"}</p>
                        </div>
                        <div>
                          <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label">
                            <Building className="h-3 w-3 text-fest-orange" />
                            <span>SMJV BRANCH</span>
                          </span>
                          <p className="mt-0.5 font-medium text-fest-deep">
                            {scannedResult.branch || "—"}
                            {scannedResult.jerseyNumber ? (
                              <span className="ml-1.5 rounded bg-fest-orange/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-fest-orange">
                                #{scannedResult.jerseyNumber}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      {/* College & Course */}
                      <div className="pt-2.5 space-y-2">
                        <div>
                          <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label">
                            <GraduationCap className="h-3 w-3 text-fest-orange" />
                            <span>COURSE</span>
                          </span>
                          <p className="mt-0.5 font-medium text-fest-deep">
                            {scannedResult.course || "—"} {scannedResult.year ? `(${scannedResult.year})` : ""}
                          </p>
                        </div>
                        <div>
                          <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-fest-label">
                            <School className="h-3 w-3 text-fest-orange" />
                            <span>COLLEGE / INSTITUTION</span>
                          </span>
                          <p className="mt-0.5 font-medium leading-relaxed text-fest-deep">
                            {scannedResult.college || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleSaveConnection}
                          disabled={isSaved}
                          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 font-display text-xs uppercase tracking-wider shadow-xs transition active:scale-95 ${
                            isSaved
                              ? "bg-green-500/15 border border-green-600/30 text-green-700 font-bold"
                              : "bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink hover:brightness-110"
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="h-4 w-4 text-green-600" />
                              <span>SAVED TO FRIENDS</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-4 w-4" />
                              <span>SAVE CONNECTION</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadVCard(scannedResult)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs hover:bg-white hover:border-fest-orange/50 transition active:scale-95"
                          title="Save contact file to your mobile address book"
                        >
                          <Download className="h-4 w-4 text-fest-orange" />
                          <span>EXPORT VCARD (.VCF)</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={resumeScanning}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-fest-border/50 bg-white/60 py-2 font-mono text-xs font-bold uppercase tracking-wider text-fest-label hover:text-fest-deep transition"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>SCAN ANOTHER STUDENT PASS</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // ════════════════════════════════════════════════════════════
                  // LIVE CAMERA VIEWPORT & CONTROLS
                  // ════════════════════════════════════════════════════════════
                  <motion.div
                    key="camera-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Viewfinder box */}
                    <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-3xl border-2 border-fest-orange/60 bg-black shadow-lg">
                      {/* Video Stream */}
                      <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />

                      {/* Targeting Reticle & Animated Laser Line */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                        <div className="relative h-full w-full rounded-2xl border-2 border-dashed border-white/60">
                          {/* Corner accents */}
                          <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-fest-yellow rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-fest-yellow rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-fest-yellow rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-fest-yellow rounded-br-lg" />

                          {/* Animated scan line */}
                          {isScanning && (
                            <motion.div
                              animate={{ y: [0, 240, 0] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                              className="h-0.5 w-full bg-gradient-to-r from-transparent via-fest-orange to-transparent shadow-[0_0_12px_#EA580C]"
                            />
                          )}
                        </div>
                      </div>

                      {/* Camera Overlay Badge */}
                      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-white backdrop-blur-md">
                        {isProcessingImage
                          ? "DECODING QR IMAGE..."
                          : isScanning
                          ? "ALIGN QR CODE IN FRAME"
                          : "STARTING CAMERA..."}
                      </div>
                    </div>

                    {/* Camera Error Alert if permissions fail */}
                    {cameraError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 shadow-xs">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                          <p>{cameraError}</p>
                        </div>
                      </div>
                    )}

                    {/* Camera Control Buttons */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3.5 py-2 font-mono text-xs font-bold text-fest-deep shadow-xs backdrop-blur-md transition hover:bg-white active:scale-95"
                        title="Switch between front and rear camera"
                      >
                        <FlipHorizontal className="h-3.5 w-3.5 text-fest-orange" />
                        <span>FLIP CAMERA</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3.5 py-2 font-mono text-xs font-bold text-fest-deep shadow-xs backdrop-blur-md transition hover:bg-white active:scale-95 disabled:opacity-50"
                        title="Upload QR screenshot or photo"
                      >
                        <Upload className="h-3.5 w-3.5 text-fest-orange" />
                        <span>{isProcessingImage ? "SCANNING..." : "UPLOAD QR IMAGE"}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {/* ── Quick Demo Scan Bar (Test without 2 devices) ── */}
                    <div className="rounded-2xl border border-fest-border/50 bg-white/60 p-3 shadow-2xs backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-fest-label">
                          OR QUICK TEST SCAN A SAMPLE ATHLETE:
                        </span>
                        <Sparkles className="h-3 w-3 text-fest-orange" />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                        {SAMPLE_STUDENTS.map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              stopCamera();
                              setScannedResult(st);
                              const saved = getScannedConnections();
                              setIsSaved(
                                saved.some(
                                  (s) =>
                                    s.mobile === st.mobile ||
                                    (s.firstName.toLowerCase() === st.firstName.toLowerCase() &&
                                      s.surname.toLowerCase() === st.surname.toLowerCase())
                                )
                              );
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-fest-border/40 bg-white/80 p-1.5 text-left transition hover:border-fest-orange hover:bg-white active:scale-95"
                          >
                            <img
                              src={st.photo || ""}
                              alt={st.firstName}
                              className="h-6 w-6 rounded-full object-cover border border-fest-orange/50 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-display text-[11px] uppercase leading-tight text-fest-deep">
                                {st.firstName}
                              </p>
                              <p className="truncate font-mono text-[8px] text-fest-label">
                                {st.branch}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // ════════════════════════════════════════════════════════════
            // "MY CONNECTIONS" TAB (List of scanned friends)
            // ════════════════════════════════════════════════════════════
            <div className="space-y-3">
              {connections.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-fest-yellow/20 text-fest-orange">
                    <Users className="h-7 w-7" />
                  </div>
                  <h3 className="mt-3 font-display text-base uppercase tracking-wide text-fest-deep">
                    NO CONNECTIONS YET
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-fest-label">
                    Scan other student passes at the tournament to exchange contact info and build your SMJV network!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("scanner");
                      startCamera();
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-ink shadow-xs"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>OPEN SCANNER NOW</span>
                  </button>
                </div>
              ) : (
                connections.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/80 p-3.5 shadow-2xs backdrop-blur-md transition hover:border-fest-orange/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={friend.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"}
                        alt={friend.firstName}
                        className="h-12 w-12 rounded-xl border border-fest-orange/50 object-cover shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-display text-sm uppercase leading-tight text-fest-deep sm:text-base">
                            {friend.firstName} {friend.surname}
                          </p>
                          <span className="rounded-md bg-fest-yellow/15 border border-fest-yellow/40 px-1.5 py-0.2 font-mono text-[8px] font-bold text-fest-yellow">
                            {friend.branch}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[9.5px] text-fest-label">
                          {friend.course} · {friend.college}
                        </p>
                        <p className="font-mono text-[9px] text-fest-gold">
                          📍 {friend.homeTown} · 📞 +91 {friend.mobile}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <a
                        href={`tel:+91${friend.mobile}`}
                        className="rounded-lg border border-fest-border/50 bg-white p-1.5 text-fest-deep hover:border-fest-orange hover:bg-fest-orange/10"
                        title="Call"
                      >
                        <Phone className="h-3.5 w-3.5 text-fest-orange" />
                      </a>
                      <a
                        href={`https://wa.me/91${friend.mobile}?text=Hi%20${encodeURIComponent(friend.firstName)}!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-green-600 p-1.5 text-white hover:bg-green-700"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadVCard(friend)}
                        className="rounded-lg border border-fest-border/50 bg-white p-1.5 text-fest-deep hover:border-fest-orange hover:bg-fest-orange/10"
                        title="Download vCard"
                      >
                        <Download className="h-3.5 w-3.5 text-fest-orange" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveConnection(friend.id, `${friend.firstName} ${friend.surname}`)}
                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
