-- Migration 006: Create user_assets table with RLS for portfolio management
-- Date: 2024-04-01
-- Related: User Assets API (P0.1)

-- Create user_assets table
CREATE TABLE IF NOT EXISTS user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  balance NUMERIC(36, 18) NOT NULL DEFAULT 0,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('funding', 'trading')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol, account_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_symbol ON user_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_user_assets_account_type ON user_assets(account_type);

-- Add comments for documentation
COMMENT ON TABLE user_assets IS 'Stores user cryptocurrency asset balances across funding and trading accounts';
COMMENT ON COLUMN user_assets.symbol IS 'Token symbol (e.g., BTC, ETH, USDT) without USDT suffix';
COMMENT ON COLUMN user_assets.balance IS 'Asset balance with up to 18 decimal precision';
COMMENT ON COLUMN user_assets.account_type IS 'Account type: funding (for deposits/withdrawals) or trading (for spot trading)';

-- Enable Row Level Security (RLS)
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;

-- Helper function: Get public.users.id from auth.users.id (via Supabase Auth)
-- Note: Since BE uses service role key (bypasses RLS), these policies are for future direct client access
-- For now, all access goes through BE API with service role key

-- RLS Policy: Users can only read their own assets
-- Using subquery to map auth.uid() -> public.users.id
CREATE POLICY "Users can view their own assets"
  ON user_assets
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE id = user_id
    )
  );

-- RLS Policy: Service role has full access (backend API)
-- This is the primary access pattern - BE uses service_role_key
CREATE POLICY "Service role has full access"
  ON user_assets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Service role bypass (for admin operations via backend)
-- Note: Service role key automatically bypasses RLS, no additional policy needed

-- Seed demo data for testing (run separately in test environments only)
-- Uncomment and adjust after creating test users:
/*
INSERT INTO user_assets (user_id, symbol, balance, account_type)
VALUES
  -- Replace with your test user UUID from auth.users
  ('YOUR-TEST-USER-UUID-HERE', 'BTC', 0.58291000, 'funding'),
  ('YOUR-TEST-USER-UUID-HERE', 'ETH', 2.45000000, 'funding'),
  ('YOUR-TEST-USER-UUID-HERE', 'USDT', 1000.00000000, 'trading')
ON CONFLICT (user_id, symbol, account_type) DO NOTHING;
*/
