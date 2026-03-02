import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  // Fix for "Internal Error" - give Next more time to generate static pages if they are slow
  // Increased to allow it to pass even if it's slow.
  staticPageGenerationTimeout: 1200,
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
