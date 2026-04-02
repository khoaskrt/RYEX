const TOKEN_ICON_MAP = {
  BTC: '/images/tokens/btc.png',
  ETH: '/images/tokens/eth.png',
  SOL: '/images/tokens/sol.png',
  BNB: '/images/tokens/bnb.png',
  XRP: '/images/tokens/xrp.png',
  ADA: '/images/tokens/ada.png',
  USDT: '/images/tokens/usdt.svg',
};

export function getTokenIconUrl(symbol, iconUrl = '') {
  if (typeof iconUrl === 'string' && iconUrl.trim().length > 0) {
    return iconUrl;
  }

  const normalizedSymbol = String(symbol || '').trim().toUpperCase();
  return TOKEN_ICON_MAP[normalizedSymbol] || '';
}

