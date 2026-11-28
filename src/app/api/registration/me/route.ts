import { authenticatedUser, authError, isFirebaseUserVerified } from "@/lib/firebase-admin";
import { diamondRegistrations, registrations } from "@/lib/mongodb";
import { registrationProfile } from "@/lib/registration-profile";
export const runtime = "nodejs";
export async function GET(request: Request) {
  let user;
  try { user = await authenticatedUser(request, false); } catch (error) { return authError(error); }
  try {
    const record =
      (await (await registrations()).findOne({ firebaseUid: user.uid })) ??
      (await (await diamondRegistrations()).findOne({ firebaseUid: user.uid }));
    return Response.json({ account: record ? { ...await registrationProfile(record), emailVerified: isFirebaseUserVerified(user) } : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Profile load failed");
    const msg = "Could not load your registration. Please try again.";
    return Response.json({ error: msg }, { status: 503 });
  }
}
