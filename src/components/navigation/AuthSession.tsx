"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRegister } from "@/lib/store";
import { loadRegistration } from "@/lib/registration-api";
import { toast } from "@/hooks/use-toast";
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
        state.set("completed", false);
        state.set("emailVerified", false);
        state.set("isVerified", false);
        return;
      }
      if (state.email && state.email.toLowerCase() !== user.email?.toLowerCase()) state.logout();
      try {
        const account = await loadRegistration();
        if (current !== generation) return;
        if (account) useRegister.getState().loginAccount(account);
        else {
          useRegister.getState().set("email", user.email ?? "");
          useRegister.getState().set("emailVerified", user.emailVerified);
        }
      } catch (error) {
        if (current === generation) toast({ title: "PROFILE UNAVAILABLE", description: error instanceof Error ? error.message : "Please sign in again", variant: "destructive" });
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
