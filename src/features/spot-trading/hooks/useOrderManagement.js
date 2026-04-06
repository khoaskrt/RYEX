'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { TRADING_POLLING_MS } from '../constants';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export function useOrderManagement(symbol = 'BTCUSDT') {
  const [state, setState] = useState({
    openOrders: [],
    tradeHistory: [],
    loading: true,
    error: '',
  });

  const refresh = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setState({ openOrders: [], tradeHistory: [], loading: false, error: 'UNAUTHORIZED' });
        return;
      }

      const [openRes, tradesRes] = await Promise.all([
        fetch(`/api/v1/trading/orders?status=open&symbol=${symbol}&limit=50&offset=0`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
        fetch(`/api/v1/trading/trades?symbol=${symbol}&limit=50&offset=0`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
      ]);

      if (!openRes.ok || !tradesRes.ok) {
        throw new Error('Failed to fetch order management payload');
      }

      const [openJson, tradesJson] = await Promise.all([openRes.json(), tradesRes.json()]);

      setState({
        openOrders: Array.isArray(openJson?.orders) ? openJson.orders : [],
        tradeHistory: Array.isArray(tradesJson?.trades) ? tradesJson.trades : [],
        loading: false,
        error: '',
      });
    } catch (_error) {
      setState((prev) => ({ ...prev, loading: false, error: 'FAILED' }));
    }
  }, [symbol]);

  const cancelOrder = useCallback(async (orderId) => {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Unauthorized' };

    const response = await fetch(`/api/v1/trading/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const json = await response.json().catch(() => null);
      return { ok: false, message: json?.error?.message || 'Không thể hủy lệnh' };
    }

    await refresh();
    return { ok: true, message: 'Hủy lệnh thành công' };
  }, [refresh]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!isMounted) return;
      await refresh();
    }

    run();
    const id = setInterval(run, TRADING_POLLING_MS);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [refresh]);

  return useMemo(() => ({ ...state, refresh, cancelOrder }), [state, refresh, cancelOrder]);
}
