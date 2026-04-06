'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { ORDER_TYPES, ORDER_SIDES, TIME_IN_FORCE } from '../constants';
import { useUserBalances } from '../hooks/useUserBalances';
import { parsePositive, validateOrderInput } from '../lib/orderValidation';
import OrderNotification from './OrderNotification';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export default function TradingForm({ side = ORDER_SIDES.BUY, symbol = 'BTCUSDT', marketTicker = null }) {
  const [orderType, setOrderType] = useState(ORDER_TYPES.LIMIT);
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: 'success', message: '' });

  const { balances } = useUserBalances();

  const isBuy = side === ORDER_SIDES.BUY;
  const sideBg = isBuy ? 'bg-primary' : 'bg-error';

  const availableUsdt = balances.USDT?.trading || '0';
  const availableBtc = balances.BTC?.trading || '0';

  const marketPrice = useMemo(() => {
    const raw = String(marketTicker?.priceDisplay || '').replace(/[$,\s]/g, '');
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [marketTicker]);

  const effectivePrice = orderType === ORDER_TYPES.MARKET ? marketPrice : parsePositive(price);
  const parsedAmount = parsePositive(amount);
  const total = effectivePrice > 0 && parsedAmount > 0 ? (effectivePrice * parsedAmount).toFixed(2) : '0.00';

  const handlePercentageClick = (percentage) => {
    if (isBuy) {
      const usdt = parsePositive(availableUsdt);
      if (usdt <= 0 || effectivePrice <= 0) return;
      const maxBtc = usdt / effectivePrice;
      setAmount(((percentage / 100) * maxBtc).toFixed(6));
      return;
    }

    const btc = parsePositive(availableBtc);
    if (btc <= 0) return;
    setAmount(((percentage / 100) * btc).toFixed(6));
  };

  const clearForm = () => {
    setAmount('');
    if (orderType === ORDER_TYPES.LIMIT) {
      setPrice('');
    }
  };

  const submitOrder = async () => {
    const validation = validateOrderInput({
      orderType,
      price: orderType === ORDER_TYPES.MARKET ? String(marketPrice || 0) : price,
      amount,
      availableUsdt,
      availableBtc,
      isBuy,
    });

    if (!validation.ok) {
      setNotice({ type: 'error', message: validation.message });
      return;
    }

    setSubmitting(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        setNotice({ type: 'error', message: 'Vui lòng đăng nhập để giao dịch' });
        return;
      }

      const response = await fetch('/api/v1/trading/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol,
          side,
          type: orderType,
          amount,
          price: orderType === ORDER_TYPES.LIMIT ? price : undefined,
          timeInForce: TIME_IN_FORCE.GTC,
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        setNotice({ type: 'error', message: json?.error?.message || 'Không thể đặt lệnh' });
        return;
      }

      setNotice({ type: 'success', message: `Đặt lệnh thành công (#${json?.orderId || '--'})` });
      clearForm();
    } catch (_error) {
      setNotice({ type: 'error', message: 'Không thể đặt lệnh, vui lòng thử lại' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col bg-surface-container-lowest p-4">
      <OrderNotification message={notice.message} onClose={() => setNotice({ type: 'success', message: '' })} type={notice.type} />

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
      </div>

      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="text-on-surface-variant">Khả dụng</span>
        <span className="font-bold text-on-surface">
          {isBuy ? `${Number.parseFloat(availableUsdt || '0').toFixed(2)} USDT` : `${Number.parseFloat(availableBtc || '0').toFixed(6)} BTC`}
        </span>
      </div>

      {orderType !== ORDER_TYPES.MARKET && (
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-on-surface-variant">Giá</label>
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container">
            <input
              className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant"
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              type="text"
              value={price}
            />
            <span className="text-xs text-on-surface-variant">USDT</span>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="mb-2 block text-xs font-medium text-on-surface-variant">Số lượng</label>
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container">
          <input
            className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            type="text"
            value={amount}
          />
          <span className="text-xs text-on-surface-variant">BTC</span>
        </div>
      </div>

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

      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium text-on-surface-variant">Tổng</label>
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2">
          <input className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none" readOnly type="text" value={total} />
          <span className="text-xs text-on-surface-variant">USDT</span>
        </div>
      </div>

      <button
        className={`${sideBg} w-full rounded-lg py-3 text-sm font-bold text-white transition-transform hover:opacity-90 active:scale-95 disabled:opacity-60`}
        disabled={submitting}
        onClick={submitOrder}
        type="button"
      >
        {submitting ? 'Đang xử lý...' : `${isBuy ? 'Mua' : 'Bán'} BTC`}
      </button>
    </div>
  );
}
