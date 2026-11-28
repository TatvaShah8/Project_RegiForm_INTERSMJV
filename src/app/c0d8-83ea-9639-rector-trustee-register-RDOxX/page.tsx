import type { Metadata } from "next";
import { OfficialRegistrationFlow } from "@/components/register/OfficialRegistrationFlow";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

export const metadata: Metadata = {
  title: "Rector & Trustee Registration · SMJV Youth Festival 2026",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RectorTrusteeRegisterPage() {
  return (
    <SectionErrorBoundary name="Official Registration">
      <OfficialRegistrationFlow />
    </SectionErrorBoundary>
  );
}
