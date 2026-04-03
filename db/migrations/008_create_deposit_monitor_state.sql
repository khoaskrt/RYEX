BEGIN;

CREATE TABLE IF NOT EXISTS public.deposit_monitor_state (
  wallet_id UUID PRIMARY KEY REFERENCES public.user_wallets(wallet_id) ON DELETE CASCADE,
  chain TEXT NOT NULL,
  last_scanned_block BIGINT NOT NULL DEFAULT 0,
  last_scan_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deposit_monitor_state_chain
  ON public.deposit_monitor_state(chain);
CREATE INDEX IF NOT EXISTS idx_deposit_monitor_state_updated_at
  ON public.deposit_monitor_state(updated_at);

COMMIT;
