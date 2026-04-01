-- Create user_assets table (Current Truth)
-- Date: 2026-04-01
-- Purpose:
--   Add baseline storage for user asset balances consumed by
--   GET /api/v1/user/assets.

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_assets (
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  account_type TEXT NOT NULL,
  balance NUMERIC(36, 18) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_assets_pkey'
      AND conrelid = 'public.user_assets'::regclass
  ) THEN
    ALTER TABLE public.user_assets
      ADD CONSTRAINT user_assets_pkey
      PRIMARY KEY (user_id, symbol, account_type);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_assets_user_id_fkey'
      AND conrelid = 'public.user_assets'::regclass
  ) THEN
    ALTER TABLE public.user_assets
      ADD CONSTRAINT user_assets_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.users(supa_id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_assets_account_type_check'
      AND conrelid = 'public.user_assets'::regclass
  ) THEN
    ALTER TABLE public.user_assets
      ADD CONSTRAINT user_assets_account_type_check
      CHECK (account_type IN ('funding', 'trading'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_assets_symbol
  ON public.user_assets(symbol);

COMMENT ON TABLE public.user_assets IS
  'User asset balances by account type, consumed by /api/v1/user/assets.';

COMMENT ON COLUMN public.user_assets.user_id IS
  'Supabase Auth user id (maps to public.users.supa_id).';

COMMENT ON COLUMN public.user_assets.symbol IS
  'Asset symbol, e.g. BTC, ETH.';

COMMENT ON COLUMN public.user_assets.account_type IS
  'Account bucket: funding or trading.';

COMMENT ON COLUMN public.user_assets.balance IS
  'Asset quantity for the given user/symbol/account_type.';

ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_assets_select_own ON public.user_assets;
DROP POLICY IF EXISTS user_assets_insert_own ON public.user_assets;
DROP POLICY IF EXISTS user_assets_update_own ON public.user_assets;
DROP POLICY IF EXISTS user_assets_delete_own ON public.user_assets;

CREATE POLICY user_assets_select_own
ON public.user_assets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY user_assets_insert_own
ON public.user_assets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_assets_update_own
ON public.user_assets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_assets_delete_own
ON public.user_assets
FOR DELETE
USING (auth.uid() = user_id);

COMMIT;
