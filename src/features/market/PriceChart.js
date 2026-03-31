'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const INTERVALS = [
  { label: '1h', value: '1h' },
  { label: '1d', value: '1d' },
  { label: '1w', value: '1w' },
  { label: '1m', value: '1M' },
];

export default function PriceChart({ symbol = 'BTCUSDT', defaultInterval = '1h' }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const [activeInterval, setActiveInterval] = useState(defaultInterval);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#fbfcfc' },
        textColor: '#3c4a43',
      },
      grid: {
        vertLines: { color: '#e6e8ea' },
        horzLines: { color: '#e6e8ea' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#e6e8ea',
      },
      timeScale: {
        borderColor: '#e6e8ea',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#01bc8d',
      downColor: '#ba1a1a',
      borderUpColor: '#01bc8d',
      borderDownColor: '#ba1a1a',
      wickUpColor: '#01bc8d',
      wickDownColor: '#ba1a1a',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    async function fetchKlineData() {
      if (!candleSeriesRef.current) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1/market/kline?symbol=${symbol}&interval=${activeInterval}&limit=100`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          candleSeriesRef.current.setData(result.data);
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }
      } catch (error) {
        console.error('Failed to fetch kline data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchKlineData();
    const intervalId = setInterval(fetchKlineData, 10000);

    return () => clearInterval(intervalId);
  }, [symbol, activeInterval]);

  return (
    <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-2">
          {INTERVALS.map((interval) => (
            <button
              key={interval.value}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
                activeInterval === interval.value
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
              onClick={() => setActiveInterval(interval.value)}
              type="button"
            >
              {interval.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-primary">
            settings
          </span>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-primary">
            fullscreen
          </span>
        </div>
      </div>
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/80">
            <div className="text-sm font-medium text-on-surface-variant">Đang tải dữ liệu...</div>
          </div>
        )}
        <div ref={chartContainerRef} />
      </div>
    </div>
  );
}
