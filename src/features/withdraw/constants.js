// Mock Data Constants for Withdraw Feature

export const MOCK_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', iconUrl: '/images/tokens/btc.png', balance: '0.5234' },
  { symbol: 'ETH', name: 'Ethereum', iconUrl: '/images/tokens/eth.png', balance: '2.5000' },
  { symbol: 'USDT', name: 'Tether', iconUrl: '/images/tokens/usdt.svg', balance: '10000.00' },
  { symbol: 'SOL', name: 'Solana', iconUrl: '/images/tokens/sol.png', balance: '15.0000' },
];

export const MOCK_NETWORKS = {
  BTC: [
    { id: 'btc-mainnet', name: 'Bitcoin Mainnet', fee: '0.0005', feeUsd: '35.00', estimatedTime: '~10-30 phút', available: true },
    { id: 'lightning', name: 'Lightning Network', fee: '0.00001', feeUsd: '0.70', estimatedTime: '~1-5 phút', available: true },
  ],
  ETH: [
    { id: 'eth-mainnet', name: 'Ethereum ERC-20', fee: '0.002', feeUsd: '7.50', estimatedTime: '~2-10 phút', available: true },
    { id: 'arbitrum', name: 'Arbitrum One', fee: '0.0001', feeUsd: '0.35', estimatedTime: '~1-3 phút', available: false },
  ],
  USDT: [
    { id: 'eth-erc20', name: 'Ethereum ERC-20', fee: '5.00', feeUsd: '5.00', estimatedTime: '~2-10 phút', available: true },
    { id: 'bsc-bep20', name: 'BSC BEP-20', fee: '1.00', feeUsd: '1.00', estimatedTime: '~1-3 phút', available: true },
    { id: 'tron-trc20', name: 'Tron TRC-20', fee: '1.00', feeUsd: '1.00', estimatedTime: '~1-3 phút', available: true },
  ],
  SOL: [
    { id: 'sol-mainnet', name: 'Solana Mainnet', fee: '0.001', feeUsd: '0.20', estimatedTime: '~10 giây', available: true },
  ],
};

export const MOCK_ACCOUNTS = [
  {
    type: 'funding',
    label: 'Tài khoản tài trợ',
    sublabel: 'Funding Account',
    balanceBTC: '0.5234',
    balanceUSDT: '35,420',
    description: 'Dùng cho nạp/rút tiền',
  },
  {
    type: 'trading',
    label: 'Tài khoản giao dịch',
    sublabel: 'Trading Account',
    balanceBTC: '1.2345',
    balanceUSDT: '83,500',
    description: 'Chuyển về Funding trước khi rút',
  },
];

export const MOCK_HISTORY = [
  {
    date: '02/04/2026 14:30',
    coin: 'BTC',
    amount: '0.1234',
    address: 'bc1q...xyz',
    network: 'Bitcoin Mainnet',
    status: 'completed',
    txHash: '3f2a1b...',
  },
  {
    date: '01/04/2026 09:15',
    coin: 'ETH',
    amount: '2.5000',
    address: '0x...abc',
    network: 'Ethereum ERC-20',
    status: 'processing',
    txHash: null,
  },
  {
    date: '31/03/2026 22:45',
    coin: 'USDT',
    amount: '500.00',
    address: '0x...def',
    network: 'BSC BEP-20',
    status: 'pending',
    txHash: null,
  },
];

export const WITHDRAWAL_LIMITS = {
  min: 0.001,
  maxPerDay: 10,
  unit: 'BTC',
};
