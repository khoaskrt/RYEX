export const DEPOSIT_TOKENS = [
  { symbol: 'USDT', name: 'Tether USD', network: 'TRC20', eta: '1-3 phút', fee: '0 USDT' },
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', eta: '10-30 phút', fee: '0 BTC' },
  { symbol: 'ETH', name: 'Ethereum', network: 'ERC20', eta: '3-10 phút', fee: '0 ETH' },
  { symbol: 'SOL', name: 'Solana', network: 'SOL', eta: '1-2 phút', fee: '0 SOL' },
];

export const DEPOSIT_STATES = [
  {
    key: 'default',
    icon: 'check_circle',
    title: 'Mặc định (Default)',
    description: 'Sẵn sàng nhận nạp tiền, QR và địa chỉ ví đã được cấp.',
    badgeClass: 'bg-primary-container/20 text-primary',
  },
  {
    key: 'loading',
    icon: 'progress_activity',
    title: 'Đang tải (Loading)',
    description: 'Đang khởi tạo địa chỉ nạp tiền và đồng bộ trạng thái mạng lưới.',
    badgeClass: 'bg-surface-container-high text-on-surface-variant animate-pulse',
  },
  {
    key: 'error',
    icon: 'error',
    title: 'Lỗi (Error)',
    description: 'Không thể tạo địa chỉ nạp tiền. User có thể bấm thử lại.',
    badgeClass: 'bg-error-container text-error',
  },
  {
    key: 'empty',
    icon: 'inbox',
    title: 'Trống (Empty)',
    description: 'Chưa có lịch sử nạp tiền nào. Gợi ý thao tác nạp ngay.',
    badgeClass: 'bg-surface-container-low text-on-surface-variant',
  },
];

export const DEPOSIT_HISTORY_RECORDS = [
  {
    orderId: 'DP-20260402-0001',
    coin: 'USDT',
    amount: '1250.00',
    network: 'TRC20',
    status: 'completed',
    timestamp: '2026-04-02T09:30:00+07:00',
  },
  {
    orderId: 'DP-20260326-0004',
    coin: 'BTC',
    amount: '0.11000000',
    network: 'Bitcoin',
    status: 'completed',
    timestamp: '2026-03-26T14:22:00+07:00',
  },
  {
    orderId: 'DP-20260320-0005',
    coin: 'SOL',
    amount: '18.50000000',
    network: 'SOL',
    status: 'pending',
    timestamp: '2026-03-20T19:42:00+07:00',
  },
  {
    orderId: 'DP-20260305-0007',
    coin: 'ETH',
    amount: '2.84000000',
    network: 'ERC20',
    status: 'completed',
    timestamp: '2026-03-05T12:36:00+07:00',
  },
];
