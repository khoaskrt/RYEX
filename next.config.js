/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY || process.env.SUPABASE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
