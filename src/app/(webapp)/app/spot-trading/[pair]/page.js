import { SpotTradingModulePage } from '@/features/spot-trading';
import { TRADING_PAIRS } from '@/features/spot-trading/constants';

function normalizePairSegment(rawPair) {
  const cleaned = String(rawPair || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '');

  return cleaned;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const normalized = normalizePairSegment(resolvedParams?.pair);
  const activePair = TRADING_PAIRS.find((pair) => pair.symbol === normalized) || TRADING_PAIRS[0];
  const titlePair = `${activePair.base}-${activePair.quote}`;

  return {
    title: `Giao dịch giao ngay ${titlePair} - RYEX`,
    description: `Giao dịch ${titlePair} với các công cụ toàn diện trên RYEX`,
  };
}

export default async function SpotTradingPairPage({ params }) {
  const resolvedParams = await params;
  const normalized = normalizePairSegment(resolvedParams?.pair);
  const activePair = TRADING_PAIRS.find((pair) => pair.symbol === normalized) || TRADING_PAIRS[0];

  return <SpotTradingModulePage initialPair={activePair.symbol} />;
}
