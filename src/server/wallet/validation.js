import { ethers } from 'ethers';
import { SUPPORTED_CHAIN, SUPPORTED_SYMBOL, TOKEN_CONFIG } from './constants.js';
import { WalletError } from './errors.js';

export function normalizeChain(rawChain) {
  const chain = String(rawChain || SUPPORTED_CHAIN).trim().toLowerCase();
  if (chain !== SUPPORTED_CHAIN) {
    throw new WalletError('WALLET_UNSUPPORTED_CHAIN', 'Unsupported chain', 400);
  }
  return chain;
}

export function normalizeSymbol(rawSymbol) {
  const symbol = String(rawSymbol || SUPPORTED_SYMBOL).trim().toUpperCase();
  if (symbol !== SUPPORTED_SYMBOL) {
    throw new WalletError('WALLET_UNSUPPORTED_SYMBOL', 'Unsupported symbol', 400);
  }
  return symbol;
}

export function normalizeAccountType(rawAccountType) {
  const accountType = String(rawAccountType || 'funding').trim().toLowerCase();
  if (accountType !== 'funding') {
    throw new WalletError('WITHDRAW_INVALID_ACCOUNT_TYPE', 'Only funding account is supported in MVP', 400);
  }
  return accountType;
}

export function normalizeAddress(rawAddress) {
  const address = String(rawAddress || '').trim();
  if (!address) {
    throw new WalletError('WITHDRAW_INVALID_ADDRESS', 'Withdraw address is required', 400);
  }

  if (!ethers.isAddress(address)) {
    throw new WalletError('WITHDRAW_INVALID_ADDRESS', 'Invalid withdraw address', 400);
  }

  return ethers.getAddress(address);
}

export function parseUSDTAmountUnits(rawAmount) {
  const amount = String(rawAmount || '').trim();
  if (!amount) {
    throw new WalletError('WITHDRAW_INVALID_AMOUNT', 'Amount is required', 400);
  }

  try {
    const amountUnits = ethers.parseUnits(amount, TOKEN_CONFIG.USDT.decimals);
    if (amountUnits <= 0n) {
      throw new WalletError('WITHDRAW_INVALID_AMOUNT', 'Amount must be greater than zero', 400);
    }
    return amountUnits;
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }
    throw new WalletError('WITHDRAW_INVALID_AMOUNT', 'Invalid amount format', 400);
  }
}

export function formatUSDT(units) {
  return ethers.formatUnits(units, TOKEN_CONFIG.USDT.decimals);
}

export function parseUSDT(rawAmount) {
  return parseUSDTAmountUnits(rawAmount);
}

export function parsePagination(rawLimit, rawOffset) {
  const limit = Number.parseInt(String(rawLimit ?? '20'), 10);
  const offset = Number.parseInt(String(rawOffset ?? '0'), 10);

  if (!Number.isFinite(limit) || !Number.isFinite(offset) || limit < 1 || limit > 100 || offset < 0) {
    throw new WalletError('WALLET_INVALID_PAGINATION', 'Invalid pagination parameters', 400);
  }

  return { limit, offset };
}
