'use client';

import { useMemo, useState } from 'react';

export default function OrderBook({ orderBook = null, ticker = null }) {
  const [viewMode, setViewMode] = useState('both');

  const asks = useMemo(() => {
    const rows = Array.isArray(orderBook?.asks) ? orderBook.asks : [];
    return rows.map((row) => ({ price: Number(row[0] || 0), amount: Number(row[1] || 0) }));
  }, [orderBook]);

  const bids = useMemo(() => {
    const rows = Array.isArray(orderBook?.bids) ? orderBook.bids : [];
    return rows.map((row) => ({ price: Number(row[0] || 0), amount: Number(row[1] || 0) }));
  }, [orderBook]);

  const renderOrderRow = (order, side, index) => {
    const isSell = side === 'sell';
    const total = order.price * order.amount;

    return (
      <div key={`${side}-${order.price}-${index}`} className="grid cursor-pointer grid-cols-3 gap-2 px-3 py-0.5 text-xs hover:bg-surface-container-low">
        <span className={`font-mono font-bold ${isSell ? 'text-error' : 'text-primary'}`}>
          {order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-mono text-right text-on-surface">{order.amount.toFixed(4)}</span>
        <span className="font-mono text-right text-on-surface-variant">{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    );
  };

  const currentPrice = ticker?.priceDisplay || '--';

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      <div className="border-b border-outline-variant/15 px-3 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface">Sổ lệnh</h3>
          <div className="flex gap-1">
            <button
              aria-label="Hiển thị sổ lệnh hai chiều"
              className={`rounded p-1 ${viewMode === 'both' ? 'bg-primary-container/20 text-primary' : 'text-outline hover:text-on-surface'}`}
              onClick={() => setViewMode('both')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">view_headline</span>
            </button>
            <button
              aria-label="Chỉ hiển thị lệnh bán"
              className={`rounded p-1 ${viewMode === 'sell' ? 'bg-primary-container/20 text-primary' : 'text-outline hover:text-on-surface'}`}
              onClick={() => setViewMode('sell')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">expand_less</span>
            </button>
            <button
              aria-label="Chỉ hiển thị lệnh mua"
              className={`rounded p-1 ${viewMode === 'buy' ? 'bg-primary-container/20 text-primary' : 'text-outline hover:text-on-surface'}`}
              onClick={() => setViewMode('buy')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-3 text-xs font-medium text-on-surface-variant">
          <span>Giá (USDT)</span>
          <span className="text-right">Số lượng (BTC)</span>
          <span className="text-right">Tổng</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
        {(viewMode === 'both' || viewMode === 'sell') && (
          <div className="flex flex-col-reverse py-1">
            {asks.slice(0, viewMode === 'both' ? 8 : 20).map((order, index) => renderOrderRow(order, 'sell', index))}
          </div>
        )}

        <div className="sticky top-0 z-10 border-y border-outline-variant/15 bg-surface-container px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">{currentPrice}</span>
            <span className="text-xs text-on-surface-variant">{ticker?.change24hDisplay || '--'}</span>
          </div>
        </div>

        {(viewMode === 'both' || viewMode === 'buy') && (
          <div className="py-1">
            {bids.slice(0, viewMode === 'both' ? 8 : 20).map((order, index) => renderOrderRow(order, 'buy', index))}
          </div>
        )}
      </div>
    </div>
  );
}
