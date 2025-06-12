import { NextRequest, NextResponse } from 'next/server';
import { simpleCacheManager } from '@/lib/utils/simple-cache-manager';
import { RezdyProduct } from '@/lib/types/rezdy';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;

interface RezdyApiResponse {
  requestStatus: {
    success: boolean;
    error?: {
      errorCode: string;
      errorMessage: string;
    };
  };
  product?: RezdyProduct;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productCode: string }> }
) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Rezdy API key not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const { productCode } = resolvedParams;

    if (!productCode) {
      return NextResponse.json(
        { error: 'Product code is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    const cacheKey = `tour:${productCode}`;
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedProduct = await simpleCacheManager.getProducts(cacheKey);
      if (cachedProduct && cachedProduct.length > 0) {
        console.log(`✅ Cache hit for tour: ${productCode}`);
        return NextResponse.json(
          { 
            tour: cachedProduct[0],
            cached: true,
            lastUpdated: new Date().toISOString()
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
              'X-Cache': 'HIT',
            },
          }
        );
      }
    }

    console.log(`⚠️ Cache miss for tour: ${productCode}, fetching from Rezdy...`);
    
    // Fetch product details from Rezdy API
    const url = `${REZDY_BASE_URL}/products/${productCode}?apiKey=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Tour not found' },
          { status: 404 }
        );
      }
      throw new Error(`Rezdy API error: ${response.status} ${response.statusText}`);
    }

    const data: RezdyApiResponse = await response.json();
    
    if (!data.requestStatus.success) {
      throw new Error(`Rezdy API error: ${data.requestStatus.error?.errorMessage || 'Unknown error'}`);
    }

    if (!data.product) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Cache the result
    await simpleCacheManager.cacheProducts([data.product], cacheKey);
    console.log(`✅ Cached tour with key: ${cacheKey}`);
    
    return NextResponse.json(
      { 
        tour: data.product,
        cached: false,
        lastUpdated: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Cache': 'MISS',
        },
      }
    );
    
  } catch (error) {
    console.error(`❌ Error fetching tour ${(await params).productCode}:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tour details from Rezdy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 