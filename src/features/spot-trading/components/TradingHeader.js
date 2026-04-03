'use client';

import { useState } from 'react';

export default function TradingHeader({ currentPair = 'BTCUSDT' }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data - sẽ được thay thế bằng real-time data sau
  const mockData = {
    price: '70,863.45',
    change24h: '+0.59%',
    high24h: '71,420.00',
    low24h: '69,850.00',
    volume24h: '2.4B',
    isUp: true,
  };

  return (
    <div className="border-b border-[#bbcac1]/15 bg-surface-container-lowest px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Pair Info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              className={`transition-colors ${isFavorite ? 'text-yellow-500' : 'text-outline hover:text-yellow-500'}`}
              onClick={() => setIsFavorite(!isFavorite)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isFavorite ? '"FILL" 1' : '"FILL" 0' }}>
                star
              </span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-on-surface">
                {currentPair.replace('USDT', '')} / USDT
              </h1>
              <p className="text-xs text-on-surface-variant">Bitcoin</p>
            </div>
          </div>

          <div className="ml-4 flex items-baseline gap-3">
            <span className={`text-3xl font-bold ${mockData.isUp ? 'text-[#01bc8d]' : 'text-[#ba1a1a]'}`}>
              ${mockData.price}
            </span>
            <span className={`text-sm font-bold ${mockData.isUp ? 'text-[#01bc8d]' : 'text-[#ba1a1a]'}`}>
              {mockData.change24h}
            </span>
          </div>
        </div>

        {/* Right: 24h Stats */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs text-on-surface-variant">24h High</p>
            <p className="text-sm font-bold text-on-surface">${mockData.high24h}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">24h Low</p>
            <p className="text-sm font-bold text-on-surface">${mockData.low24h}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">24h Volume (USDT)</p>
            <p className="text-sm font-bold text-on-surface">${mockData.volume24h}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
