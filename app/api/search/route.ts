import { NextRequest, NextResponse } from 'next/server';
import { getCityFromLocation } from '@/lib/utils/product-utils';
import { doesProductMatchCategory } from '@/lib/constants/categories';

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
  city?: string;
  location?: string;
  page?: number;
  limit?: number;
}

// Helper function to check product availability for specific dates
async function checkProductAvailability(productCode: string, checkIn: string, checkOut: string, travelers: string = '1'): Promise<boolean> {
  try {
    if (!API_KEY) return true; // If no API key, assume available
    
    // Format dates for Rezdy API (YYYY-MM-DD)
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    };

    const formattedCheckIn = formatDate(checkIn);
    const formattedCheckOut = formatDate(checkOut);
    
    if (!formattedCheckIn || !formattedCheckOut) return false;

    // Prepare participants parameter (default to adult travelers)
    const participants = `ADULT:${travelers}`;
    
    const url = `${REZDY_BASE_URL}/availability?apiKey=${API_KEY}&productCode=${encodeURIComponent(productCode)}&startTime=${formattedCheckIn}&endTime=${formattedCheckOut}&participants=${encodeURIComponent(participants)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Availability check failed for ${productCode}: ${response.status}`);
      return true; // If availability check fails, assume available to not exclude products
    }

    const data = await response.json();
    
    // Check if there are any available sessions in the date range
    const sessions = data.sessions || [];
    const hasAvailableSessions = sessions.some((session: any) => {
      const sessionDate = new Date(session.startTimeLocal);
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      return sessionDate >= checkInDate && 
             sessionDate <= checkOutDate && 
             (session.seatsAvailable || 0) > 0;
    });

    return hasAvailableSessions;
  } catch (error) {
    console.warn(`Error checking availability for ${productCode}:`, error);
    return true; // If error occurs, assume available to not exclude products
  }
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
      city: searchParams.get('city') || '',
      location: searchParams.get('location') || '',
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
    let filteredProducts = products.filter((product: any) => {
      // Exclude GIFT_CARD products
      if (product.productType === "GIFT_CARD") {
        return false;
      }

      // City filter - check both city and location parameters
      if ((filters.city && filters.city !== 'all') || (filters.location && filters.location !== '')) {
        const targetCity = filters.city || filters.location;
        
        if (targetCity) {
          const productCity = getCityFromLocation(product.locationAddress);
          
          if (!productCity || productCity.toLowerCase() !== targetCity.toLowerCase()) {
            // Also check if the city is mentioned in the location address string
            const locationText = typeof product.locationAddress === 'string' 
              ? product.locationAddress.toLowerCase()
              : '';
            
            if (!locationText.includes(targetCity.toLowerCase())) {
              return false;
            }
          }
        }
      }

      // Search query filter
      if (filters.query && filters.query.trim() !== '') {
        const searchText = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${product.locationAddress || ''}`.toLowerCase();
        const queryTerms = filters.query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        // Check if all query terms are found in the search text
        const matchesQuery = queryTerms.every(term => searchText.includes(term));
        if (!matchesQuery) return false;
      }

      // Category filter using the centralized function
      if (filters.category && filters.category !== 'all') {
        if (!doesProductMatchCategory(product, filters.category)) {
          return false;
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
          case "under-99":
            if (price >= 99) return false;
            break;
          case "99-159":
            if (price < 99 || price >= 159) return false;
            break;
          case "159-299":
            if (price < 159 || price >= 299) return false;
            break;
          case "over-299":
            if (price < 299) return false;
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

      // Basic date validation (dates must be in the future and check-out after check-in)
      if (filters.checkIn && filters.checkOut) {
        const checkInDate = new Date(filters.checkIn);
        const checkOutDate = new Date(filters.checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        
        // Basic date validation
        if (checkInDate < today || checkOutDate <= checkInDate) {
          return false;
        }
      }

      return true;
    });

    // Enhanced date filtering with availability checking
    if (filters.checkIn && filters.checkOut && filteredProducts.length > 0) {
      console.log(`Checking availability for ${filteredProducts.length} products between ${filters.checkIn} and ${filters.checkOut}`);
      
      // Check availability for each product (with concurrency limit to avoid overwhelming the API)
      const BATCH_SIZE = 10; // Process products in batches to avoid rate limiting
      const availableProducts = [];
      
      for (let i = 0; i < filteredProducts.length; i += BATCH_SIZE) {
        const batch = filteredProducts.slice(i, i + BATCH_SIZE);
        
        const availabilityPromises = batch.map(async (product: any) => {
          const isAvailable = await checkProductAvailability(
            product.productCode, 
            filters.checkIn!, 
            filters.checkOut!, 
            filters.travelers || '1'
          );
          return { product, isAvailable };
        });
        
        const batchResults = await Promise.all(availabilityPromises);
        const availableBatch = batchResults
          .filter(result => result.isAvailable)
          .map(result => result.product);
        
        availableProducts.push(...availableBatch);
      }
      
      filteredProducts = availableProducts;
      console.log(`Found ${filteredProducts.length} products with availability`);
    }

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
          checkIn: filters.checkIn || null,
          checkOut: filters.checkOut || null,
          city: filters.city || null,
          location: filters.location || null,
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