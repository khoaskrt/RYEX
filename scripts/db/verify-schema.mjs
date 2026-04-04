/**
 * Verifies that core public tables exist on Supabase (service role).
 * Run: npm run db:verify
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** Bắt buộc cho core profile + assets + wallet + auth log */
const TABLES_REQUIRED = [
  'users',
  'user_assets',
  'user_wallets',
  'wallet_transactions',
  'deposit_monitor_state',
  'withdraw_limits',
  'auth_identities',
  'auth_verification_events',
  'auth_login_events',
  'user_sessions',
  'audit_events',
];

/** Tùy chọn: login-challenge trusted device — có thể chưa migrate nếu FK legacy chưa xử lý */
const TABLES_OPTIONAL = ['trusted_devices'];

async function tableExists(name) {
  const { error } = await supabase.from(name).select('*').limit(0);
  if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
    return false;
  }
  if (error) {
    console.error(`Query error on ${name}:`, error.message);
    return false;
  }
  return true;
}

console.log('Verifying public tables (Supabase REST)...\n');

let failed = false;
for (const t of TABLES_REQUIRED) {
  const ok = await tableExists(t);
  console.log(`${ok ? '✅' : '❌'} ${t}`);
  if (!ok) failed = true;
}

for (const t of TABLES_OPTIONAL) {
  const ok = await tableExists(t);
  console.log(`${ok ? '✅' : '⚠️ optional (missing)'} ${t}`);
}

if (failed) {
  console.log('\nApply migrations in order: see db/README.md (§2 Track A).');
  process.exit(1);
}

console.log('\n✅ All required tables exist.');
