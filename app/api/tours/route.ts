import { NextRequest, NextResponse } from 'next/server';
import { simpleCacheManager } from '@/lib/utils/simple-cache-manager';
import { RezdyProduct } from '@/lib/types/rezdy';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;
const RATE_LIMIT_DELAY = 600; // 600ms delay between requests (100 calls per minute limit)

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
    const category = searchParams.get('category');
    const productType = searchParams.get('productType');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const cacheKey = 'tours:all';
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedProducts = await simpleCacheManager.getProducts(cacheKey);
      if (cachedProducts && cachedProducts.length > 0) {
        console.log(`✅ Cache hit for all tours: ${cachedProducts.length} products`);
        
        // Apply filters if provided
        let filteredProducts = cachedProducts;
        
        if (category && category !== 'all') {
          filteredProducts = filteredProducts.filter(product => 
            product.categories?.includes(category) || 
            product.productType?.toLowerCase().includes(category.toLowerCase())
          );
        }
        
        if (productType && productType !== 'all') {
          filteredProducts = filteredProducts.filter(product => 
            product.productType === productType
          );
        }
        
        // Apply pagination
        const totalCount = filteredProducts.length;
        const paginatedProducts = filteredProducts.slice(offset, offset + limit);
        
        return NextResponse.json(
          { 
            tours: paginatedProducts,
            totalCount,
            cached: true,
            lastUpdated: new Date().toISOString(),
            filters: { category, productType, limit, offset }
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
              'X-Cache': 'HIT',
              'X-Total-Tours': totalCount.toString(),
            },
          }
        );
      }
    }

    console.log(`⚠️ Cache miss for all tours, fetching from Rezdy...`);
    
    // Fetch all products using pagination
    const allProducts = await fetchAllProducts();
    
    // Cache the results
    await simpleCacheManager.cacheProducts(allProducts, cacheKey);
    console.log(`✅ Cached ${allProducts.length} tours with key: ${cacheKey}`);
    
    // Apply filters if provided
    let filteredProducts = allProducts;
    
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.categories?.includes(category) || 
        product.productType?.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (productType && productType !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.productType === productType
      );
    }
    
    // Apply pagination
    const totalCount = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);
    
    return NextResponse.json(
      { 
        tours: paginatedProducts,
        totalCount,
        cached: false,
        lastUpdated: new Date().toISOString(),
        filters: { category, productType, limit, offset },
        fetchStats: {
          totalProducts: allProducts.length,
          fetchTime: new Date().toISOString()
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Cache': 'MISS',
          'X-Total-Tours': totalCount.toString(),
        },
      }
    );
    
  } catch (error) {
    console.error('❌ Error fetching tours:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tours from Rezdy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 