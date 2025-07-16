import { NextRequest, NextResponse } from 'next/server';
import { UnifiedPickupFilter } from '@/lib/services/unified-pickup-filter';
import { RezdyProduct } from '@/lib/types/rezdy';

export async function POST(request: NextRequest) {
  try {
    const { products, location, options } = await request.json();

    // Validate input
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products must be an array' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { error: 'Location must be a string' },
        { status: 400 }
      );
    }

    // Use UnifiedPickupFilter with server-side optimizations
    const result = await UnifiedPickupFilter.filterProductsByLocation(
      products as RezdyProduct[],
      location,
      {
        useApiData: false,
        enableFallback: true,
        cacheResults: true,
        forceLocalData: true, // Server-side can use local data
        ...options
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Pickup filter API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Pickup filter API endpoint',
    usage: 'POST with { products: RezdyProduct[], location: string, options?: object }'
  });
}