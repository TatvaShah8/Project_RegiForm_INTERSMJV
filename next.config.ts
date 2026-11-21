import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* Hide the floating Next.js dev-tools launcher and build-activity dot.
     End users viewing the preview link should not see dev chrome. */
  devIndicators: false,
  /* Allow the preview proxy host to load /_next/* assets without the
     cross-origin warning. */
  allowedDevOrigins: [
    "preview-chat-efaf41f5-865d-4b6c-8a0d-57b396ccbed7.space-z.ai",
  ],
};

export default nextConfig;
