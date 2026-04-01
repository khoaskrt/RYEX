-- Migration: Create user_assets table for portfolio management
-- Date: 2024-04-01
-- Related: User Assets API (P0.1)

-- Create user_assets table
CREATE TABLE IF NOT EXISTS user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  balance DECIMAL(36, 18) NOT NULL DEFAULT 0,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('funding', 'trading')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol, account_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_symbol ON user_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_user_assets_account_type ON user_assets(account_type);

-- Add comment for documentation
COMMENT ON TABLE user_assets IS 'Stores user cryptocurrency asset balances across funding and trading accounts';
COMMENT ON COLUMN user_assets.symbol IS 'Token symbol (e.g., BTC, ETH, USDT) without USDT suffix';
COMMENT ON COLUMN user_assets.balance IS 'Asset balance with up to 18 decimal precision';
COMMENT ON COLUMN user_assets.account_type IS 'Account type: funding (for deposits/withdrawals) or trading (for spot trading)';

-- Seed demo data for testing (optional - run separately for test environments)
-- INSERT INTO user_assets (user_id, symbol, balance, account_type)
-- SELECT
--   u.id,
--   'BTC',
--   0.58291000,
--   'funding'
-- FROM users u
-- WHERE u.email LIKE '%test%'
-- ON CONFLICT (user_id, symbol, account_type) DO NOTHING;
