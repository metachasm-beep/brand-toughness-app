const nextConfig: import('next').NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['playwright', 'lighthouse', 'chrome-launcher'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
