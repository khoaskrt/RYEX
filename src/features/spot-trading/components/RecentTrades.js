'use client';

function formatTime(value) {
  if (!value) return '--:--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--:--';
  return date.toLocaleTimeString('vi-VN');
}

export default function RecentTrades({ recentTrades = null }) {
  const trades = Array.isArray(recentTrades?.trades) ? recentTrades.trades : [];

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      <div className="border-b border-outline-variant/15 px-3 py-3">
        <h3 className="mb-3 text-sm font-bold text-on-surface">Giao dịch gần đây</h3>

        <div className="grid grid-cols-3 gap-2 px-3 text-xs font-medium text-on-surface-variant">
          <span>Giá (USDT)</span>
          <span className="text-right">Số lượng (BTC)</span>
          <span className="text-right">Thời gian</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="py-1">
          {trades.map((trade) => {
            const isBuy = !trade.isBuyerMaker;
            const price = Number.parseFloat(trade.price || '0');
            const amount = Number.parseFloat(trade.amount || '0');

            return (
              <div key={trade.id || `${trade.time}-${trade.price}`} className="grid cursor-pointer grid-cols-3 gap-2 px-3 py-1 text-xs hover:bg-surface-container-low">
                <span className={`font-mono font-bold ${isBuy ? 'text-primary' : 'text-error'}`}>
                  {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-right text-on-surface">{amount.toFixed(4)}</span>
                <span className="text-right text-on-surface-variant">{formatTime(trade.time)}</span>
              </div>
            );
          })}
          {trades.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-on-surface-variant">Chưa có dữ liệu giao dịch gần đây</p>
          )}
        </div>
      </div>
    </div>
  );
}
