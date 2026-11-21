import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,

  allowedDevOrigins: [
    "preview-chat-efaf41f5-865d-4b6c-8a0d-57b396ccbed7.space-z.ai",
  ],

  serverExternalPackages: [],
};

export default nextConfig;