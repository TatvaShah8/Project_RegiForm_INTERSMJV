"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRegister } from "@/lib/store";
import { loadRegistration } from "@/lib/registration-api";

export function AuthSession() {
  useEffect(() => {
    // Remove the obsolete demo account cache, which could contain plaintext passwords.
    try { localStorage.removeItem("smjv_saved_accounts"); } catch {}
    if (!auth) return;
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, async user => {
      const current = ++generation;
      const state = useRegister.getState();
      if (!user) {
        if (state.completed) {
          state.logout();
        } else {
          state.set("emailVerified", false);
        }
        return;
      }
      if (state.completed && state.email && state.email.toLowerCase() !== user.email?.toLowerCase()) {
        state.logout();
      }
      try {
        const account = await loadRegistration();
        if (current !== generation) return;
        if (account) {
          useRegister.getState().loginAccount(account);
        } else {
          // In-progress registration: preserve Step 1 identity fields (name, grNo, gender, mobile)
          const s = useRegister.getState();
          if (s.completed) {
            s.set("completed", false);
            s.set("outdoor", []);
            s.set("indoor", []);
            s.set("jerseyNumber", "");
          }
          s.set("email", user.email ?? s.email);
          s.set("emailVerified", !!user.emailVerified);
        }
      } catch (error) {
        if (current === generation) {
          console.warn("Registration load not ready or unavailable:", error);
        }
      }
    });
    const refresh = setInterval(async () => {
      if (!auth?.currentUser || !useRegister.getState().completed) return;
      const current = generation;
      try {
        const account = await loadRegistration();
        if (account && current === generation) useRegister.getState().loginAccount(account);
      } catch { /* Keep the pass visible; the next load retries temporary service failures. */ }
    }, 50 * 60 * 1000);
    return () => { generation++; clearInterval(refresh); unsubscribe(); };
  }, []);
  return null;
}
