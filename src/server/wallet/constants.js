export const SUPPORTED_CHAIN = 'bsc_testnet';
export const SUPPORTED_SYMBOL = 'USDT';

export const CHAIN_CONFIG = {
  bsc_testnet: {
    id: 'bsc_testnet',
    name: 'BSC Testnet',
    explorerTxBaseUrl: 'https://testnet.bscscan.com/tx/',
    requiredConfirmations: 12,
    estimatedArrival: 'Du kien 1-10 phut trong dieu kien mang binh thuong',
  },
};

export const TOKEN_CONFIG = {
  USDT: {
    symbol: 'USDT',
    decimals: 18,
    contractAddress: process.env.USDT_CONTRACT_ADDRESS_TESTNET || '',
  },
};

export const WITHDRAW_DEFAULT_LIMITS = {
  dailyLimitUSDT: '10000.00',
  minPerTxUSDT: '10.00',
  maxPerTxUSDT: '5000.00',
  hourlyTxLimit: 5,
};

export const WITHDRAW_DEFAULT_NETWORK_FEE_BNB = '0.00000000';
