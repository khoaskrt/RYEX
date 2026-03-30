const DEFAULT_REFRESH_MS = 10000;

export function getMarketRefreshIntervalMs() {
  const raw = process.env.NEXT_PUBLIC_MARKET_REFRESH_MS || process.env.MARKET_REFRESH_MS;
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_REFRESH_MS;
}

export async function fetchMarketTickers() {
  const response = await fetch('/api/v1/market/tickers', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch market tickers: ${response.status}`);
  }

  return response.json();
}

function safeNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatUsdPrice(value) {
  const number = safeNumber(value, 0);
  return `$${number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercentChange(value) {
  const number = safeNumber(value, 0);
  const sign = number > 0 ? '+' : '';
  return `${sign}${number.toFixed(2)}%`;
}

export function formatUsdCompact(value) {
  const number = safeNumber(value, 0);
  return `$${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)}`;
}
