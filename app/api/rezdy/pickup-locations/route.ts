import { NextRequest, NextResponse } from "next/server";
import { EnhancedPickupFilter } from "@/lib/services/enhanced-pickup-filter";
import { RezdyProduct } from "@/lib/types/rezdy";

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
let aggregateCache: {
  data: any;
  timestamp: number;
} | null = null;

/**
 * GET /api/rezdy/pickup-locations
 * 
 * Returns aggregated pickup location data across all products
 * with product counts and API data availability information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const useApiData = searchParams.get("useApiData") !== "false"; // Default true
    const location = searchParams.get("location"); // Filter by specific location
    
    const now = Date.now();

    // Check cache first (unless refresh is requested)
    if (!refresh && aggregateCache && (now - aggregateCache.timestamp) < CACHE_TTL) {
      let responseData = aggregateCache.data;
      
      // Filter by location if specified
      if (location && location !== "all") {
        responseData = {
          ...responseData,
          locations: responseData.locations.filter((loc: any) => 
            loc.location.toLowerCase() === location.toLowerCase()
          ),
        };
      }
      
      return NextResponse.json({
        ...responseData,
        cached: true,
        cacheAge: now - aggregateCache.timestamp,
      });
    }

    // Fetch all products first
    const productsResponse = await fetch(
      `${request.nextUrl.origin}/api/rezdy/products/all`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`);
    }

    const productsData = await productsResponse.json();
    const products: RezdyProduct[] = productsData.products || [];

    if (products.length === 0) {
      return NextResponse.json({
        locations: [],
        totalProducts: 0,
        apiDataAvailable: 0,
        dataQuality: "no_products",
        cached: false,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Get aggregate pickup data using enhanced filtering
    const aggregateData = await EnhancedPickupFilter.getAggregatePickupData(
      products,
      useApiData
    );

    // Prepare response data
    const responseData = {
      locations: aggregateData.locations,
      totalProducts: aggregateData.totalProcessed,
      apiDataAvailable: aggregateData.apiDataAvailable,
      dataQuality: aggregateData.apiDataAvailable > 0 ? "enhanced" : "text_based",
      useApiData,
      cacheStats: EnhancedPickupFilter.getCacheStats(),
      lastUpdated: new Date().toISOString(),
    };

    // Cache the full result
    aggregateCache = {
      data: responseData,
      timestamp: now,
    };

    // Filter by location if specified
    let filteredData = responseData;
    if (location && location !== "all") {
      filteredData = {
        ...responseData,
        locations: responseData.locations.filter(loc => 
          loc.location.toLowerCase() === location.toLowerCase()
        ),
      };
    }

    return NextResponse.json({
      ...filteredData,
      cached: false,
    });

  } catch (error) {
    console.error("Error in pickup-locations API:", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch pickup locations",
        message: error instanceof Error ? error.message : "Unknown error",
        locations: [],
        totalProducts: 0,
        apiDataAvailable: 0,
        dataQuality: "error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rezdy/pickup-locations
 * 
 * Filter products by pickup location using enhanced filtering
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      location, 
      products, 
      useApiData = true 
    }: {
      location: string;
      products?: RezdyProduct[];
      useApiData?: boolean;
    } = body;

    if (!location) {
      return NextResponse.json(
        { error: "Location parameter is required" },
        { status: 400 }
      );
    }

    let productsToFilter: RezdyProduct[] = [];

    // If products not provided, fetch all products
    if (!products || products.length === 0) {
      const productsResponse = await fetch(
        `${request.nextUrl.origin}/api/rezdy/products/all`
      );

      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.status}`);
      }

      const productsData = await productsResponse.json();
      productsToFilter = productsData.products || [];
    } else {
      productsToFilter = products;
    }

    // Apply enhanced filtering
    const filterResult = await EnhancedPickupFilter.filterProductsByPickupLocation(
      productsToFilter,
      location,
      useApiData
    );

    return NextResponse.json({
      success: true,
      filteredProducts: filterResult.filteredProducts,
      filterStats: filterResult.filterStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error filtering products by pickup location:", error);
    
    return NextResponse.json(
      {
        error: "Failed to filter products",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rezdy/pickup-locations
 * 
 * Clear pickup location cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productCode = searchParams.get("productCode");

    // Clear enhanced filter cache
    EnhancedPickupFilter.clearCache(productCode || undefined);

    // Clear aggregate cache if no specific product
    if (!productCode) {
      aggregateCache = null;
    }

    return NextResponse.json({
      success: true,
      message: productCode 
        ? `Cache cleared for product ${productCode}` 
        : "All pickup location caches cleared",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error clearing pickup location cache:", error);
    
    return NextResponse.json(
      {
        error: "Failed to clear cache",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}