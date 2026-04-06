export const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', name: 'Bitcoin' },
];

export const ORDER_TYPES = {
  LIMIT: 'limit',
  MARKET: 'market',
};

export const ORDER_SIDES = {
  BUY: 'buy',
  SELL: 'sell',
};

export const TIME_IN_FORCE = {
  GTC: 'GTC',
};

export const CHART_INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

export const TRADING_POLLING_MS = 10000;
