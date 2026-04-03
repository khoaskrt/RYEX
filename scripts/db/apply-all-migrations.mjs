#!/usr/bin/env node
/**
 * Apply All Auth Migrations
 * Run all pending database migrations in order
 */

import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL or POSTGRES_URL in .env');
  process.exit(1);
}

// Migrations to apply in order
const MIGRATIONS = [
  '001_users_current_truth_baseline.sql',
  '001_auth_identity_baseline.sql',
  '002_fix_auth_handle_new_user_trigger.sql',
  '003_auth_trusted_devices.sql',
  '004_auth_verification_event_types.sql',
];

async function applyMigrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const migrationsDir = join(__dirname, '../../db/migrations');

    for (const migrationFile of MIGRATIONS) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📂 Applying: ${migrationFile}`);
      console.log('='.repeat(80));

      const migrationPath = join(migrationsDir, migrationFile);

      try {
        const sql = readFileSync(migrationPath, 'utf-8');

        if (!sql.trim()) {
          console.warn(`⚠️  Skipping empty migration: ${migrationFile}`);
          continue;
        }

        console.log(`📄 SQL preview (first 300 chars):`);
        console.log(sql.substring(0, 300).trim() + '...\n');

        await pool.query(sql);

        console.log(`✅ Successfully applied: ${migrationFile}`);

      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  Already exists (skipping): ${migrationFile}`);
        } else {
          console.error(`❌ Failed to apply: ${migrationFile}`);
          console.error(`   Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('🎉 All migrations applied successfully!');
    console.log('='.repeat(80));

    // Verify key tables
    console.log('\n🔍 Verifying tables...');

    const tables = ['users', 'auth_identities', 'trusted_devices', 'auth_verification_events', 'auth_login_events', 'audit_events', 'user_sessions'];

    for (const table of tables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = $1
        )
      `, [table]);

      const exists = result.rows[0].exists;
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    }

    // Verify trigger
    console.log('\n🔍 Verifying trigger...');
    const triggerCheck = await pool.query(`
      SELECT tgname, tgenabled
      FROM pg_trigger
      WHERE tgname = 'on_auth_user_created'
        AND tgrelid = 'auth.users'::regclass
    `);

    if (triggerCheck.rows.length > 0) {
      console.log(`   ✅ Trigger: on_auth_user_created (enabled: ${triggerCheck.rows[0].tgenabled === 'O' ? 'Yes' : 'No'})`);
    } else {
      console.warn('   ⚠️  Trigger: on_auth_user_created NOT FOUND');
    }

    console.log('\n✅ Setup complete! Test signup API:');
    console.log('   curl -X POST http://localhost:3000/api/v1/auth/signup \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"email":"test@ryex.vn","password":"TestPass@123","displayName":"Test"}\'');

  } catch (error) {
    console.error('\n❌ Migration process failed:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigrations();
