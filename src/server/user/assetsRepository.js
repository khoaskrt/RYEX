import { createClient } from '../../shared/lib/supabase/server.js';
import { getMarketTickers } from '../market/SpotMarket.js';

/**
 * Fetch user's asset balances from database
 * @param {string} userId - User's Supabase UUID
 * @returns {Promise<Array>} Array of user assets with balance and account type
 */
export async function getUserAssetBalances(userId) {
  const supabaseAdmin = await createClient();

  // Fetch all user assets
  const { data: assets, error: assetsError } = await supabaseAdmin
    .from('user_assets')
    .select('symbol, balance, account_type')
    .eq('user_id', userId);

  if (assetsError) {
    const fetchError = new Error('Failed to fetch user assets');
    fetchError.code = 'ASSET_FETCH_FAILED';
    fetchError.statusCode = 500;
    throw fetchError;
  }

  return assets || [];
}

/**
 * Get current market prices for symbols
 * @param {Array<string>} symbols - Array of symbols (e.g., ['BTC', 'ETH'])
 * @returns {Promise<Map>} Map of symbol to price data
 */
async function getMarketPrices(symbols) {
  try {
    const marketData = await getMarketTickers();
    const priceMap = new Map();

    for (const ticker of marketData.data || []) {
      const symbolShort = ticker.symbol.replace(/USDT$/, '');
      if (symbols.includes(symbolShort)) {
        priceMap.set(symbolShort, {
          price: ticker.price,
          name: ticker.name,
          iconUrl: ticker.iconUrl,
        });
      }
    }

    return priceMap;
  } catch (error) {
    console.error('[assetsRepository] Failed to fetch market prices:', error);
    // Return empty map to allow graceful degradation
    return new Map();
  }
}

/**
 * Calculate asset value in USDT
 * @param {string} balance - Asset balance (string to preserve precision)
 * @param {string} price - Current market price in USDT
 * @returns {string} Value in USDT formatted to 2 decimals
 */
function calculateValueUSDT(balance, price) {
  const balanceNum = Number.parseFloat(balance) || 0;
  const priceNum = Number.parseFloat(price) || 0;
  const value = balanceNum * priceNum;
  return value.toFixed(2);
}

/**
 * Aggregate user assets and enrich with market data
 * @param {string} userId - User's Supabase UUID
 * @returns {Promise<Object>} Complete user assets payload
 */
export async function getUserAssetsPayload(userId) {
  const userAssets = await getUserAssetBalances(userId);

  // Get unique symbols
  const symbols = [...new Set(userAssets.map((asset) => asset.symbol))];
  const priceMap = await getMarketPrices(symbols);

  // Group by account type and symbol
  const assetsBySymbol = new Map();

  for (const asset of userAssets) {
    const existing = assetsBySymbol.get(asset.symbol) || {
      symbol: asset.symbol,
      fundingBalance: '0',
      tradingBalance: '0',
    };

    if (asset.account_type === 'funding') {
      existing.fundingBalance = asset.balance;
    } else if (asset.account_type === 'trading') {
      existing.tradingBalance = asset.balance;
    }

    assetsBySymbol.set(asset.symbol, existing);
  }

  // Build enriched asset list
  const enrichedAssets = [];
  let totalBalanceUSDT = 0;
  let fundingBalanceUSDT = 0;
  let tradingBalanceUSDT = 0;

  for (const [symbol, balances] of assetsBySymbol) {
    const marketData = priceMap.get(symbol);
    const price = marketData?.price || '0';
    const name = marketData?.name || symbol;
    const iconUrl = marketData?.iconUrl || '';

    const fundingBal = Number.parseFloat(balances.fundingBalance) || 0;
    const tradingBal = Number.parseFloat(balances.tradingBalance) || 0;
    const totalBalance = fundingBal + tradingBal;

    const valueUSDT = calculateValueUSDT(totalBalance.toString(), price);
    const fundingValueUSDT = calculateValueUSDT(balances.fundingBalance, price);
    const tradingValueUSDT = calculateValueUSDT(balances.tradingBalance, price);

    totalBalanceUSDT += Number.parseFloat(valueUSDT);
    fundingBalanceUSDT += Number.parseFloat(fundingValueUSDT);
    tradingBalanceUSDT += Number.parseFloat(tradingValueUSDT);

    enrichedAssets.push({
      symbol,
      name,
      balance: totalBalance.toFixed(8),
      price,
      valueUSDT,
      iconUrl,
      fundingBalance: balances.fundingBalance,
      tradingBalance: balances.tradingBalance,
    });
  }

  // Calculate BTC equivalents (assuming BTC is in the list)
  const btcPrice = Number.parseFloat(priceMap.get('BTC')?.price || '0');
  const totalBalanceBTC = btcPrice > 0 ? (totalBalanceUSDT / btcPrice).toFixed(8) : '0.00000000';
  const fundingBalanceBTC = btcPrice > 0 ? (fundingBalanceUSDT / btcPrice).toFixed(8) : '0.00000000';
  const tradingBalanceBTC = btcPrice > 0 ? (tradingBalanceUSDT / btcPrice).toFixed(8) : '0.00000000';

  return {
    totalBalanceBTC,
    totalBalanceUSDT: totalBalanceUSDT.toFixed(2),
    fundingAccount: {
      balanceBTC: fundingBalanceBTC,
      balanceUSDT: fundingBalanceUSDT.toFixed(2),
    },
    tradingAccount: {
      balanceBTC: tradingBalanceBTC,
      balanceUSDT: tradingBalanceUSDT.toFixed(2),
    },
    assets: enrichedAssets.sort((a, b) => Number.parseFloat(b.valueUSDT) - Number.parseFloat(a.valueUSDT)),
    fetchedAt: new Date().toISOString(),
  };
}
