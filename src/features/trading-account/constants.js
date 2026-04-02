export const TRADING_OVERVIEW = {
  totalEquityUSDT: '128,945.72',
  availableMarginUSDT: '94,210.18',
  unrealizedPnlUSDT: '+2,431.56',
  marginUsagePercent: 27,
  dailyVolumeUSDT: '5,240,000',
  riskLevel: 'An toàn',
};

export const TRADING_KPI_CARDS = [
  {
    key: 'spot',
    title: 'Spot Wallet',
    subtitle: 'Sẵn sàng khớp lệnh tức thì',
    amount: '42,115.33 USDT',
    delta: '+4.2% 24h',
    tone: 'primary',
    icon: 'account_balance_wallet',
  },
  {
    key: 'futures',
    title: 'Futures Margin',
    subtitle: 'Cross + Isolated',
    amount: '33,480.10 USDT',
    delta: '+1.1% 24h',
    tone: 'secondary',
    icon: 'finance',
  },
  {
    key: 'options',
    title: 'Options Account',
    subtitle: 'Bảo vệ biến động lớn',
    amount: '18,230.55 USDT',
    delta: '-0.7% 24h',
    tone: 'surface',
    icon: 'query_stats',
  },
];

export const TRADING_POSITIONS = [
  {
    id: 'p1',
    symbol: 'BTCUSDT',
    side: 'Long',
    leverage: '10x',
    entryPrice: '67,245.5',
    markPrice: '68,022.8',
    quantity: '0.75 BTC',
    pnl: '+583.10 USDT',
    pnlPercent: '+1.16%',
    liquidationPrice: '59,402.3',
    margin: '4,230.00 USDT',
    status: 'open',
  },
  {
    id: 'p2',
    symbol: 'ETHUSDT',
    side: 'Short',
    leverage: '8x',
    entryPrice: '3,520.4',
    markPrice: '3,486.1',
    quantity: '12.00 ETH',
    pnl: '+411.60 USDT',
    pnlPercent: '+0.97%',
    liquidationPrice: '3,792.0',
    margin: '5,010.00 USDT',
    status: 'open',
  },
  {
    id: 'p3',
    symbol: 'SOLUSDT',
    side: 'Long',
    leverage: '5x',
    entryPrice: '145.6',
    markPrice: '141.2',
    quantity: '320 SOL',
    pnl: '-1,408.00 USDT',
    pnlPercent: '-3.01%',
    liquidationPrice: '118.4',
    margin: '9,120.00 USDT',
    status: 'warning',
  },
];

export const TRADING_OPEN_ORDERS = [
  {
    id: 'o1',
    symbol: 'BTCUSDT',
    type: 'Limit',
    side: 'Buy',
    price: '66,800.0',
    amount: '0.45 BTC',
    filled: '35%',
  },
  {
    id: 'o2',
    symbol: 'ETHUSDT',
    type: 'Stop-Limit',
    side: 'Sell',
    price: '3,610.0',
    amount: '8.00 ETH',
    filled: '0%',
  },
  {
    id: 'o3',
    symbol: 'BNBUSDT',
    type: 'Limit',
    side: 'Buy',
    price: '612.5',
    amount: '25 BNB',
    filled: '62%',
  },
];

export const TRADING_ACTIVITY_TIMELINE = [
  {
    id: 't1',
    title: 'Khớp lệnh TP BTCUSDT',
    detail: 'Chốt lời 0.20 BTC tại 68,050.0',
    time: '19:42',
    tone: 'success',
  },
  {
    id: 't2',
    title: 'Nạp bổ sung ký quỹ',
    detail: 'Futures Wallet +2,000.00 USDT',
    time: '18:30',
    tone: 'info',
  },
  {
    id: 't3',
    title: 'Cảnh báo rủi ro SOLUSDT',
    detail: 'Tỷ lệ ký quỹ còn 38%',
    time: '17:55',
    tone: 'warning',
  },
];

export const TRADING_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'open', label: 'Đang mở' },
  { key: 'warning', label: 'Cảnh báo' },
];
