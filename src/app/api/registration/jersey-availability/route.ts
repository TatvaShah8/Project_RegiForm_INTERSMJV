import { authenticatedUser, authError } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import { normalizeJersey, badInput, validationError } from "@/lib/registration-helpers";
export const runtime = "nodejs";
export async function GET(request: Request) {
  let user;
  try { user = await authenticatedUser(request); }
  catch (error) { return authError(error); }
  try {
    const collection = await registrations();
    const own = await collection.findOne({ firebaseUid: user.uid });
    if (!own?.branch || !own.gender) return Response.json({ error: "Select branch first" }, { status: 409 });
    const jerseyNumber = normalizeJersey(new URL(request.url).searchParams.get("jerseyNumber"));
    const taken = await collection.findOne({
      branch: own.branch, gender: own.gender, jerseyNumber,
      firebaseUid: { $ne: user.uid },
    }, { projection: { _id: 1 } });
    return Response.json({ available: !taken, jerseyNumber });
  } catch (error) {
    if (validationError(error)) return badInput(error);
    return Response.json({ error: "Unable to check jersey availability" }, { status: 503 });
  }
}
