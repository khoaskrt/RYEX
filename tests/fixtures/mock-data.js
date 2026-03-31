/**
 * Test Fixtures & Mock Data
 */

export const mockUser = {
  uid: 'test-user-123',
  email: 'test@ryex.com',
  displayName: 'Test User',
  emailVerified: true,
};

export const mockMarketTickers = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 50000,
    change24h: 2.5,
    volume24h: 1000000000,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3000,
    change24h: -1.2,
    volume24h: 500000000,
  },
];

export const mockAuthTokens = {
  idToken: 'mock-id-token',
  refreshToken: 'mock-refresh-token',
};
