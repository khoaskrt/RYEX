#!/usr/bin/env node
/**
 * Script để test kết nối Supabase
 * Chạy: node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase connection...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('📡 Connecting to Supabase...');
    console.log(`   URL: ${supabaseUrl}\n`);

    // Test 1: Check connection
    console.log('✅ Test 1: Basic connection');
    const { data: connectionTest, error: connError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (connError) throw connError;
    console.log('   ✓ Connection successful!\n');

    // Test 2: Count users
    console.log('✅ Test 2: Count users');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log(`   ✓ Total users: ${count}\n`);

    // Test 3: List tables
    console.log('✅ Test 3: List tables');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) throw tablesError;
    console.log('   ✓ Tables found:');
    tables.forEach(t => console.log(`     - ${t.table_name}`));
    console.log('');

    // Test 4: Check RLS status
    console.log('✅ Test 4: Check RLS (Row Level Security)');
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public');

    if (!rlsError && rlsStatus) {
      console.log('   ✓ RLS Status:');
      rlsStatus.forEach(t => {
        const status = t.rowsecurity ? '🔒 Enabled' : '🔓 Disabled';
        console.log(`     ${status} ${t.tablename}`);
      });
    } else {
      console.log('   ⚠️  Could not check RLS status (requires custom function)');
    }
    console.log('');

    // Test 5: Insert test user (và rollback)
    console.log('✅ Test 5: Test insert permission');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        firebase_uid: `test_${Date.now()}`,
        email: testEmail,
        status: 'pending_email_verification',
      })
      .select()
      .single();

    if (insertError) throw insertError;
    console.log(`   ✓ Insert successful! User ID: ${insertData.id}`);

    // Cleanup: Delete test user
    await supabase
      .from('users')
      .delete()
      .eq('id', insertData.id);
    console.log('   ✓ Test user deleted (cleanup)\n');

    console.log('🎉 All tests passed! Supabase is ready to use.\n');
    console.log('📝 Next steps:');
    console.log('   1. Run migrations: psql $POSTGRES_URL < db/migrations/005_enable_rls_policies.sql');
    console.log('   2. Verify RLS in Supabase Dashboard → Table Editor');
    console.log('   3. Test API endpoints: /api/v1/user/profile\n');

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check .env file has correct SUPABASE_URL and keys');
    console.error('   - Verify database migrations are applied');
    console.error('   - Check Supabase Dashboard → Database → Tables');
    process.exit(1);
  }
}

testConnection();
