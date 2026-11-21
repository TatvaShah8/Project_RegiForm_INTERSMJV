"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

const CommitteeVerificationDashboard = dynamic(
  () =>
    import("@/components/admin/CommitteeVerificationDashboard").then(
      (mod) => mod.CommitteeVerificationDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-fest-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fest-orange border-t-transparent" />
      </div>
    ),
  }
);

export default function CommitteeVerificationPage() {
  return (
    <SectionErrorBoundary name="Committee Verification Dashboard Page">
      <CommitteeVerificationDashboard />
    </SectionErrorBoundary>
  );
}
