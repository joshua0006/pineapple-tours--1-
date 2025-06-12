import { NextRequest, NextResponse } from 'next/server';
import { simpleCacheManager } from '@/lib/utils/simple-cache-manager';
import { RezdyProduct } from '@/lib/types/rezdy';
import { TOUR_CATEGORIES } from '@/lib/constants/categories';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;

interface CategoryWithCount {
  id: string;
  title: string;
  description: string;
  productTypes: string[];
  keywords: string[];
  slug: string;
  categoryGroup: 'tours' | 'experiences' | 'transportation';
  tourCount: number;
  products?: RezdyProduct[];
}

function matchesCategory(product: RezdyProduct, categoryId: string): boolean {
  const category = TOUR_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category) return false;

  // Check if product type matches
  if (category.productTypes.includes(product.productType || '')) {
    return true;
  }

  // Check if any keywords match in product name or description
  const searchText = `${product.name || ''} ${product.description || ''} ${product.shortDescription || ''}`.toLowerCase();
  return category.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
}

function categorizeProducts(products: RezdyProduct[]): CategoryWithCount[] {
  const categoriesWithCounts: CategoryWithCount[] = TOUR_CATEGORIES.map(category => ({
    ...category,
    tourCount: 0,
    products: []
  }));

  // Count products for each category
  products.forEach(product => {
    categoriesWithCounts.forEach(category => {
      if (matchesCategory(product, category.id)) {
        category.tourCount++;
        if (category.products) {
          category.products.push(product);
        }
      }
    });
  });

  return categoriesWithCounts;
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
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const minCount = parseInt(searchParams.get('minCount') || '0');
    
    const cacheKey = 'tour-categories:all';
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedCategories = await simpleCacheManager.getProducts(cacheKey);
      if (cachedCategories && cachedCategories.length > 0) {
        console.log(`✅ Cache hit for tour categories`);
        
        let categories = cachedCategories as unknown as CategoryWithCount[];
        
        // Filter by minimum count if specified
        if (minCount > 0) {
          categories = categories.filter(cat => cat.tourCount >= minCount);
        }
        
        // Remove products if not requested
        if (!includeProducts) {
          categories = categories.map(cat => {
            const { products, ...categoryWithoutProducts } = cat;
            return categoryWithoutProducts;
          });
        }
        
        return NextResponse.json(
          { 
            categories,
            totalCategories: categories.length,
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

    console.log(`⚠️ Cache miss for tour categories, fetching products from Rezdy...`);
    
    // First, get all products to analyze categories
    const productsUrl = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=1000&offset=0`;
    
    const response = await fetch(productsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Rezdy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const products: RezdyProduct[] = data.products || data.data || [];
    
    console.log(`✅ Fetched ${products.length} products for category analysis`);
    
    // Categorize products and count them
    const categoriesWithCounts = categorizeProducts(products);
    
    // Cache the results
    await simpleCacheManager.cacheProducts(categoriesWithCounts as unknown as RezdyProduct[], cacheKey);
    console.log(`✅ Cached tour categories with key: ${cacheKey}`);
    
    // Filter by minimum count if specified
    let filteredCategories = categoriesWithCounts;
    if (minCount > 0) {
      filteredCategories = categoriesWithCounts.filter(cat => cat.tourCount >= minCount);
    }
    
    // Remove products if not requested
    if (!includeProducts) {
      filteredCategories = filteredCategories.map(cat => {
        const { products, ...categoryWithoutProducts } = cat;
        return categoryWithoutProducts;
      });
    }
    
    return NextResponse.json(
      { 
        categories: filteredCategories,
        totalCategories: filteredCategories.length,
        cached: false,
        lastUpdated: new Date().toISOString(),
        stats: {
          totalProducts: products.length,
          categorizedProducts: categoriesWithCounts.reduce((sum, cat) => sum + cat.tourCount, 0),
          topCategories: categoriesWithCounts
            .sort((a, b) => b.tourCount - a.tourCount)
            .slice(0, 5)
            .map(cat => ({ id: cat.id, title: cat.title, count: cat.tourCount }))
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Cache': 'MISS',
        },
      }
    );
    
  } catch (error) {
    console.error('❌ Error fetching tour categories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tour categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 