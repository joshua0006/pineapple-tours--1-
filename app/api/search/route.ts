import { NextRequest, NextResponse } from 'next/server';

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';
const API_KEY = process.env.REZDY_API_KEY;

interface SearchFilters {
  query?: string;
  category?: string;
  productType?: string;
  priceRange?: string;
  duration?: string;
  travelers?: string;
  sortBy?: string;
  checkIn?: string;
  checkOut?: string;
  page?: number;
  limit?: number;
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
    
    // Extract search parameters
    const filters: SearchFilters = {
      query: searchParams.get('query') || '',
      category: searchParams.get('category') || 'all',
      productType: searchParams.get('productType') || 'all',
      priceRange: searchParams.get('priceRange') || 'all',
      duration: searchParams.get('duration') || 'any',
      travelers: searchParams.get('travelers') || '1',
      sortBy: searchParams.get('sortBy') || 'name',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
    };

    // Fetch ALL products from Rezdy API first (we'll filter and paginate them)
    const url = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=1000&offset=0`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Rezdy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let products = data.products || data.data || [];

    // Filter products based on search criteria
    const filteredProducts = products.filter((product: any) => {
      // Exclude GIFT_CARD products
      if (product.productType === "GIFT_CARD") {
        return false;
      }

      // Search query filter
      if (filters.query && filters.query.trim() !== '') {
        const searchText = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${product.locationAddress || ''}`.toLowerCase();
        const queryTerms = filters.query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        // Check if all query terms are found in the search text
        const matchesQuery = queryTerms.every(term => searchText.includes(term));
        if (!matchesQuery) return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        const searchText = `${product.name} ${product.shortDescription || ''} ${product.description || ''}`.toLowerCase();
        
        switch (filters.category) {
          case "family":
            if (!searchText.includes("family") && !searchText.includes("kids") && !searchText.includes("children")) return false;
            break;
          case "honeymoon":
            if (!searchText.includes("romantic") && !searchText.includes("honeymoon") && !searchText.includes("couples")) return false;
            break;
          case "adventure":
            if (!searchText.includes("adventure") && !searchText.includes("hiking") && !searchText.includes("diving") && !searchText.includes("expedition")) return false;
            break;
          case "cultural":
            if (!searchText.includes("cultural") && !searchText.includes("culture") && !searchText.includes("heritage") && !searchText.includes("traditional")) return false;
            break;
          case "nature":
            if (!searchText.includes("nature") && !searchText.includes("wildlife") && !searchText.includes("national park") && !searchText.includes("scenic")) return false;
            break;
          case "luxury":
            if (!searchText.includes("luxury") && !searchText.includes("premium") && !searchText.includes("exclusive")) return false;
            break;
        }
      }

      // Product Type filter
      if (filters.productType && filters.productType !== 'all') {
        if (!product.productType) return false;
        
        const productTypeUpper = product.productType.toUpperCase();
        
        switch (filters.productType) {
          case "day-tour":
            if (!productTypeUpper.includes("DAY_TOUR") && !productTypeUpper.includes("TOUR")) return false;
            break;
          case "multiday-tour":
            if (!productTypeUpper.includes("MULTIDAY_TOUR") && !productTypeUpper.includes("MULTI_DAY_TOUR") && !productTypeUpper.includes("PACKAGE")) return false;
            break;
          case "private-tour":
            if (!productTypeUpper.includes("PRIVATE_TOUR") && !productTypeUpper.includes("PRIVATE")) return false;
            break;
          case "transfer":
            if (!productTypeUpper.includes("TRANSFER") && !productTypeUpper.includes("TRANSPORT") && !productTypeUpper.includes("TRANSPORTATION")) return false;
            break;
        }
      }

      // Price range filter
      if (filters.priceRange && filters.priceRange !== 'all') {
        const price = product.advertisedPrice || 0;
        switch (filters.priceRange) {
          case "under-500":
            if (price >= 500) return false;
            break;
          case "500-1000":
            if (price < 500 || price >= 1000) return false;
            break;
          case "1000-2000":
            if (price < 1000 || price >= 2000) return false;
            break;
          case "over-2000":
            if (price < 2000) return false;
            break;
        }
      }

      // Duration filter (basic implementation based on product name/description)
      if (filters.duration && filters.duration !== 'any') {
        const searchText = `${product.name} ${product.shortDescription || ''} ${product.description || ''}`.toLowerCase();
        
        switch (filters.duration) {
          case "1-3":
            if (!searchText.includes("day") && !searchText.includes("half day") && !searchText.includes("3 day")) return false;
            break;
          case "4-7":
            if (!searchText.includes("week") && !searchText.includes("7 day") && !searchText.includes("4 day") && !searchText.includes("5 day") && !searchText.includes("6 day")) return false;
            break;
          case "8-14":
            if (!searchText.includes("10 day") && !searchText.includes("14 day") && !searchText.includes("two week")) return false;
            break;
          case "15+":
            if (!searchText.includes("month") && !searchText.includes("extended") && !searchText.includes("long")) return false;
            break;
        }
      }

      // Date filtering (basic validation - for full availability checking, 
      // you would need to call the availability API for each product)
      if (filters.checkIn && filters.checkOut) {
        const checkInDate = new Date(filters.checkIn);
        const checkOutDate = new Date(filters.checkOut);
        const today = new Date();
        
        // Basic date validation
        if (checkInDate < today || checkOutDate <= checkInDate) {
          return false;
        }
        
        // Note: For real-world implementation, you would check actual availability
        // by calling the Rezdy availability API for each product with these dates
        // This is a simplified implementation that just validates the date range
      }

      return true;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
      switch (filters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return (a.advertisedPrice || 0) - (b.advertisedPrice || 0);
        case "price-high":
          return (b.advertisedPrice || 0) - (a.advertisedPrice || 0);
        case "newest":
          return a.productCode.localeCompare(b.productCode);
        case "relevance":
        default:
          // For relevance, prioritize exact matches in name, then description
          if (filters.query) {
            const queryLower = filters.query.toLowerCase();
            const aNameMatch = a.name.toLowerCase().includes(queryLower);
            const bNameMatch = b.name.toLowerCase().includes(queryLower);
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
          }
          return a.name.localeCompare(b.name);
      }
    });

    // Calculate pagination
    const totalCount = sortedProducts.length;
    const totalPages = Math.ceil(totalCount / (filters.limit || 12));
    const currentPage = Math.max(1, Math.min(filters.page || 1, totalPages));
    const offset = (currentPage - 1) * (filters.limit || 12);
    const paginatedProducts = sortedProducts.slice(offset, offset + (filters.limit || 12));

    // Prepare response with metadata
    const response_data = {
      products: paginatedProducts,
      totalCount: totalCount,
      totalPages: totalPages,
      currentPage: currentPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      filters: filters,
      metadata: {
        hasResults: sortedProducts.length > 0,
        searchQuery: filters.query,
        appliedFilters: {
          category: filters.category !== 'all' ? filters.category : null,
          productType: filters.productType !== 'all' ? filters.productType : null,
          priceRange: filters.priceRange !== 'all' ? filters.priceRange : null,
          duration: filters.duration !== 'any' ? filters.duration : null,
        }
      }
    };

    return NextResponse.json(response_data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search tours',
        products: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        metadata: { hasResults: false }
      },
      { status: 500 }
    );
  }
} 