import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { readForm } from "@/lib/request-body";
import { authenticatedUser, authError } from "@/lib/firebase-admin";
import { diamondRegistrations } from "@/lib/mongodb";
import { imageStorage, imageUrls as resolveImageUrls } from "@/lib/supabase";
import {
  BOYS_BRANCHES,
  GIRLS_BRANCHES,
  JERSEY_SIZES,
  TRACK_PANT_SIZES,
} from "@/lib/fest";
import {
  badInput,
  duplicateMessage,
  normalizeGender,
  normalizePhone,
  validationError,
} from "@/lib/registration-helpers";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const DESIGNATIONS = [
  "Hostel Rector",
  "Trustee",
  "Hon Secretary",
  "LMC Member",
] as const;

const diamondSchema = z
  .object({
    designation: z.enum(DESIGNATIONS),
    firstName: z.string().trim().min(1, "First name is required").max(80),
    middleName: z.string().trim().min(1, "Middle name is required").max(80),
    surname: z.string().trim().min(1, "Surname is required").max(80),
    gender: z.enum(["MALE", "FEMALE"]),
    mobile: z.string().trim().min(10).max(20),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid date of birth is required"),
    branch: z.string().trim().min(1, "Branch / Hostel is required").max(80),
    tshirt: z.enum(JERSEY_SIZES),
    waist: z.enum(TRACK_PANT_SIZES),
    companyName: z.string().trim().max(160).optional().default(""),
    position: z.string().trim().max(160).optional().default(""),
    industry: z.string().trim().max(160).optional().default(""),
    allowMentorshipShare: z.literal("true"),
    agreeTerms: z.literal("true"),
  })
  .superRefine((data, ctx) => {
    const baseBranches =
      data.gender === "FEMALE"
        ? [...GIRLS_BRANCHES, "Bombay HO"]
        : [...BOYS_BRANCHES, "Bombay HO"];
    const validBranches =
      data.designation === "Trustee" ||
      data.designation === "Hon Secretary" ||
      data.designation === "LMC Member"
        ? [...baseBranches, "All / Central Committee"]
        : baseBranches;

    if (!validBranches.includes(data.branch)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["branch"],
        message: "Invalid SMJV branch / hostel for selected gender and role",
      });
    }

    if (data.designation === "Trustee") {
      if (!data.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyName"],
          message: "Company / Organization name is required for Trustees",
        });
      }
      if (!data.position) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["position"],
          message: "Position / Designation is required for Trustees",
        });
      }
      if (!data.industry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["industry"],
          message: "Industry / Sector is required for Trustees",
        });
      }
    }
  });

export async function POST(request: Request) {
  let user;
  try {
    user = await authenticatedUser(request);
  } catch (error) {
    return authError(error);
  }

  let uploaded: string[] = [];
  const { storage } = imageStorage();

  try {
    if (Number(request.headers.get("content-length")) > 10 * 1024 * 1024) {
      return Response.json({ error: "Upload too large" }, { status: 413 });
    }

    const form = await readForm(request);
    const parsed = diamondSchema.parse({
      designation: form.get("designation"),
      firstName: form.get("firstName"),
      middleName: form.get("middleName"),
      surname: form.get("surname"),
      gender: normalizeGender(String(form.get("gender") ?? "")),
      mobile: form.get("mobile"),
      dob: form.get("dob"),
      branch: form.get("branch"),
      tshirt: form.get("tshirt"),
      waist: form.get("waist"),
      companyName: form.get("companyName") ?? "",
      position: form.get("position") ?? "",
      industry: form.get("industry") ?? "",
      allowMentorshipShare: form.get("allowMentorshipShare"),
      agreeTerms: form.get("agreeTerms"),
    });

    const email = (user.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Authenticated email is invalid." }, { status: 400 });
    }
    const phone = normalizePhone(parsed.mobile);

    const dobDate = new Date(`${parsed.dob}T00:00:00.000Z`);
    if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) {
      return Response.json({ error: "Please enter a valid date of birth." }, { status: 400 });
    }

    const collection = await diamondRegistrations();
    const existing = await collection.findOne({ firebaseUid: user.uid });
    if (existing?.registrationStatus === "completed") {
      const existingUrls = await resolveImageUrls(existing.imagePaths ?? []);
      return Response.json({
        success: true,
        alreadyExists: true,
        passNo: existing.passNo,
        photo: existingUrls[0] ?? null,
      });
    }

    const photos = form.getAll("images");
    if (
      photos.length !== 1 ||
      photos.some(
        (p) =>
          !(p instanceof File) ||
          !ALLOWED_TYPES[p.type] ||
          p.size > 5 * 1024 * 1024 ||
          p.size === 0
      )
    ) {
      throw new Error("INVALID_IMAGES");
    }

    const nameSlug =
      [parsed.firstName, parsed.middleName, parsed.surname]
        .filter(Boolean)
        .join(" ")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100)
        .replace(/-+$/g, "") || "official";

    const file = photos[0] as File;
    const path = `diamond/${nameSlug}-${randomUUID()}.jpg`;
    let bytes: Buffer;
    try {
      const input = Buffer.from(await file.arrayBuffer());
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

    const { error: uploadError } = await storage.upload(path, bytes, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (uploadError) throw uploadError;
    uploaded.push(path);

    const imageUrls = await resolveImageUrls(uploaded);
    const now = new Date();
    const docFields = {
      firebaseUid: user.uid,
      email,
      phone,
      firstName: parsed.firstName,
      middleName: parsed.middleName,
      surname: parsed.surname,
      gender: parsed.gender,
      dob: parsed.dob,
      branch: parsed.branch,
      tshirt: parsed.tshirt,
      waist: parsed.waist,
      role: "Daimond",
      designation: parsed.designation,
      companyName: parsed.companyName,
      position: parsed.position,
      industry: parsed.industry,
      allowMentorshipShare: true,
      agreeTerms: true,
      agreement: true,
      imagePaths: uploaded,
      imageUrls,
      registrationStatus: "completed",
      isVerified: true,
      completedAt: now,
      updatedAt: now,
    };

    let passNo = "";
    if (existing) {
      passNo = existing.passNo || `#${existing._id.toString()}`;
      await collection.updateOne(
        { _id: existing._id },
        { $set: { ...docFields, passNo } }
      );
    } else {
      const inserted = await collection.insertOne({
        ...docFields,
        createdAt: now,
      });
      passNo = `#${inserted.insertedId.toString()}`;
      await collection.updateOne(
        { _id: inserted.insertedId },
        { $set: { passNo } }
      );
    }

    uploaded = [];
    return Response.json(
      {
        success: true,
        passNo,
        photo: imageUrls[0] ?? null,
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    if (uploaded.length) {
      await storage.remove(uploaded).catch(() => {});
    }
    const duplicate = duplicateMessage(error);
    if (duplicate) return Response.json({ error: duplicate }, { status: 409 });
    if (validationError(error)) return badInput(error);
    if (error instanceof Error && error.message === "INVALID_IMAGES") {
      return Response.json({ error: "Please upload a valid JPG, PNG, or WebP photo (max 5 MB)." }, { status: 400 });
    }
    console.error("Diamond registration failed", error);
    return Response.json(
      { error: "Registration could not be completed. Please try again." },
      { status: 500 }
    );
  }
}
