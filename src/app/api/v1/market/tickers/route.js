import { NextResponse } from 'next/server';
import { getMarketTickers } from '@/server/market/binanceSpotMarket';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getMarketTickers();
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching market tickers:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch market tickers',
      },
      {
        status: error.statusCode || 503,
      }
    );
  }
}
