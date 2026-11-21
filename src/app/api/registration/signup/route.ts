import { signupSchema, validationError } from "@/lib/registration-helpers";
import { authenticatedUser, authError } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import { normalizeGender, normalizePhone, duplicateMessage, badInput } from "@/lib/registration-helpers";

export const runtime = "nodejs";
export async function POST(request: Request) {
  let user;
  try { user = await authenticatedUser(request, false); }
  catch (error) { return authError(error); }
  try {
    const body = signupSchema.parse(await request.json());
    const email = user.email!.trim().toLowerCase();
    const firstName = String(body.firstName ?? "").trim();
    const middleName = String(body.middleName ?? "").trim();
    const surname = String(body.surname ?? "").trim();
    const grnumber = String(body.grNo ?? "").trim().toUpperCase();
    const phone = normalizePhone(body.mobile);
    const gender = normalizeGender(body.gender);
    if (!firstName || !surname || !grnumber || grnumber.length > 64 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("INVALID_SIGNUP_FIELDS");
    const collection = await registrations();
    const existing = await collection.findOne({ firebaseUid: user.uid });
    if (existing?.registrationStatus === "completed") return Response.json({ success: true, alreadyExists: true });
    if (existing) {
      await collection.updateOne({ firebaseUid: user.uid, registrationStatus: { $ne: "completed" } }, {
        $set: { email, phone, grnumber, gender, firstName, middleName, surname, updatedAt: new Date() },
      });
      return Response.json({ success: true, alreadyExists: true });
    }
    await collection.insertOne({
      firebaseUid: user.uid, email, phone, grnumber, gender,
      firstName, middleName, surname,
      registrationStatus: "pending_verification", createdAt: new Date(), updatedAt: new Date(),
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    const duplicate = duplicateMessage(error);
    if (duplicate) return Response.json({ error: duplicate }, { status: 409 });
    if (validationError(error)) return badInput(error);
    console.error("Signup failed", error);
    const msg = error instanceof Error ? error.message : "Registration temporarily unavailable";
    return Response.json({ error: msg }, { status: 500 });
  }
}
