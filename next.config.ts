/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['playwright', 'lighthouse', 'chrome-launcher'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['playwright', 'lighthouse', 'chrome-launcher'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
