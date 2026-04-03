import { ethers } from 'ethers';
import {
  CHAIN_CONFIG,
  SUPPORTED_SYMBOL,
  TOKEN_CONFIG,
  WITHDRAW_DEFAULT_NETWORK_FEE_BNB,
} from './constants.js';
import { WalletError } from './errors.js';
import { encryptPrivateKey } from './encryption.js';
import {
  createUserWallet,
  createWithdrawTransaction,
  getFundingBalance,
  getUserWallet,
  getWithdrawLimits,
  getWithdrawStats,
  listUserTransactions,
} from './walletRepository.js';
import {
  formatUSDT,
  normalizeAccountType,
  normalizeAddress,
  normalizeChain,
  normalizeSymbol,
  parsePagination,
  parseUSDT,
  parseUSDTAmountUnits,
} from './validation.js';

function toISOTimeAgo(milliseconds) {
  return new Date(Date.now() - milliseconds).toISOString();
}

function normalizeLimitValue(value, fallbackValue) {
  const asString = value == null ? String(fallbackValue) : String(value);
  return parseUSDT(asString);
}

function sumAmountsToUnits(rows) {
  return (rows || []).reduce((total, row) => {
    const amount = parseUSDT(String(row.amount || '0'));
    return total + amount;
  }, 0n);
}

function mapTxRecord(record) {
  const chainConfig = CHAIN_CONFIG[record.chain] || CHAIN_CONFIG.bsc_testnet;

  const amount = String(record.amount ?? '0');
  const networkFeeBNB = String(record.network_fee_bnb ?? '0');
  const requestedAmountUSDT = String(record.requested_amount_usdt ?? amount);
  const platformFeeUSDT = String(record.platform_fee_usdt ?? '0');
  const receiveAmountUSDT = String(record.receive_amount_usdt ?? amount);

  return {
    transactionId: record.transaction_id,
    type: record.tx_type,
    symbol: record.symbol,
    amount,
    status: record.status,
    txHash: record.tx_hash || '',
    fromAddress: record.from_address || '',
    toAddress: record.to_address || '',
    confirmations: record.confirmations || 0,
    blockNumber: record.block_number || null,
    networkFeeBNB,
    requestedAmountUSDT,
    platformFeeUSDT,
    receiveAmountUSDT,
    createdAt: record.created_at,
    completedAt: record.completed_at,
    explorerUrl: record.tx_hash ? `${chainConfig.explorerTxBaseUrl}${record.tx_hash}` : '',
  };
}

export async function getOrCreateDepositAddress({ userId, chain: rawChain, symbol: rawSymbol }) {
  const chain = normalizeChain(rawChain);
  const symbol = normalizeSymbol(rawSymbol);
  const chainConfig = CHAIN_CONFIG[chain];

  const existing = await getUserWallet(userId, chain);
  if (existing) {
    return {
      address: existing.address,
      network: chainConfig.name,
      symbol,
      contractAddress: TOKEN_CONFIG[symbol].contractAddress,
      requiredConfirmations: chainConfig.requiredConfirmations,
      estimatedArrival: chainConfig.estimatedArrival,
      createdAt: existing.created_at,
    };
  }

  const wallet = ethers.Wallet.createRandom();
  const encrypted = encryptPrivateKey(wallet.privateKey);

  const created = await createUserWallet({
    userId,
    chain,
    address: wallet.address,
    encryptedKey: encrypted.encryptedKey,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
  });

  return {
    address: created.address,
    network: chainConfig.name,
    symbol,
    contractAddress: TOKEN_CONFIG[symbol].contractAddress,
    requiredConfirmations: chainConfig.requiredConfirmations,
    estimatedArrival: chainConfig.estimatedArrival,
    createdAt: created.created_at,
  };
}

export async function getDepositAddress({ userId, chain: rawChain, symbol: rawSymbol }) {
  const chain = normalizeChain(rawChain);
  const symbol = normalizeSymbol(rawSymbol);
  const chainConfig = CHAIN_CONFIG[chain];

  const wallet = await getUserWallet(userId, chain);
  if (!wallet) {
    throw new WalletError('WALLET_NOT_FOUND', 'No wallet found for this chain', 404);
  }

  return {
    address: wallet.address,
    network: chainConfig.name,
    symbol,
    contractAddress: TOKEN_CONFIG[symbol].contractAddress,
    requiredConfirmations: chainConfig.requiredConfirmations,
    estimatedArrival: chainConfig.estimatedArrival,
    createdAt: wallet.created_at,
  };
}

export async function submitWithdrawRequest({
  userId,
  chain: rawChain,
  symbol: rawSymbol,
  toAddress: rawToAddress,
  amount: rawAmount,
  accountType: rawAccountType,
  idempotencyKey,
}) {
  const safeIdempotencyKey = String(idempotencyKey || '').trim();

  const chain = normalizeChain(rawChain);
  const symbol = normalizeSymbol(rawSymbol);
  const accountType = normalizeAccountType(rawAccountType);
  const toAddress = normalizeAddress(rawToAddress);

  const wallet = await getUserWallet(userId, chain);
  if (!wallet) {
    throw new WalletError('WALLET_NOT_FOUND', 'Wallet not found for chain', 404);
  }

  if (wallet.address.toLowerCase() === toAddress.toLowerCase()) {
    throw new WalletError('WITHDRAW_INVALID_ADDRESS', 'Cannot withdraw to your own deposit address', 400);
  }

  const amountUnits = parseUSDTAmountUnits(rawAmount);
  const amount = formatUSDT(amountUnits);

  const limits = await getWithdrawLimits(userId);

  const minUnits = normalizeLimitValue(limits.per_tx_min_usdt, '10.00');
  const maxUnits = normalizeLimitValue(limits.per_tx_max_usdt, '5000.00');
  const dailyLimitUnits = normalizeLimitValue(limits.daily_limit_usdt, '10000.00');
  const hourlyLimit = Number.parseInt(String(limits.hourly_tx_limit || 5), 10);

  if (amountUnits < minUnits) {
    throw new WalletError('WITHDRAW_AMOUNT_TOO_SMALL', `Minimum amount is ${formatUSDT(minUnits)} ${symbol}`, 400);
  }

  if (amountUnits > maxUnits) {
    throw new WalletError('WITHDRAW_AMOUNT_TOO_LARGE', `Maximum amount is ${formatUSDT(maxUnits)} ${symbol}`, 400);
  }

  const fundingBalanceUnits = parseUSDT(String(await getFundingBalance(userId, SUPPORTED_SYMBOL) || '0'));
  if (amountUnits > fundingBalanceUnits) {
    throw new WalletError('WITHDRAW_INSUFFICIENT_BALANCE', 'Insufficient balance', 400);
  }

  const { dailyRows, hourlyCount } = await getWithdrawStats(
    userId,
    toISOTimeAgo(24 * 60 * 60 * 1000),
    toISOTimeAgo(60 * 60 * 1000)
  );

  const dailyTotalUnits = sumAmountsToUnits(dailyRows);
  if (dailyTotalUnits + amountUnits > dailyLimitUnits) {
    throw new WalletError('WITHDRAW_LIMIT_EXCEEDED', 'Daily withdrawal limit exceeded', 400);
  }

  if (hourlyCount >= hourlyLimit) {
    throw new WalletError('WITHDRAW_RATE_LIMIT', 'Hourly withdrawal limit exceeded', 429);
  }

  try {
    const tx = await createWithdrawTransaction({
      user_id: userId,
      wallet_id: wallet.wallet_id,
      tx_type: 'withdraw',
      symbol,
      chain,
      account_type: accountType,
      amount,
      requested_amount_usdt: amount,
      platform_fee_usdt: '0',
      receive_amount_usdt: amount,
      network_fee_bnb: WITHDRAW_DEFAULT_NETWORK_FEE_BNB,
      from_address: wallet.address,
      to_address: toAddress,
      status: 'pending',
      idempotency_key: safeIdempotencyKey || null,
    });

    return {
      transactionId: tx.transaction_id,
      status: tx.status,
      requestedAmountUSDT: String(tx.requested_amount_usdt ?? amount),
      platformFeeUSDT: String(tx.platform_fee_usdt ?? '0'),
      networkFeeBNB: String(tx.network_fee_bnb ?? WITHDRAW_DEFAULT_NETWORK_FEE_BNB),
      receiveAmountUSDT: String(tx.receive_amount_usdt ?? amount),
      estimatedTime: CHAIN_CONFIG[chain].estimatedArrival,
      submittedAt: tx.created_at,
    };
  } catch (error) {
    if (error?.code === '23505') {
      throw new WalletError('WITHDRAW_DUPLICATE_REQUEST', 'Duplicate withdraw request', 409);
    }
    throw error;
  }
}

export async function getTransactions({ userId, type, status, limit: rawLimit, offset: rawOffset }) {
  const { limit, offset } = parsePagination(rawLimit, rawOffset);

  const safeType = String(type || 'all').toLowerCase();
  const safeStatus = String(status || 'all').toLowerCase();

  if (!['all', 'deposit', 'withdraw'].includes(safeType)) {
    throw new WalletError('WALLET_INVALID_FILTER', 'Invalid type filter', 400);
  }

  if (!['all', 'pending', 'confirming', 'completed', 'failed'].includes(safeStatus)) {
    throw new WalletError('WALLET_INVALID_FILTER', 'Invalid status filter', 400);
  }

  const { transactions, total } = await listUserTransactions({
    userId,
    type: safeType,
    status: safeStatus,
    limit,
    offset,
  });

  return {
    transactions: transactions.map(mapTxRecord),
    pagination: {
      total,
      limit,
      offset,
    },
  };
}
