/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg', 'firebase-admin'],
  },
};

module.exports = nextConfig;
