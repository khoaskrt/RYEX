#!/usr/bin/env node
/**
 * Script kiểm tra data đang lưu ở đâu: localhost hay Supabase production
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

console.log('🔍 Checking database location...\n');

const databaseUrl = process.env.DATABASE_URL;
const postgresUrl = process.env.POSTGRES_URL;
const supabaseUrl = process.env.SUPABASE_URL;

// Analyze connection strings
function analyzeConnectionString(url, name) {
  if (!url) {
    console.log(`❌ ${name}: NOT SET\n`);
    return null;
  }

  console.log(`📋 ${name}:`);
  console.log(`   ${url.substring(0, 60)}...`);

  // Parse host
  let host = 'unknown';
  try {
    const match = url.match(/@([^:\/]+)/);
    if (match) {
      host = match[1];
    }
  } catch (e) {
    // ignore
  }

  // Determine location
  const isLocal =
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('0.0.0.0') ||
    host === 'localhost';

  const isSupabase =
    url.includes('supabase.co') ||
    url.includes('pooler.supabase.com');

  const isDocker =
    url.includes('postgres:') ||
    (url.includes('172.') && !url.includes('supabase'));

  let location = '🌐 Remote/Cloud';
  let emoji = '☁️';

  if (isLocal) {
    location = '🏠 Local Machine';
    emoji = '🏠';
  } else if (isSupabase) {
    location = '🚀 Supabase Production';
    emoji = '🚀';
  } else if (isDocker) {
    location = '🐳 Docker Container';
    emoji = '🐳';
  }

  console.log(`   Host: ${host}`);
  console.log(`   ${emoji} Location: ${location}`);
  console.log('');

  return { url, host, location, isLocal, isSupabase, isDocker };
}

// Check all connection strings
console.log('═══════════════════════════════════════\n');

const db = analyzeConnectionString(databaseUrl, 'DATABASE_URL');
const pg = analyzeConnectionString(postgresUrl, 'POSTGRES_URL');

console.log('═══════════════════════════════════════\n');

// Determine which one is being used
console.log('📊 Analysis:\n');

const usedUrl = databaseUrl || postgresUrl;

if (!usedUrl) {
  console.log('❌ NO DATABASE CONNECTION STRING FOUND!');
  console.log('   App cannot connect to any database.\n');
  process.exit(1);
}

if (databaseUrl) {
  console.log('✅ App is using: DATABASE_URL');
  if (db.isLocal) {
    console.log('   🏠 Data is stored on LOCAL MACHINE');
    console.log('   📂 Location: Your computer (localhost)');
    console.log('   ⚠️  Only accessible from this machine');
  } else if (db.isSupabase) {
    console.log('   🚀 Data is stored on SUPABASE PRODUCTION');
    console.log('   📂 Location: Supabase cloud servers');
    console.log('   ✅ Accessible from anywhere with internet');
  } else if (db.isDocker) {
    console.log('   🐳 Data is stored in DOCKER CONTAINER');
    console.log('   📂 Location: Docker container on this machine');
    console.log('   ⚠️  Data lost when container stops');
  }
} else if (postgresUrl) {
  console.log('⚠️  App is using: POSTGRES_URL (fallback)');
  if (pg.isSupabase) {
    console.log('   🚀 Data is stored on SUPABASE PRODUCTION');
  }
}

console.log('');

// Supabase Dashboard check
if (supabaseUrl) {
  console.log('🔗 Supabase Dashboard:');
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
  if (projectId) {
    console.log(`   https://supabase.com/dashboard/project/${projectId}`);
  }
  console.log('');
}

// Summary
console.log('═══════════════════════════════════════\n');
console.log('📝 Summary:\n');

if (db?.isSupabase || pg?.isSupabase) {
  console.log('✅ Your data is stored in SUPABASE CLOUD');
  console.log('   • Safe, backed up, always available');
  console.log('   • Accessible from anywhere');
  console.log('   • View in Supabase Dashboard');
  console.log('');
  console.log('🧪 To verify data:');
  console.log('   1. npm run db:debug');
  console.log('   2. Open Supabase Dashboard → Table Editor');
} else if (db?.isLocal || pg?.isLocal) {
  console.log('⚠️  Your data is stored LOCALLY');
  console.log('   • Only on this computer');
  console.log('   • NOT backed up to cloud');
  console.log('   • Lost if computer crashes');
  console.log('');
  console.log('💡 To use Supabase instead:');
  console.log('   Update DATABASE_URL in .env to Supabase connection string');
} else if (db?.isDocker || pg?.isDocker) {
  console.log('⚠️  Your data is in Docker container');
  console.log('   • Temporary storage');
  console.log('   • Lost when container stops');
  console.log('   • Use for development only');
}

console.log('');
