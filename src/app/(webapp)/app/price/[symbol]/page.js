import PricePage from '@/app/price/page';
import { getMarketPriceDetail } from '@/server/market/SpotMarket';

const SYMBOL_TO_PAIR = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  BNB: 'BNBUSDT',
  XRP: 'XRPUSDT',
  ADA: 'ADAUSDT',
  TAO: 'TAOUSDT',
};

export default async function TokenPriceDetailPage({ params }) {
  const symbol = (params?.symbol || 'BTC').toUpperCase();
  const mappedPair = SYMBOL_TO_PAIR[symbol] || `${symbol}USDT`;
  let marketData = null;

  try {
    marketData = await getMarketPriceDetail(mappedPair);
  } catch (error) {
    console.error('Price detail preload failed:', error);
  }

  return <PricePage searchParams={{ symbol: mappedPair }} data={marketData} />;
}
