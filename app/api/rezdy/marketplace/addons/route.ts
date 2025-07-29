import { NextRequest, NextResponse } from 'next/server';
import { simpleCacheManager } from '@/lib/utils/simple-cache-manager';
import { RezdyExtra } from '@/lib/types/rezdy';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;
const RATE_LIMIT_DELAY = 600; // 600ms delay between requests

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
    extras?: Array<{
      id?: string;
      name: string;
      description?: string;
      price?: number;
      currency?: string;
      priceType?: "PER_PERSON" | "PER_BOOKING" | "PER_DAY";
      maxQuantity?: number;
      minQuantity?: number;
      isRequired?: boolean;
      isAvailable?: boolean;
      category?: string;
      image?: {
        itemUrl: string;
        thumbnailUrl?: string;
        mediumSizeUrl?: string;
        largeSizeUrl?: string;
        caption?: string;
      };
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

function filterMarketplaceAddons(products: MarketplaceProductsResponse['products'], region?: string): RezdyExtra[] {
  const addons: RezdyExtra[] = [];
  
  products.forEach((product) => {
    // Only include products that are eligible for marketplace
    if (!product.marketplaceRate && !product.maxCommissionPercent && !product.maxCommissionNetRate) {
      return;
    }
    
    // Filter by region if specified
    if (region && product.locationAddress?.city && 
        !product.locationAddress.city.toLowerCase().includes(region.toLowerCase())) {
      return;
    }
    
    // Since we're using server-side search, include all returned products
    const isTargetProduct = true;
    
    if (isTargetProduct) {
      // Create add-on from the product itself
      addons.push({
        id: `marketplace-${product.productCode}`,
        name: product.name,
        description: product.description || product.shortDescription || '',
        price: product.advertisedPrice || 0,
        currency: 'USD',
        priceType: 'PER_BOOKING',
        isRequired: false,
        isAvailable: true,
        category: 'marketplace',
        maxQuantity: 10,
        minQuantity: 1,
      });
    }
    
    // Also include any specific extras from products
    if (product.extras && product.extras.length > 0) {
      product.extras.forEach((extra, index) => {
        // Since we're using server-side search, include all available extras
        if (extra.isAvailable !== false) {
          addons.push({
            id: extra.id || `${product.productCode}-extra-${index}`,
            name: extra.name,
            description: extra.description,
            price: extra.price || 0,
            currency: extra.currency || 'USD',
            priceType: extra.priceType || 'PER_BOOKING',
            maxQuantity: extra.maxQuantity,
            minQuantity: extra.minQuantity,
            isRequired: extra.isRequired || false,
            isAvailable: extra.isAvailable !== false,
            category: extra.category || 'marketplace',
            image: extra.image ? {
              id: index + 1,
              itemUrl: extra.image.itemUrl,
              thumbnailUrl: extra.image.thumbnailUrl || extra.image.itemUrl,
              mediumSizeUrl: extra.image.mediumSizeUrl || extra.image.itemUrl,
              largeSizeUrl: extra.image.largeSizeUrl || extra.image.itemUrl,
              caption: extra.image.caption,
              isPrimary: false,
            } : undefined,
          });
        }
      });
    }
  });
  
  return addons;
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
    
    const cacheKey = `marketplace:addons:${searchTerm}:${region || 'all'}`;
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedAddons = await simpleCacheManager.get(cacheKey);
      if (cachedAddons) {
        console.log(`✅ Cache hit for marketplace addons: ${cachedAddons.length} addons`);
        return NextResponse.json(
          { 
            addons: cachedAddons,
            totalCount: cachedAddons.length,
            cached: true,
            region: region || 'all',
            searchTerm,
            lastUpdated: new Date().toISOString()
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // 24 hour cache, 48 hour stale
              'X-Cache': 'HIT',
              'X-Total-Addons': cachedAddons.length.toString(),
            },
          }
        );
      }
    }

    console.log(`⚠️ Cache miss for marketplace addons, fetching from Rezdy...`);
    
    // Fetch marketplace products
    const marketplaceData = await fetchMarketplaceProducts(searchTerm);
    
    // Filter and transform to add-ons
    const addons = filterMarketplaceAddons(marketplaceData.products, region);
    
    console.log(`✅ Found ${addons.length} marketplace add-ons for search: "${searchTerm}"${region ? ` in region: ${region}` : ''}`);
    
    // Cache the results with a longer TTL (24 hours)
    await simpleCacheManager.set(cacheKey, addons, 86400);
    
    return NextResponse.json(
      {
        addons,
        totalCount: addons.length,
        cached: false,
        region: region || 'all',
        searchTerm,
        lastUpdated: new Date().toISOString(),
        fetchStats: {
          totalProducts: marketplaceData.products.length,
          filteredAddons: addons.length,
          fetchTime: new Date().toISOString(),
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // 24 hour cache, 48 hour stale
          'X-Cache': 'MISS',
          'X-Total-Addons': addons.length.toString(),
        },
      }
    );
    
  } catch (error) {
    console.error('❌ Error fetching marketplace addons:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch marketplace addons from Rezdy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}