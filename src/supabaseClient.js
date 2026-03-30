import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_PUBLIC_KEY
  || '';

if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
  throw new Error(
    'Missing Supabase credentials. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
