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
  jerseyNumber: "10",
  tshirt: "40 (L)",
  waist: "40 (L)",
  outdoor: ["Cricket", "Volleyball"],
  indoor: ["Table Tennis"],
  agreement: true,
  completed: true,
  passNo: "#000142",
  photo: DEFAULT_AVATAR,
};

export const INITIAL_ACCOUNTS: Partial<RegisterState>[] = [
  DEMO_STUDENT,
  {
    firstName: "Devam",
    middleName: "Ketanbhai",
    surname: "Shah",
    email: "devam.shah@smjv.edu",
    password: "password123",
    mobile: "9879100007",
    grNo: "SMJV26-0707",
    gender: "MALE",
    branch: "Ahmedabad",
    homeTown: "Ahmedabad",
    college: "L.D. College of Engineering",
    course: "B.Tech Information Technology",
    year: "3rd Year",
    bloodGroup: "O+",
    dob: new Date("2003-05-12"),
    emergency: "9879111111",
    relation: "Father",
    role: "sports",
    jerseyNumber: "7",
    tshirt: "40 (L)",
    waist: "38 (M)",
    outdoor: ["Cricket"],
    indoor: ["Badminton"],
    agreement: true,
    completed: true,
    passNo: "#000707",
    photo: DEFAULT_AVATAR,
  },
  {
    firstName: "Priya",
    middleName: "Kirtikumar",
    surname: "Shah",
    email: "priya.shah@smjv.edu",
    password: "password123",
    mobile: "9879123456",
    grNo: "SMJV26-0524",
    gender: "FEMALE",
    branch: "Ahmedabad",
    homeTown: "Ahmedabad",
    college: "Institute of Technology, Nirma University",
    course: "B.Tech Electronics & Communication",
    year: "4th Year",
    bloodGroup: "A+",
    dob: new Date("2002-11-20"),
    emergency: "9879222222",
    relation: "Mother",
    role: "sports",
    jerseyNumber: "18",
    tshirt: "36 (S)",
    waist: "36 (S)",
    outdoor: ["Throwball"],
    indoor: ["Badminton"],
    agreement: true,
    completed: true,
    passNo: "#000524",
    photo: DEFAULT_AVATAR,
  },
];

const STORAGE_KEY = "smjv_saved_accounts";

export function getSavedAccounts(): Partial<RegisterState>[] {
  if (typeof window === "undefined") return INITIAL_ACCOUNTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    return parsed.map((acc: any) => ({
      ...acc,
      dob: acc.dob ? new Date(acc.dob) : null,
    }));
  } catch {
    return INITIAL_ACCOUNTS;
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

/**
 * Normalizes a jersey number by trimming whitespace and converting to integer string.
 * e.g. " 07 " -> "7", "00" -> "0"
 */
export function normalizeJerseyNumber(raw: string | number | undefined | null): string {
  if (raw === undefined || raw === null) return "";
  const str = String(raw).trim();
  if (!str) return "";
  const num = parseInt(str, 10);
  return isNaN(num) ? str : String(num);
}

export interface JerseyCheckResult {
  available: boolean;
  normalized: string;
  reason?: string;
  claimedBy?: string;
}

/**
 * Validates whether a jersey number is available on a first-come, first-served basis.
 * Scope: Unique per (Branch + Gender + Jersey Number).
 * 
 * Example:
 * - Male + Ahmedabad takes 7 -> No other Male from Ahmedabad can take 7.
 * - Female from Ahmedabad CAN take 7.
 * - Male from Vadodara CAN take 7.
 */
export function checkJerseyAvailability(
  jerseyNum: string | number | undefined | null,
  branch: string | undefined | null,
  gender: string | undefined | null,
  currentIdentifier?: { email?: string; grNo?: string }
): JerseyCheckResult {
  const normalized = normalizeJerseyNumber(jerseyNum);
  if (!normalized) {
    return { available: false, normalized: "", reason: "Please enter your desired jersey number." };
  }

  const numVal = parseInt(normalized, 10);
  if (isNaN(numVal) || numVal < 0 || numVal > 999) {
    return {
      available: false,
      normalized,
      reason: "Jersey number must be a valid number between 0 and 999.",
    };
  }

  const cleanBranch = (branch || "").trim().toLowerCase();
  const cleanGender = (gender || "").trim().toUpperCase();

  if (!cleanBranch || !cleanGender) {
    // If branch/gender not yet set, number format is valid
    return { available: true, normalized };
  }

  const accounts = getSavedAccounts();
  const currentEmail = currentIdentifier?.email?.trim().toLowerCase();
  const currentGr = currentIdentifier?.grNo?.trim().toLowerCase();

  const conflict = accounts.find((a) => {
    // Exclude the student's own account if they are modifying or reviewing
    if (currentEmail && a.email?.trim().toLowerCase() === currentEmail) return false;
    if (currentGr && a.grNo?.trim().toLowerCase() === currentGr) return false;

    const aBranch = (a.branch || "").trim().toLowerCase();
    const aGender = (a.gender || "").trim().toUpperCase();
    const aJersey = normalizeJerseyNumber(a.jerseyNumber);

    return aBranch === cleanBranch && aGender === cleanGender && aJersey === normalized;
  });

  if (conflict) {
    const claimant =
      [conflict.firstName, conflict.surname].filter(Boolean).join(" ") || "Another athlete";
    const genderLabel = cleanGender === "FEMALE" ? "Female" : "Male";
    return {
      available: false,
      normalized,
      claimedBy: claimant,
      reason: `Jersey #${normalized} is already taken for ${branch} (${genderLabel} division) by ${claimant}. Numbers are allocated on a first-come, first-served basis.`,
    };
  }

  return { available: true, normalized };
}

/**
 * Returns list of already claimed jersey numbers for a given branch and gender division.
 */
export function getTakenJerseyNumbers(
  branch: string | undefined | null,
  gender: string | undefined | null,
  currentIdentifier?: { email?: string; grNo?: string }
): { number: string; takenBy: string }[] {
  const cleanBranch = (branch || "").trim().toLowerCase();
  const cleanGender = (gender || "").trim().toUpperCase();
  if (!cleanBranch || !cleanGender) return [];

  const accounts = getSavedAccounts();
  const currentEmail = currentIdentifier?.email?.trim().toLowerCase();
  const currentGr = currentIdentifier?.grNo?.trim().toLowerCase();

  const takenMap = new Map<string, string>();
  for (const a of accounts) {
    if (currentEmail && a.email?.trim().toLowerCase() === currentEmail) continue;
    if (currentGr && a.grNo?.trim().toLowerCase() === currentGr) continue;

    const aBranch = (a.branch || "").trim().toLowerCase();
    const aGender = (a.gender || "").trim().toUpperCase();
    const aJersey = normalizeJerseyNumber(a.jerseyNumber);

    if (aBranch === cleanBranch && aGender === cleanGender && aJersey) {
      const claimant = [a.firstName, a.surname].filter(Boolean).join(" ") || "Athlete";
      if (!takenMap.has(aJersey)) {
        takenMap.set(aJersey, claimant);
      }
    }
  }

  return Array.from(takenMap.entries())
    .map(([number, takenBy]) => ({ number, takenBy }))
    .sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
}
