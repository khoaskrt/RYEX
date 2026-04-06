import { getOrderBookDepth } from '@/server/market/SpotMarket';

export const runtime = 'nodejs';

function jsonError(message, code, status = 400) {
  return Response.json({ error: { message, code } }, { status });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const depth = Number.parseInt(searchParams.get('depth') || '20', 10);

    if (!Number.isFinite(depth) || depth < 5 || depth > 100) {
      return jsonError('Depth must be between 5 and 100', 'INVALID_DEPTH', 400);
    }

    const payload = await getOrderBookDepth(symbol, depth);
    return Response.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    const code = status === 503 ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR';
    return jsonError(error.message || 'Failed to fetch orderbook', code, status);
  }
}
