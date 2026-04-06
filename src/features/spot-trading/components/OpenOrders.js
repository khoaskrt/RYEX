'use client';

import { useState } from 'react';
import { useOrderManagement } from '../hooks/useOrderManagement';
import OrderNotification from './OrderNotification';

function formatDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
}

function formatNumber(value, min = 2, max = 8) {
  const parsed = Number.parseFloat(String(value || '0'));
  if (!Number.isFinite(parsed)) return '--';
  return parsed.toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });
}

export default function OpenOrders({ symbol = 'BTCUSDT' }) {
  const [activeTab, setActiveTab] = useState('open');
  const [notice, setNotice] = useState({ type: 'success', message: '' });
  const { openOrders, tradeHistory, cancelOrder, loading } = useOrderManagement(symbol);

  const handleCancel = async (orderId) => {
    const result = await cancelOrder(orderId);
    setNotice({ type: result.ok ? 'success' : 'error', message: result.message });
  };

  return (
    <div className="relative flex h-full flex-col bg-surface-container-lowest">
      <OrderNotification message={notice.message} onClose={() => setNotice({ type: 'success', message: '' })} type={notice.type} />

      <div className="border-b border-outline-variant/15 px-4">
        <div className="flex gap-6">
          <button
            className={`border-b-2 px-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'open'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setActiveTab('open')}
            type="button"
          >
            Lệnh mở ({openOrders.length})
          </button>
          <button
            className={`border-b-2 px-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setActiveTab('history')}
            type="button"
          >
            Lịch sử giao dịch
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">Đang tải dữ liệu...</div>
        ) : activeTab === 'open' ? (
          openOrders.length > 0 ? (
            <div className="h-full overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface-container-low text-xs text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3 font-medium">Thời gian</th>
                    <th className="px-4 py-3 font-medium">Cặp</th>
                    <th className="px-4 py-3 font-medium">Loại</th>
                    <th className="px-4 py-3 font-medium">Bên</th>
                    <th className="px-4 py-3 font-medium">Giá</th>
                    <th className="px-4 py-3 font-medium">Số lượng</th>
                    <th className="px-4 py-3 font-medium">Đã khớp</th>
                    <th className="px-4 py-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {openOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-4 py-3 text-on-surface-variant">{formatDateTime(order.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-on-surface">BTC/USDT</td>
                      <td className="px-4 py-3 text-on-surface">{String(order.type || '').toUpperCase()}</td>
                      <td className={`px-4 py-3 font-bold ${order.side === 'buy' ? 'text-primary' : 'text-error'}`}>
                        {order.side === 'buy' ? 'Mua' : 'Bán'}
                      </td>
                      <td className="px-4 py-3 font-mono text-on-surface">{order.type === 'market' ? 'Market' : formatNumber(order.price, 2, 2)}</td>
                      <td className="px-4 py-3 font-mono text-on-surface">{formatNumber(order.amount, 4, 8)}</td>
                      <td className="px-4 py-3 font-mono text-on-surface-variant">{formatNumber(order.filledAmount, 4, 8)}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="rounded-lg bg-error/10 px-4 py-1.5 text-xs font-bold text-error transition-colors hover:bg-error/20" onClick={() => handleCancel(order.id)} type="button">
                          Hủy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined mb-3 text-5xl text-outline">receipt_long</span>
                <p className="text-sm text-on-surface-variant">Không có lệnh mở</p>
              </div>
            </div>
          )
        ) : tradeHistory.length > 0 ? (
          <div className="h-full overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-container-low text-xs text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">Cặp</th>
                  <th className="px-4 py-3 font-medium">Bên</th>
                  <th className="px-4 py-3 font-medium">Giá</th>
                  <th className="px-4 py-3 font-medium">Số lượng</th>
                  <th className="px-4 py-3 font-medium">Phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tradeHistory.map((trade) => (
                  <tr key={trade.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3 text-on-surface-variant">{formatDateTime(trade.executedAt)}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">BTC/USDT</td>
                    <td className={`px-4 py-3 font-bold ${trade.side === 'buy' ? 'text-primary' : 'text-error'}`}>
                      {trade.side === 'buy' ? 'Mua' : 'Bán'}
                    </td>
                    <td className="px-4 py-3 font-mono text-on-surface">{formatNumber(trade.price, 2, 2)}</td>
                    <td className="px-4 py-3 font-mono text-on-surface">{formatNumber(trade.amount, 4, 8)}</td>
                    <td className="px-4 py-3 font-mono text-on-surface">{formatNumber(trade.fee, 2, 8)} {trade.feeAsset || 'USDT'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined mb-3 text-5xl text-outline">history</span>
              <p className="text-sm text-on-surface-variant">Chưa có lịch sử giao dịch</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
