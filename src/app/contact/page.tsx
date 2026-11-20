"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

const ContactView = dynamic(
  () => import("@/components/contact/ContactView").then((mod) => mod.ContactView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[100dvh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fest-orange border-t-transparent" />
      </div>
    ),
  }
);

export default function ContactPage() {
  return (
    <SectionErrorBoundary name="Contact Us Page">
      <ContactView />
    </SectionErrorBoundary>
  );
}
