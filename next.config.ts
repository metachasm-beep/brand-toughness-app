/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['playwright', 'lighthouse', 'chrome-launcher'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
