"use client";

import * as React from "react";
import { ContactView } from "@/components/contact/ContactView";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

export default function ContactPage() {
  return (
    <SectionErrorBoundary name="Contact Us Page">
      <ContactView />
    </SectionErrorBoundary>
  );
}
