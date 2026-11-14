"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { RegistrationFlow } from "@/components/register/RegistrationFlow";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import { useRegister } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const s = useRegister();
  const isHydrated = s._hasHydrated;
  const isLoggedIn = isHydrated && s.completed && !!s.firstName;

  React.useEffect(() => {
    if (isLoggedIn) {
      router.replace("/schedule/boys");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <TournamentNav activeNav="register" />

      <main className="fest-scroll mx-auto w-full max-w-5xl flex-1 px-3 pb-12 md:px-6">
        <SectionErrorBoundary name="Registration Portal">
          <RegistrationFlow showHeader={false} />
        </SectionErrorBoundary>
      </main>
    </div>
  );
}
