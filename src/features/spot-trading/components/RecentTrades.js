'use client';

// Mock recent trades data
const generateMockTrades = (count = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `trade-${i}`,
    price: (70800 + Math.random() * 200).toFixed(2),
    amount: (Math.random() * 0.5).toFixed(4),
    time: new Date(Date.now() - i * 5000).toLocaleTimeString('vi-VN'),
    side: Math.random() > 0.5 ? 'buy' : 'sell',
  }));
};

export default function RecentTrades() {
  const trades = generateMockTrades(20);

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Header */}
      <div className="border-b border-[#bbcac1]/15 px-3 py-3">
        <h3 className="mb-3 text-sm font-bold text-on-surface">Giao dịch gần đây</h3>

        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-2 px-3 text-xs font-medium text-on-surface-variant">
          <span>Giá (USDT)</span>
          <span className="text-right">Số lượng (BTC)</span>
          <span className="text-right">Thời gian</span>
        </div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="py-1">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-3 gap-2 px-3 py-1 text-xs hover:bg-surface-container-low cursor-pointer"
            >
              <span className={`font-mono font-bold ${trade.side === 'buy' ? 'text-[#01bc8d]' : 'text-[#ba1a1a]'}`}>
                {parseFloat(trade.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-right text-on-surface">{trade.amount}</span>
              <span className="text-right text-on-surface-variant">{trade.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
