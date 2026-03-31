const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'SOLUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'TRXUSDT',
  'TONUSDT',
  'AVAXUSDT',
  'SHIBUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'BCHUSDT',
  'NEARUSDT',
  'LTCUSDT',
  'UNIUSDT',
  'APTUSDT',
  'ICPUSDT',
  'ETCUSDT',
  'FILUSDT',
  'ATOMUSDT',
  'XLMUSDT',
  'ARBUSDT',
  'OPUSDT',
  'VETUSDT',
  'ALGOUSDT',
  'INJUSDT',
  'AAVEUSDT',
  'MKRUSDT',
  'RENDERUSDT',
  'IMXUSDT',
  'GRTUSDT',
  'SANDUSDT',
  'MANAUSDT',
  'THETAUSDT',
  'EOSUSDT',
  'SEIUSDT',
  'STXUSDT',
  'PEPEUSDT',
  'FLOKIUSDT',
  'BONKUSDT',
  'JUPUSDT',
  'WIFUSDT',
  'FTMUSDT',
  'HBARUSDT',
  'SUIUSDT',
  'LDOUSDT',
  'EGLDUSDT',
  'CAKEUSDT',
];
const DEFAULT_BASE_URL = 'https://data-api.binance.vision';
const DEFAULT_COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const DEFAULT_CACHE_TTL_MS = 5000;
const DEFAULT_TIMEOUT_MS = 4500;

const SYMBOL_NAME_MAP = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  BNBUSDT: 'BNB',
  XRPUSDT: 'XRP',
  SOLUSDT: 'Solana',
  ADAUSDT: 'Cardano',
  DOGEUSDT: 'Dogecoin',
  TRXUSDT: 'TRON',
  TONUSDT: 'Toncoin',
  AVAXUSDT: 'Avalanche',
  SHIBUSDT: 'Shiba Inu',
  DOTUSDT: 'Polkadot',
  LINKUSDT: 'Chainlink',
  BCHUSDT: 'Bitcoin Cash',
  NEARUSDT: 'NEAR Protocol',
  LTCUSDT: 'Litecoin',
  UNIUSDT: 'Uniswap',
  APTUSDT: 'Aptos',
  ICPUSDT: 'Internet Computer',
  ETCUSDT: 'Ethereum Classic',
  FILUSDT: 'Filecoin',
  ATOMUSDT: 'Cosmos',
  XLMUSDT: 'Stellar',
  ARBUSDT: 'Arbitrum',
  OPUSDT: 'Optimism',
  VETUSDT: 'VeChain',
  ALGOUSDT: 'Algorand',
  INJUSDT: 'Injective',
  AAVEUSDT: 'Aave',
  MKRUSDT: 'Maker',
  RENDERUSDT: 'Render',
  IMXUSDT: 'Immutable',
  GRTUSDT: 'The Graph',
  SANDUSDT: 'The Sandbox',
  MANAUSDT: 'Decentraland',
  THETAUSDT: 'Theta Network',
  EOSUSDT: 'EOS',
  SEIUSDT: 'Sei',
  STXUSDT: 'Stacks',
  PEPEUSDT: 'Pepe',
  FLOKIUSDT: 'Floki',
  BONKUSDT: 'Bonk',
  JUPUSDT: 'Jupiter',
  WIFUSDT: 'dogwifhat',
  FTMUSDT: 'Fantom',
  HBARUSDT: 'Hedera',
  SUIUSDT: 'Sui',
  LDOUSDT: 'Lido DAO',
  EGLDUSDT: 'MultiversX',
  CAKEUSDT: 'PancakeSwap',
};

const SYMBOL_COINGECKO_ID_MAP = {
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  BNBUSDT: 'binancecoin',
  XRPUSDT: 'ripple',
  SOLUSDT: 'solana',
  ADAUSDT: 'cardano',
  DOGEUSDT: 'dogecoin',
  TRXUSDT: 'tron',
  TONUSDT: 'the-open-network',
  AVAXUSDT: 'avalanche-2',
  SHIBUSDT: 'shiba-inu',
  DOTUSDT: 'polkadot',
  LINKUSDT: 'chainlink',
  BCHUSDT: 'bitcoin-cash',
  NEARUSDT: 'near',
  LTCUSDT: 'litecoin',
  UNIUSDT: 'uniswap',
  APTUSDT: 'aptos',
  ICPUSDT: 'internet-computer',
  ETCUSDT: 'ethereum-classic',
  FILUSDT: 'filecoin',
  ATOMUSDT: 'cosmos',
  XLMUSDT: 'stellar',
  ARBUSDT: 'arbitrum',
  OPUSDT: 'optimism',
  VETUSDT: 'vechain',
  ALGOUSDT: 'algorand',
  INJUSDT: 'injective-protocol',
  AAVEUSDT: 'aave',
  MKRUSDT: 'maker',
  RENDERUSDT: 'render-token',
  IMXUSDT: 'immutable-x',
  GRTUSDT: 'the-graph',
  SANDUSDT: 'the-sandbox',
  MANAUSDT: 'decentraland',
  THETAUSDT: 'theta-token',
  EOSUSDT: 'eos',
  SEIUSDT: 'sei-network',
  STXUSDT: 'blockstack',
  PEPEUSDT: 'pepe',
  FLOKIUSDT: 'floki',
  BONKUSDT: 'bonk',
  JUPUSDT: 'jupiter-exchange-solana',
  WIFUSDT: 'dogwifcoin',
  FTMUSDT: 'fantom',
  HBARUSDT: 'hedera-hashgraph',
  SUIUSDT: 'sui',
  LDOUSDT: 'lido-dao',
  EGLDUSDT: 'multiversx',
  CAKEUSDT: 'pancakeswap-token',
};

let marketCache = {
  cachedAt: 0,
  payload: null,
};
const marketPriceDetailCache = new Map();

function parseSymbols(envValue) {
  if (!envValue) return DEFAULT_SYMBOLS;
  const symbols = envValue
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  if (symbols.length === 0) return DEFAULT_SYMBOLS;

  // Keep compatibility with existing env overrides while guaranteeing
  // a minimum 50-token universe for market pagination requirements.
  return Array.from(new Set([...symbols, ...DEFAULT_SYMBOLS])).slice(0, DEFAULT_SYMBOLS.length);
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
    iconUrl: '',
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
  const url = new URL('coins/markets', normalizedBaseUrl);
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('ids', ids.join(','));
  url.searchParams.set('sparkline', 'false');
  url.searchParams.set('price_change_percentage', '24h');
  url.searchParams.set('locale', 'en');
  url.searchParams.set('per_page', String(ids.length));
  url.searchParams.set('page', '1');
  return url.toString();
}

function buildSingleTickerUrl(baseUrl, symbol) {
  const url = new URL('/api/v3/ticker/24hr', baseUrl);
  url.searchParams.set('symbol', symbol);
  return url.toString();
}

function formatUsdPrice(value) {
  const number = toNumber(value, 0);
  if (number <= 0) return '--';
  return `$${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)}`;
}

function formatPercent(value) {
  const number = toNumber(value, 0);
  const sign = number > 0 ? '+' : '';
  return `${sign}${number.toFixed(2)}%`;
}

function formatTokenSupply(value, symbol) {
  const number = toNumber(value, 0);
  if (number <= 0) return `-- ${symbol}`;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(number)} ${symbol}`;
}

function formatTokenVolume(value, symbol) {
  const number = toNumber(value, 0);
  if (number <= 0) return '--';
  return `${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(number)} ${symbol}`;
}

function getCoinGeckoHeaders() {
  const demoApiKey = process.env.COINGECKO_API_KEY || '';
  const proApiKey = process.env.COINGECKO_PRO_API_KEY || '';
  if (proApiKey) return { 'x-cg-pro-api-key': proApiKey };
  if (demoApiKey) return { 'x-cg-demo-api-key': demoApiKey };
  return null;
}

async function fetchCoinGeckoPriceDetail(symbol) {
  const coinId = SYMBOL_COINGECKO_ID_MAP[symbol];
  if (!coinId) return null;

  const headers = getCoinGeckoHeaders();
  const baseUrl = process.env.COINGECKO_BASE_URL || DEFAULT_COINGECKO_BASE_URL;
  const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, '')}/`;
  const url = new URL('coins/markets', normalizedBaseUrl);
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('ids', coinId);
  url.searchParams.set('sparkline', 'false');
  url.searchParams.set('price_change_percentage', '24h');
  url.searchParams.set('locale', 'en');
  url.searchParams.set('per_page', '1');
  url.searchParams.set('page', '1');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: headers || undefined,
    });
    if (!response.ok) return null;

    const body = await response.json();
    const coin = Array.isArray(body) ? body[0] : null;
    if (!coin) return null;

    return {
      marketCapDisplay: formatUsdCompact(coin.market_cap),
      circulatingSupplyDisplay: formatTokenSupply(coin.circulating_supply, symbol.replace(/USDT$/, '')),
      totalSupplyDisplay: formatTokenSupply(coin.max_supply || coin.total_supply, symbol.replace(/USDT$/, '')),
      rankDisplay: coin.market_cap_rank ? `#${coin.market_cap_rank}` : '--',
      iconUrl: coin.image || '',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBtcDominanceDisplay() {
  const headers = getCoinGeckoHeaders();
  const baseUrl = process.env.COINGECKO_BASE_URL || DEFAULT_COINGECKO_BASE_URL;
  const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, '')}/`;
  const url = new URL('global', normalizedBaseUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: headers || undefined,
    });
    if (!response.ok) return '--';

    const body = await response.json();
    const dominance = toNumber(body?.data?.market_cap_percentage?.btc, NaN);
    if (!Number.isFinite(dominance)) return '--';
    return `${dominance.toFixed(2)}%`;
  } catch {
    return '--';
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCoinGeckoSupplementalData(symbols) {
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
    const dataBySymbol = {};
    const coinById = new Map(
      (Array.isArray(body) ? body : [])
        .filter((item) => item && typeof item.id === 'string')
        .map((item) => [item.id, item])
    );

    for (const symbol of symbols) {
      const coinId = SYMBOL_COINGECKO_ID_MAP[symbol];
      const coinData = coinId ? coinById.get(coinId) : null;
      dataBySymbol[symbol] = {
        marketCapDisplay: formatUsdCompact(coinData?.market_cap),
        iconUrl: coinData?.image || '',
      };
    }

    return dataBySymbol;
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

    const coinGeckoDataBySymbol = await fetchCoinGeckoSupplementalData(symbols);

    const data = symbols
      .map((symbol) => {
        const ticker = tickerBySymbol.get(symbol);
        if (!ticker) return null;
        const normalized = normalizeTicker(ticker, SYMBOL_NAME_MAP[symbol] || symbol.replace(/USDT$/, ''), fetchedAtIso);
        const coinGeckoData = coinGeckoDataBySymbol[symbol] || {};
        return {
          ...normalized,
          marketCapDisplay: coinGeckoData.marketCapDisplay || '--',
          iconUrl: coinGeckoData.iconUrl || '',
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

function normalizeMarketPairSymbol(symbolInput) {
  const raw = String(symbolInput || 'BTCUSDT').trim().toUpperCase();
  return raw.endsWith('USDT') ? raw : `${raw}USDT`;
}

async function fetchMarketPriceDetail(symbolInput) {
  const symbol = normalizeMarketPairSymbol(symbolInput);
  const baseUrl = process.env.BINANCE_MARKET_BASE_URL || DEFAULT_BASE_URL;
  const fetchedAtIso = new Date().toISOString();
  const symbolShort = symbol.replace(/USDT$/, '');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(buildSingleTickerUrl(baseUrl, symbol), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`Binance upstream returned ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    const ticker = await response.json();
    const cgDetail = await fetchCoinGeckoPriceDetail(symbol);
    const btcDominance = symbol === 'BTCUSDT' ? await fetchBtcDominanceDisplay() : '--';

    return {
      symbol,
      symbolShort,
      name: SYMBOL_NAME_MAP[symbol] || symbolShort,
      priceDisplay: formatUsdPrice(ticker?.lastPrice),
      change24hPercent: toNumber(ticker?.priceChangePercent, 0),
      change24hDisplay: formatPercent(ticker?.priceChangePercent),
      high24hDisplay: formatUsdPrice(ticker?.highPrice),
      low24hDisplay: formatUsdPrice(ticker?.lowPrice),
      volumeTokenDisplay: formatTokenVolume(ticker?.volume, symbolShort),
      volumeUsdDisplay: formatUsdCompact(ticker?.quoteVolume),
      marketCapDisplay: cgDetail?.marketCapDisplay || '--',
      circulatingSupplyDisplay: cgDetail?.circulatingSupplyDisplay || `-- ${symbolShort}`,
      totalSupplyDisplay: cgDetail?.totalSupplyDisplay || `-- ${symbolShort}`,
      rankDisplay: cgDetail?.rankDisplay || '--',
      dominanceDisplay: btcDominance,
      iconUrl: cgDetail?.iconUrl || '',
      updatedAt: toIsoTime(ticker?.closeTime, fetchedAtIso),
      fetchedAt: fetchedAtIso,
      stale: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getMarketPriceDetail(symbolInput = 'BTCUSDT') {
  const symbol = normalizeMarketPairSymbol(symbolInput);
  const cacheEntry = marketPriceDetailCache.get(symbol);
  const now = Date.now();
  if (cacheEntry && now - cacheEntry.cachedAt < DEFAULT_CACHE_TTL_MS) {
    return cacheEntry.payload;
  }

  try {
    const payload = await fetchMarketPriceDetail(symbol);
    marketPriceDetailCache.set(symbol, { payload, cachedAt: now });
    return payload;
  } catch (error) {
    if (cacheEntry?.payload) {
      return {
        ...cacheEntry.payload,
        stale: true,
      };
    }
    const wrappedError = new Error(error.message || 'Failed to fetch market price detail');
    wrappedError.statusCode = 503;
    throw wrappedError;
  }
}
