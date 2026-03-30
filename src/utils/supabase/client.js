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
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Vì dùng Firebase Auth
      autoRefreshToken: false,
    },
  });

  return client;
}
