'use client';

import { useState } from 'react';
import { CHART_INTERVALS } from '../constants';
import TradingChartCanvas from './TradingChartCanvas';

export default function TradingChart({ currentPair = 'BTCUSDT' }) {
  const [selectedInterval, setSelectedInterval] = useState('15m');
  const [chartType, setChartType] = useState('candlestick');

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      <div className="border-b border-outline-variant/15 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex gap-1 rounded-lg bg-surface-container p-1">
              <button
                aria-label="Biểu đồ nến"
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  chartType === 'candlestick'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setChartType('candlestick')}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">candlestick_chart</span>
              </button>
              <button
                aria-label="Biểu đồ đường"
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setChartType('line')}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">show_chart</span>
              </button>
            </div>

            <div className="flex gap-1">
              {CHART_INTERVALS.map((interval) => (
                <button
                  key={interval.value}
                  className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                    selectedInterval === interval.value
                      ? 'bg-primary-container/20 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  onClick={() => setSelectedInterval(interval.value)}
                  type="button"
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button aria-label="Công cụ vẽ" className="p-2 text-on-surface-variant hover:text-on-surface" type="button">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button aria-label="Thiết lập biểu đồ" className="p-2 text-on-surface-variant hover:text-on-surface" type="button">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
            <button aria-label="Toàn màn hình" className="p-2 text-on-surface-variant hover:text-on-surface" type="button">
              <span className="material-symbols-outlined text-[20px]">fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-gradient-to-br from-surface-container-lowest to-surface-container">
        <TradingChartCanvas symbol={currentPair} interval={selectedInterval} chartType={chartType} />
      </div>
    </div>
  );
}
