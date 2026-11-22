import "server-only";
import fs from "node:fs";
import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export function adminAuth() {
  const existing = getApps().find(app => app.name === "smjv-server");
  if (existing) return getAuth(existing);

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let account: any = undefined;

  if (json) {
    try {
      let cleanJson = json.trim();
      // Handle edge cases where the JSON env var might have been wrapped in quotes
      if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
        cleanJson = JSON.parse(cleanJson);
      }
      account = typeof cleanJson === "string" ? JSON.parse(cleanJson) : cleanJson;
      if (account && typeof account.private_key === "string") {
        // Fix unescaped newlines in private key if copied directly into Vercel
        account.private_key = account.private_key.replace(/\\n/g, "\n");
      }
    } catch {
      throw new Error("Invalid server authentication configuration");
    }
  }

  const projectId = account?.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "intersmjv";

  let credential;
  if (account) {
    credential = cert(account);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!fs.existsSync(credPath)) {
      throw new Error(
        `GOOGLE_APPLICATION_CREDENTIALS file not found: '${credPath}'. On Vercel, please set FIREBASE_SERVICE_ACCOUNT_JSON in Project Settings > Environment Variables with your service account JSON.`
      );
    }
    credential = applicationDefault();
  } else {
    throw new Error(
      "Firebase Admin credential is not configured. Please add FIREBASE_SERVICE_ACCOUNT_JSON to Vercel Environment Variables."
    );
  }

  return getAuth(initializeApp({ projectId, credential }, "smjv-server"));
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
  console.error("Server authentication unavailable");
  return Response.json({
    error: "Sign-in is temporarily unavailable. Please try again later."
  }, { status: 503 });
}
