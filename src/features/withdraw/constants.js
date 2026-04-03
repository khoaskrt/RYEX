// Mock Data Constants for Withdraw Feature

export const MOCK_COINS = [
  { symbol: 'USDT', name: 'Tether', iconUrl: '/images/tokens/usdt.svg', balance: '0.00000000' },
];

export const MOCK_NETWORKS = {
  USDT: [
    {
      id: 'bsc-testnet-bep20',
      name: 'BSC Testnet BEP-20',
      fee: '0.00000000',
      feeUsd: '0.00',
      feeSymbol: 'BNB',
      estimatedTime: 'Du kien 1-10 phut trong dieu kien mang binh thuong',
      available: true,
    },
  ],
};

export const MOCK_ACCOUNTS = [
  {
    type: 'funding',
    label: 'Tài khoản tài trợ',
    sublabel: 'Funding Account',
    balance: '0.00000000',
    unit: 'USDT',
    balanceUSDT: '0.00',
    description: 'Dùng cho nạp/rút tiền',
  },
];

export const MOCK_HISTORY = [
  {
    date: '03/04/2026 10:00',
    coin: 'USDT',
    amount: '0.00000000',
    address: '--',
    network: 'BSC Testnet BEP-20',
    status: 'pending',
    txHash: null,
  },
];

export const WITHDRAWAL_LIMITS = {
  min: 10,
  maxPerDay: 10000,
  unit: 'USDT',
};
