import "server-only";
import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
export function adminAuth() {
  const existing = getApps().find(app => app.name === "smjv-server");
  if (existing) return getAuth(existing);
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json && !process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error("FIREBASE_ADMIN_NOT_CONFIGURED");
  const account = json ? JSON.parse(json) : undefined;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || (account && account.project_id !== projectId)) throw new Error("FIREBASE_PROJECT_MISMATCH");
  return getAuth(initializeApp({ projectId, credential: account ? cert(account) : applicationDefault() }, "smjv-server"));
}
export async function authenticatedUser(request: Request, requireVerified = true) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ") || !header.slice(7).trim()) throw new Error("UNAUTHORIZED");
  const auth = adminAuth();
  const decoded = await auth.verifyIdToken(header.slice(7), true);
  const user = await auth.getUser(decoded.uid);
  if (requireVerified && !user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
  if (!user.email) throw new Error("EMAIL_MISSING");
  return user;
}
export async function authenticatedAdmin(request: Request) {
  const user = await authenticatedUser(request);
  const allowed = (process.env.ADMIN_FIREBASE_UIDS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (!allowed.includes(user.uid)) throw new Error("FORBIDDEN");
  return user;
}
export function authError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code = (error as { code?: string })?.code;
  if (message === "EMAIL_NOT_VERIFIED") return Response.json({ error: "Verify your email first" }, { status: 403 });
  if (message === "FORBIDDEN") return Response.json({ error: "Committee access requires an authorized Firebase account" }, { status: 403 });
  if (["UNAUTHORIZED", "EMAIL_MISSING"].includes(message) || [
    "auth/id-token-expired", "auth/id-token-revoked", "auth/invalid-id-token", "auth/argument-error", "auth/user-disabled", "auth/user-not-found",
  ].includes(code ?? "")) return Response.json({ error: "Please sign in again" }, { status: 401 });
  console.error("Firebase Admin unavailable:", code ?? message);
  return Response.json({ error: "Server authentication is unavailable. Check the Firebase Admin credential and project configuration." }, { status: 503 });
}
