import "server-only";
import type { Document } from "mongodb";
import { imageUrls } from "./supabase";
import { BRANCHES } from "./fest";
export async function registrationProfile(record: Document) {
  const urls = await imageUrls(record.imagePaths ?? []);
  const profile: Record<string, unknown> = {};
  for (const field of ["firstName", "middleName", "surname", "email", "gender", "bloodGroup", "dob", "homeTown", "college", "course", "year", "emergency", "relation", "role", "designation", "companyName", "position", "industry", "allowMentorshipShare", "tshirt", "waist", "outdoor", "indoor", "agreement", "passNo", "isVerified"]) {
    if (record[field] !== undefined) profile[field] = record[field];
  }
  const branchVal =
    BRANCHES.find(b => b.toLowerCase() === String(record.branch ?? "").toLowerCase()) ??
    (record.role === "Daimond" && typeof record.branch === "string" ? record.branch : "");
  return { ...profile, alsoParticipatesInCultural: record.role === "sports" && record.alsoParticipatesInCultural === true, grNo: record.grnumber ?? "", mobile: String(record.phone ?? "").replace(/^\+91/, ""),
    branch: branchVal,
    jerseyNumber: record.jerseyNumber === undefined ? "" : String(record.jerseyNumber),
    photo: urls[0] ?? null, completed: record.registrationStatus === "completed" };
}
