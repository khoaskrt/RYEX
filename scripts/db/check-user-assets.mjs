import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Checking if user_assets table exists...\n');

const { data, error } = await supabase
  .from('user_assets')
  .select('count')
  .limit(1);

if (error) {
  if (error.code === 'PGRST205' || error.code === '42P01') {
    console.log('❌ Table user_assets does NOT exist');
    console.log('   Error:', error.message);
    console.log('\n📋 Solution: Apply migration via Supabase Dashboard SQL Editor:');
    console.log('   File: db/migrations/003_create_user_assets_current_truth.sql\n');
  } else {
    console.log('❌ Query error:', error);
  }
  process.exit(1);
} else {
  console.log('✅ Table user_assets exists');
  console.log('   Current row count:', data?.length || 0);
  console.log('\n📝 Next: Add test data via Supabase Dashboard or seed script');
}
