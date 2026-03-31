#!/usr/bin/env node
/**
 * Script verify tables tồn tại trong Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTables() {
  console.log('🔍 Verifying Supabase tables...\n');

  const expectedTables = [
    'users',
    'auth_identities',
    'user_sessions',
    'trusted_devices',
    'auth_verification_events',
    'auth_login_events',
    'audit_events'
  ];

  try {
    // Query all tables in public schema
    const { data: tables, error } = await supabase
      .rpc('pg_tables_list', {}, { get: true })
      .select('*');

    // Fallback: Try to query each table individually
    const results = [];
    for (const tableName of expectedTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count', { count: 'exact', head: true });

        if (error) {
          if (error.code === '42P01' || error.message.includes('does not exist')) {
            results.push({ table: tableName, exists: false });
          } else {
            results.push({ table: tableName, exists: true, error: error.message });
          }
        } else {
          results.push({ table: tableName, exists: true });
        }
      } catch (err) {
        results.push({ table: tableName, exists: false, error: err.message });
      }
    }

    console.log('📊 Table Status:\n');
    let allExist = true;
    results.forEach(({ table, exists, error }) => {
      if (exists) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} (NOT FOUND)`);
        allExist = false;
      }
      if (error) {
        console.log(`      Error: ${error}`);
      }
    });

    console.log('');

    if (allExist) {
      console.log('🎉 All tables exist! Ready to use.\n');
      console.log('Next steps:');
      console.log('1. Restart dev server: npm run dev');
      console.log('2. Signup a new user');
      console.log('3. Run: npm run db:debug');
    } else {
      console.log('❌ Some tables are missing!\n');
      console.log('🔧 Action required:');
      console.log('1. Open Supabase Dashboard → SQL Editor');
      console.log('2. Run the SQL in: supabase-complete-schema.sql');
      console.log('3. Then run: supabase-rls-policies.sql');
      console.log('4. Run this script again to verify\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyTables();
