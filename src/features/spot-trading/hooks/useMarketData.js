'use client';

import { useEffect, useMemo, useState } from 'react';
import { TRADING_POLLING_MS } from '../constants';

async function safeJson(response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

export function useMarketData(symbol = 'BTCUSDT') {
  const [state, setState] = useState({
    loading: true,
    error: '',
    ticker: null,
    orderBook: null,
    recentTrades: null,
    lastUpdated: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      try {
        const [tickerRes, orderBookRes, tradesRes] = await Promise.all([
          fetch(`/api/v1/market/price/${symbol}`, { cache: 'no-store' }),
          fetch(`/api/v1/market/orderbook?symbol=${symbol}&depth=20`, { cache: 'no-store' }),
          fetch(`/api/v1/market/trades?symbol=${symbol}&limit=50`, { cache: 'no-store' }),
        ]);

        if (!tickerRes.ok || !orderBookRes.ok || !tradesRes.ok) {
          throw new Error('Failed to fetch market data');
        }

        const [ticker, orderBook, recentTrades] = await Promise.all([
          safeJson(tickerRes),
          safeJson(orderBookRes),
          safeJson(tradesRes),
        ]);

        if (!isMounted) return;

        setState({
          loading: false,
          error: '',
          ticker,
          orderBook,
          recentTrades,
          lastUpdated: new Date().toISOString(),
        });
      } catch (_error) {
        if (!isMounted) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Không thể tải dữ liệu thị trường',
        }));
      }
    }

    fetchAll();
    const id = setInterval(fetchAll, TRADING_POLLING_MS);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [symbol]);

  return useMemo(() => state, [state]);
}
