"use client";

import { auth } from "@/lib/firebase";

export async function registrationRequest(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  data?: object | FormData,
) {
  if (!auth) throw new Error("Configure Firebase client settings in .env.local");
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in to Firebase first");
  // Get a fresh token when needed. The server verifies the user and email.
  const token = await user.getIdToken();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const form = data instanceof FormData;
  if (data !== undefined && !form) headers["Content-Type"] = "application/json";
  const response = await fetch(`/api/registration/${path}`, {
    method,
    headers,
    body: data === undefined ? undefined : form ? data : JSON.stringify(data),
  });
  const rawText = await response.text();
  let result: any = {};
  try {
    result = JSON.parse(rawText);
  } catch {
    // If response is HTML or text, strip tags and extract message
    const clean = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    result = { error: clean.slice(0, 200) || `Request failed (${response.status})` };
  }
  if (!response.ok) {
    const errorMsg = result?.error || result?.message || `Request failed (${response.status})`;
    throw new Error(errorMsg);
  }
  return result;
}

export async function addPhotoToForm(form: FormData, photo: string | null) {
  if (!photo || !photo.startsWith("data:image/")) {
    throw new Error("Please upload or capture a valid photo first");
  }
  const response = await fetch(photo);
  const blob = await response.blob();
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  };
  const extension = extensions[blob.type];
  if (!extension) throw new Error("Only JPG, PNG or WebP photos are supported");
  form.append("images", blob, `portrait.${extension}`);
}

export function finalRegistrationForm(s: {
  role: string; jerseyNumber: string; tshirt: string; waist: string;
  agreement: boolean; outdoor: string[]; indoor: string[];
}) {
  const form = new FormData();
  form.set("role", s.role);
  if (s.role === "sports") form.set("jerseyNumber", s.jerseyNumber);
  form.set("tshirt", s.tshirt);
  form.set("waist", s.waist);
  form.set("agreement", String(s.agreement));
  form.set("outdoor", JSON.stringify(s.outdoor));
  form.set("indoor", JSON.stringify(s.indoor));
  return form;
}

export async function loadRegistration() {
  const { account } = await registrationRequest("me", "GET");
  return account ? { ...account, dob: account.dob ? new Date(account.dob) : null } : null;
}
