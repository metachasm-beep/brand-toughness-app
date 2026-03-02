import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimization to reduce memory usage during build on Cloudflare
  productionBrowserSourceMaps: false,
  // Ensure that the build doesn't fetch telemetry or extra data
  experimental: {
    // This helps in some Next.js 15 Cloudflare edge cases
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
