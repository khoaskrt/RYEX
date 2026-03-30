const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];
const DEFAULT_BASE_URL = 'https://data-api.binance.vision';
const DEFAULT_COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const DEFAULT_CACHE_TTL_MS = 5000;
const DEFAULT_TIMEOUT_MS = 4500;

const SYMBOL_NAME_MAP = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  SOLUSDT: 'Solana',
  BNBUSDT: 'BNB',
  XRPUSDT: 'XRP',
  ADAUSDT: 'Cardano',
};

const SYMBOL_COINGECKO_ID_MAP = {
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  SOLUSDT: 'solana',
  BNBUSDT: 'binancecoin',
  XRPUSDT: 'ripple',
  ADAUSDT: 'cardano',
};

let marketCache = {
  cachedAt: 0,
  payload: null,
};

function parseSymbols(envValue) {
  if (!envValue) return DEFAULT_SYMBOLS;
  const symbols = envValue
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  return symbols.length > 0 ? symbols : DEFAULT_SYMBOLS;
}

function toNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoTime(input, fallbackIso) {
  const millis = Number.parseInt(input, 10);
  if (!Number.isFinite(millis)) return fallbackIso;
  return new Date(millis).toISOString();
}

function formatUsdCompact(value) {
  const number = toNumber(value, 0);
  if (number <= 0) return '--';
  return `$${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)}`;
}

function normalizeTicker(rawTicker, fallbackName, fetchedAtIso) {
  const changePercent = toNumber(rawTicker.priceChangePercent, 0);

  return {
    symbol: rawTicker.symbol,
    name: fallbackName,
    price: rawTicker.lastPrice ?? '0',
    change24hPercent: rawTicker.priceChangePercent ?? '0',
    volume24h: rawTicker.quoteVolume ?? '0',
    marketCapDisplay: '--',
    isUp: changePercent >= 0,
    updatedAt: toIsoTime(rawTicker.closeTime, fetchedAtIso),
  };
}

function buildTickerUrl(baseUrl, symbols) {
  const url = new URL('/api/v3/ticker/24hr', baseUrl);
  url.searchParams.set('symbols', JSON.stringify(symbols));
  return url.toString();
}

function buildCoinGeckoUrl(baseUrl, ids) {
  const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, '')}/`;
  const url = new URL('simple/price', normalizedBaseUrl);
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_market_cap', 'true');
  url.searchParams.set('ids', ids.join(','));
  return url.toString();
}

async function fetchMarketCapsFromCoinGecko(symbols) {
  const demoApiKey = process.env.COINGECKO_API_KEY || '';
  const proApiKey = process.env.COINGECKO_PRO_API_KEY || '';
  const baseUrl = process.env.COINGECKO_BASE_URL || DEFAULT_COINGECKO_BASE_URL;

  const ids = symbols.map((symbol) => SYMBOL_COINGECKO_ID_MAP[symbol]).filter(Boolean);
  if ((!demoApiKey && !proApiKey) || ids.length === 0) {
    return {};
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers = proApiKey
      ? { 'x-cg-pro-api-key': proApiKey }
      : { 'x-cg-demo-api-key': demoApiKey };

    const response = await fetch(buildCoinGeckoUrl(baseUrl, ids), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers,
    });

    if (!response.ok) {
      return {};
    }

    const body = await response.json();
    const marketCapsBySymbol = {};

    for (const symbol of symbols) {
      const coinId = SYMBOL_COINGECKO_ID_MAP[symbol];
      const coinData = coinId ? body?.[coinId] : null;
      marketCapsBySymbol[symbol] = formatUsdCompact(coinData?.usd_market_cap);
    }

    return marketCapsBySymbol;
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTickersFromBinance() {
  const symbols = parseSymbols(process.env.MARKET_SYMBOLS);
  const baseUrl = process.env.BINANCE_MARKET_BASE_URL || DEFAULT_BASE_URL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const fetchedAtIso = new Date().toISOString();

  try {
    const response = await fetch(buildTickerUrl(baseUrl, symbols), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`Binance upstream returned ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    const body = await response.json();
    const tickers = Array.isArray(body) ? body : [body];
    const tickerBySymbol = new Map(
      tickers
        .filter((item) => item && typeof item.symbol === 'string')
        .map((item) => [item.symbol.toUpperCase(), item])
    );

    const marketCapsBySymbol = await fetchMarketCapsFromCoinGecko(symbols);

    const data = symbols
      .map((symbol) => {
        const ticker = tickerBySymbol.get(symbol);
        if (!ticker) return null;
        const normalized = normalizeTicker(ticker, SYMBOL_NAME_MAP[symbol] || symbol.replace(/USDT$/, ''), fetchedAtIso);
        return {
          ...normalized,
          marketCapDisplay: marketCapsBySymbol[symbol] || '--',
        };
      })
      .filter(Boolean);

    if (data.length === 0) {
      throw new Error('Binance returned an empty ticker set for configured symbols');
    }

    return {
      data,
      fetchedAt: fetchedAtIso,
      stale: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getMarketTickers() {
  const now = Date.now();
  if (marketCache.payload && now - marketCache.cachedAt < DEFAULT_CACHE_TTL_MS) {
    return marketCache.payload;
  }

  try {
    const payload = await fetchTickersFromBinance();
    marketCache = {
      payload,
      cachedAt: now,
    };
    return payload;
  } catch (error) {
    if (marketCache.payload) {
      return {
        ...marketCache.payload,
        stale: true,
      };
    }

    const wrappedError = new Error(error.message || 'Failed to fetch market tickers');
    wrappedError.statusCode = 503;
    throw wrappedError;
  }
}
