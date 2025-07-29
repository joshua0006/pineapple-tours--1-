import { NextRequest, NextResponse } from 'next/server';
import { simpleCacheManager } from '@/lib/utils/simple-cache-manager';
import { MarketplaceProduct } from '@/lib/types/rezdy';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;

interface MarketplaceProductsResponse {
  requestStatus: {
    success: boolean;
    error?: {
      errorCode: string;
      errorMessage: string;
    };
  };
  products: Array<{
    productCode: string;
    name: string;
    shortDescription?: string;
    description?: string;
    advertisedPrice?: number;
    images?: Array<{
      id: number;
      itemUrl: string;
      thumbnailUrl?: string;
      mediumSizeUrl?: string;
      largeSizeUrl?: string;
      caption?: string;
      isPrimary?: boolean;
    }>;
    categories?: string[];
    locationAddress?: {
      city?: string;
      state?: string;
      countryCode?: string;
    };
    agentPaymentType?: string;
    maxCommissionPercent?: number;
    maxCommissionNetRate?: number;
    marketplaceRate?: boolean;
    productType?: string;
    status?: string;
  }>;
}

async function fetchMarketplaceProducts(searchTerm: string = 'skywalk'): Promise<MarketplaceProductsResponse> {
  const url = `${REZDY_BASE_URL}/products/marketplace?search=${encodeURIComponent(searchTerm)}&apiKey=${API_KEY}&limit=100`;
  
  console.log('🔄 Fetching marketplace products from Rezdy...');
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Rezdy marketplace API error: ${response.status} ${response.statusText}`);
  }

  const data: MarketplaceProductsResponse = await response.json();
  
  if (!data.requestStatus.success) {
    throw new Error(`Rezdy marketplace API error: ${data.requestStatus.error?.errorMessage || 'Unknown error'}`);
  }

  return data;
}

function filterMarketplaceProducts(products: MarketplaceProductsResponse['products'], region?: string): MarketplaceProduct[] {
  return products
    .filter((product) => {
      // Only include products that are eligible for marketplace
      if (!product.marketplaceRate && !product.maxCommissionPercent && !product.maxCommissionNetRate) {
        return false;
      }
      
      // Filter by region if specified
      if (region && product.locationAddress?.city && 
          !product.locationAddress.city.toLowerCase().includes(region.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .map((product) => ({
      productCode: product.productCode,
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      advertisedPrice: product.advertisedPrice,
      images: product.images?.map(img => ({
        id: img.id,
        itemUrl: img.itemUrl,
        thumbnailUrl: img.thumbnailUrl || img.itemUrl,
        mediumSizeUrl: img.mediumSizeUrl || img.itemUrl,
        largeSizeUrl: img.largeSizeUrl || img.itemUrl,
        caption: img.caption,
        isPrimary: img.isPrimary,
      })),
      categories: product.categories,
      locationAddress: product.locationAddress,
      agentPaymentType: product.agentPaymentType,
      maxCommissionPercent: product.maxCommissionPercent,
      maxCommissionNetRate: product.maxCommissionNetRate,
      marketplaceRate: product.marketplaceRate,
      productType: product.productType,
      status: product.status,
    }));
}

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Rezdy API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const region = searchParams.get('region') || undefined;
    const searchTerm = searchParams.get('search') || 'skywalk';
    
    const cacheKey = `marketplace:products:${searchTerm}:${region || 'all'}`;
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedProducts = await simpleCacheManager.get(cacheKey);
      if (cachedProducts) {
        console.log(`✅ Cache hit for marketplace products: ${cachedProducts.length} products`);
        return NextResponse.json(
          { 
            products: cachedProducts,
            totalCount: cachedProducts.length,
            cached: true,
            region: region || 'all',
            searchTerm,
            lastUpdated: new Date().toISOString()
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
              'X-Cache': 'HIT',
              'X-Total-Products': cachedProducts.length.toString(),
            },
          }
        );
      }
    }

    console.log(`⚠️ Cache miss for marketplace products, fetching from Rezdy...`);
    
    // Fetch marketplace products
    const marketplaceData = await fetchMarketplaceProducts(searchTerm);
    
    // Filter and transform products
    const products = filterMarketplaceProducts(marketplaceData.products, region);
    
    console.log(`✅ Found ${products.length} marketplace products for search: "${searchTerm}"${region ? ` in region: ${region}` : ''}`);
    
    // Cache the results with a longer TTL (24 hours)
    await simpleCacheManager.set(cacheKey, products, 86400);
    
    return NextResponse.json(
      {
        products,
        totalCount: products.length,
        cached: false,
        region: region || 'all',
        searchTerm,
        lastUpdated: new Date().toISOString(),
        fetchStats: {
          totalProducts: marketplaceData.products.length,
          filteredProducts: products.length,
          fetchTime: new Date().toISOString(),
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
          'X-Cache': 'MISS',
          'X-Total-Products': products.length.toString(),
        },
      }
    );
    
  } catch (error) {
    console.error('❌ Error fetching marketplace products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch marketplace products from Rezdy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}