import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Seeding user_assets with test data...\n');

// Get the first user (for testing)
const { data: users, error: userError } = await supabase
  .from('users')
  .select('id, email')
  .limit(1);

if (userError || !users || users.length === 0) {
  console.log('❌ No users found. Please create a user first via signup.');
  process.exit(1);
}

const testUser = users[0];
console.log(`Found user: ${testUser.email} (${testUser.id})\n`);

// Demo assets to seed
const demoAssets = [
  { symbol: 'BTC', balance: '0.58291000', account_type: 'funding' },
  { symbol: 'BTC', balance: '0.12000000', account_type: 'trading' },
  { symbol: 'ETH', balance: '2.45678900', account_type: 'funding' },
  { symbol: 'USDT', balance: '1000.00000000', account_type: 'trading' },
  { symbol: 'BNB', balance: '5.50000000', account_type: 'funding' },
];

console.log('Inserting demo assets...\n');

for (const asset of demoAssets) {
  const { data, error } = await supabase
    .from('user_assets')
    .upsert({
      user_id: testUser.id,
      symbol: asset.symbol,
      balance: asset.balance,
      account_type: asset.account_type,
    }, {
      onConflict: 'user_id,symbol,account_type',
    })
    .select();

  if (error) {
    console.log(`❌ Failed to insert ${asset.symbol} (${asset.account_type}):`, error.message);
  } else {
    console.log(`✅ Inserted ${asset.symbol} ${asset.balance} (${asset.account_type})`);
  }
}

console.log('\n✅ Seed completed! Test the Assets page now.');
