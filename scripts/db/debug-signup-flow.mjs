#!/usr/bin/env node
/**
 * Script debug signup flow
 * Kiểm tra xem data có được lưu vào Supabase không
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debug() {
  console.log('🔍 Debugging signup flow...\n');

  try {
    // 1. Check users table
    console.log('1️⃣ Checking users table...');
    const { data: users, error: usersError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) throw usersError;

    console.log(`   ✅ Total users: ${count}`);
    if (users && users.length > 0) {
      console.log('   Latest users:');
      users.forEach(u => {
        console.log(`     - ${u.email} (${u.status}) created: ${u.created_at}`);
      });
    } else {
      console.log('   ⚠️  No users found in database!');
    }
    console.log('');

    // 2. Check auth_identities
    console.log('2️⃣ Checking auth_identities...');
    const { data: identities, error: identitiesError } = await supabase
      .from('auth_identities')
      .select('email, email_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (identitiesError) throw identitiesError;

    console.log(`   ✅ Total identities: ${identities?.length || 0}`);
    if (identities && identities.length > 0) {
      identities.forEach(i => {
        console.log(`     - ${i.email} verified: ${i.email_verified}`);
      });
    }
    console.log('');

    // 3. Check database connection
    console.log('3️⃣ Checking DATABASE_URL env var...');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      console.log(`   ✅ DATABASE_URL: ${dbUrl.substring(0, 50)}...`);
    } else {
      console.log('   ⚠️  DATABASE_URL not set! Code might not connect to DB.');
    }
    console.log('');

    // 4. Check auth_verification_events
    console.log('4️⃣ Checking recent auth events...');
    const { data: events, error: eventsError } = await supabase
      .from('auth_verification_events')
      .select('email, event_type, event_status, occurred_at')
      .order('occurred_at', { ascending: false })
      .limit(5);

    if (eventsError) throw eventsError;

    console.log(`   ✅ Total events: ${events?.length || 0}`);
    if (events && events.length > 0) {
      events.forEach(e => {
        console.log(`     - ${e.email}: ${e.event_type} (${e.event_status})`);
      });
    }
    console.log('');

    // 5. Diagnosis
    console.log('📋 DIAGNOSIS:');
    if (count === 0) {
      console.log('   ❌ NO DATA IN DATABASE');
      console.log('   Possible reasons:');
      console.log('   1. Tables chưa được tạo → Run SQL migrations');
      console.log('   2. Code đang connect đến DB khác');
      console.log('   3. Signup flow có lỗi (check server logs)');
      console.log('');
      console.log('   🔧 Next steps:');
      console.log('   1. Run: npm run dev');
      console.log('   2. Signup 1 user mới');
      console.log('   3. Check terminal logs có lỗi gì không');
      console.log('   4. Run script này lại để verify');
    } else {
      console.log('   ✅ Data is being saved correctly!');
      console.log(`   Found ${count} users in database.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Ran supabase-complete-schema.sql in Supabase Dashboard');
    console.error('   2. DATABASE_URL is set in .env');
    console.error('   3. Supabase connection is working');
  }
}

debug();
