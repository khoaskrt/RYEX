BEGIN;

CREATE TABLE IF NOT EXISTS public.spot_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(supa_id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  price NUMERIC(36, 18),
  amount NUMERIC(36, 18) NOT NULL,
  filled_amount NUMERIC(36, 18) NOT NULL DEFAULT 0,
  time_in_force TEXT NOT NULL DEFAULT 'GTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  filled_at TIMESTAMPTZ,

  CONSTRAINT spot_orders_symbol_check CHECK (symbol = 'BTCUSDT'),
  CONSTRAINT spot_orders_side_check CHECK (side IN ('buy', 'sell')),
  CONSTRAINT spot_orders_type_check CHECK (type IN ('market', 'limit')),
  CONSTRAINT spot_orders_status_check CHECK (status IN ('open', 'partial', 'filled', 'cancelled')),
  CONSTRAINT spot_orders_tif_check CHECK (time_in_force = 'GTC'),
  CONSTRAINT spot_orders_amount_positive_check CHECK (amount > 0),
  CONSTRAINT spot_orders_price_positive_check CHECK (price IS NULL OR price > 0),
  CONSTRAINT spot_orders_filled_amount_check CHECK (filled_amount >= 0 AND filled_amount <= amount),
  CONSTRAINT spot_orders_price_required_for_limit_check CHECK (
    (type = 'market' AND price IS NULL)
    OR (type = 'limit' AND price IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.spot_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.spot_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(supa_id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  price NUMERIC(36, 18) NOT NULL,
  amount NUMERIC(36, 18) NOT NULL,
  fee NUMERIC(36, 18) NOT NULL DEFAULT 0,
  fee_asset TEXT NOT NULL DEFAULT 'USDT',
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT spot_trades_symbol_check CHECK (symbol = 'BTCUSDT'),
  CONSTRAINT spot_trades_side_check CHECK (side IN ('buy', 'sell')),
  CONSTRAINT spot_trades_price_positive_check CHECK (price > 0),
  CONSTRAINT spot_trades_amount_positive_check CHECK (amount > 0),
  CONSTRAINT spot_trades_fee_non_negative_check CHECK (fee >= 0)
);

CREATE INDEX IF NOT EXISTS idx_spot_orders_user_status
  ON public.spot_orders(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spot_orders_user_symbol
  ON public.spot_orders(user_id, symbol, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spot_trades_user_executed
  ON public.spot_trades(user_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_spot_trades_symbol_executed
  ON public.spot_trades(symbol, executed_at DESC);

ALTER TABLE public.spot_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spot_orders_select_own ON public.spot_orders;
CREATE POLICY spot_orders_select_own
ON public.spot_orders
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS spot_trades_select_own ON public.spot_trades;
CREATE POLICY spot_trades_select_own
ON public.spot_trades
FOR SELECT
USING (auth.uid() = user_id);

COMMIT;
