import { NextRequest, NextResponse } from 'next/server';
import { simpleCacheManager } from '@/lib/utils/simple-cache-manager';
import { PickupLocationService } from '@/lib/services/pickup-location-service';
import { ProductFilterService } from '@/lib/services/product-filter-service';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;
const RATE_LIMIT_DELAY = 600; // 600ms delay between requests (100 calls per minute limit)

interface RezdyTax {
  supplierId: number;
  label: string;
  taxFeeType: "TAX" | "FEE";
  taxType: "PERCENT" | "FIXED";
  taxPercent?: number;
  taxAmount?: number;
  priceInclusive: boolean;
  compound: boolean;
}

interface RezdyProduct {
  productCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  advertisedPrice?: number;
  images?: Array<{ itemUrl: string; thumbnailUrl?: string; mediumSizeUrl?: string; largeSizeUrl?: string }>;
  quantityRequiredMin?: number;
  quantityRequiredMax?: number;
  productType?: string;
  locationAddress?: {
    addressLine?: string;
    city?: string;
    state?: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
  };
  priceOptions?: Array<{
    price: number;
    label: string;
    id: number;
    seatsUsed: number;
  }>;
  currency?: string;
  timezone?: string;
  supplierId?: number;
  supplierName?: string;
  dateCreated?: string;
  dateUpdated?: string;
  tags?: string[];
  categories?: string[];
  taxes?: RezdyTax[];
}

interface RezdyApiResponse {
  requestStatus: {
    success: boolean;
    error?: {
      errorCode: string;
      errorMessage: string;
    };
  };
  products: RezdyProduct[];
}

async function fetchProductsBatch(limit: number, offset: number): Promise<RezdyProduct[]> {
  const url = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=${limit}&offset=${offset}`;
  
  console.log(`🔄 Fetching products batch: offset=${offset}, limit=${limit}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Rezdy API error: ${response.status} ${response.statusText}`);
  }

  const data: RezdyApiResponse = await response.json();
  
  if (!data.requestStatus.success) {
    throw new Error(`Rezdy API error: ${data.requestStatus.error?.errorMessage || 'Unknown error'}`);
  }

  return data.products || [];
}

async function fetchAllProducts(): Promise<RezdyProduct[]> {
  const allProducts: RezdyProduct[] = [];
  let offset = 0;
  const limit = 100; // Maximum allowed by Rezdy API
  let hasMore = true;
  let batchCount = 0;

  console.log('🚀 Starting to fetch all products from Rezdy...');

  while (hasMore) {
    try {
      batchCount++;
      const products = await fetchProductsBatch(limit, offset);
      
      if (products && products.length > 0) {
        allProducts.push(...products);
        offset += limit;
        hasMore = products.length === limit;
        
        console.log(`✅ Batch ${batchCount}: Fetched ${products.length} products (Total: ${allProducts.length})`);
        
        // Add delay to respect rate limits (100 calls per minute)
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
      } else {
        hasMore = false;
        console.log(`🏁 No more products found at offset ${offset}`);
      }
      
      // Safety check to prevent infinite loops
      if (batchCount > 50) {
        console.warn('⚠️ Reached maximum batch limit (50), stopping fetch');
        break;
      }
      
    } catch (error) {
      console.error(`❌ Error fetching batch at offset ${offset}:`, error);
      
      // If it's a rate limit error, wait longer and retry once
      if (error instanceof Error && error.message.includes('429')) {
        console.log('⏳ Rate limit hit, waiting 60 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        continue;
      }
      
      // For other errors, stop the process
      hasMore = false;
    }
  }

  console.log(`🎉 Completed fetching all products: ${allProducts.length} total products in ${batchCount} batches`);
  return allProducts;
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
    
    const cacheKey = 'products:all';
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedProducts = await simpleCacheManager.getProducts(cacheKey);
      if (cachedProducts && cachedProducts.length > 0) {
        console.log(`✅ Cache hit for all products: ${cachedProducts.length} products`);
        return NextResponse.json(
          { 
            products: cachedProducts,
            totalCount: cachedProducts.length,
            cached: true,
            lastUpdated: new Date().toISOString()
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache, 2 hour stale
              'X-Cache': 'HIT',
              'X-Total-Products': cachedProducts.length.toString(),
            },
          }
        );
      }
    }

    console.log(`⚠️ Cache miss for all products, fetching from Rezdy...`);
    
    // Fetch all products using pagination
    const allProducts = await fetchAllProducts();
    
    // Log filtering statistics before filtering
    console.log('📊 Product filtering statistics:');
    const filterStats = ProductFilterService.getFilterStatistics(allProducts);
    console.log(`   Total products: ${filterStats.total}`);
    console.log(`   Products to filter: ${filterStats.filtered}`);
    console.log(`   Filtered by reason:`, filterStats.byReason);
    
    // Apply comprehensive product filtering
    const filteredProducts = ProductFilterService.filterProducts(allProducts);
    console.log(`✅ Products after filtering: ${filteredProducts.length}`);
    
    // Transform products to ensure consistent structure
    const transformedProducts = filteredProducts.map((product, index) => {
      // Extract pickup locations for this product
      const pickupLocations = PickupLocationService.extractPickupLocations(product);
      const primaryPickupLocation = PickupLocationService.getPrimaryPickupLocation(product);
      
      return {
        productCode: product.productCode,
        name: product.name,
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        advertisedPrice: product.advertisedPrice || 0,
        images: product.images?.map((img, imgIndex) => ({
          id: imgIndex + 1, // Generate ID since API doesn't provide it
          itemUrl: img.itemUrl,
          thumbnailUrl: img.thumbnailUrl || img.itemUrl,
          mediumSizeUrl: img.mediumSizeUrl || img.itemUrl,
          largeSizeUrl: img.largeSizeUrl || img.itemUrl,
          caption: '',
          isPrimary: imgIndex === 0,
        })) || [],
        quantityRequiredMin: product.quantityRequiredMin || 1,
        quantityRequiredMax: product.quantityRequiredMax || 50,
        productType: product.productType || 'ACTIVITY',
        locationAddress: product.locationAddress || undefined,
        customFields: {},
        status: 'ACTIVE',
        categories: product.categories || [],
        extras: [],
        taxes: product.taxes || [],
        // Add pickup location data
        pickupLocations,
        departsFrom: pickupLocations, // Same as pickupLocations for now
        primaryPickupLocation,
      };
    });

    // Cache the results with a longer TTL for all products (24 hours)
    await simpleCacheManager.cacheProducts(transformedProducts, cacheKey);
    
    // Log pickup location statistics
    const pickupStats = PickupLocationService.getPickupLocationStats(transformedProducts);
    console.log(`✅ Cached ${transformedProducts.length} products with key: ${cacheKey}`);
    console.log(`📍 Pickup location stats:`, pickupStats);

    return NextResponse.json(
      {
        products: transformedProducts,
        totalCount: transformedProducts.length,
        cached: false,
        lastUpdated: new Date().toISOString(),
        fetchStats: {
          totalProducts: transformedProducts.length,
          fetchTime: new Date().toISOString(),
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache, 2 hour stale
          'X-Cache': 'MISS',
          'X-Total-Products': transformedProducts.length.toString(),
        },
      }
    );
    
  } catch (error) {
    console.error('❌ Error fetching all Rezdy products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch all products from Rezdy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 