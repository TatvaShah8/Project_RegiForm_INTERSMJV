import type { RegisterState } from "./store";

export const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F59E0B"/><stop offset="100%" stop-color="%23EA580C"/></linearGradient></defs><circle cx="60" cy="60" r="60" fill="%23FFF5EA"/><circle cx="60" cy="45" r="24" fill="%231E293B"/><circle cx="60" cy="47" r="21" fill="%23F6D5B8"/><path d="M42 38 C42 22 78 22 78 38 C75 30 65 30 60 32 C55 30 45 30 42 38 Z" fill="%231E293B"/><ellipse cx="53" cy="47" rx="2.5" ry="3" fill="%231E293B"/><ellipse cx="67" cy="47" rx="2.5" ry="3" fill="%231E293B"/><path d="M55 56 Q60 60 65 56" stroke="%23B45309" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M24 106 C24 82 40 76 60 76 C80 76 96 82 96 106 Z" fill="url(%23g)"/><path d="M52 76 L60 88 L68 76 Z" fill="%23FFF5EA"/></svg>`;

export const DEMO_STUDENT: Partial<RegisterState> = {
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
  completed: true,
  passNo: "#000142",
  photo: DEFAULT_AVATAR,
};

const STORAGE_KEY = "smjv_saved_accounts";

export function getSavedAccounts(): Partial<RegisterState>[] {
  if (typeof window === "undefined") return [DEMO_STUDENT];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEMO_STUDENT];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [DEMO_STUDENT];
    return parsed.map((acc: any) => ({
      ...acc,
      dob: acc.dob ? new Date(acc.dob) : null,
    }));
  } catch {
    return [DEMO_STUDENT];
  }
}

export function saveAccount(account: Partial<RegisterState>) {
  if (typeof window === "undefined") return;
  try {
    const accounts = getSavedAccounts();
    const email = account.email?.toLowerCase().trim();
    const grNo = account.grNo?.toLowerCase().trim();

    const filtered = accounts.filter(
      (a) =>
        (!email || a.email?.toLowerCase().trim() !== email) &&
        (!grNo || a.grNo?.toLowerCase().trim() !== grNo)
    );

    filtered.unshift(account);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Could not save account to localStorage", err);
  }
}

export function findAccount(identifier: string): Partial<RegisterState> | null {
  const q = identifier.trim().toLowerCase();
  const accounts = getSavedAccounts();
  const found = accounts.find(
    (a) =>
      a.email?.toLowerCase().trim() === q ||
      a.grNo?.toLowerCase().trim() === q ||
      a.mobile?.trim() === q
  );
  if (found) return found;

  // Fallback demo matching
  if (
    q === "aarav" ||
    q === "aarav.mehta@smjv.edu" ||
    q === "smjv26-0142" ||
    q === "0142" ||
    q === "demo"
  ) {
    return DEMO_STUDENT;
  }
  return null;
}
