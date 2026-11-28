import { readJson } from "@/lib/request-body";
import { generalSchema, validationError } from "@/lib/registration-helpers";
import { authenticatedUser, authError } from "@/lib/firebase-admin";
import { REGISTRATION_OPEN } from "@/lib/fest";
import { registrations } from "@/lib/mongodb";
import { normalizeBranch, normalizePhone, badInput } from "@/lib/registration-helpers";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  if (!REGISTRATION_OPEN) {
    return Response.json({ error: "Registrations are currently closed." }, { status: 403 });
  }
  let user;
  try { user = await authenticatedUser(request); }
  catch (error) { return authError(error); }
  try {
    const body = generalSchema.parse(await readJson(request));
    const collection = await registrations();
    const record = await collection.findOne({ firebaseUid: user.uid });
    if (!record) return Response.json({ error: "Finish signup first" }, { status: 404 });
    if (record.registrationStatus === "completed") return Response.json({ error: "Registration is finalized" }, { status: 409 });
    const branch = normalizeBranch(body.branch, record.gender);
    if (record.jerseyNumber !== undefined && record.branch !== branch) return Response.json({ error: "Branch is locked after jersey assignment" }, { status: 409 });
    const bloodGroup = String(body.bloodGroup ?? "");
    if (!["A+","A-","B+","B-","AB+","AB-","O+","O-"].includes(bloodGroup)) throw new Error("INVALID_BLOOD_GROUP");
    const dob = new Date(String(body.dob ?? ""));
    if (Number.isNaN(dob.getTime()) || dob > new Date()) throw new Error("INVALID_DOB");
    const homeTown = String(body.homeTown ?? "").trim();
    const college = String(body.college ?? "").trim();
    const course = String(body.course ?? "").trim();
    const year = String(body.year ?? "").trim();
    const emergency = normalizePhone(body.emergency);
    const relation = String(body.relation ?? "").trim();
    if (!homeTown || !college || !course || !year || !emergency || !relation) throw new Error("INVALID_GENERAL_FIELDS");
    const update = await collection.updateOne({ firebaseUid: user.uid, registrationStatus: { $ne: "completed" }, updatedAt: record.updatedAt }, {
      $set: { branch, bloodGroup, dob, homeTown, college, course, year, emergency, relation, updatedAt: new Date(), registrationStatus: "incomplete" },
    });
    if (!update.matchedCount) return Response.json({ error: "Registration changed. Reload your profile." }, { status: 409 });
    return Response.json({ success: true });
  } catch (error) {
    if (validationError(error)) return badInput(error);
    console.error("General update failed");
    const msg = "Unable to save your information. Please try again.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
