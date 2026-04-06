import { getRecentTrades } from '@/server/market/SpotMarket';

export const runtime = 'nodejs';

function jsonError(message, code, status = 400) {
  return Response.json({ error: { message, code } }, { status });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
      return jsonError('Limit must be between 1 and 100', 'INVALID_LIMIT', 400);
    }

    const payload = await getRecentTrades(symbol, limit);
    return Response.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    const code = status === 503 ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR';
    return jsonError(error.message || 'Failed to fetch recent trades', code, status);
  }
}
