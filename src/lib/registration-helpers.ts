import { BodyTooLargeError } from "./request-body";
import { z } from "zod";
import { BLOOD_GROUPS, YEARS_OF_STUDY, RELATIONS, JERSEY_SIZES, TRACK_PANT_SIZES, ALL_VALID_TRACK_PANT_SIZES, getOutdoorSportsForGender, INDOOR_SPORTS } from "./fest";
import { MongoServerError } from "mongodb";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const boysBranches = ["Vadodara", "Ahmedabad", "Andheri, Mumbai", "Sandhurst Road, Mumbai", "Pune", "Vallabh Vidyanagar", "Bhavnagar"];
export const girlsBranches = ["Vadodara", "Ahmedabad", "Vallabh Vidyanagar", "Pune", "Surat"];
export function normalizeGender(input: unknown) {
  const value = String(input ?? "").trim().toUpperCase();
  if (value !== "MALE" && value !== "FEMALE") throw new Error("INVALID_GENDER");
  return value;
}
export function normalizeBranch(input: unknown, gender: string) {
  const list = gender === "MALE" ? boysBranches : girlsBranches;
  const match = list.find(v => v.toLowerCase() === String(input ?? "").trim().toLowerCase());
  if (!match) throw new Error("INVALID_BRANCH");
  return match.toLowerCase();
}
export function normalizePhone(input: unknown) {
  const parsed = parsePhoneNumberFromString(String(input ?? ""), "IN");
  if (!parsed?.isValid()) throw new Error("INVALID_PHONE");
  return parsed.number;
}
export function normalizeJersey(input: unknown) {
  const value = String(input ?? "").trim();
  if (!/^\d{1,3}$/.test(value)) throw new Error("INVALID_JERSEY");
  return Number(value); // Current frontend allows 0 through 999
}
export function duplicateMessage(error: unknown) {
  if (!(error instanceof MongoServerError) || error.code !== 11000) return null;
  const keys = error.keyPattern ?? {};
  if (keys.email) return "Email already registered";
  if (keys.phone) return "Phone already registered";
  if (keys.grnumber) return "GR number already registered";
  if (keys.firebaseUid) return "Firebase account already registered";
  if (keys.jerseyNumber) return "Jersey number already taken in this branch and gender";
  return "Duplicate registration";
}
export function badInput(error: unknown) {
  if (error instanceof BodyTooLargeError) return Response.json({ error: "Request too large" }, { status: 413 });
  const message = error instanceof z.ZodError ? error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") : error instanceof SyntaxError ? "Invalid request body" : error instanceof Error ? error.message : "INVALID_DATA";
  return Response.json({ error: message.replaceAll("_", " ") }, { status: 400 });
}

const text = z.string().trim().min(1).max(200);
export const signupSchema = z.object({
  firstName: text.max(80), middleName: z.string().trim().max(80).default(""), surname: text.max(80),
  grNo: z.string().trim().min(1).max(64).regex(/^[a-zA-Z0-9/-]+$/),
  mobile: z.string().max(20), gender: z.enum(["MALE", "FEMALE"]),
});
export const generalSchema = z.object({
  branch: text, bloodGroup: z.enum(BLOOD_GROUPS),
  dob: z.iso.datetime({ offset: true }).refine(value => {
    const date = new Date(value);
    return date <= new Date() && date.getFullYear() >= new Date().getFullYear() - 120;
  }, "Enter a valid birth date"),
  homeTown: text, college: text, course: text,
  year: z.enum(YEARS_OF_STUDY), emergency: z.string().max(20), relation: z.enum(RELATIONS),
});
export const kitSchema = z.object({
  role: z.enum(["sports", "cultural"]), tshirt: z.enum(JERSEY_SIZES), waist: z.enum(ALL_VALID_TRACK_PANT_SIZES),
  alsoParticipatesInCultural: z.enum(["true", "false"]).default("false"),
  agreement: z.literal("true"), outdoor: z.array(z.string()).max(5), indoor: z.array(z.string()).max(4),
});
export function validateSports(outdoor: string[], indoor: string[], gender: string, role: string) {
  const allowedOutdoor: readonly string[] = getOutdoorSportsForGender(gender).map(s => s.name);
  const allowedIndoor: readonly string[] = INDOOR_SPORTS.map(s => s.name);
  if (new Set([...outdoor, ...indoor]).size !== outdoor.length + indoor.length ||
      outdoor.some(s => !allowedOutdoor.includes(s)) || indoor.some(s => !allowedIndoor.includes(s)) ||
      (role === "cultural" && outdoor.length + indoor.length > 0)) throw new Error("INVALID_SPORTS");
}
export function validationError(error: unknown) {
  return error instanceof z.ZodError || error instanceof SyntaxError ||
    (error instanceof Error && error.message.startsWith("INVALID_"));
}
