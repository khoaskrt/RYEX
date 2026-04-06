import { NextResponse } from 'next/server';
import { getRequestId, jsonError, verifySupabaseUserId } from '../../../../../server/wallet/http.js';
import { isTradingError } from '../../../../../server/trading/errors.js';
import { getOrders, placeOrder } from '../../../../../server/trading/tradingService.js';

export const runtime = 'nodejs';

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    const userId = await verifySupabaseUserId(request, requestId, 'trading/orders');
    if (!userId) {
      return jsonError('TRADING_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const body = await request.json();
    const payload = await placeOrder({
      userId,
      symbol: body.symbol,
      side: body.side,
      type: body.type,
      price: body.price,
      amount: body.amount,
      timeInForce: body.timeInForce,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (isTradingError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('TRADING_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    console.error(`[trading/orders][${requestId}] Unexpected POST error`, error);
    return jsonError('TRADING_INTERNAL_ERROR', 'Failed to place order', 500, requestId);
  }
}

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const userId = await verifySupabaseUserId(request, requestId, 'trading/orders');
    if (!userId) {
      return jsonError('TRADING_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const url = new URL(request.url);
    const payload = await getOrders({
      userId,
      status: url.searchParams.get('status') || '',
      symbol: url.searchParams.get('symbol') || '',
      limit: url.searchParams.get('limit') || '50',
      offset: url.searchParams.get('offset') || '0',
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (isTradingError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('TRADING_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    console.error(`[trading/orders][${requestId}] Unexpected GET error`, error);
    return jsonError('TRADING_INTERNAL_ERROR', 'Failed to fetch orders', 500, requestId);
  }
}
