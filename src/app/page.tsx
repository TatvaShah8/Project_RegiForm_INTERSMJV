"use client";

import * as React from "react";
import { HomePage } from "@/components/home/HomePage";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

export default function Home() {
  return (
    <SectionErrorBoundary name="Home Page">
      <HomePage />
    </SectionErrorBoundary>
  );
}
