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
  staticPageGenerationTimeout: 1500,
  experimental: {
    // Aggressive memory saving for Cloudflare
    workerThreads: false,
    cpus: 1,
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
