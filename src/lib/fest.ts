/* SMJV Youth Festival 2026 — shared constants & helpers
 * Field lists, options and wording transcribed from the reference app screenshots. */

export const FEST_NAME = "SMJV Youth Festival 2026";
export const FEST_ORG = "SMJV Youth Festival Vadodara Organizing Committee";

/** Master switches to close/re-open new registrations and form editing */
export const REGISTRATION_OPEN = process.env.SMJV_TEST_REGISTRATION_OPEN === "true";
export const EDIT_REGISTRATION_OPEN = process.env.SMJV_TEST_REGISTRATION_OPEN === "true";

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
  rise?: string;
}

/** Official Standardized Jersey Size Chart (for both Boys and Girls) */
export const JERSEY_SIZE_CHART: readonly JerseySizeInfo[] = [
  { size: "XXS", chest: "32", length: "24" },
  { size: "XS", chest: "34", length: "25" },
  { size: "S", chest: "36", length: "26" },
  { size: "M", chest: "38", length: "27" },
  { size: "L", chest: "40", length: "28" },
  { size: "XL", chest: "42", length: "29" },
  { size: "XXL", chest: "44", length: "30" },
  { size: "XXXL", chest: "46", length: "31" },
  { size: "XXXXL", chest: "48", length: "32" },
] as const;

export const JERSEY_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "XXXXL",
] as const;

/** Official Standardized Pant Size Chart (for both Boys and Girls) */
export const TRACK_PANT_SIZE_CHART: readonly TrackPantSizeInfo[] = [
  { size: "S", waist: "28", length: "38" },
  { size: "M", waist: "30", length: "38" },
  { size: "L", waist: "32", length: "38" },
  { size: "XL", waist: "34", length: "40" },
  { size: "2XL", waist: "36", length: "40" },
  { size: "3XL", waist: "38", length: "40" },
  { size: "4XL", waist: "40", length: "42" },
  { size: "5XL", waist: "42", length: "42" },
  { size: "6XL", waist: "44", length: "42" },
] as const;

export const TRACK_PANT_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
] as const;

export const ALL_VALID_TRACK_PANT_SIZES = [
  ...TRACK_PANT_SIZES,
  "XXL", // Backward compatibility for previously saved records
] as const;

// Backward-compatible aliases (unified for both genders)
export const BOYS_JERSEY_SIZE_CHART = JERSEY_SIZE_CHART;
export const GIRLS_JERSEY_SIZE_CHART = JERSEY_SIZE_CHART;
export const BOYS_JERSEY_SIZES = JERSEY_SIZES;
export const GIRLS_JERSEY_SIZES = JERSEY_SIZES;
export const TSHIRT_SIZES = JERSEY_SIZES;

export const BOYS_TRACK_PANT_SIZE_CHART = TRACK_PANT_SIZE_CHART;
export const GIRLS_TRACK_PANT_SIZE_CHART = TRACK_PANT_SIZE_CHART;
export const BOYS_TRACK_PANT_SIZES = TRACK_PANT_SIZES;
export const GIRLS_TRACK_PANT_SIZES = TRACK_PANT_SIZES;
export const WAIST_SIZES = TRACK_PANT_SIZES;

export function getTshirtSizesForGender(_gender?: string | null): readonly string[] {
  return JERSEY_SIZES;
}

export function getTrackPantSizesForGender(_gender?: string | null): readonly string[] {
  return TRACK_PANT_SIZES;
}

export function getTrackPantSizeInfo(
  val?: string,
  _gender?: string | null
): TrackPantSizeInfo | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  // Backward compatibility alias: XXL -> 2XL
  if (clean === "xxl") {
    return TRACK_PANT_SIZE_CHART.find((item) => item.size === "2XL");
  }
  return (
    TRACK_PANT_SIZE_CHART.find((item) => item.size.toLowerCase() === clean) ||
    TRACK_PANT_SIZE_CHART.find((item) => item.size.toLowerCase() === clean.replace(/[^a-z0-9]/g, "")) ||
    TRACK_PANT_SIZE_CHART.find((item) => clean.includes(item.size.toLowerCase())) ||
    TRACK_PANT_SIZE_CHART.find((item) => item.waist === clean || item.waist.includes(clean))
  );
}

export function getJerseySizeInfo(
  val?: string,
  _gender?: string | null
): JerseySizeInfo | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  return (
    JERSEY_SIZE_CHART.find((item) => item.size.toLowerCase() === clean) ||
    JERSEY_SIZE_CHART.find((item) => item.size.toLowerCase() === clean.replace(/[^a-z0-9]/g, "")) ||
    JERSEY_SIZE_CHART.find((item) => clean.includes(item.size.toLowerCase())) ||
    JERSEY_SIZE_CHART.find((item) => item.chest === clean)
  );
}

export const BOYS_OUTDOOR_SPORTS = [
  { emoji: "🏏", name: "CRICKET" },
  { emoji: "⚽", name: "FOOTBALL" },
  { emoji: "🏐", name: "VOLLEYBALL" },
  { emoji: "🥒", name: "PICKLEBALL" },
] as const;

export const GIRLS_OUTDOOR_SPORTS = [
  { emoji: "🏏", name: "CRICKET" },
  { emoji: "🏐", name: "THROWBALL" },
  { emoji: "🪢", name: "TUG OF WAR" },
  { emoji: "🏃‍♀️", name: "KHO KHO" },
  { emoji: "🥒", name: "PICKLEBALL" },
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
  { emoji: "🎯", name: "CARROM" },
] as const;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type Role = "sports" | "cultural" | "visitor" | "Daimond";
export const ROLE_META: Record<Role, { emoji: string; title: string; sub: string; passLabel: string }> = {
  sports: {
    emoji: "⚡",
    title: "Sports Team",
    sub: "Competing athlete in athletic & indoor ties",
    passLabel: "PLAYER",
  },
  cultural: {
    emoji: "🎭",
    title: "Cultural Team",
    sub: "Garba, music, drama & stage performances",
    passLabel: "CULTURAL",
  },
  visitor: {
    emoji: "🎟",
    title: "Visitor",
    sub: "Student supporter, spectator & resident pass",
    passLabel: "VISITOR",
  },
  Daimond: {
    emoji: "💎",
    title: "Dignitary & Official",
    sub: "Hostel Rector, Trustee, Hon Secretary & LMC Member",
    passLabel: "Daimond",
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
