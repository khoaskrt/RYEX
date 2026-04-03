'use client';

import { useState } from 'react';
import { CHART_INTERVALS } from '../constants';

export default function TradingChart() {
  const [selectedInterval, setSelectedInterval] = useState('15m');
  const [chartType, setChartType] = useState('candlestick');

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Chart Controls */}
      <div className="border-b border-[#bbcac1]/15 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Chart Type */}
            <div className="flex gap-1 rounded-lg bg-surface-container p-1">
              <button
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

            {/* Time Intervals */}
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

          {/* Chart Tools */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-on-surface-variant hover:text-on-surface" type="button">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-on-surface" type="button">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-on-surface" type="button">
              <span className="material-symbols-outlined text-[20px]">fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Area - Placeholder */}
      <div className="relative flex-1 bg-gradient-to-br from-surface-container-lowest to-surface-container">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined mb-4 text-6xl text-outline">candlestick_chart</span>
            <p className="text-sm font-medium text-on-surface-variant">
              Biểu đồ TradingView sẽ được tích hợp ở đây
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Hiện đang hiển thị placeholder UI
            </p>
          </div>
        </div>

        {/* Mock Chart Grid */}
        <svg className="h-full w-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}
