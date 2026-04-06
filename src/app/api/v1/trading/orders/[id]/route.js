import { NextResponse } from 'next/server';
import { getRequestId, jsonError, verifySupabaseUserId } from '../../../../../../server/wallet/http.js';
import { isTradingError } from '../../../../../../server/trading/errors.js';
import { cancelOrder } from '../../../../../../server/trading/tradingService.js';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const requestId = getRequestId(request);

  try {
    const userId = await verifySupabaseUserId(request, requestId, 'trading/orders/[id]');
    if (!userId) {
      return jsonError('TRADING_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const resolvedParams = await params;
    const orderId = String(resolvedParams?.id || '').trim();
    if (!orderId) {
      return jsonError('TRADING_INVALID_ORDER_ID', 'Order id is required', 400, requestId);
    }

    const payload = await cancelOrder({ userId, orderId });
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (isTradingError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('TRADING_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    console.error(`[trading/orders/[id]][${requestId}] Unexpected DELETE error`, error);
    return jsonError('TRADING_INTERNAL_ERROR', 'Failed to cancel order', 500, requestId);
  }
}
