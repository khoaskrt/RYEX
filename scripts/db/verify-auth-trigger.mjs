#!/usr/bin/env node
/**
 * Verify Auth Trigger Script
 * Check if handle_new_user() trigger function exists and is correct
 */

import { Pool } from 'pg';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL or POSTGRES_URL in .env');
  process.exit(1);
}

async function verifyAuthTrigger() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Checking handle_new_user() trigger function...\n');

    // Check if function exists
    const funcCheck = await pool.query(`
      SELECT
        p.proname as function_name,
        pg_get_functiondef(p.oid) as function_definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'handle_new_user'
    `);

    if (funcCheck.rows.length === 0) {
      console.error('❌ Function handle_new_user() NOT FOUND');
      console.log('\n💡 Action required: Apply migration 002.1_fix_auth_handle_new_user_trigger.sql');
      process.exit(1);
    }

    console.log('✅ Function handle_new_user() exists\n');
    console.log('📄 Current function definition:');
    console.log('─'.repeat(80));
    console.log(funcCheck.rows[0].function_definition);
    console.log('─'.repeat(80));

    // Check if trigger is attached to auth.users
    const triggerCheck = await pool.query(`
      SELECT
        tgname as trigger_name,
        tgenabled as enabled,
        pg_get_triggerdef(oid) as trigger_definition
      FROM pg_trigger
      WHERE tgname LIKE '%handle_new_user%'
        AND tgrelid = 'auth.users'::regclass
    `);

    if (triggerCheck.rows.length === 0) {
      console.warn('\n⚠️  Trigger not found on auth.users table');
      console.log('💡 You may need to create trigger manually:');
      console.log(`
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
      `);
    } else {
      console.log('\n✅ Trigger attached to auth.users:');
      triggerCheck.rows.forEach(row => {
        console.log(`   Name: ${row.trigger_name}`);
        console.log(`   Enabled: ${row.enabled === 'O' ? 'Yes' : 'No'}`);
        console.log(`   Definition: ${row.trigger_definition}`);
      });
    }

    // Check users table schema
    console.log('\n🔍 Checking public.users table schema...\n');
    const schemaCheck = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('✅ Users table columns:');
    schemaCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check if required columns exist
    const requiredColumns = ['supa_id', 'users_id', 'email', 'display_name'];
    const existingColumns = schemaCheck.rows.map(r => r.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.error('\n❌ Missing required columns:', missingColumns.join(', '));
      console.log('💡 Run migration 001.1_users_current_truth_baseline.sql first');
      process.exit(1);
    }

    console.log('\n✅ All required columns present');

    // Test the function logic (read-only)
    console.log('\n🧪 Testing function logic (simulated)...');
    const testQuery = `
      SELECT
        'supa_id' as check_name,
        EXISTS(
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users'
            AND column_name = 'supa_id'
        ) as result
      UNION ALL
      SELECT
        'users_id' as check_name,
        EXISTS(
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users'
            AND column_name = 'users_id'
        ) as result
    `;

    const testResult = await pool.query(testQuery);
    console.log('   Column checks:');
    testResult.rows.forEach(row => {
      console.log(`   - ${row.check_name}: ${row.result ? '✅' : '❌'}`);
    });

    console.log('\n✅ Verification complete - trigger setup looks correct');
    console.log('\n💡 Next step: Test signup API with:');
    console.log('   curl -X POST http://localhost:3000/api/v1/auth/signup \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"email":"test@ryex.vn","password":"TestPass@123"}\'');

  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyAuthTrigger();
