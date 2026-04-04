#!/usr/bin/env node
/**
 * Apply Migration Script
 * Usage: node scripts/db/apply-migration.mjs <migration-file-name>
 * Example: node scripts/db/apply-migration.mjs 002.1_fix_auth_handle_new_user_trigger.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('❌ Usage: node scripts/db/apply-migration.mjs <migration-file-name>');
  console.error('   Example: node scripts/db/apply-migration.mjs 002.1_fix_auth_handle_new_user_trigger.sql');
  process.exit(1);
}

async function applyMigration() {
  try {
    // Read migration file
    const migrationPath = join(__dirname, '../../db/migrations', migrationFile);
    console.log(`📂 Reading migration: ${migrationPath}`);

    const sql = readFileSync(migrationPath, 'utf-8');

    if (!sql.trim()) {
      console.error('❌ Migration file is empty');
      process.exit(1);
    }

    console.log(`\n📄 Migration SQL preview (first 500 chars):`);
    console.log('─'.repeat(80));
    console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
    console.log('─'.repeat(80));

    // Confirm before applying
    console.log(`\n⚠️  About to apply migration to: ${SUPABASE_URL}`);
    console.log(`⚠️  Press Ctrl+C within 3 seconds to cancel...`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('\n🚀 Applying migration...');

    // Execute SQL via Supabase RPC
    // Note: Supabase doesn't allow direct SQL execution via JS client for DDL
    // We need to use postgres REST API endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Migration failed: ${response.status} ${error}`);
    }

    console.log('\n✅ Migration applied successfully!');

    // Verify the function exists
    console.log('\n🔍 Verifying function handle_new_user() exists...');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'handle_new_user')
      .limit(1);

    if (funcError) {
      console.warn('⚠️  Could not verify function (may need manual check):', funcError.message);
    } else if (functions && functions.length > 0) {
      console.log('✅ Function handle_new_user() confirmed in database');
    } else {
      console.warn('⚠️  Function not found via pg_proc query');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Alternative: Direct postgres connection (more reliable for DDL)
async function applyMigrationViaPostgres() {
  try {
    const { Pool } = await import('pg');

    const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!DATABASE_URL) {
      throw new Error('Missing DATABASE_URL or POSTGRES_URL');
    }

    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Read migration file
    const migrationPath = join(__dirname, '../../db/migrations', migrationFile);
    console.log(`📂 Reading migration: ${migrationPath}`);

    const sql = readFileSync(migrationPath, 'utf-8');

    if (!sql.trim()) {
      console.error('❌ Migration file is empty');
      process.exit(1);
    }

    console.log(`\n📄 Migration SQL preview (first 500 chars):`);
    console.log('─'.repeat(80));
    console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
    console.log('─'.repeat(80));

    console.log(`\n⚠️  About to apply migration to database`);
    console.log(`⚠️  Press Ctrl+C within 3 seconds to cancel...`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🚀 Applying migration via PostgreSQL connection...');

    const result = await pool.query(sql);

    console.log('\n✅ Migration applied successfully!');
    console.log('Result:', result.command);

    // Verify function
    console.log('\n🔍 Verifying function handle_new_user() exists...');
    const verifyResult = await pool.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_name = 'handle_new_user'
        AND routine_schema = 'public'
    `);

    if (verifyResult.rows.length > 0) {
      console.log('✅ Function handle_new_user() confirmed:');
      console.log('   Type:', verifyResult.rows[0].routine_type);
    } else {
      console.warn('⚠️  Function not found in information_schema');
    }

    await pool.end();

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Use postgres connection method (more reliable for DDL)
console.log('🔧 Using PostgreSQL connection for migration...\n');
applyMigrationViaPostgres();
