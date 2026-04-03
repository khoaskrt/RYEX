'use client';

import { useState } from 'react';
import { ORDER_TYPES, ORDER_SIDES } from '../constants';

export default function TradingForm({ side = ORDER_SIDES.BUY }) {
  const [orderType, setOrderType] = useState(ORDER_TYPES.LIMIT);
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');

  const isBuy = side === ORDER_SIDES.BUY;
  const sideColor = isBuy ? 'text-[#01bc8d]' : 'text-[#ba1a1a]';
  const sideBg = isBuy ? 'bg-[#01bc8d]' : 'bg-[#ba1a1a]';

  // Mock balances
  const availableBalance = {
    buy: '10,000.00 USDT',
    sell: '0.5000 BTC',
  };

  const handlePercentageClick = (percentage) => {
    setAmount(((percentage / 100) * 0.5).toFixed(4));
  };

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest p-4">
      {/* Order Type Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-surface-container p-1">
        <button
          className={`flex-1 rounded px-3 py-2 text-xs font-bold transition-colors ${
            orderType === ORDER_TYPES.LIMIT
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setOrderType(ORDER_TYPES.LIMIT)}
          type="button"
        >
          Limit
        </button>
        <button
          className={`flex-1 rounded px-3 py-2 text-xs font-bold transition-colors ${
            orderType === ORDER_TYPES.MARKET
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setOrderType(ORDER_TYPES.MARKET)}
          type="button"
        >
          Market
        </button>
        <button
          className={`flex-1 rounded px-3 py-2 text-xs font-bold transition-colors ${
            orderType === ORDER_TYPES.STOP_LIMIT
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setOrderType(ORDER_TYPES.STOP_LIMIT)}
          type="button"
        >
          Stop-Limit
        </button>
      </div>

      {/* Available Balance */}
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="text-on-surface-variant">Khả dụng</span>
        <span className="font-bold text-on-surface">
          {isBuy ? availableBalance.buy : availableBalance.sell}
        </span>
      </div>

      {/* Price Input */}
      {orderType !== ORDER_TYPES.MARKET && (
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-on-surface-variant">
            Giá
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-[#bbcac1]/30 bg-surface-container px-3 py-2 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container">
            <input
              className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant"
              placeholder="0.00"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <span className="text-xs text-on-surface-variant">USDT</span>
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-3">
        <label className="mb-2 block text-xs font-medium text-on-surface-variant">
          Số lượng
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-[#bbcac1]/30 bg-surface-container px-3 py-2 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container">
          <input
            className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant"
            placeholder="0.00"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="text-xs text-on-surface-variant">BTC</span>
        </div>
      </div>

      {/* Percentage Buttons */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((percent) => (
          <button
            key={percent}
            className="rounded bg-surface-container py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            onClick={() => handlePercentageClick(percent)}
            type="button"
          >
            {percent}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium text-on-surface-variant">
          Tổng
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-[#bbcac1]/30 bg-surface-container px-3 py-2">
          <input
            className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant"
            placeholder="0.00"
            type="text"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
          <span className="text-xs text-on-surface-variant">USDT</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className={`${sideBg} w-full rounded-lg py-3 text-sm font-bold text-white transition-transform active:scale-95 hover:opacity-90`}
        type="button"
      >
        {isBuy ? 'Mua' : 'Bán'} BTC
      </button>

      {/* Login CTA for non-authenticated users */}
      <div className="mt-4 rounded-lg bg-surface-container p-3 text-center">
        <p className="mb-2 text-xs text-on-surface-variant">
          Đăng nhập để bắt đầu giao dịch
        </p>
        <button
          className="w-full rounded-lg bg-primary-container/20 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary-container/30"
          type="button"
        >
          Đăng nhập / Đăng ký
        </button>
      </div>
    </div>
  );
}
