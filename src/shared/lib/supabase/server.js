// Server-side Supabase instance (for API routes)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper để execute raw SQL queries
export async function executeQuery(sql, params = []) {
  const { data, error } = await supabaseAdmin.rpc('execute_sql', {
    query: sql,
    params: params,
  });

  if (error) throw error;
  return data;
}
