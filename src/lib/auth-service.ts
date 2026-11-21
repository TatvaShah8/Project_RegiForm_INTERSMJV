import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "./firebase";

export interface AuthResult {
  ok: boolean;
  user?: User;
  email?: string;
  error?: string;
  code?: string;
}

/**
 * 1-Click Sign-in / Verification via Google.
 * Always marks email as verified because Google accounts are pre-verified.
 * Leaves tournament fields (name, surname, photo, branch) for manual entry for certificates.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isFirebaseConfigured || !auth) {
    return {
      ok: false,
      error: "Firebase keys not yet configured in .env.local",
    };
  }
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return {
      ok: true,
      user: cred.user,
      email: cred.user.email || undefined,
    };
  } catch (err: any) {
    const code = err?.code || "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      // Normal user action (user closed the popup or clicked away) — avoid logging console.error
      console.warn("Google sign-in popup was closed by user.");
      return {
        ok: false,
        code,
        error: "Sign-in popup was closed before completion.",
      };
    }
    console.error("Google sign-in error:", err);
    let msg = err.message || "Failed to sign in with Google";
    if (code === "auth/unauthorized-domain") {
      msg = "Add localhost to Firebase Authentication > Settings > Authorized domains.";
    } else if (code === "auth/operation-not-allowed") {
      msg = "Enable the Google sign-in provider in Firebase Authentication.";
    } else if (code === "auth/popup-blocked") {
      msg = "Popup was blocked by your browser. Please allow popups for this site.";
    }
    return { ok: false, code, error: msg };
  }
}

/**
 * Creates account with email and password and dispatches official verification email.
 */
export async function registerWithEmailPassword(
  email: string,
  pass: string
): Promise<AuthResult> {
  if (!isFirebaseConfigured || !auth) {
    return {
      ok: false,
      error: "Firebase keys not yet configured in .env.local",
    };
  }
  try {
    if (pass.length < 8) return { ok: false, error: "Password must be at least 8 characters long." };
    if (!/[a-z]/.test(pass)) return { ok: false, error: "Password must include at least one lowercase letter (a-z)." };
    if (!/[A-Z]/.test(pass)) return { ok: false, error: "Password must include at least one uppercase letter (A-Z)." };
    if (!/\d/.test(pass)) return { ok: false, error: "Password must include at least one number (0-9)." };
    if (!/[^a-zA-Z0-9]/.test(pass)) return { ok: false, error: "Password must include at least one special character (!@#...)." };
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error) {
      if ((error as { code?: string }).code !== "auth/email-already-in-use") throw error;
      cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    }
    if (cred.user) {
      await sendEmailVerification(cred.user);
    }
    return {
      ok: true,
      user: cred.user,
      email: cred.user.email || email,
    };
  } catch (err: any) {
    console.error("Email registration error:", err);
    let msg = err.message || "Failed to register account";
    if (err.code === "auth/email-already-in-use") {
      msg = "This email is already registered. Please sign in instead.";
    } else if (err.code === "auth/weak-password") {
      msg = "Password does not meet Firebase requirements (min 8 characters, with uppercase, lowercase, number, and special character).";
    } else if (err.code === "auth/invalid-email") {
      msg = "Please enter a valid email address.";
    }
    return { ok: false, error: msg };
  }
}

/**
 * Signs in existing student with email and password.
 */
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<AuthResult> {
  if (!isFirebaseConfigured || !auth) {
    return {
      ok: false,
      error: "Firebase keys not yet configured in .env.local",
    };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return {
      ok: true,
      user: cred.user,
      email: cred.user.email || email,
    };
  } catch (err: any) {
    console.error("Email login error:", err);
    let msg = err.message || "Invalid email or password";
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      msg = "Invalid email or password. Please check your credentials.";
    }
    return { ok: false, error: msg };
  }
}

/**
 * Resends the official verification email to the currently signed in user.
 */
export async function resendVerificationEmail(): Promise<AuthResult> {
  const current = auth?.currentUser;
  if (!current) {
    return { ok: false, error: "No student account currently active." };
  }
  try {
    await sendEmailVerification(current);
    return { ok: true, user: current };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to resend verification email." };
  }
}

/**
 * Reloads the user and returns whether their email is verified.
 */
export async function checkEmailVerified(): Promise<boolean> {
  const current = auth?.currentUser;
  if (!current) return false;
  try {
    await current.reload();
    await current.getIdToken(true);
    return current.emailVerified;
  } catch {
    return false;
  }
}

/**
 * Signs out current Firebase session.
 */
export async function logoutFirebase(): Promise<void> {
  try {
    if (auth) await signOut(auth);
  } catch {}
}
