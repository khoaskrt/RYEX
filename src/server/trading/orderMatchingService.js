import { withTransaction } from '../db/postgres.js';
import { getMarketPriceDetail } from '../market/SpotMarket.js';
import {
  createOrder,
  createTrade,
  decreaseUserAssetBalance,
  lockUserAssetBalance,
  setOrderFilled,
  upsertIncreaseUserAssetBalance,
} from './orderRepository.js';
import { ORDER_SIDES, ORDER_STATUSES, ORDER_TYPES, TRADING_SYMBOL } from './constants.js';
import { TradingError } from './errors.js';

function safeNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePriceDisplay(value) {
  const normalized = String(value || '').replace(/[$,\s]/g, '');
  return safeNumber(normalized, 0);
}

async function getCurrentMarketPrice() {
  const detail = await getMarketPriceDetail(TRADING_SYMBOL);
  const fromDisplay = parsePriceDisplay(detail?.priceDisplay);
  if (fromDisplay > 0) return fromDisplay;

  throw new TradingError('TRADING_MARKET_PRICE_UNAVAILABLE', 'Failed to fetch market price', 503);
}

function shouldFillLimitOrder(side, limitPrice, marketPrice) {
  if (side === ORDER_SIDES.BUY) return limitPrice >= marketPrice;
  return limitPrice <= marketPrice;
}

async function debitAssetOrFail(client, { userId, symbol, accountType, requiredAmount, errorCode, errorMessage }) {
  const asset = await lockUserAssetBalance(client, { userId, symbol, accountType });
  const currentBalance = safeNumber(asset?.balance, 0);

  if (!asset || currentBalance < requiredAmount) {
    throw new TradingError(errorCode, errorMessage, 400);
  }

  await decreaseUserAssetBalance(client, {
    userId,
    symbol,
    accountType,
    amount: String(requiredAmount),
  });
}

async function executeImmediateFill(client, { order, executionPrice }) {
  const amount = safeNumber(order.amount, 0);
  if (amount <= 0) {
    throw new TradingError('TRADING_INVALID_AMOUNT', 'Amount must be greater than zero', 400);
  }

  const quoteValue = amount * executionPrice;

  if (order.side === ORDER_SIDES.BUY) {
    await debitAssetOrFail(client, {
      userId: order.user_id,
      symbol: 'USDT',
      accountType: 'trading',
      requiredAmount: quoteValue,
      errorCode: 'TRADING_INSUFFICIENT_BALANCE',
      errorMessage: 'Insufficient USDT trading balance',
    });

    await upsertIncreaseUserAssetBalance(client, {
      userId: order.user_id,
      symbol: 'BTC',
      accountType: 'trading',
      amount: String(amount),
    });
  } else {
    await debitAssetOrFail(client, {
      userId: order.user_id,
      symbol: 'BTC',
      accountType: 'trading',
      requiredAmount: amount,
      errorCode: 'TRADING_INSUFFICIENT_BALANCE',
      errorMessage: 'Insufficient BTC trading balance',
    });

    await upsertIncreaseUserAssetBalance(client, {
      userId: order.user_id,
      symbol: 'USDT',
      accountType: 'trading',
      amount: String(quoteValue),
    });
  }

  await createTrade(client, {
    orderId: order.id,
    userId: order.user_id,
    symbol: order.symbol,
    side: order.side,
    price: String(executionPrice),
    amount: String(amount),
    fee: '0',
    feeAsset: 'USDT',
  });

  return setOrderFilled(client, order.id, String(amount));
}

async function reserveOpenLimitOrderFunds(client, { order }) {
  const amount = safeNumber(order.amount, 0);
  const price = safeNumber(order.price, 0);

  if (amount <= 0 || price <= 0) {
    throw new TradingError('TRADING_INVALID_ORDER', 'Invalid order amount or price', 400);
  }

  if (order.side === ORDER_SIDES.BUY) {
    const requiredUsdt = amount * price;
    await debitAssetOrFail(client, {
      userId: order.user_id,
      symbol: 'USDT',
      accountType: 'trading',
      requiredAmount: requiredUsdt,
      errorCode: 'TRADING_INSUFFICIENT_BALANCE',
      errorMessage: 'Insufficient USDT trading balance',
    });
    return;
  }

  await debitAssetOrFail(client, {
    userId: order.user_id,
    symbol: 'BTC',
    accountType: 'trading',
    requiredAmount: amount,
    errorCode: 'TRADING_INSUFFICIENT_BALANCE',
    errorMessage: 'Insufficient BTC trading balance',
  });
}

export async function createAndMatchOrder({ userId, symbol, side, type, price, amount, timeInForce }) {
  return withTransaction(async (client) => {
    const marketPrice = await getCurrentMarketPrice();

    const order = await createOrder(client, {
      userId,
      symbol,
      side,
      type,
      status: ORDER_STATUSES.OPEN,
      price,
      amount,
      filledAmount: '0',
      timeInForce,
    });

    if (!order) {
      throw new TradingError('TRADING_INTERNAL_ERROR', 'Failed to create order', 500);
    }

    if (type === ORDER_TYPES.MARKET) {
      const filled = await executeImmediateFill(client, {
        order,
        executionPrice: marketPrice,
      });

      return {
        order: filled,
        executionPrice: String(marketPrice),
      };
    }

    const limitPrice = safeNumber(price, 0);
    if (shouldFillLimitOrder(side, limitPrice, marketPrice)) {
      const filled = await executeImmediateFill(client, {
        order,
        executionPrice: marketPrice,
      });

      return {
        order: filled,
        executionPrice: String(marketPrice),
      };
    }

    await reserveOpenLimitOrderFunds(client, { order });

    return {
      order,
      executionPrice: null,
    };
  });
}
