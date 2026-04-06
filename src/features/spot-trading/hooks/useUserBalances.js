'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { TRADING_POLLING_MS } from '../constants';

function mapBalances(payload) {
  const output = {};
  const assets = Array.isArray(payload?.assets) ? payload.assets : [];

  for (const asset of assets) {
    output[asset.symbol] = {
      funding: String(asset.fundingBalance || '0'),
      trading: String(asset.tradingBalance || '0'),
    };
  }

  return output;
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export function useUserBalances() {
  const [state, setState] = useState({
    balances: {},
    loading: true,
    error: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchBalances() {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!isMounted) return;
          setState({ balances: {}, loading: false, error: 'UNAUTHORIZED' });
          return;
        }

        const response = await fetch('/api/v1/user/assets', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch balances');
        }

        const json = await response.json();

        if (!isMounted) return;
        setState({
          balances: mapBalances(json),
          loading: false,
          error: '',
        });
      } catch (_error) {
        if (!isMounted) return;
        setState((prev) => ({ ...prev, loading: false, error: 'FAILED' }));
      }
    }

    fetchBalances();
    const id = setInterval(fetchBalances, TRADING_POLLING_MS);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  return useMemo(() => state, [state]);
}
