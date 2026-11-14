"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { calcAge, randomOtp, type Role } from "@/lib/fest";
import { saveAccount, DEFAULT_AVATAR } from "@/lib/auth-storage";

export type { Role } from "@/lib/fest";
export type Gender = "MALE" | "FEMALE";
export type DobMode = "dropdown" | "calendar" | "typed";

export interface RegisterState {
  /* hydration tracking for Next.js SSR */
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  /* step 01 — account & identity */
  firstName: string;
  middleName: string;
  surname: string;
  email: string;
  password: string;
  mobile: string;
  grNo: string;
  gender: Gender | "";

  /* step 02 — verification */
  emailCode: string;
  mobileCode: string;
  emailOtp: string;
  mobileOtp: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  otpIssued: boolean;

  /* step 03 — general info */
  photo: string | null;
  dob: Date | null;
  dobMode: DobMode;
  bloodGroup: string;
  branch: string;
  homeTown: string;
  college: string;
  course: string;
  year: string;
  emergency: string;
  relation: string;

  /* step 04 — participation */
  role: Role | "";
  tshirt: string;
  waist: string;
  outdoor: string[];
  indoor: string[];
  agreement: boolean;

  /* outcome */
  passNo: string;
  completed: boolean;

  set: <K extends keyof RegisterState>(key: K, value: RegisterState[K]) => void;
  issueOtps: () => void;
  verifyOtp: (channel: "email" | "mobile", code: string) => boolean;
  toggleSport: (kind: "outdoor" | "indoor", name: string) => { ok: boolean; reason?: string };
  quotaStatus: () => { total: number; outdoor: number; indoor: number; valid: boolean; message: string; tone: "ok" | "pending" };
  complete: () => void;
  loginAccount: (account: Partial<RegisterState>) => void;
  logout: () => void;
  resetAll: () => void;
  fillTestData: () => void;
  completeTestData: () => void;
}

const initial = {
  _hasHydrated: false,

  firstName: "",
  middleName: "",
  surname: "",
  email: "",
  password: "",
  mobile: "",
  grNo: "",
  gender: "" as Gender | "",

  emailCode: "",
  mobileCode: "",
  emailOtp: "",
  mobileOtp: "",
  emailVerified: false,
  mobileVerified: false,
  otpIssued: false,

  photo: null,
  dob: null as Date | null,
  dobMode: "dropdown" as DobMode,
  bloodGroup: "",
  branch: "",
  homeTown: "",
  college: "",
  course: "",
  year: "",
  emergency: "",
  relation: "",

  role: "" as Role | "",
  tshirt: "",
  waist: "",
  outdoor: [] as string[],
  indoor: [] as string[],
  agreement: false,

  passNo: "",
  completed: false,
};

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useRegister = create<RegisterState>()(
  persist(
    (set, get) => ({
      ...initial,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      set: (key, value) => set({ [key]: value } as Partial<RegisterState>),

      issueOtps: () => {
        const { emailCode, mobileCode, otpIssued } = get();
        if (otpIssued && emailCode && mobileCode) return;
        set({
          emailCode: emailCode || randomOtp(),
          mobileCode: mobileCode || randomOtp(),
          otpIssued: true,
        });
      },

      verifyOtp: (channel, code) => {
        const s = get();
        const target = channel === "email" ? s.emailCode : s.mobileCode;
        const ok = code.trim() === target;
        if (ok) set(channel === "email" ? { emailVerified: true } : { mobileVerified: true });
        return ok;
      },

      toggleSport: (kind, name) => {
        const s = get();
        const list = kind === "outdoor" ? s.outdoor : s.indoor;
        const other = kind === "outdoor" ? s.indoor : s.outdoor;
        const has = list.includes(name);

        if (!has) {
          if (list.length >= 2)
            return { ok: false, reason: `Quota limit: at most 2 ${kind} sports per the 2+1 / 1+2 rule.` };
          if (list.length + other.length >= 3)
            return { ok: false, reason: "Total is already 3 sports — remove one before adding another." };
          const next = kind === "outdoor" ? { outdoor: [...list, name] } : { indoor: [...list, name] };
          set(next);
          return { ok: true };
        }
        set(
          kind === "outdoor"
            ? { outdoor: list.filter((n) => n !== name) }
            : { indoor: list.filter((n) => n !== name) }
        );
        return { ok: true };
      },

      quotaStatus: () => {
        const { outdoor, indoor } = get();
        const total = outdoor.length + indoor.length;
        const valid = total === 3 && outdoor.length <= 2 && indoor.length <= 2;
        let message: string;
        let tone: "ok" | "pending";
        if (valid) {
          message = `Valid selection confirmed: ${outdoor.length} Outdoor + ${indoor.length} Indoor sports.`;
          tone = "ok";
        } else {
          message = `Current status: Please select ${3 - total} more sport(s) following the 2+1 or 1+2 rule.`;
          tone = "pending";
        }
        return { total, outdoor: outdoor.length, indoor: indoor.length, valid, message, tone };
      },

      complete: () => {
        const s = get();
        const digits = s.grNo.replace(/\D/g, "") || "000142";
        const passNo = s.passNo || `#${digits}`;
        set({ completed: true, passNo });
        const updated = { ...s, completed: true, passNo };
        try {
          window.localStorage.setItem(
            "smjv_auto_login",
            JSON.stringify({
              name: [s.firstName, s.surname].filter(Boolean).join(" "),
              email: s.email,
              gr: s.grNo,
              fest: "INTER SMJV 2026",
              savedAt: new Date().toISOString(),
            })
          );
          saveAccount(updated);
        } catch {
          /* storage unavailable — ignore in demo */
        }
      },

      loginAccount: (account) => {
        set({
          ...initial,
          ...account,
          completed: true,
          _hasHydrated: true,
        });
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              "smjv_auto_login",
              JSON.stringify({
                name: [account.firstName, account.surname].filter(Boolean).join(" "),
                email: account.email,
                gr: account.grNo,
                fest: "INTER SMJV 2026",
                savedAt: new Date().toISOString(),
              })
            );
          } catch {}
        }
      },

      logout: () => {
        set({ ...initial, _hasHydrated: true });
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem("smjv_auto_login");
          } catch {}
        }
      },

      resetAll: () => {
        set({ ...initial, _hasHydrated: true });
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem("smjv_registration_storage");
            window.localStorage.removeItem("smjv_auto_login");
          } catch {}
        }
      },

      fillTestData: () => {
        set({
          firstName: "Aarav",
          middleName: "Rajeshbhai",
          surname: "Mehta",
          email: "aarav.mehta@smjv.edu",
          password: "password123",
          mobile: "9825040142",
          grNo: "SMJV26-0142",
          gender: "MALE",
          emailVerified: true,
          mobileVerified: true,
          otpIssued: true,
          emailCode: "4201",
          mobileCode: "8841",
          emailOtp: "4201",
          mobileOtp: "8841",
          branch: "Vadodara",
          homeTown: "Vadodara",
          college: "Faculty of Technology & Engineering, MSU",
          course: "B.Tech Computer Science",
          year: "3rd Year",
          bloodGroup: "B+",
          dob: new Date("2003-08-14"),
          emergency: "9825011111",
          relation: "Father",
          role: "sports",
          tshirt: "L",
          waist: "32",
          outdoor: ["Cricket", "Volleyball"],
          indoor: ["Table Tennis"],
          agreement: true,
          completed: false,
          photo: DEFAULT_AVATAR,
        });
      },

      completeTestData: () => {
        get().fillTestData();
        get().complete();
      },
    }),
    {
      name: "smjv_registration_storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.dob && typeof state.dob === "string") {
            state.dob = new Date(state.dob);
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);

/** Convenience selector: auto-computed age. */
export function selectAge(dob: Date | null): number | null {
  if (!dob) return null;
  const age = calcAge(dob);
  return age >= 0 && age <= 120 ? age : null;
}
