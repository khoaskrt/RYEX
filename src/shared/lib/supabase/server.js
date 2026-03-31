/**
 * Supabase Server Client (theo chuẩn Next.js + Supabase)
 *
 * File này follow đúng convention của Supabase documentation:
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Create Supabase client for server-side usage (API routes, Server Components)
 *
 * Sử dụng SERVICE_ROLE_KEY để bypass RLS khi cần
 * (Dùng cho auth operations, admin tasks)
 */
export async function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create Supabase client with ANON key (respects RLS)
 * Dùng khi muốn enforce RLS policies
 */
export async function createAnonClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
