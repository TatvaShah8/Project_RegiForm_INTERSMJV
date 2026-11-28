import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import {
  ALL_VALID_TRACK_PANT_SIZES,
  BLOOD_GROUPS,
  EDIT_REGISTRATION_OPEN,
  JERSEY_SIZES,
  RELATIONS,
  YEARS_OF_STUDY,
} from "@/lib/fest";
import { authError, authenticatedUser } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import {
  badInput,
  duplicateMessage,
  normalizePhone,
  validateSports,
  validationError,
} from "@/lib/registration-helpers";
import { readForm } from "@/lib/request-body";
import { imageStorage, imageUrls as resolveImageUrls } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const editSportsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  middleName: z.string().trim().max(80).default(""),
  surname: z.string().trim().min(1).max(80),
  mobile: z.string().max(20),
  bloodGroup: z.enum(BLOOD_GROUPS),
  dob: z.iso.datetime({ offset: true }).refine((value) => {
    const date = new Date(value);
    return date <= new Date() && date.getFullYear() >= new Date().getFullYear() - 120;
  }, "Enter a valid birth date"),
  homeTown: z.string().trim().min(1).max(200),
  college: z.string().trim().min(1).max(200),
  course: z.string().trim().min(1).max(200),
  year: z.enum(YEARS_OF_STUDY),
  emergency: z.string().max(20),
  relation: z.enum(RELATIONS),
  tshirt: z.enum(JERSEY_SIZES),
  waist: z.enum(ALL_VALID_TRACK_PANT_SIZES),
  outdoor: z.array(z.string()).max(5),
  indoor: z.array(z.string()).max(4),
});

export async function PATCH(request: Request) {
  if (!EDIT_REGISTRATION_OPEN) {
    return Response.json(
      { error: "Registration editing is currently closed." },
      { status: 403 }
    );
  }
  let user;
  try {
    user = await authenticatedUser(request);
  } catch (error) {
    return authError(error);
  }

  let newlyUploaded: string[] = [];
  try {
    if (Number(request.headers.get("content-length")) > 26 * 1024 * 1024) {
      return Response.json({ error: "Upload too large" }, { status: 413 });
    }

    const form = await readForm(request);
    const collection = await registrations();
    const record = await collection.findOne({ firebaseUid: user.uid });

    if (!record || record.registrationStatus !== "completed") {
      return Response.json({ error: "Completed registration not found" }, { status: 404 });
    }
    if (record.role !== "sports") {
      return Response.json(
        { error: "This edit form is only for Sports player registrations." },
        { status: 403 }
      );
    }

    const outdoorRaw = JSON.parse(String(form.get("outdoor") ?? "[]"));
    const indoorRaw = JSON.parse(String(form.get("indoor") ?? "[]"));
    if (
      !Array.isArray(outdoorRaw) ||
      !Array.isArray(indoorRaw) ||
      [...outdoorRaw, ...indoorRaw].some((s) => typeof s !== "string")
    ) {
      throw new Error("INVALID_SPORTS");
    }

    const parsed = editSportsSchema.parse({
      firstName: form.get("firstName"),
      middleName: form.get("middleName") ?? "",
      surname: form.get("surname"),
      mobile: form.get("mobile"),
      bloodGroup: form.get("bloodGroup"),
      dob: form.get("dob"),
      homeTown: form.get("homeTown"),
      college: form.get("college"),
      course: form.get("course"),
      year: form.get("year"),
      emergency: form.get("emergency"),
      relation: form.get("relation"),
      tshirt: form.get("tshirt"),
      waist: form.get("waist"),
      outdoor: outdoorRaw,
      indoor: indoorRaw,
    });

    const phone = normalizePhone(parsed.mobile);
    const emergency = normalizePhone(parsed.emergency);
    const dob = new Date(parsed.dob);

    validateSports(parsed.outdoor, parsed.indoor, record.gender, "sports");

    const count = parsed.outdoor.length + parsed.indoor.length;
    const bhavnagar = record.branch === "bhavnagar";
    const isFemale = record.gender === "FEMALE";
    if (
      count < 1 ||
      (!bhavnagar && (count > 3 || (!isFemale && (parsed.outdoor.length > 2 || parsed.indoor.length > 2))))
    ) {
      throw new Error("INVALID_SPORTS_QUOTA");
    }

    const maybeImage = form.get("image");
    let photoChanged = false;
    let imagePaths = Array.isArray(record.imagePaths) ? record.imagePaths : [];
    let imageUrls = Array.isArray(record.imageUrls) ? record.imageUrls : [];
    const oldImagePaths = [...imagePaths];

    if (maybeImage instanceof File && maybeImage.size > 0) {
      if (!ALLOWED_IMAGE_TYPES[maybeImage.type] || maybeImage.size > 5 * 1024 * 1024) {
        throw new Error("INVALID_IMAGES");
      }

      const nameSlug =
        [parsed.firstName, parsed.middleName, parsed.surname]
          .filter((n) => typeof n === "string" && n.trim().length > 0)
          .join(" ")
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 100)
          .replace(/-+$/g, "") || "participant";

      const path = `registrations/${nameSlug}-${randomUUID()}.jpg`;
      let bytes: Buffer;
      try {
        const input = Buffer.from(await maybeImage.arrayBuffer());
        const metadata = await sharp(input, { limitInputPixels: 25000000 }).metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
          throw new Error("INVALID_IMAGES");
        }
        bytes = await sharp(input, { limitInputPixels: 25000000 })
          .rotate()
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch {
        throw new Error("INVALID_IMAGES");
      }

      const { storage } = imageStorage();
      const { error } = await storage.upload(path, bytes, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (error) throw error;
      newlyUploaded.push(path);

      imagePaths = [path];
      imageUrls = await resolveImageUrls(imagePaths);
      photoChanged = true;
    }

    const nameChanged =
      parsed.firstName !== String(record.firstName ?? "") ||
      parsed.middleName !== String(record.middleName ?? "") ||
      parsed.surname !== String(record.surname ?? "");

    const isVerified = nameChanged || photoChanged ? false : Boolean(record.isVerified);

    const updateFields: Record<string, unknown> = {
      firstName: parsed.firstName,
      middleName: parsed.middleName,
      surname: parsed.surname,
      phone,
      bloodGroup: parsed.bloodGroup,
      dob,
      homeTown: parsed.homeTown,
      college: parsed.college,
      course: parsed.course,
      year: parsed.year,
      emergency,
      relation: parsed.relation,
      tshirt: parsed.tshirt,
      waist: parsed.waist,
      outdoor: parsed.outdoor,
      indoor: parsed.indoor,
      outdoorSports: parsed.outdoor.join(", ") || "None",
      indoorSports: parsed.indoor.join(", ") || "None",
      imagePaths,
      imageUrls,
      isVerified,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { firebaseUid: user.uid, registrationStatus: "completed", role: "sports" },
      { $set: updateFields }
    );

    if (!result.matchedCount) {
      throw new Error("REGISTRATION_NOT_FOUND");
    }

    newlyUploaded = [];

    if (photoChanged && oldImagePaths.length > 0) {
      try {
        await imageStorage().storage.remove(oldImagePaths);
      } catch {
        // Best-effort cleanup of replaced portrait
      }
    }

    return Response.json({
      success: true,
      reverificationRequired: Boolean(record.isVerified) && (nameChanged || photoChanged),
    });
  } catch (error) {
    if (newlyUploaded.length > 0) {
      try {
        await imageStorage().storage.remove(newlyUploaded);
      } catch {}
    }
    const duplicate = duplicateMessage(error);
    if (duplicate) return Response.json({ error: duplicate }, { status: 409 });
    if (validationError(error)) return badInput(error);
    console.error("Edit sports registration failed");
    return Response.json(
      { error: "Unable to update your registration. Please try again." },
      { status: 500 }
    );
  }
}
