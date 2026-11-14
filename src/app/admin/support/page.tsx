"use client";

import * as React from "react";
import { AdminSupportDashboard } from "@/components/admin/AdminSupportDashboard";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

export default function AdminSupportPage() {
  return (
    <SectionErrorBoundary name="Admin Support Dashboard Page">
      <AdminSupportDashboard />
    </SectionErrorBoundary>
  );
}
