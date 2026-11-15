/* INTER SMJV 2026 — shared constants & helpers
 * Field lists, options and wording transcribed from the reference app screenshots. */

export const FEST_NAME = "INTER SMJV 2026";
export const FEST_ORG = "INTER SMJV Vadodara Organizing Committee";

export const BOYS_BRANCHES = [
  "Vadodara",
  "Ahmedabad",
  "Andheri, Mumbai",
  "Sandhurst Road, Mumbai",
  "Pune",
  "Vallabh Vidyanagar",
  "Bhavnagar",
] as const;

export const GIRLS_BRANCHES = [
  "Vadodara",
  "Ahmedabad",
  "Vallabh Vidyanagar",
  "Pune",
  "Surat",
] as const;

export const BRANCHES = [
  "Vadodara",
  "Ahmedabad",
  "Andheri, Mumbai",
  "Sandhurst Road, Mumbai",
  "Pune",
  "Vallabh Vidyanagar",
  "Bhavnagar",
  "Surat",
] as const;

export function getBranchesForGender(gender?: string | null): readonly string[] {
  if (gender === "FEMALE") return GIRLS_BRANCHES;
  if (gender === "MALE") return BOYS_BRANCHES;
  return BRANCHES;
}

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const YEARS_OF_STUDY = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] as const;

export const RELATIONS = [
  "Father",
  "Mother",
  "Guardian",
  "Elder Brother",
  "Elder Sister",
  "Other Relative",
] as const;

export interface JerseySizeInfo {
  size: string;
  chest: string;
  length: string;
}

export interface TrackPantSizeInfo {
  size: string;
  waist: string;
  length: string;
}

/** Standardized Girls Sports Jersey Size Chart */
export const GIRLS_JERSEY_SIZE_CHART: readonly JerseySizeInfo[] = [
  { size: "XS (34)", chest: "34", length: "24" },
  { size: "S (36)", chest: "36", length: "25" },
  { size: "M (38)", chest: "38", length: "26" },
  { size: "L (40)", chest: "40", length: "27" },
  { size: "XL (42)", chest: "42", length: "28" },
  { size: "XXL (44)", chest: "44", length: "29" },
  { size: "XXXL (46)", chest: "46", length: "30" },
] as const;

export const GIRLS_JERSEY_SIZES = [
  "XS (34)",
  "S (36)",
  "M (38)",
  "L (40)",
  "XL (42)",
  "XXL (44)",
  "XXXL (46)",
] as const;

/** STARTDESI – Men's Sports Jersey Size Chart */
export const BOYS_JERSEY_SIZE_CHART: readonly JerseySizeInfo[] = [
  { size: "36 (S)", chest: "36", length: "26" },
  { size: "38 (M)", chest: "38", length: "27" },
  { size: "40 (L)", chest: "40", length: "28" },
  { size: "42 (XL)", chest: "42", length: "29" },
  { size: "44 (XXL)", chest: "44", length: "30" },
] as const;

export const BOYS_JERSEY_SIZES = [
  "36 (S)",
  "38 (M)",
  "40 (L)",
  "42 (XL)",
  "44 (XXL)",
] as const;

export const TSHIRT_SIZES = BOYS_JERSEY_SIZES;

/** Standardized Girls Track Pants Size Chart */
export const GIRLS_TRACK_PANT_SIZE_CHART: readonly TrackPantSizeInfo[] = [
  { size: "XS (34)", waist: "26–28", length: "36" },
  { size: "S (36)", waist: "28–30", length: "37" },
  { size: "M (38)", waist: "30–32", length: "38" },
  { size: "L (40)", waist: "32–34", length: "39" },
  { size: "XL (42)", waist: "34–36", length: "40" },
  { size: "XXL (44)", waist: "36–38", length: "41" },
  { size: "XXXL (46)", waist: "38–40", length: "42" },
] as const;

export const GIRLS_TRACK_PANT_SIZES = [
  "XS (34)",
  "S (36)",
  "M (38)",
  "L (40)",
  "XL (42)",
  "XXL (44)",
  "XXXL (46)",
] as const;

/** Standardized Boys Track Pants Size Chart */
export const BOYS_TRACK_PANT_SIZE_CHART: readonly TrackPantSizeInfo[] = [
  { size: "36 (S)", waist: "28–30", length: "38" },
  { size: "38 (M)", waist: "30–32", length: "39" },
  { size: "40 (L)", waist: "32–34", length: "40" },
  { size: "42 (XL)", waist: "34–36", length: "41" },
  { size: "44 (XXL)", waist: "36–38", length: "42" },
  { size: "46 (3XL)", waist: "38–40", length: "43" },
] as const;

export const BOYS_TRACK_PANT_SIZES = [
  "36 (S)",
  "38 (M)",
  "40 (L)",
  "42 (XL)",
  "44 (XXL)",
  "46 (3XL)",
] as const;

// Backward-compatible defaults
export const TRACK_PANT_SIZE_CHART = BOYS_TRACK_PANT_SIZE_CHART;
export const TRACK_PANT_SIZES = BOYS_TRACK_PANT_SIZES;
export const WAIST_SIZES = BOYS_TRACK_PANT_SIZES;

export function getTshirtSizesForGender(gender?: string | null): readonly string[] {
  if (gender === "FEMALE") return GIRLS_JERSEY_SIZES;
  return TSHIRT_SIZES;
}

export function getTrackPantSizesForGender(gender?: string | null): readonly string[] {
  if (gender === "FEMALE") return GIRLS_TRACK_PANT_SIZES;
  return BOYS_TRACK_PANT_SIZES;
}

export function getTrackPantSizeInfo(
  val?: string,
  gender?: string | null
): TrackPantSizeInfo | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  const list = gender === "FEMALE" ? GIRLS_TRACK_PANT_SIZE_CHART : BOYS_TRACK_PANT_SIZE_CHART;
  const foundInList =
    list.find((item) => item.size.toLowerCase() === clean) ||
    list.find((item) => item.size.toLowerCase().includes(clean)) ||
    list.find((item) => item.waist.includes(clean));
  if (foundInList) return foundInList;

  const otherList = gender === "FEMALE" ? BOYS_TRACK_PANT_SIZE_CHART : GIRLS_TRACK_PANT_SIZE_CHART;
  return (
    otherList.find((item) => item.size.toLowerCase() === clean) ||
    otherList.find((item) => item.size.toLowerCase().includes(clean)) ||
    otherList.find((item) => item.waist.includes(clean))
  );
}

export function getJerseySizeInfo(
  val?: string,
  gender?: string | null
): JerseySizeInfo | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  const list = gender === "FEMALE" ? GIRLS_JERSEY_SIZE_CHART : BOYS_JERSEY_SIZE_CHART;
  const foundInList =
    list.find((item) => item.size.toLowerCase() === clean) ||
    list.find((item) => item.size.toLowerCase().includes(`(${clean})`)) ||
    list.find((item) => item.size.toLowerCase().includes(clean)) ||
    list.find((item) => item.chest.includes(clean));
  if (foundInList) return foundInList;

  const otherList = gender === "FEMALE" ? BOYS_JERSEY_SIZE_CHART : GIRLS_JERSEY_SIZE_CHART;
  return (
    otherList.find((item) => item.size.toLowerCase() === clean) ||
    otherList.find((item) => item.size.toLowerCase().includes(`(${clean})`)) ||
    otherList.find((item) => item.size.toLowerCase().includes(clean)) ||
    otherList.find((item) => item.chest.includes(clean))
  );
}

export const BOYS_OUTDOOR_SPORTS = [
  { emoji: "🏏", name: "CRICKET" },
  { emoji: "⚽", name: "FOOTBALL" },
  { emoji: "🏐", name: "VOLLEYBALL" },
] as const;

export const GIRLS_OUTDOOR_SPORTS = [
  { emoji: "🏏", name: "CRICKET" },
  { emoji: "🏐", name: "THROWBALL" },
  { emoji: "🪢", name: "TUG OF WAR" },
  { emoji: "🏃‍♀️", name: "KHO KHO" },
] as const;

export const OUTDOOR_SPORTS = BOYS_OUTDOOR_SPORTS;

export function getOutdoorSportsForGender(gender?: string | null) {
  if (gender === "FEMALE") return GIRLS_OUTDOOR_SPORTS;
  return BOYS_OUTDOOR_SPORTS;
}

export const INDOOR_SPORTS = [
  { emoji: "🏓", name: "TABLE TENNIS" },
  { emoji: "♟️", name: "CHESS" },
  { emoji: "🏸", name: "BADMINTON" },
  { emoji: "🥒", name: "PICKLEBALL" },
  { emoji: "🎯", name: "CARROM" },
] as const;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type Role = "sports" | "cultural" | "visitor";
export const ROLE_META: Record<Role, { emoji: string; title: string; sub: string; passLabel: string }> = {
  sports: {
    emoji: "⚡",
    title: "Sports Team",
    sub: "Competing athlete in athletic & indoor ties",
    passLabel: "SPORTS TEAM",
  },
  cultural: {
    emoji: "🎭",
    title: "Cultural Team",
    sub: "Garba, music, drama & stage performances",
    passLabel: "CULTURAL TEAM",
  },
  visitor: {
    emoji: "🎟",
    title: "Visitor",
    sub: "Student supporter, spectator & resident pass",
    passLabel: "VISITOR",
  },
};

/** Rule text transcribed from the reference quota box. */
export const QUOTA_RULE =
  "A player can register for 1, 2, or 3 sports. For 3 sports: either 2 Outdoor + 1 Indoor, or 1 Outdoor + 2 Indoor. (Special exception: Bhavnagar SMJV Branch students have no limit on sports selection).";

export const BHAVNAGAR_QUOTA_RULE =
  "Special Exception for Bhavnagar SMJV Branch: Students of Bhavnagar Branch can select as many indoor and outdoor sports as they want without any limit.";

export const AGREEMENT_TEXT =
  "I agree to tournament sportsmanship regulations and verify that all information provided is accurate. I authorize saving my credentials securely in this browser for auto-login.";

/* ── helpers ─────────────────────────────────────────────── */

export function calcAge(dob: Date | string): number {
  const d = typeof dob === "string" ? new Date(dob) : dob;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isPhone(v: string): boolean {
  return /^[6-9]\d{9}$/.test(v.trim());
}

export function fullName(f: { firstName: string; middleName: string; surname: string }): string {
  return [f.firstName, f.middleName, f.surname].filter(Boolean).join(" ").trim();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic pseudo-barcode stripe widths derived from a seed string. */
export function barcodeWidths(seed: string, count = 44): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const widths: number[] = [];
  for (let i = 0; i < count; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    widths.push(1 + (Math.abs(h) % 4)); // 1..4 px stripes
  }
  return widths;
}

export function randomOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function grDigits(gr: string): string {
  const digits = gr.replace(/\D/g, "");
  return digits || "000000";
}

export function formatDob(d: Date | null): string {
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
