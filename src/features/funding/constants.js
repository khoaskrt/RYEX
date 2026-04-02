export const FUNDING_OVERVIEW = {
  totalBalanceBTC: '0.28476391',
  totalBalanceUSDT: '19,473.62',
  availableToWithdrawUSDT: '17,925.11',
  pendingUSDT: '1,548.51',
};

export const FUNDING_ACCOUNT_CARDS = [
  {
    key: 'main-funding',
    title: 'Funding chính',
    subtitle: 'Main Funding Wallet',
    amountBTC: '0.21973341',
    amountUSDT: '15,038.90',
    icon: 'account_balance_wallet',
    tone: 'primary',
  },
  {
    key: 'p2p-funding',
    title: 'Funding P2P',
    subtitle: 'P2P Settlement Wallet',
    amountBTC: '0.05260000',
    amountUSDT: '3,604.43',
    icon: 'handshake',
    tone: 'secondary',
  },
  {
    key: 'locked-funding',
    title: 'Funding bị khóa',
    subtitle: 'Locked for Orders',
    amountBTC: '0.01243050',
    amountUSDT: '830.29',
    icon: 'lock',
    tone: 'surface',
  },
];

export const FUNDING_ASSET_ROWS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    total: '7,512.45',
    available: '7,201.14',
    inOrder: '311.31',
    fiatValue: '$7,512.45',
    change24h: '+0.00%',
    trend: 'flat',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    total: '0.13245791',
    available: '0.12800791',
    inOrder: '0.00445000',
    fiatValue: '$9,061.10',
    change24h: '+2.18%',
    trend: 'up',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    total: '1.54020000',
    available: '1.52130000',
    inOrder: '0.01890000',
    fiatValue: '$2,670.35',
    change24h: '-0.71%',
    trend: 'down',
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    total: '4.25000000',
    available: '4.25000000',
    inOrder: '0.00000000',
    fiatValue: '$1,932.54',
    change24h: '+1.32%',
    trend: 'up',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    total: '15.84000000',
    available: '15.10000000',
    inOrder: '0.74000000',
    fiatValue: '$1,298.16',
    change24h: '-1.54%',
    trend: 'down',
  },
];

export const FUNDING_QUICK_ACTIONS = [
  {
    title: 'Nạp tiền',
    description: 'Nạp coin vào Funding để bắt đầu giao dịch hoặc thanh toán P2P.',
    icon: 'arrow_downward',
    cta: 'Đi tới nạp tiền',
    href: '/app/deposit',
  },
  {
    title: 'Rút tiền',
    description: 'Rút tài sản về ví ngoài với giới hạn và phí theo network.',
    icon: 'arrow_upward',
    cta: 'Đi tới rút tiền',
    href: '/app/withdraw',
  },
  {
    title: 'Xem lịch sử',
    description: 'Theo dõi toàn bộ biến động nạp/rút và các trạng thái xử lý.',
    icon: 'history',
    cta: 'Đi tới lịch sử',
    href: '/app/history',
  },
];

export const FUNDING_RECENT_ACTIVITY = [
  {
    id: 'FD-230991',
    type: 'Nạp USDT',
    time: '02/04/2026 15:20',
    amount: '+1,500.00 USDT',
    status: 'Hoàn thành',
    statusTone: 'success',
  },
  {
    id: 'FD-230984',
    type: 'Rút BTC',
    time: '02/04/2026 11:42',
    amount: '-0.01500000 BTC',
    status: 'Đang xử lý',
    statusTone: 'pending',
  },
  {
    id: 'FD-230961',
    type: 'Chuyển nội bộ',
    time: '01/04/2026 20:10',
    amount: '-220.00 USDT',
    status: 'Hoàn thành',
    statusTone: 'success',
  },
  {
    id: 'FD-230917',
    type: 'Rút ETH',
    time: '01/04/2026 09:15',
    amount: '-0.25000000 ETH',
    status: 'Thất bại',
    statusTone: 'error',
  },
];
