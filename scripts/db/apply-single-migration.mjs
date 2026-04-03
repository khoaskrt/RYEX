#!/usr/bin/env node
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import 'dotenv/config';

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node scripts/db/apply-single-migration.mjs <path-to-migration.sql>');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function apply() {
  try {
    const sql = readFileSync(migrationFile, 'utf-8');
    console.log(`📂 Applying: ${migrationFile}\n`);
    console.log('📄 SQL preview (first 400 chars):');
    console.log(sql.substring(0, 400) + '...\n');

    await pool.query(sql);
    console.log(`✅ Migration applied successfully`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    if (err.code) console.error(`   Code: ${err.code}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

apply();
