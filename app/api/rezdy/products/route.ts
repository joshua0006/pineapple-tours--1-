import { NextRequest, NextResponse } from "next/server";
import { simpleCacheManager } from "@/lib/utils/simple-cache-manager";

const REZDY_BASE_URL = "https://api.rezdy.com/v1";
const API_KEY = process.env.REZDY_API_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Rezdy API key not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";
    const featured = searchParams.get("featured");
    const stats = searchParams.get("stats");

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
    const cacheKey = featured
      ? "products:featured"
      : `products:${limit}:${offset}`;

    // Check cache first
    const cachedProducts = await simpleCacheManager.getProducts(cacheKey);
    if (cachedProducts) {
      console.log(
        `✅ Cache HIT for products: ${cacheKey} (${cachedProducts.length} products)`
      );
      return NextResponse.json(
        {
          products: cachedProducts,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            count: cachedProducts.length,
            hasMore: cachedProducts.length === parseInt(limit),
          },
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

    console.log(
      `⚠️ Cache MISS for products: ${cacheKey}, fetching from Rezdy...`
    );

    const url = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(isHighPriority && { Priority: "u=1, i" }), // High priority header for urgent requests
      },
      // Add timeout for high priority requests
      ...(isHighPriority && { signal: AbortSignal.timeout(15000) }),
    });

    if (!response.ok) {
      throw new Error(
        `Rezdy API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const products = data.products || data.data || [];

    // Cache the results
    await simpleCacheManager.cacheProducts(products, cacheKey);

    console.log(
      `✅ Cached ${products.length} products with key: ${cacheKey} (TTL: 30min)`
    );

    // Enhanced response with pagination info
    const responseData = {
      ...data,
      products,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: products.length,
        hasMore: products.length === parseInt(limit),
      },
    };

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        "X-Cache": "MISS",
        "X-Cache-Key": cacheKey,
      },
    });
  } catch (error) {
    console.error("Error fetching Rezdy products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products from Rezdy" },
      { status: 500 }
    );
  }
}
