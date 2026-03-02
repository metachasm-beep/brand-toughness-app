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
  // Significant memory reduction for build environments
  experimental: {
    // Disable multi-threading to avoid build worker crashes on resource-constrained CI
    workerThreads: false,
    cpus: 1,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
