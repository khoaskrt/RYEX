import { NextResponse } from 'next/server';
import { getRequestId, jsonError, verifySupabaseUserId } from '../../../../../server/wallet/http.js';
import { isTradingError } from '../../../../../server/trading/errors.js';
import { getTrades } from '../../../../../server/trading/tradingService.js';

export const runtime = 'nodejs';

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const userId = await verifySupabaseUserId(request, requestId, 'trading/trades');
    if (!userId) {
      return jsonError('TRADING_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const url = new URL(request.url);
    const payload = await getTrades({
      userId,
      symbol: url.searchParams.get('symbol') || 'BTCUSDT',
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

    console.error(`[trading/trades][${requestId}] Unexpected GET error`, error);
    return jsonError('TRADING_INTERNAL_ERROR', 'Failed to fetch trades', 500, requestId);
  }
}
