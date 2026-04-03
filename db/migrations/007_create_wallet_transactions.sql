BEGIN;

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(supa_id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.user_wallets(wallet_id) ON DELETE SET NULL,

  tx_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  chain TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'funding',

  amount NUMERIC(36, 18) NOT NULL,
  requested_amount_usdt NUMERIC(36, 18),
  platform_fee_usdt NUMERIC(36, 18) NOT NULL DEFAULT 0,
  receive_amount_usdt NUMERIC(36, 18),
  network_fee_bnb NUMERIC(36, 18) NOT NULL DEFAULT 0,

  tx_hash TEXT,
  log_index INTEGER,
  from_address TEXT,
  to_address TEXT,
  block_number BIGINT,
  confirmations INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL,
  idempotency_key TEXT,
  error_code TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  CONSTRAINT wallet_transactions_type_check CHECK (tx_type IN ('deposit', 'withdraw')),
  CONSTRAINT wallet_transactions_status_check CHECK (status IN ('pending', 'confirming', 'completed', 'failed')),
  CONSTRAINT wallet_transactions_account_type_check CHECK (account_type IN ('funding', 'trading'))
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created
  ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status
  ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_chain_symbol
  ON public.wallet_transactions(chain, symbol);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_tx_hash
  ON public.wallet_transactions(tx_hash);

CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_transactions_deposit_event
  ON public.wallet_transactions(chain, tx_hash, log_index, to_address)
  WHERE tx_hash IS NOT NULL AND log_index IS NOT NULL AND tx_type = 'deposit';

CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_transactions_withdraw_idempotency
  ON public.wallet_transactions(user_id, tx_type, idempotency_key)
  WHERE idempotency_key IS NOT NULL AND tx_type = 'withdraw';

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wallet_transactions_select_own ON public.wallet_transactions;
CREATE POLICY wallet_transactions_select_own
ON public.wallet_transactions
FOR SELECT
USING (auth.uid() = user_id);

COMMIT;
