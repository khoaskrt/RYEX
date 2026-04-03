export const DEPOSIT_TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'BSC Testnet',
    eta: 'Du kien 1-10 phut trong dieu kien mang binh thuong',
    fee: '0 USDT',
  },
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
    orderId: 'DP-BOOTSTRAP-0001',
    coin: 'USDT',
    amount: '0.00000000',
    network: 'BSC Testnet',
    status: 'pending',
    timestamp: '2026-04-03T00:00:00+07:00',
  },
];
