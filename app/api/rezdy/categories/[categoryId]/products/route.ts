import { NextRequest, NextResponse } from "next/server";
import { simpleCacheManager } from "@/lib/utils/simple-cache-manager";

const REZDY_BASE_URL = "https://api.rezdy.com/v1";
const API_KEY = process.env.REZDY_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Rezdy API key not configured" },
        { status: 500 }
      );
    }

    const { categoryId } = params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";
    const stats = searchParams.get("stats");
    const forceRefresh = searchParams.get("refresh") === "true";

    // Check for preload priority header
    const preloadPriority = request.headers.get("X-Preload-Priority");
    const isHighPriority = preloadPriority === "high";

    // Return cache statistics if requested
    if (stats === "true") {
      const cacheStats = simpleCacheManager.getCacheStats();
      return NextResponse.json({
        cache: cacheStats,
        timestamp: new Date().toISOString(),
      });
    }

    // Generate cache key
    const cacheKey = `category:${categoryId}:products:${limit}:${offset}`;
    const requestKey = `req:${cacheKey}`; // For request deduplication

    // Use request deduplication to prevent multiple simultaneous API calls
    return await simpleCacheManager.deduplicateRequest(requestKey, async () => {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedProducts = await simpleCacheManager.getCategoryProducts(cacheKey);
        if (cachedProducts) {
          console.log(
            `✅ Cache HIT for category products: ${cacheKey} (${cachedProducts.length} products)`
          );
          return NextResponse.json(
            {
              products: cachedProducts,
              categoryId: parseInt(categoryId),
              pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: cachedProducts.length,
                hasMore: cachedProducts.length === parseInt(limit),
              },
              cached: true,
            },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=1800, stale-while-revalidate=3600",
                "X-Cache": "HIT",
                "X-Cache-Key": cacheKey,
              },
            }
          );
        }

        // Try shared cache as fallback
        const sharedProducts = await simpleCacheManager.getProductsForCategory(parseInt(categoryId));
        if (sharedProducts && sharedProducts.length > 0) {
          console.log(
            `✅ Shared cache HIT for category ${categoryId} (${sharedProducts.length} products)`
          );
          
          // Apply pagination to shared cache results
          const startIndex = parseInt(offset);
          const endIndex = startIndex + parseInt(limit);
          const paginatedProducts = sharedProducts.slice(startIndex, endIndex);
          
          // Cache the paginated results for future use
          await simpleCacheManager.cacheCategoryProducts(paginatedProducts, cacheKey);
          
          return NextResponse.json(
            {
              products: paginatedProducts,
              categoryId: parseInt(categoryId),
              pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: paginatedProducts.length,
                hasMore: paginatedProducts.length === parseInt(limit),
              },
              cached: true,
              source: "shared-cache",
            },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=1800, stale-while-revalidate=3600",
                "X-Cache": "HIT-SHARED",
                "X-Cache-Key": cacheKey,
              },
            }
          );
        }
      }

      console.log(
        `⚠️ Cache MISS for category products: ${cacheKey}, fetching from Rezdy...`
      );

      const url = `${REZDY_BASE_URL}/categories/${categoryId}/products?apiKey=${API_KEY}&limit=${limit}&offset=${offset}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(isHighPriority && { Priority: "u=1, i" }),
        },
        ...(isHighPriority && { signal: AbortSignal.timeout(15000) }),
      });

      if (!response.ok) {
        throw new Error(
          `Rezdy API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const products = data.products || data.data || [];

      // Add categoryId to each product for reference
      const productsWithCategory = products.map((product: any) => ({
        ...product,
        categoryId: parseInt(categoryId),
      }));

      // Cache the results
      await simpleCacheManager.cacheCategoryProducts(productsWithCategory, cacheKey);

      console.log(
        `✅ Cached ${productsWithCategory.length} category products with key: ${cacheKey} (TTL: 30min)`
      );

      const responseData = {
        products: productsWithCategory,
        categoryId: parseInt(categoryId),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: productsWithCategory.length,
          hasMore: productsWithCategory.length === parseInt(limit),
        },
        totalCount: data.totalCount || productsWithCategory.length,
        cached: false,
      };

      return NextResponse.json(responseData, {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
          "X-Cache": "MISS",
          "X-Cache-Key": cacheKey,
        },
      });
    });
  } catch (error) {
    console.error("Error fetching Rezdy category products:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch category products from Rezdy",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}