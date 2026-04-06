'use client';

import AppTopNav from '@/shared/components/AppTopNav';
import TradingHeader from './components/TradingHeader';
import TradingChart from './components/TradingChart';
import OrderBook from './components/OrderBook';
import RecentTrades from './components/RecentTrades';
import TradingForm from './components/TradingForm';
import OpenOrders from './components/OpenOrders';
import { ORDER_SIDES, TRADING_PAIRS } from './constants';
import { useMarketData } from './hooks/useMarketData';

export function SpotTradingModulePage({ initialPair = 'BTCUSDT' }) {
  const normalizedPair = String(initialPair || '').toUpperCase();
  const activePair = TRADING_PAIRS.find((pair) => pair.symbol === normalizedPair) || TRADING_PAIRS[0];
  const currentPair = activePair.symbol;
  const marketData = useMarketData(currentPair);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      <AppTopNav activeSection="none" />

      <main className="min-h-screen pt-16">
        <TradingHeader currentPair={currentPair} pairName={activePair.name} ticker={marketData.ticker} />

        <div className="grid grid-cols-1 border-outline-variant/15 xl:min-h-[calc(100vh-4rem)] xl:grid-cols-[20rem_minmax(0,1fr)_24rem] xl:grid-rows-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex h-[560px] flex-col border-b border-outline-variant/15 xl:col-start-1 xl:row-span-2 xl:h-auto xl:border-b-0 xl:border-r">
            <div className="h-1/2 border-b border-outline-variant/15">
              <OrderBook orderBook={marketData.orderBook} ticker={marketData.ticker} />
            </div>
            <div className="h-1/2">
              <RecentTrades recentTrades={marketData.recentTrades} />
            </div>
          </div>

          <div className="h-[420px] border-b border-outline-variant/15 xl:col-start-2 xl:row-start-1 xl:h-auto">
            <TradingChart currentPair={currentPair} />
          </div>

          <div className="flex border-b border-outline-variant/15 xl:col-start-3 xl:row-span-2 xl:border-b-0 xl:border-l">
            <div className="w-1/2 border-r border-outline-variant/15">
              <TradingForm side={ORDER_SIDES.BUY} symbol={currentPair} marketTicker={marketData.ticker} />
            </div>
            <div className="w-1/2">
              <TradingForm side={ORDER_SIDES.SELL} symbol={currentPair} marketTicker={marketData.ticker} />
            </div>
          </div>

          <div className="h-[360px] xl:col-start-2 xl:row-start-2 xl:h-auto">
            <OpenOrders symbol={currentPair} />
          </div>
        </div>
      </main>
    </div>
  );
}
