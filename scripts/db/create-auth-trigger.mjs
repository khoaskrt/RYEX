#!/usr/bin/env node
/**
 * Create Auth Trigger
 * Attach handle_new_user() function to auth.users INSERT trigger
 */

import { Pool } from 'pg';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL or POSTGRES_URL in .env');
  process.exit(1);
}

async function createAuthTrigger() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔧 Creating trigger on auth.users table...\n');

    // Check if trigger already exists
    const checkTrigger = await pool.query(`
      SELECT tgname
      FROM pg_trigger
      WHERE tgname = 'on_auth_user_created'
        AND tgrelid = 'auth.users'::regclass
    `);

    if (checkTrigger.rows.length > 0) {
      console.log('⚠️  Trigger already exists. Dropping and recreating...');
      await pool.query(`
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      `);
      console.log('✅ Dropped old trigger');
    }

    // Create trigger
    const createTriggerSQL = `
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `;

    await pool.query(createTriggerSQL);

    console.log('✅ Trigger created successfully!\n');

    // Verify
    const verifyTrigger = await pool.query(`
      SELECT
        tgname as trigger_name,
        tgenabled as enabled,
        pg_get_triggerdef(oid) as trigger_definition
      FROM pg_trigger
      WHERE tgname = 'on_auth_user_created'
        AND tgrelid = 'auth.users'::regclass
    `);

    if (verifyTrigger.rows.length > 0) {
      console.log('✅ Verification successful:');
      console.log('   Trigger name:', verifyTrigger.rows[0].trigger_name);
      console.log('   Enabled:', verifyTrigger.rows[0].enabled === 'O' ? 'Yes' : 'No');
      console.log('\n📄 Trigger definition:');
      console.log('─'.repeat(80));
      console.log(verifyTrigger.rows[0].trigger_definition);
      console.log('─'.repeat(80));

      console.log('\n✅ Setup complete! Now test signup API:');
      console.log('\n   curl -X POST http://localhost:3000/api/v1/auth/signup \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"email":"test@ryex.vn","password":"TestPass@123","displayName":"Test User"}\'');
    } else {
      console.error('❌ Trigger verification failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Failed to create trigger:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAuthTrigger();
