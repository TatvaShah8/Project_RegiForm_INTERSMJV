import { readJson } from "@/lib/request-body";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { database } from "@/lib/mongodb";
import { authenticatedAdmin, authError } from "@/lib/firebase-admin";
import { badInput, validationError } from "@/lib/registration-helpers";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = z.object({ name: z.string().trim().min(1).max(100), email: z.email().max(254), issue: z.string().trim().min(1).max(5000) }).parse(await readJson(request, 12000));
    const ticket = { ...body, id: `SMJV-TK-${randomUUID()}`, status: "OPEN", createdAt: new Date().toISOString() };
    await (await database()).collection("supportTickets").insertOne({ ...ticket });
    return Response.json({ ticket }, { status: 201 });
  } catch (error) {
    if (validationError(error)) return badInput(error);
    return Response.json({ error: "Could not save support ticket" }, { status: 503 });
  }
}
export async function GET(request: Request) {
  try { await authenticatedAdmin(request); } catch (error) { return authError(error); }
  try {
    const tickets = await (await database()).collection("supportTickets").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return Response.json({ tickets }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Could not load support tickets" }, { status: 503 }); }
}
export async function PATCH(request: Request) {
  try { await authenticatedAdmin(request); } catch (error) { return authError(error); }
  try {
    const { id, ...fields } = z.object({ id: z.string().max(100), status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]), adminNotes: z.string().max(5000).optional() }).parse(await readJson(request));
    const result = await (await database()).collection("supportTickets").updateOne({ id }, { $set: { ...fields, repliedAt: new Date().toISOString() } });
    return Response.json({ success: !!result.matchedCount }, { status: result.matchedCount ? 200 : 404 });
  } catch (error) {
    if (validationError(error)) return badInput(error);
    return Response.json({ error: "Could not update ticket" }, { status: 503 });
  }
}
export async function DELETE(request: Request) {
  try { await authenticatedAdmin(request); } catch (error) { return authError(error); }
  try {
    const { id } = z.object({ id: z.string().max(100) }).parse(await readJson(request));
    await (await database()).collection("supportTickets").deleteOne({ id });
    return Response.json({ success: true });
  } catch (error) {
    if (validationError(error)) return badInput(error);
    return Response.json({ error: "Could not delete ticket" }, { status: 503 });
  }
}
