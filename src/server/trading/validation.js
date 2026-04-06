import {
  ORDER_SIDES,
  ORDER_TIME_IN_FORCE,
  ORDER_TYPES,
  ORDER_STATUSES,
  TRADING_SYMBOL,
} from './constants.js';
import { TradingError } from './errors.js';

const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

export function normalizeSymbol(symbol) {
  const safe = String(symbol || '').trim().toUpperCase();
  if (safe !== TRADING_SYMBOL) {
    throw new TradingError('TRADING_INVALID_SYMBOL', `Only ${TRADING_SYMBOL} is supported in MVP`, 400);
  }
  return safe;
}

export function normalizeSide(side) {
  const safe = String(side || '').trim().toLowerCase();
  if (![ORDER_SIDES.BUY, ORDER_SIDES.SELL].includes(safe)) {
    throw new TradingError('TRADING_INVALID_ORDER_SIDE', 'Invalid order side', 400);
  }
  return safe;
}

export function normalizeType(type) {
  const safe = String(type || '').trim().toLowerCase();
  if (![ORDER_TYPES.MARKET, ORDER_TYPES.LIMIT].includes(safe)) {
    throw new TradingError('TRADING_INVALID_ORDER_TYPE', 'Invalid order type', 400);
  }
  return safe;
}

export function normalizeTimeInForce(timeInForce, type) {
  if (type === ORDER_TYPES.MARKET) return ORDER_TIME_IN_FORCE.GTC;
  const safe = String(timeInForce || ORDER_TIME_IN_FORCE.GTC).trim().toUpperCase();
  if (safe !== ORDER_TIME_IN_FORCE.GTC) {
    throw new TradingError('TRADING_INVALID_TIME_IN_FORCE', 'Only GTC is supported in MVP', 400);
  }
  return safe;
}

export function normalizePositiveDecimal(value, code, message) {
  const safe = String(value ?? '').trim();
  if (!safe || !DECIMAL_PATTERN.test(safe)) {
    throw new TradingError(code, message, 400);
  }

  const asNumber = Number.parseFloat(safe);
  if (!Number.isFinite(asNumber) || asNumber <= 0) {
    throw new TradingError(code, message, 400);
  }

  return safe;
}

export function normalizeAmount(value) {
  return normalizePositiveDecimal(value, 'TRADING_INVALID_AMOUNT', 'Amount must be a positive number');
}

export function normalizePrice(value, type) {
  if (type === ORDER_TYPES.MARKET) return null;
  return normalizePositiveDecimal(value, 'TRADING_INVALID_PRICE', 'Price must be a positive number for limit orders');
}

export function normalizePagination(limit, offset, defaultLimit = 50, maxLimit = 200) {
  const parsedLimit = Number.parseInt(String(limit ?? defaultLimit), 10);
  const parsedOffset = Number.parseInt(String(offset ?? 0), 10);

  const safeLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), maxLimit) : defaultLimit;
  const safeOffset = Number.isFinite(parsedOffset) ? Math.max(parsedOffset, 0) : 0;

  return {
    limit: safeLimit,
    offset: safeOffset,
  };
}

export function normalizeStatus(status) {
  if (!status) return '';
  const safe = String(status).trim().toLowerCase();
  const allowed = Object.values(ORDER_STATUSES);
  if (!allowed.includes(safe)) {
    throw new TradingError('TRADING_INVALID_ORDER_STATUS', 'Invalid status filter', 400);
  }
  return safe;
}

export function mapOrderRow(row) {
  return {
    id: row.id,
    symbol: row.symbol,
    side: row.side,
    type: row.type,
    status: row.status,
    price: row.price,
    amount: row.amount,
    filledAmount: row.filled_amount,
    timeInForce: row.time_in_force,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    filledAt: row.filled_at,
  };
}

export function mapTradeRow(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    symbol: row.symbol,
    side: row.side,
    price: row.price,
    amount: row.amount,
    fee: row.fee,
    feeAsset: row.fee_asset,
    executedAt: row.executed_at,
  };
}
