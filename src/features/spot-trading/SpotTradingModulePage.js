'use client';

import TradingHeader from './components/TradingHeader';
import TradingChart from './components/TradingChart';
import OrderBook from './components/OrderBook';
import RecentTrades from './components/RecentTrades';
import TradingForm from './components/TradingForm';
import OpenOrders from './components/OpenOrders';
import { ORDER_SIDES } from './constants';

export function SpotTradingModulePage() {
  const currentPair = 'BTCUSDT';

  return (
    <div className="flex h-screen flex-col bg-surface">
      {/* Trading Header */}
      <TradingHeader currentPair={currentPair} />

      {/* Main Trading Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: OrderBook + Recent Trades */}
        <div className="flex w-80 flex-col border-r border-[#bbcac1]/15">
          <div className="h-1/2 border-b border-[#bbcac1]/15">
            <OrderBook />
          </div>
          <div className="h-1/2">
            <RecentTrades />
          </div>
        </div>

        {/* Center Column: Chart + Open Orders */}
        <div className="flex flex-1 flex-col">
          <div className="h-2/3 border-b border-[#bbcac1]/15">
            <TradingChart />
          </div>
          <div className="h-1/3">
            <OpenOrders />
          </div>
        </div>

        {/* Right Column: Trading Forms (Buy/Sell) */}
        <div className="flex w-96 border-l border-[#bbcac1]/15">
          <div className="w-1/2 border-r border-[#bbcac1]/15">
            <TradingForm side={ORDER_SIDES.BUY} />
          </div>
          <div className="w-1/2">
            <TradingForm side={ORDER_SIDES.SELL} />
          </div>
        </div>
      </div>
    </div>
  );
}
