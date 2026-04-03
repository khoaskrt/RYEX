'use client';

import { useState } from 'react';

// Mock order book data
const generateMockOrders = (side, count = 15) => {
  return Array.from({ length: count }, (_, i) => ({
    price: side === 'sell' ? 70900 + i * 10 : 70800 - i * 10,
    amount: (Math.random() * 2).toFixed(4),
    total: (Math.random() * 140000).toFixed(2),
  }));
};

export default function OrderBook() {
  const [viewMode, setViewMode] = useState('both'); // 'buy', 'sell', 'both'

  const sellOrders = generateMockOrders('sell', 15);
  const buyOrders = generateMockOrders('buy', 15);

  const renderOrderRow = (order, side) => {
    const isRed = side === 'sell';
    return (
      <div
        key={`${side}-${order.price}`}
        className="group grid grid-cols-3 gap-2 px-3 py-0.5 text-xs hover:bg-surface-container-low cursor-pointer"
      >
        <span className={`font-mono font-bold ${isRed ? 'text-[#ba1a1a]' : 'text-[#01bc8d]'}`}>
          {order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        <span className="font-mono text-right text-on-surface">{order.amount}</span>
        <span className="font-mono text-right text-on-surface-variant">{order.total}</span>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Header */}
      <div className="border-b border-[#bbcac1]/15 px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-on-surface">Sổ lệnh</h3>
          <div className="flex gap-1">
            <button
              className={`p-1 rounded ${viewMode === 'both' ? 'bg-primary-container/20 text-primary' : 'text-outline hover:text-on-surface'}`}
              onClick={() => setViewMode('both')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">view_headline</span>
            </button>
            <button
              className={`p-1 rounded ${viewMode === 'sell' ? 'bg-primary-container/20 text-primary' : 'text-outline hover:text-on-surface'}`}
              onClick={() => setViewMode('sell')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">expand_less</span>
            </button>
            <button
              className={`p-1 rounded ${viewMode === 'buy' ? 'bg-primary-container/20 text-primary' : 'text-outline hover:text-on-surface'}`}
              onClick={() => setViewMode('buy')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-2 px-3 text-xs font-medium text-on-surface-variant">
          <span>Giá (USDT)</span>
          <span className="text-right">Số lượng (BTC)</span>
          <span className="text-right">Tổng</span>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
        {/* Sell Orders */}
        {(viewMode === 'both' || viewMode === 'sell') && (
          <div className="flex flex-col-reverse py-1">
            {sellOrders.slice(0, viewMode === 'both' ? 8 : 15).map((order) => renderOrderRow(order, 'sell'))}
          </div>
        )}

        {/* Current Price */}
        <div className="sticky top-0 z-10 border-y border-[#bbcac1]/15 bg-surface-container px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-[#01bc8d]">70,863.45</span>
            <span className="text-xs text-on-surface-variant">$70,863.45</span>
          </div>
        </div>

        {/* Buy Orders */}
        {(viewMode === 'both' || viewMode === 'buy') && (
          <div className="py-1">
            {buyOrders.slice(0, viewMode === 'both' ? 8 : 15).map((order) => renderOrderRow(order, 'buy'))}
          </div>
        )}
      </div>
    </div>
  );
}
