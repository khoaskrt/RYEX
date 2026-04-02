import { NextResponse } from 'next/server';
import { getMarketPriceDetail } from '@/server/market/SpotMarket';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const symbol = (params?.symbol || 'BTC').toUpperCase();
    const payload = await getMarketPriceDetail(symbol);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching market price detail:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch market price detail',
      },
      {
        status: error.statusCode || 503,
      }
    );
  }
}
