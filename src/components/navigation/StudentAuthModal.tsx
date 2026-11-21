"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X, LogIn, UserPlus, Eye, EyeOff, Sparkles, CheckCircle2, User } from "lucide-react";
import { useRegister } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { loadRegistration } from "@/lib/registration-api";
import { signInWithGoogle, loginWithEmailPassword } from "@/lib/auth-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface StudentAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export function StudentAuthModal({
  open,
  onOpenChange,
  defaultTab = "login",
}: StudentAuthModalProps) {
  const router = useRouter();
  const s = useRegister();
  const { toast } = useToast();

  const [tab, setTab] = React.useState<"login" | "register">(defaultTab);
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setError(null);
    }
  }, [open, defaultTab]);

  const handleGoogleAuth = async () => {
    setLoadingGoogle(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      if (!res.ok || !res.user) {
        if (res.code === "auth/popup-closed-by-user" || res.code === "auth/cancelled-popup-request") {
          setError("Google sign-in window was closed.");
        } else {
          setError(res.error || "Google sign-in was cancelled or could not be completed.");
        }
        return;
      }
      const userEmail = res.user.email;
      if (!userEmail) {
        setError("No email address returned from your Google account.");
        return;
      }

      // 1. Check if user already completed registration
      const account = await loadRegistration();
      if (account?.completed) {
        s.loginAccount(account);
        toast({
          title: "LOGGED IN WITH GOOGLE ✓",
          description: `Welcome back, ${[account.firstName, account.surname].filter(Boolean).join(" ")}!`,
        });
        onOpenChange(false);
        return;
      }

      // 2. New student registration with pre-verified Google email
      s.set("email", userEmail);
      s.set("emailVerified", res.user.emailVerified);
      toast({
        title: "GOOGLE ACCOUNT AUTHENTICATED ✓",
        description: `Verified ${userEmail}. Please fill your official details manually for certificates.`,
      });
      onOpenChange(false);
      router.push("/register");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const id = identifier.trim();
    if (!id) {
      setError("Please enter your registered Email ID");
      return;
    }

    if (!id.includes("@") || !password) {
      setError("Enter your Firebase email address and password, or sign in with Google.");
      return;
    }
    try {
      const result = await loginWithEmailPassword(id, password);
      if (!result.ok || !result.user) throw new Error(result.error || "Sign-in failed");
      const account = await loadRegistration();
      if (account) s.loginAccount(account);
      else {
        s.set("email", result.user.email ?? id);
        s.set("emailVerified", result.user.emailVerified);
      }
      onOpenChange(false);
      if (!account?.completed) router.push("/register");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load your registration");
    }
  };

  const handleGoRegister = () => {
    onOpenChange(false);
    router.push("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl overflow-hidden border border-white/85 bg-white/95 p-0 shadow-[0_24px_64px_rgba(28,36,56,0.18)] backdrop-blur-2xl sm:rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Student Portal Login & Registration</DialogTitle>
          <DialogDescription>Log in to access your tournament pass or start a new student registration.</DialogDescription>
        </DialogHeader>

        {/* Modal Top Banner */}
        <div className="relative border-b border-fest-border/60 bg-gradient-to-r from-fest-yellow/20 via-fest-orange/15 to-transparent px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="SMJV Youth Festival 2026 Logo"
                className="h-10 w-10 rounded-full border border-fest-orange/40 object-cover shadow-sm"
              />
              <div>
                <p className="font-display text-base uppercase leading-tight tracking-wide text-fest-deep">
                  SMJV YOUTH FESTIVAL <span className="fest-gradient-text">2026</span>
                </p>
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-fest-label">
                  STUDENT ACCREDITATION PORTAL
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 text-fest-label transition hover:bg-fest-inner/60 hover:text-fest-deep"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="mt-4 flex rounded-xl border border-white/80 bg-white/60 p-1 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-display text-xs uppercase tracking-wider transition ${
                tab === "login"
                  ? "bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-sm font-bold"
                  : "text-fest-label hover:text-fest-deep"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>LOG IN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-display text-xs uppercase tracking-wider transition ${
                tab === "register"
                  ? "bg-gradient-to-r from-fest-yellow to-fest-orange text-fest-ink shadow-sm font-bold"
                  : "text-fest-label hover:text-fest-deep"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>REGISTER</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="fest-scroll max-h-[75vh] overflow-y-auto px-6 py-5">
          {tab === "login" ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base uppercase tracking-wide text-fest-deep">
                  Student Sign In
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-fest-deep">
                  Enter your registered Email to view your official tournament ID pass.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              {/* Google 1-Click Sign-in Button */}
              <button
                type="button"
                disabled={loadingGoogle}
                onClick={handleGoogleAuth}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-fest-border bg-white px-4 font-display text-xs uppercase tracking-wider text-fest-deep shadow-xs transition hover:border-fest-orange hover:bg-fest-orange/5 active:scale-95 disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{loadingGoogle ? "CONNECTING WITH GOOGLE…" : "CONTINUE WITH GOOGLE"}</span>
              </button>

              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-fest-border/80" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white/95 px-2 font-mono text-fest-label">Or sign in with email &amp; password</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    Email ID
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. aarav.mehta@smjv.edu or SMJV26-0142"
                    className="mt-1 h-11 w-full rounded-xl border border-fest-border bg-white/80 px-3.5 font-mono text-xs text-fest-deep shadow-sm outline-none transition placeholder:text-fest-label/50 focus:border-fest-orange focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="h-11 w-full rounded-xl border border-fest-border bg-white/80 px-3.5 pr-10 font-mono text-xs text-fest-deep shadow-sm outline-none transition placeholder:text-fest-label/50 focus:border-fest-orange focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-fest-label hover:text-fest-deep"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-95"
                >
                  <LogIn className="h-4 w-4" />
                  LOG IN TO ID PASS
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="font-mono text-xs text-fest-label">
                  New student?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="font-bold text-fest-orange underline underline-offset-4 hover:brightness-110"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* Register tab */
            <div className="space-y-4">
              <div className="text-center">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-fest-orange">
                  SMJV YOUTH FESTIVAL 2026 · REGISTRATION
                </span>
                <h3 className="mt-1 font-display text-xl uppercase tracking-wide text-fest-deep sm:text-2xl">
                  Choose Your Participation Team
                </h3>
                <p className="mt-1 text-xs text-fest-label">
                  Select whether you want to participate in sports competition or cultural stage performances.
                </p>
              </div>

              {/* Big, Proper Visible Buttons (Curved Rectangular Boxes) */}
              <div className="grid gap-3.5 pt-1">
                {/* ── Box 1: Sports Team ── */}
                <button
                  type="button"
                  onClick={() => {
                    s.set("role", "sports");
                    onOpenChange(false);
                    router.push("/register");
                  }}
                  className="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-fest-orange/50 bg-gradient-to-br from-white/95 via-amber-50/50 to-fest-orange/15 p-4 sm:p-5 text-left shadow-[0_12px_32px_rgba(217,119,6,0.12),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-xl transition-all duration-200 hover:border-fest-orange hover:shadow-[0_16px_40px_rgba(217,119,6,0.25)] hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fest-yellow to-fest-orange text-2xl sm:text-3xl shadow-md shadow-fest-orange/30 text-fest-ink font-bold">
                        ⚡
                      </div>
                      <div>
                        <span className="inline-block rounded-full border border-fest-orange/30 bg-fest-orange/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
                          ATHLETICS &amp; COMPETITION
                        </span>
                        <h4 className="mt-0.5 font-display text-base sm:text-lg uppercase tracking-wide text-fest-deep group-hover:text-fest-orange transition-colors">
                          REGISTER FOR SPORTS TEAM
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-fest-label leading-relaxed">
                    Compete in 10+ outdoor &amp; indoor sports (Cricket, Football, Volleyball, Pickleball, Table Tennis, Badminton, Chess &amp; more). Includes custom official jersey with allocated number &amp; track pant.
                  </p>

                  <div className="mt-3.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2.5 font-display text-xs uppercase tracking-wider text-fest-ink shadow-sm group-hover:brightness-105 transition">
                    <span className="font-bold">PROCEED AS SPORTS PLAYER</span>
                    <span className="text-base font-black transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>

                {/* ── Box 2: Cultural Team ── */}
                <button
                  type="button"
                  onClick={() => {
                    s.set("role", "cultural");
                    onOpenChange(false);
                    router.push("/register");
                  }}
                  className="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-indigo-400/50 bg-gradient-to-br from-white/95 via-indigo-50/50 to-purple-100/30 p-4 sm:p-5 text-left shadow-[0_12px_32px_rgba(99,102,241,0.10),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-xl transition-all duration-200 hover:border-purple-600 hover:shadow-[0_16px_40px_rgba(147,51,234,0.22)] hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl sm:text-3xl shadow-md shadow-purple-500/30 text-white font-bold">
                        🎭
                      </div>
                      <div>
                        <span className="inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-purple-700">
                          STAGE ARTS &amp; PERFORMANCES
                        </span>
                        <h4 className="mt-0.5 font-display text-base sm:text-lg uppercase tracking-wide text-fest-deep group-hover:text-purple-700 transition-colors">
                          REGISTER FOR CULTURAL TEAM
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-fest-label leading-relaxed">
                    Represent your branch in Garba, Raas, Dance drama, Singing, Instrumental performances &amp; stage showcases. Fast 3-step registration (official customized jersey &amp; track pant included).
                  </p>

                  <div className="mt-3.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 font-display text-xs uppercase tracking-wider text-white shadow-sm group-hover:brightness-105 transition">
                    <span className="font-bold">PROCEED AS CULTURAL PERFORMER</span>
                    <span className="text-base font-black transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="font-mono text-xs text-fest-label">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="font-bold text-fest-orange underline underline-offset-4 hover:brightness-110"
                  >
                    Sign in to your ID pass
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
