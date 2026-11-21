import { authenticatedUser, authError } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import { registrationProfile } from "@/lib/registration-profile";
export const runtime = "nodejs";
export async function GET(request: Request) {
  let user;
  try { user = await authenticatedUser(request, false); } catch (error) { return authError(error); }
  try {
    const record = await (await registrations()).findOne({ firebaseUid: user.uid });
    return Response.json({ account: record ? { ...await registrationProfile(record), emailVerified: user.emailVerified } : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Profile load failed", error);
    const msg = error instanceof Error ? error.message : "Could not load your saved registration";
    return Response.json({ error: msg }, { status: 503 });
  }
}
