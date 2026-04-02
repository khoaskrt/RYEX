import { getMarketKline } from '@/server/market/SpotMarket';

export const runtime = 'nodejs';

const VALID_INTERVALS = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];

function jsonError(message, code, status = 400) {
  return Response.json({ error: { message, code } }, { status });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const interval = searchParams.get('interval') || '1h';
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10);

    if (!VALID_INTERVALS.includes(interval)) {
      return jsonError('Invalid interval parameter', 'INVALID_INTERVAL', 400);
    }

    if (!Number.isFinite(limit) || limit < 1 || limit > 1000) {
      return jsonError('Limit must be between 1 and 1000', 'INVALID_LIMIT', 400);
    }

    const payload = await getMarketKline(symbol, interval, limit);

    return Response.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    const code = status === 503 ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR';
    return jsonError(error.message || 'Failed to fetch kline data', code, status);
  }
}
