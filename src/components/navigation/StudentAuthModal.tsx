"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X, LogIn, UserPlus, Eye, EyeOff, Sparkles, CheckCircle2, User } from "lucide-react";
import { useRegister } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  getSavedAccounts,
  findAccount,
  DEMO_STUDENT,
} from "@/lib/auth-storage";
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
  const [savedAccounts, setSavedAccounts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setError(null);
      setSavedAccounts(getSavedAccounts());
    }
  }, [open, defaultTab]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const id = identifier.trim();
    if (!id) {
      setError("Please enter your registered Email ID or GR Number");
      return;
    }

    const account = findAccount(id);
    if (!account) {
      setError("No registered student found with this Email or GR Number. You can register as a new student or use the quick demo account below.");
      return;
    }

    // If password was stored and entered
    if (account.password && password && account.password !== password) {
      setError("Incorrect password. Please try again.");
      return;
    }

    // Success login
    s.loginAccount(account);
    toast({
      title: "LOGGED IN SUCCESSFULLY",
      description: `Welcome back, ${[account.firstName, account.surname].filter(Boolean).join(" ")}! Your official ID pass is ready.`,
    });
    onOpenChange(false);
  };

  const handleQuickLogin = (acc: any) => {
    s.loginAccount(acc);
    toast({
      title: "LOGGED IN AS " + [acc.firstName, acc.surname].filter(Boolean).join(" ").toUpperCase(),
      description: "Loaded accreditation profile and generated tournament ID pass.",
    });
    onOpenChange(false);
  };

  const handleGoRegister = () => {
    onOpenChange(false);
    router.push("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border border-white/85 bg-white/95 p-0 shadow-[0_24px_64px_rgba(28,36,56,0.18)] backdrop-blur-2xl sm:rounded-3xl">
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
                <p className="mt-0.5 text-xs text-fest-label">
                  Enter your registered Email or GR Number to view your official tournament ID pass.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    Email ID or GR Number
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

              {/* Quick Login / Localhost Dev Persistence */}
              <div className="mt-5 rounded-2xl border border-fest-orange/25 bg-amber-50/60 p-4 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide text-fest-orange">
                  <Sparkles className="h-3.5 w-3.5 text-fest-orange" />
                  <span>ONE-CLICK QUICK LOGIN (SAVED / DEMO)</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-fest-label">
                  Click any profile below to log in instantly without typing:
                </p>

                <div className="mt-3 space-y-2">
                  {savedAccounts.map((acc, idx) => {
                    const name = [acc.firstName, acc.surname].filter(Boolean).join(" ") || "Student";
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-fest-border/80 bg-white/90 p-2.5 text-left shadow-xs transition hover:border-fest-orange/70 hover:bg-white active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fest-orange/15 font-mono text-xs font-bold text-fest-orange">
                            {acc.photo ? (
                              <img src={acc.photo} alt={name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                              name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-display text-xs uppercase text-fest-deep">{name}</p>
                            <p className="font-mono text-[10px] text-fest-label">
                              {acc.branch || "Vadodara"} · GR: {acc.grNo || "SMJV26-0142"}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-lg bg-fest-orange/15 px-2.5 py-1 font-mono text-[10px] font-bold text-fest-orange">
                          Log In →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
              <div>
                <h3 className="font-display text-base uppercase tracking-wide text-fest-deep">
                  New Student Registration
                </h3>
                <p className="mt-0.5 text-xs text-fest-label">
                  Join SMJV Youth Festival 2026! Complete the simple 4-step registration to participate and get your tournament ID badge.
                </p>
              </div>

              <div className="space-y-2.5 rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-md">
                <div className="flex items-start gap-2.5 text-xs text-fest-deep">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-fest-green" />
                  <span><b>10 Sports & Events:</b> Boys and girls tournament competition across 7 SMJV branches.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-fest-deep">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-fest-green" />
                  <span><b>Digital ID Pass:</b> Scannable QR code verification badge generated upon completion.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-fest-deep">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-fest-green" />
                  <span><b>Tournament Kit:</b> Official customized T-Shirt & Track Pant included.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoRegister}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                START NEW REGISTRATION →
              </button>

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
