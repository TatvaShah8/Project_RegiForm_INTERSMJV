"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { calcAge, type Role } from "@/lib/fest";

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
  jerseyNumber: string;
  tshirt: string;
  waist: string;
  outdoor: string[];
  indoor: string[];
  agreement: boolean;

  /* outcome */
  passNo: string;
  completed: boolean;
  isVerified: boolean;

  set: <K extends keyof RegisterState>(key: K, value: RegisterState[K]) => void;
  toggleSport: (kind: "outdoor" | "indoor", name: string) => { ok: boolean; reason?: string };
  quotaStatus: () => {
    total: number;
    outdoor: number;
    indoor: number;
    valid: boolean;
    message: string;
    tone: "ok" | "pending";
    isBhavnagar: boolean;
    maxTotal: number;
    maxOutdoor: number;
    maxIndoor: number;
  };
  loginAccount: (account: Partial<RegisterState>) => void;
  logout: () => void;
  resetAll: () => void;
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
  jerseyNumber: "",
  tshirt: "",
  waist: "",
  outdoor: [] as string[],
  indoor: [] as string[],
  agreement: false,

  passNo: "",
  completed: false,
  isVerified: false,
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

      toggleSport: (kind, name) => {
        const s = get();
        const list = kind === "outdoor" ? s.outdoor : s.indoor;
        const other = kind === "outdoor" ? s.indoor : s.outdoor;
        const has = list.includes(name);
        const isBhavnagar = (s.branch || "").trim().toLowerCase() === "bhavnagar";
        const isFemale = s.gender === "FEMALE";

        if (!has) {
          if (!isBhavnagar) {
            // For boys: at most 2 per category. For girls: any 3 allowed (all can be indoor or outdoor).
            if (!isFemale && list.length >= 2)
              return {
                ok: false,
                reason: `Quota limit: at most 2 ${kind} sports allowed for boys (choose 1 or 2 ${kind} sports, max 3 total).`,
              };
            if (list.length + other.length >= 3)
              return {
                ok: false,
                reason: "Maximum 3 sports allowed. Remove one before selecting another.",
              };
          }
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
        const s = get();
        const { outdoor, indoor, branch, gender } = s;
        const total = outdoor.length + indoor.length;
        const isBhavnagar = (branch || "").trim().toLowerCase() === "bhavnagar";
        const isFemale = gender === "FEMALE";

        if (isBhavnagar) {
          const valid = total >= 1;
          let message: string;
          let tone: "ok" | "pending";
          if (valid) {
            message = `Bhavnagar Special Quota: ${total} sport(s) selected (${outdoor.length} Outdoor + ${indoor.length} Indoor). No upper limit!`;
            tone = "ok";
          } else {
            message = "Bhavnagar Special Quota: Please select at least 1 sport (no upper limit on sports).";
            tone = "pending";
          }
          return {
            total,
            outdoor: outdoor.length,
            indoor: indoor.length,
            valid,
            message,
            tone,
            isBhavnagar: true,
            maxTotal: Infinity,
            maxOutdoor: Infinity,
            maxIndoor: Infinity,
          };
        }

        if (isFemale) {
          const valid = total >= 1 && total <= 3;
          let message: string;
          let tone: "ok" | "pending";
          if (valid) {
            if (total === 3) {
              message = `Valid selection confirmed: 3 sports selected (${outdoor.length} Outdoor + ${indoor.length} Indoor).`;
            } else {
              message = `Valid selection: ${total} sport(s) selected (${outdoor.length} Outdoor + ${indoor.length} Indoor). You can select up to 3 sports total.`;
            }
            tone = "ok";
          } else {
            message = "Girls Quota: Select any 1, 2, or 3 sports (all can be indoor, all can be outdoor, or any combination).";
            tone = "pending";
          }
          return {
            total,
            outdoor: outdoor.length,
            indoor: indoor.length,
            valid,
            message,
            tone,
            isBhavnagar: false,
            maxTotal: 3,
            maxOutdoor: 3,
            maxIndoor: 3,
          };
        }

        const valid = total >= 1 && total <= 3 && outdoor.length <= 2 && indoor.length <= 2;
        let message: string;
        let tone: "ok" | "pending";
        if (valid) {
          if (total === 3) {
            message = `Valid selection confirmed: 3 sports (${outdoor.length} Outdoor + ${indoor.length} Indoor).`;
          } else if (total === 2) {
            message = `Valid selection: 2 sports selected (${outdoor.length} Outdoor + ${indoor.length} Indoor). You can add 1 more sport if desired.`;
          } else {
            message = `Valid selection: 1 sport selected (${outdoor.length ? "1 Outdoor" : "1 Indoor"}). You can add up to 2 more sports if desired.`;
          }
          tone = "ok";
        } else {
          message = "Please select 1, 2, or 3 sports (for 3 sports: 2 Outdoor + 1 Indoor, or 1 Outdoor + 2 Indoor).";
          tone = "pending";
        }
        return {
          total,
          outdoor: outdoor.length,
          indoor: indoor.length,
          valid,
          message,
          tone,
          isBhavnagar: false,
          maxTotal: 3,
          maxOutdoor: 2,
          maxIndoor: 2,
        };
      },

      loginAccount: (account) => {
        set({
          ...initial,
          ...account,
          isVerified: !!account.isVerified,
          completed: !!account.completed,
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
                fest: "SMJV Youth Festival 2026",
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
            window.localStorage.removeItem("smjv_registration_storage");
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

    }),
    {
      name: "smjv_registration_storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : dummyStorage)),
      // Do not persist plaintext passwords, OTPs or uploaded photo data.
      partialize: (state) => {
        const { password, emailCode, mobileCode, emailOtp, mobileOtp, photo, completed, emailVerified, mobileVerified, isVerified, ...safe } = state;
        return safe;
      },
      version: 2,
      migrate: (persisted) => {
        const value = persisted as Partial<RegisterState>;
        return { ...value, password: "", emailCode: "", mobileCode: "", emailOtp: "", mobileOtp: "", photo: null, completed: false, emailVerified: false, mobileVerified: false, isVerified: false };
      },
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
