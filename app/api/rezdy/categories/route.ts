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
    const visibleOnly = searchParams.get("visibleOnly") === "true";
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
    const cacheKey = visibleOnly ? "categories:visible" : "categories:all";

    // Check cache first
    const cachedCategories = await simpleCacheManager.getCategories(cacheKey);
    if (cachedCategories) {
      console.log(
        `✅ Cache HIT for categories: ${cacheKey} (${cachedCategories.length} categories)`
      );
      return NextResponse.json(
        {
          categories: cachedCategories,
          count: cachedCategories.length,
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
      `⚠️ Cache MISS for categories: ${cacheKey}, fetching from Rezdy...`
    );

    const url = `${REZDY_BASE_URL}/categories?apiKey=${API_KEY}`;

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
    let categories = data.categories || data.data || [];

    // Filter to visible categories only if requested
    if (visibleOnly) {
      categories = categories.filter((category: any) => category.isVisible);
    }

    // Cache the results
    await simpleCacheManager.cacheCategories(categories, cacheKey);

    console.log(
      `✅ Cached ${categories.length} categories with key: ${cacheKey} (TTL: 30min)`
    );

    const responseData = {
      categories,
      count: categories.length,
      totalCount: data.totalCount || categories.length,
    };

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        "X-Cache": "MISS",
        "X-Cache-Key": cacheKey,
      },
    });
  } catch (error) {
    console.error("Error fetching Rezdy categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories from Rezdy" },
      { status: 500 }
    );
  }
}