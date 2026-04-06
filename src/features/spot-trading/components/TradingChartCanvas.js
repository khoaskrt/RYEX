'use client';

import { createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { TRADING_POLLING_MS } from '../constants';
import { candleTheme, chartTheme, lineTheme, volumeTheme } from '../lib/chartTheme';

function toLineSeries(data = []) {
  return data.map((item) => ({
    time: item.time,
    value: item.close,
  }));
}

export default function TradingChartCanvas({ symbol = 'BTCUSDT', interval = '15m', chartType = 'candlestick' }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const mainSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const chart = createChart(containerRef.current, {
      ...chartTheme,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    chartRef.current = chart;

    const buildSeries = () => {
      if (!chartRef.current) return;
      if (mainSeriesRef.current) {
        chartRef.current.removeSeries(mainSeriesRef.current);
      }
      if (volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current);
      }

      if (chartType === 'line') {
        mainSeriesRef.current = chartRef.current.addLineSeries(lineTheme);
      } else {
        mainSeriesRef.current = chartRef.current.addCandlestickSeries(candleTheme);
      }

      volumeSeriesRef.current = chartRef.current.addHistogramSeries({
        ...volumeTheme,
        color: 'rgba(0, 108, 79, 0.35)',
      });
    };

    buildSeries();

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [chartType]);

  useEffect(() => {
    let isMounted = true;

    async function fetchKlineData() {
      try {
        const response = await fetch(`/api/v1/market/kline?symbol=${symbol}&interval=${interval}&limit=500`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const json = await response.json();
        const rows = Array.isArray(json?.data) ? json.data : [];

        if (!isMounted || !mainSeriesRef.current || !volumeSeriesRef.current) return;

        if (chartType === 'line') {
          mainSeriesRef.current.setData(toLineSeries(rows));
        } else {
          mainSeriesRef.current.setData(rows);
        }

        volumeSeriesRef.current.setData(
          rows.map((item) => ({
            time: item.time,
            value: item.volume,
          }))
        );

        setError('');
        setLoading(false);
      } catch (_error) {
        if (!isMounted) return;
        setError('Không thể tải dữ liệu biểu đồ');
        setLoading(false);
      }
    }

    setLoading(true);
    fetchKlineData();
    const id = setInterval(fetchKlineData, TRADING_POLLING_MS);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [symbol, interval, chartType]);

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full" ref={containerRef} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-on-surface-variant">
          Loading chart data...
        </div>
      )}
      {!!error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 px-4 text-center text-sm text-[#ba1a1a]">
          {error}
        </div>
      )}
    </div>
  );
}
