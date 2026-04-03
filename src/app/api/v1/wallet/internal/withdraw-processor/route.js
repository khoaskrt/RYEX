import { NextResponse } from 'next/server';
import { assertWalletConfig, verifyInternalWalletKey } from '../../../../../../server/wallet/config.js';
import { isWalletError } from '../../../../../../server/wallet/errors.js';
import { getRequestId, jsonError } from '../../../../../../server/wallet/http.js';
import { processPendingWithdrawals } from '../../../../../../server/wallet/walletProcessorService.js';

export const runtime = 'nodejs';

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    assertWalletConfig({ requireEncryptionKey: true, requireInternalApiKey: true });

    if (!verifyInternalWalletKey(request)) {
      return jsonError('WALLET_FORBIDDEN', 'Forbidden', 403, requestId);
    }

    const body = await request.json().catch(() => ({}));
    const summary = await processPendingWithdrawals({
      limit: body.limit || 20,
    });

    return NextResponse.json(
      {
        processor: 'withdraw',
        requestId,
        ...summary,
      },
      { status: 200 }
    );
  } catch (error) {
    if (isWalletError(error)) {
      return jsonError(error.code, error.message, error.status, requestId);
    }

    console.error(`[wallet/internal/withdraw-processor][${requestId}] Unexpected error`, error);
    return jsonError('WITHDRAW_PROCESSOR_FAILED', 'Failed to process withdraw queue', 500, requestId);
  }
}
