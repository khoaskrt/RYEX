/**
 * Supabase Browser Client (theo chuẩn Next.js + Supabase)
 *
 * Dùng trong Client Components (pages, components với 'use client')
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let client = null;

export function createClient() {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_PUBLIC_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase client env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
    );
  }

  client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}

export const supabase = createClient();
