import { authenticatedAdmin, authError } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import { registrationProfile } from "@/lib/registration-profile";
import { z } from "zod";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { await authenticatedAdmin(request); } catch (error) { return authError(error); }
  try {
    const records = await (await registrations()).find({ registrationStatus: "completed" }).toArray();
    return Response.json({ accounts: await Promise.all(records.map(registrationProfile)) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Could not load registrations" }, { status: 503 }); }
}
export async function PATCH(request: Request) {
  let user;
  try { user = await authenticatedAdmin(request); } catch (error) { return authError(error); }
  try {
    const body = z.object({ identifier: z.string().trim().min(1).max(254), isVerified: z.boolean() }).parse(await request.json());
    const result = await (await registrations()).updateOne({ registrationStatus: "completed", $or: [{ grnumber: body.identifier.toUpperCase() }, { email: body.identifier.toLowerCase() }] }, {
      $set: { isVerified: body.isVerified, verifiedBy: user.uid, updatedAt: new Date() },
    });
    if (!result.matchedCount) return Response.json({ error: "Student not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Could not update verification" }, { status: error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 503 });
  }
}
