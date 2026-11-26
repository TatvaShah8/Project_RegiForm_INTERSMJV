import { ObjectId } from "mongodb";
import { authenticatedAdmin, authenticatedUser } from "@/lib/firebase-admin";
import { registrations } from "@/lib/mongodb";
import { registrationProfile } from "@/lib/registration-profile";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cleanId = (id ?? "").trim();

  if (!cleanId || cleanId === "pending" || !ObjectId.isValid(cleanId)) {
    return Response.json(
      { valid: false, error: "Invalid or incomplete pass ID." },
      { status: 404 }
    );
  }

  let record;
  try {
    const col = await registrations();
    record = await col.findOne({
      _id: new ObjectId(cleanId),
      registrationStatus: "completed",
    });
  } catch {
    return Response.json(
      { valid: false, error: "Could not verify pass right now." },
      { status: 503 }
    );
  }

  if (!record) {
    return Response.json(
      { valid: false, error: "Pass not found or registration incomplete." },
      { status: 404 }
    );
  }

  const publicStatus = record.isVerified ? "verified" : "registered";
  const authHeader = request.headers.get("authorization") ?? "";

  if (authHeader.startsWith("Bearer ") && authHeader.slice(7).trim()) {
    try {
      await authenticatedAdmin(request);
      const profile = await registrationProfile(record);
      return Response.json({
        valid: true,
        access: "committee",
        status: publicStatus,
        profile,
      });
    } catch {
      // Not a committee admin; check if caller is a signed-in participant for safe networking info.
      try {
        await authenticatedUser(request);
        const profile = (await registrationProfile(record)) as Record<string, unknown>;
        return Response.json({
          valid: true,
          access: "student",
          status: publicStatus,
          staffDenied: true,
          student: {
            firstName: profile.firstName || "",
            middleName: profile.middleName || "",
            surname: profile.surname || "",
            photo: profile.photo ?? null,
            mobile: profile.mobile || "",
            homeTown: profile.homeTown || "",
            branch: profile.branch || "",
            course: profile.course || "",
            college: profile.college || "",
            year: profile.year || "",
            jerseyNumber: profile.jerseyNumber || "",
          },
        });
      } catch {
        return Response.json({
          valid: true,
          access: "public",
          status: publicStatus,
          staffDenied: true,
        });
      }
    }
  }

  return Response.json({
    valid: true,
    access: "public",
    status: publicStatus,
  });
}
