/**
 * SMJV YOUTH FESTIVAL 2026 — Student Accreditation QR Scanner & Networking
 * Handles QR parsing, student profile extraction, vCard export,
 * and local storage of scanned student connections.
 * 
 * Privacy Policy:
 * GR Number, Pass ID, and Blood Group are strictly PRIVATE tournament data
 * and are NOT shared or exported via the QR code.
 */

import { getSavedAccounts } from "./auth-storage";

export interface ScannedStudent {
  id: string;
  firstName: string;
  middleName?: string;
  surname: string;
  photo?: string | null;
  mobile: string;
  homeTown: string;
  branch: string;
  course: string;
  college: string;
  year?: string;
  scannedAt: string;
}

export const SAMPLE_STUDENTS: ScannedStudent[] = [
  {
    id: "sample-1",
    firstName: "Aarav",
    middleName: "Rajeshbhai",
    surname: "Mehta",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    mobile: "9825040142",
    homeTown: "Vadodara",
    branch: "Vadodara",
    course: "B.Tech Computer Science",
    college: "Faculty of Technology & Engineering, MSU",
    year: "3rd Year",
    scannedAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    firstName: "Priya",
    middleName: "Kirtikumar",
    surname: "Shah",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces",
    mobile: "9879123456",
    homeTown: "Ahmedabad",
    branch: "Ahmedabad",
    course: "B.Tech Electronics & Communication",
    college: "Institute of Technology, Nirma University",
    year: "4th Year",
    scannedAt: new Date().toISOString(),
  },
  {
    id: "sample-3",
    firstName: "Dhruvil",
    middleName: "Pravinbhai",
    surname: "Patel",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    mobile: "9426098765",
    homeTown: "Surat",
    branch: "Pune",
    course: "B.Tech Mechanical Engineering",
    college: "College of Engineering, Pune (COEP)",
    year: "2nd Year",
    scannedAt: new Date().toISOString(),
  },
  {
    id: "sample-4",
    firstName: "Sneha",
    middleName: "Mukeshbhai",
    surname: "Jain",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    mobile: "9724567890",
    homeTown: "Bhavnagar",
    branch: "Vallabh Vidyanagar",
    course: "B.Arch Architecture",
    college: "Birla Vishvakarma Mahavidyalaya (BVM)",
    year: "3rd Year",
    scannedAt: new Date().toISOString(),
  },
];

const SCANNED_STORAGE_KEY = "smjv_scanned_friends";

export function getScannedConnections(): ScannedStudent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCANNED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScannedConnection(student: ScannedStudent): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getScannedConnections();
    const existingIndex = list.findIndex(
      (s) =>
        (s.mobile && s.mobile === student.mobile) ||
        (s.firstName.toLowerCase() === student.firstName.toLowerCase() &&
          s.surname.toLowerCase() === student.surname.toLowerCase() &&
          s.branch.toLowerCase() === student.branch.toLowerCase())
    );

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...student };
    } else {
      list.unshift(student);
    }

    window.localStorage.setItem(SCANNED_STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function removeScannedConnection(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getScannedConnections().filter((s) => s.id !== id);
    window.localStorage.setItem(SCANNED_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Generate a dynamic fallback SVG avatar based on the student's name
 */
export function generateAvatarSvg(name: string, surname: string): string {
  const initials = `${name?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase() || "SM";
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F59E0B"/><stop offset="100%" stop-color="%23EA580C"/></linearGradient></defs><rect width="160" height="160" rx="80" fill="url(%23bg)"/><text x="80" y="98" font-family="sans-serif" font-weight="900" font-size="56" fill="%230A0E2A" text-anchor="middle" letter-spacing="2">${initials}</text></svg>`;
}

/**
 * Parse QR raw decoded string into a structured ScannedStudent object.
 * Strictly ignores any GR, pass ID, or blood group data.
 */
export function parseScannedQr(rawText: string): ScannedStudent | null {
  if (!rawText || typeof rawText !== "string") return null;

  try {
    const data = JSON.parse(rawText.trim());

    // Resolve student identity fields
    let fn = data.fn || "";
    let mn = data.mn || "";
    let sn = data.sn || "";

    if (!fn && data.name) {
      const parts = data.name.trim().split(/\s+/);
      if (parts.length === 1) {
        fn = parts[0];
      } else if (parts.length === 2) {
        fn = parts[0];
        sn = parts[1];
      } else if (parts.length >= 3) {
        fn = parts[0];
        mn = parts.slice(1, -1).join(" ");
        sn = parts[parts.length - 1];
      }
    }

    const mobile = data.mob || data.mobile || "";
    const homeTown = data.ht || data.homeTown || data.city || "";
    const branch = data.br || data.branch || "SMJV";
    const course = data.co || data.course || "";
    const college = data.cl || data.college || "";
    const year = data.yr || data.year || "";

    // Lookup local database or sample accounts to find high-res photo if available
    let photo = data.photo || null;
    if (!photo) {
      const savedAccounts = getSavedAccounts();
      const match = savedAccounts.find(
        (a) =>
          (mobile && a.mobile === mobile) ||
          (a.firstName?.toLowerCase() === fn.toLowerCase() && a.surname?.toLowerCase() === sn.toLowerCase())
      );
      if (match?.photo) {
        photo = match.photo;
      } else {
        const sampleMatch = SAMPLE_STUDENTS.find(
          (s) =>
            s.mobile === mobile ||
            (s.firstName.toLowerCase() === fn.toLowerCase() && s.surname.toLowerCase() === sn.toLowerCase())
        );
        photo = sampleMatch?.photo || generateAvatarSvg(fn, sn);
      }
    }

    const student: ScannedStudent = {
      id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      firstName: fn || "SMJV",
      middleName: mn,
      surname: sn || "Student",
      photo,
      mobile: mobile || "—",
      homeTown: homeTown || "—",
      branch: branch || "SMJV",
      course: course || "—",
      college: college || "—",
      year: year || "",
      scannedAt: new Date().toISOString(),
    };

    return student;
  } catch {
    // If not JSON, check against sample mobile numbers or names
    const clean = rawText.trim();
    if (clean.length > 2) {
      const match = SAMPLE_STUDENTS.find(
        (s) =>
          s.mobile === clean ||
          `${s.firstName} ${s.surname}`.toLowerCase() === clean.toLowerCase()
      );
      if (match) return { ...match, id: `scan-${Date.now()}` };
    }
    return null;
  }
}

/**
 * Generate a clean .vcf vCard file string for instant saving into phone contacts.
 * Only includes contact and networking info (NO GR, NO pass ID, NO blood group).
 */
export function generateVCard(student: ScannedStudent): string {
  const name = [student.firstName, student.middleName, student.surname].filter(Boolean).join(" ");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `N:${student.surname};${student.firstName};${student.middleName || ""};;`,
    `TEL;TYPE=CELL,VOICE:${student.mobile}`,
    `ORG:SMJV ${student.branch};${student.college}`,
    `TITLE:${student.course}${student.year ? ` (${student.year})` : ""}`,
    `NOTE:SMJV Student. Hometown: ${student.homeTown}. Branch: ${student.branch}.`,
    "END:VCARD",
  ].join("\r\n");
}

/**
 * Trigger immediate browser download of the contact vCard
 */
export function downloadVCard(student: ScannedStudent) {
  const vcardText = generateVCard(student);
  const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${student.firstName}_${student.surname}_SMJV.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
