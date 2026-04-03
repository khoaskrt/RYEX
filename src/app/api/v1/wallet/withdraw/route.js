import { NextResponse } from 'next/server';
import { assertWalletConfig } from '../../../../../server/wallet/config.js';
import { isWalletError } from '../../../../../server/wallet/errors.js';
import { getRequestId, jsonError, verifySupabaseUserId } from '../../../../../server/wallet/http.js';
import { submitWithdrawRequest } from '../../../../../server/wallet/walletService.js';

export const runtime = 'nodejs';

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    assertWalletConfig({ requireEncryptionKey: true });

    const userId = await verifySupabaseUserId(request, requestId, 'wallet/withdraw');
    if (!userId) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    const idempotencyKey = request.headers.get('x-idempotency-key') || requestId;
    const body = await request.json();

    const payload = await submitWithdrawRequest({
      userId,
      chain: body.chain,
      symbol: body.symbol,
      toAddress: body.toAddress,
      amount: body.amount,
      accountType: body.accountType,
      idempotencyKey,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (isWalletError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    if (error?.code === '23505') {
      return jsonError('WITHDRAW_DUPLICATE_REQUEST', 'Duplicate withdraw request', 409, requestId);
    }

    if (String(error?.message || '').toLowerCase().includes('token')) {
      return jsonError('WALLET_UNAUTHORIZED', 'Unauthorized', 401, requestId);
    }

    console.error(`[wallet/withdraw][${requestId}] Unexpected error`, error);
    return jsonError('WITHDRAW_SUBMIT_FAILED', 'Failed to submit withdraw request', 500, requestId);
  }
}
