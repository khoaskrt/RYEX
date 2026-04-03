'use client';

import { useState } from 'react';

// Mock open orders
const mockOpenOrders = [
  {
    id: '1',
    pair: 'BTC/USDT',
    type: 'Limit',
    side: 'Buy',
    price: '70,500.00',
    amount: '0.0500',
    filled: '0.0000',
    total: '3,525.00',
    time: '2024-01-15 14:30:25',
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    type: 'Limit',
    side: 'Sell',
    price: '3,850.00',
    amount: '0.5000',
    filled: '0.2000',
    total: '1,925.00',
    time: '2024-01-15 13:15:10',
  },
];

export default function OpenOrders() {
  const [activeTab, setActiveTab] = useState('open'); // 'open', 'history'

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Tabs */}
      <div className="border-b border-[#bbcac1]/15 px-4">
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
            Lệnh mở ({mockOpenOrders.length})
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
          <button
            className="border-b-2 border-transparent px-1 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:text-on-surface"
            type="button"
          >
            Quỹ giao dịch
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'open' && mockOpenOrders.length > 0 ? (
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
                  <th className="px-4 py-3 font-medium">Tổng</th>
                  <th className="px-4 py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bbcac1]/10">
                {mockOpenOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant">{order.time}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">{order.pair}</td>
                    <td className="px-4 py-3 text-on-surface">{order.type}</td>
                    <td className={`px-4 py-3 font-bold ${order.side === 'Buy' ? 'text-[#01bc8d]' : 'text-[#ba1a1a]'}`}>
                      {order.side}
                    </td>
                    <td className="px-4 py-3 font-mono text-on-surface">{order.price}</td>
                    <td className="px-4 py-3 font-mono text-on-surface">{order.amount}</td>
                    <td className="px-4 py-3 font-mono text-on-surface-variant">{order.filled}</td>
                    <td className="px-4 py-3 font-mono text-on-surface">{order.total}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-lg bg-[#ba1a1a]/10 px-4 py-1.5 text-xs font-bold text-[#ba1a1a] transition-colors hover:bg-[#ba1a1a]/20"
                        type="button"
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'open' ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined mb-3 text-5xl text-outline">receipt_long</span>
              <p className="text-sm text-on-surface-variant">Không có lệnh mở</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined mb-3 text-5xl text-outline">history</span>
              <p className="text-sm text-on-surface-variant">Lịch sử giao dịch sẽ hiển thị ở đây</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
