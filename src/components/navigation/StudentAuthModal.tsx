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
