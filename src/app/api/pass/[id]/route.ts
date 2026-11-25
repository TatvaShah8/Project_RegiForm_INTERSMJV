import { ObjectId } from "mongodb";
import { authenticatedAdmin } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import { registrationProfile } from "@/lib/registration-profile";
import { isValidPassId } from "@/lib/pass-qr";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isValidPassId(id)) {
    return Response.json(
      { valid: false, error: "Pass not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  let record;
  try {
    record = await (await registrations()).findOne({
      _id: new ObjectId(id),
      registrationStatus: "completed",
    });
  } catch {
    return Response.json(
      { error: "Could not verify pass right now. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!record) {
    return Response.json(
      { valid: false, error: "Pass not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  const publicSummary = {
    valid: true,
    authenticated: false,
    verified: Boolean(record.isVerified),
    passRole: record.role === "cultural" ? "CULTURAL" : "PLAYER",
  };

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ") || !header.slice(7).trim()) {
    return Response.json(publicSummary, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    await authenticatedAdmin(request);
  } catch {
    return Response.json(
      { ...publicSummary, authDenied: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(
    {
      valid: true,
      authenticated: true,
      role: "admin",
      pass: await registrationProfile(record),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
