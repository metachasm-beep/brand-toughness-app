/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['playwright', 'lighthouse', 'chrome-launcher'],
};

module.exports = nextConfig;
