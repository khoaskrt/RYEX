export const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', name: 'Ethereum' },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', name: 'Solana' },
  { symbol: 'BNBUSDT', base: 'BNB', quote: 'USDT', name: 'BNB' },
  { symbol: 'XRPUSDT', base: 'XRP', quote: 'USDT', name: 'Ripple' },
];

export const ORDER_TYPES = {
  LIMIT: 'limit',
  MARKET: 'market',
  STOP_LIMIT: 'stop-limit',
};

export const ORDER_SIDES = {
  BUY: 'buy',
  SELL: 'sell',
};

export const TIME_IN_FORCE = {
  GTC: 'GTC', // Good Till Cancel
  IOC: 'IOC', // Immediate or Cancel
  FOK: 'FOK', // Fill or Kill
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
