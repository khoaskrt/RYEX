'use client';

import { useState } from 'react';

export default function TradingHeader({ currentPair = 'BTCUSDT', pairName = 'Bitcoin', ticker = null }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const isUp = Number.parseFloat(String(ticker?.change24hPercent || '0')) >= 0;

  return (
    <div className="border-b border-outline-variant/15 bg-surface-container-lowest px-4 py-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              aria-label={isFavorite ? 'Bỏ đánh dấu yêu thích' : 'Đánh dấu yêu thích'}
              className={`transition-colors ${isFavorite ? 'text-primary' : 'text-outline hover:text-primary'}`}
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
              <p className="text-xs text-on-surface-variant">{pairName}</p>
            </div>
          </div>

          <div className="ml-4 flex items-baseline gap-3">
            <span className={`text-3xl font-bold ${isUp ? 'text-primary' : 'text-error'}`}>
              {ticker?.priceDisplay || '--'}
            </span>
            <span className={`text-sm font-bold ${isUp ? 'text-primary' : 'text-error'}`}>
              {ticker?.change24hDisplay || '--'}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <div>
            <p className="text-xs text-on-surface-variant">24h High</p>
            <p className="text-sm font-bold text-on-surface">{ticker?.high24hDisplay || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">24h Low</p>
            <p className="text-sm font-bold text-on-surface">{ticker?.low24hDisplay || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">24h Volume (USDT)</p>
            <p className="text-sm font-bold text-on-surface">{ticker?.volumeUsdDisplay || '--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
