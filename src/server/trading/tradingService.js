import { withTransaction } from '../db/postgres.js';
import {
  ORDER_STATUSES,
  ORDER_TYPES,
  TRADING_SYMBOL,
} from './constants.js';
import { TradingError } from './errors.js';
import {
  countOrders,
  countTrades,
  getOrderByIdForUpdate,
  listOrders,
  listTrades,
  setOrderCancelled,
  upsertIncreaseUserAssetBalance,
} from './orderRepository.js';
import { createAndMatchOrder } from './orderMatchingService.js';
import {
  mapOrderRow,
  mapTradeRow,
  normalizeAmount,
  normalizePagination,
  normalizePrice,
  normalizeSide,
  normalizeStatus,
  normalizeSymbol,
  normalizeTimeInForce,
  normalizeType,
} from './validation.js';

function safeNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function placeOrder({ userId, symbol, side, type, price, amount, timeInForce }) {
  const safeSymbol = normalizeSymbol(symbol);
  const safeSide = normalizeSide(side);
  const safeType = normalizeType(type);
  const safeAmount = normalizeAmount(amount);
  const safePrice = normalizePrice(price, safeType);
  const safeTimeInForce = normalizeTimeInForce(timeInForce, safeType);

  const result = await createAndMatchOrder({
    userId,
    symbol: safeSymbol,
    side: safeSide,
    type: safeType,
    price: safePrice,
    amount: safeAmount,
    timeInForce: safeTimeInForce,
  });

  const order = mapOrderRow(result.order);

  return {
    order,
    orderId: order.id,
    status: order.status,
    symbol: safeSymbol,
    side: safeSide,
    type: safeType,
    timeInForce: safeType === ORDER_TYPES.MARKET ? 'GTC' : safeTimeInForce,
    executionPrice: result.executionPrice,
    fee: '0',
  };
}

export async function getOrders({ userId, status, symbol, limit, offset }) {
  const safeStatus = normalizeStatus(status);
  const safeSymbol = symbol ? normalizeSymbol(symbol) : '';
  const { limit: safeLimit, offset: safeOffset } = normalizePagination(limit, offset, 50, 200);

  const [orders, total] = await Promise.all([
    listOrders({ userId, status: safeStatus, symbol: safeSymbol, limit: safeLimit, offset: safeOffset }),
    countOrders({ userId, status: safeStatus, symbol: safeSymbol }),
  ]);

  return {
    orders: orders.map(mapOrderRow),
    total,
    pagination: {
      limit: safeLimit,
      offset: safeOffset,
    },
  };
}

export async function getTrades({ userId, symbol, limit, offset }) {
  const safeSymbol = symbol ? normalizeSymbol(symbol) : TRADING_SYMBOL;
  const { limit: safeLimit, offset: safeOffset } = normalizePagination(limit, offset, 50, 200);

  const [trades, total] = await Promise.all([
    listTrades({ userId, symbol: safeSymbol, limit: safeLimit, offset: safeOffset }),
    countTrades({ userId, symbol: safeSymbol }),
  ]);

  return {
    trades: trades.map(mapTradeRow),
    total,
    pagination: {
      limit: safeLimit,
      offset: safeOffset,
    },
  };
}

export async function cancelOrder({ userId, orderId }) {
  return withTransaction(async (client) => {
    const order = await getOrderByIdForUpdate(client, orderId, userId);

    if (!order) {
      throw new TradingError('TRADING_ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (order.status !== ORDER_STATUSES.OPEN) {
      throw new TradingError('TRADING_ORDER_NOT_CANCELLABLE', 'Only open orders can be cancelled', 400);
    }

    const amount = safeNumber(order.amount, 0);
    const filledAmount = safeNumber(order.filled_amount, 0);
    const remainingAmount = Math.max(0, amount - filledAmount);

    if (remainingAmount > 0) {
      if (order.side === 'buy') {
        const price = safeNumber(order.price, 0);
        const refundUsdt = remainingAmount * price;

        if (refundUsdt > 0) {
          await upsertIncreaseUserAssetBalance(client, {
            userId: order.user_id,
            symbol: 'USDT',
            accountType: 'trading',
            amount: String(refundUsdt),
          });
        }
      } else {
        await upsertIncreaseUserAssetBalance(client, {
          userId: order.user_id,
          symbol: 'BTC',
          accountType: 'trading',
          amount: String(remainingAmount),
        });
      }
    }

    const cancelled = await setOrderCancelled(client, order.id);

    return {
      cancelled: true,
      orderId: cancelled.id,
      status: cancelled.status,
    };
  });
}
