import sharp from "sharp";
import { kitSchema, validateSports, validationError } from "@/lib/registration-helpers";
import { randomUUID } from "node:crypto";
import { authenticatedUser, authError } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import { imageStorage, imageUrls as resolveImageUrls } from "@/lib/supabase";
import { normalizeBranch, normalizeJersey, duplicateMessage, badInput } from "@/lib/registration-helpers";
export const runtime = "nodejs";
const types: Record<string,string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export async function POST(request: Request) {
  let user;
  try { user = await authenticatedUser(request); }
  catch (error) { return authError(error); }
  let uploaded: string[] = [];
  try {
    if (Number(request.headers.get("content-length")) > 26 * 1024 * 1024) return Response.json({ error: "Upload too large" }, { status: 413 });
    const form = await request.formData();
    const collection = await registrations();
    const record = await collection.findOne({ firebaseUid: user.uid });
    if (!record?.branch || !record.gender || !record.bloodGroup) return Response.json({ error: "Complete general details first" }, { status: 409 });
    if (record.registrationStatus === "completed") return Response.json({ success: true });
    normalizeBranch(record.branch, record.gender);
    const role = String(form.get("role") ?? "");
    if (role !== "sports" && role !== "cultural") throw new Error("INVALID_ROLE");
    const jerseyNumber = role === "sports" ? normalizeJersey(form.get("jerseyNumber")) : undefined;
    const tshirt = String(form.get("tshirt") ?? "");
    const waist = String(form.get("waist") ?? "");
    if (!tshirt || !waist || form.get("agreement") !== "true") throw new Error("INVALID_KIT_OR_AGREEMENT");
    const outdoor = JSON.parse(String(form.get("outdoor") ?? "[]"));
    const indoor = JSON.parse(String(form.get("indoor") ?? "[]"));
    if (!Array.isArray(outdoor) || !Array.isArray(indoor) || [...outdoor, ...indoor].some(s => typeof s !== "string")) throw new Error("INVALID_SPORTS");
    kitSchema.parse({ role, tshirt, waist, agreement: form.get("agreement"), outdoor, indoor });
    validateSports(outdoor, indoor, record.gender, role);
    if (role === "sports") {
      const count = outdoor.length + indoor.length;
      const bhavnagar = record.branch === "bhavnagar";
      const isFemale = record.gender === "FEMALE";
      if (
        count < 1 ||
        (!bhavnagar && (count > 3 || (!isFemale && (outdoor.length > 2 || indoor.length > 2))))
      ) {
        throw new Error("INVALID_SPORTS_QUOTA");
      }
      const taken = await collection.findOne({ branch: record.branch, gender: record.gender, jerseyNumber, firebaseUid: { $ne: user.uid } });
      if (taken) return Response.json({ error: "Jersey number already taken in your branch and gender" }, { status: 409 });
    }
    const photos = form.getAll("images");
    if (photos.length < 1 || photos.length > 5 || photos.some(p => !(p instanceof File) || !types[p.type] || p.size > 5*1024*1024 || p.size === 0)) throw new Error("INVALID_IMAGES");
    const { storage } = imageStorage();
    for (const p of photos) {
      const file = p as File;
      const path = `${user.uid}/${randomUUID()}.jpg`;
      let bytes: Buffer;
      try {
        const input = Buffer.from(await file.arrayBuffer());
        const metadata = await sharp(input, { limitInputPixels: 25000000 }).metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) throw new Error("INVALID_IMAGES");
        bytes = await sharp(input, { limitInputPixels: 25000000 }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
      } catch { throw new Error("INVALID_IMAGES"); }
      const { error } = await storage.upload(path, bytes, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      uploaded.push(path);

    }
    const imageUrls = await resolveImageUrls(uploaded);
    const fields: Record<string, unknown> = { role, tshirt, waist, outdoor, indoor, agreement: true, passNo: `#${record._id.toString()}`, imagePaths: uploaded, imageUrls, registrationStatus: "completed", completedAt: new Date(), updatedAt: new Date() };
    if (jerseyNumber !== undefined) fields.jerseyNumber = jerseyNumber;
    const update = await collection.updateOne({ firebaseUid: user.uid, registrationStatus: { $ne: "completed" }, updatedAt: record.updatedAt }, { $set: fields });
    if (!update.matchedCount) throw new Error("REGISTRATION_CHANGED");
    uploaded = []; // registered images now belong to the saved record
    return Response.json({ success: true });
  } catch (error) {
    if (uploaded.length) {
      try {
        // A network error may occur after MongoDB committed. Never remove referenced images.
        const saved = await (await registrations()).findOne({ firebaseUid: user.uid, imagePaths: { $in: uploaded } });
        if (saved) return Response.json({ success: true });
        const { error: removalError } = await imageStorage().storage.remove(uploaded);
        if (removalError) console.error("Supabase cleanup failed:", uploaded);
      } catch { console.error("Supabase cleanup requires retry:", uploaded); }
    }
    const duplicate = duplicateMessage(error);
    if (duplicate) return Response.json({ error: duplicate }, { status: 409 });
    if (validationError(error)) return badInput(error);
    console.error("Finish registration failed", error);
    const msg = error instanceof Error ? error.message : "Could not finalize registration";
    return Response.json({ error: msg }, { status: 500 });
  }
}
