import { NextRequest, NextResponse } from "next/server";
import { simpleCacheManager } from "@/lib/utils/simple-cache-manager";
import { RezdyProduct } from "@/lib/types/rezdy";
import { ProductFilterService } from "@/lib/services/product-filter-service";

const REZDY_BASE_URL = "https://api.rezdy.com/v1";
const API_KEY = process.env.REZDY_API_KEY;
const RATE_LIMIT_DELAY = 600; // 600ms delay between requests

async function fetchProductsBatch(
  limit: number,
  offset: number
): Promise<RezdyProduct[]> {
  const url = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=${limit}&offset=${offset}`;

  console.log(`🔄 Fetching products batch: offset=${offset}, limit=${limit}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Rezdy API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.products || data.data || [];
}

async function fetchAllProducts(): Promise<RezdyProduct[]> {
  const allProducts: RezdyProduct[] = [];
  let offset = 0;
  const limit = 100; // Maximum allowed by Rezdy API
  let hasMore = true;
  let batchCount = 0;

  console.log("🚀 Starting to fetch all products from Rezdy...");

  while (hasMore) {
    try {
      batchCount++;
      const products = await fetchProductsBatch(limit, offset);

      if (products && products.length > 0) {
        allProducts.push(...products);
        offset += limit;
        hasMore = products.length === limit;

        console.log(
          `✅ Batch ${batchCount}: Fetched ${products.length} products (Total: ${allProducts.length})`
        );

        // Add delay to respect rate limits
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
      } else {
        hasMore = false;
        console.log(`🏁 No more products found at offset ${offset}`);
      }

      // Safety check to prevent infinite loops
      if (batchCount > 50) {
        console.warn("⚠️ Reached maximum batch limit (50), stopping fetch");
        break;
      }
    } catch (error) {
      console.error(`❌ Error fetching batch at offset ${offset}:`, error);

      // If it's a rate limit error, wait longer and retry once
      if (error instanceof Error && error.message.includes("429")) {
        console.log("⏳ Rate limit hit, waiting 60 seconds before retry...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        continue;
      }

      // For other errors, stop the process
      hasMore = false;
    }
  }

  console.log(
    `🎉 Completed fetching all products: ${allProducts.length} total products in ${batchCount} batches`
  );
  return allProducts;
}

// This function is now replaced by ProductFilterService.filterProducts()
// Keeping it for backward compatibility reference
function filterOutVouchers(products: RezdyProduct[]): RezdyProduct[] {
  // Use the comprehensive ProductFilterService instead
  return ProductFilterService.filterProducts(products);
}

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Rezdy API key not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const includeStats = searchParams.get("stats") === "true";

    // Generate cache key for tours only
    const cacheKey = "products:tours-only";

    // Return cache statistics if requested
    if (includeStats) {
      const cacheStats = simpleCacheManager.getCacheStats();
      return NextResponse.json({
        cache: cacheStats,
        timestamp: new Date().toISOString(),
      });
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedProducts = await simpleCacheManager.getProducts(cacheKey);
      if (cachedProducts && cachedProducts.length > 0) {
        console.log(
          `✅ Cache HIT for tours-only: ${cachedProducts.length} products`
        );

        return NextResponse.json(
          {
            products: cachedProducts,
            totalCount: cachedProducts.length,
            cached: true,
            lastUpdated: new Date().toISOString(),
            filterInfo: {
              type: "tours-only",
              excludes: ["GIFT_CARD", "vouchers", "gift cards", "certificates"],
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
    }

    console.log(`⚠️ Cache MISS for tours-only, fetching from Rezdy...`);

    // Fetch all products
    const allProducts = await fetchAllProducts();

    // Log filtering statistics
    console.log('📊 Product filtering statistics:');
    const filterStats = ProductFilterService.getFilterStatistics(allProducts);
    console.log(`   Total products: ${filterStats.total}`);
    console.log(`   Products to filter: ${filterStats.filtered}`);
    console.log(`   Filtered by reason:`, filterStats.byReason);

    // Apply comprehensive product filtering
    const toursOnlyProducts = ProductFilterService.filterProducts(allProducts);

    console.log(
      `🎯 Filtered ${allProducts.length} total products to ${
        toursOnlyProducts.length
      } tours (excluded ${
        allProducts.length - toursOnlyProducts.length
      } products)`
    );

    // Cache the filtered results
    await simpleCacheManager.cacheProducts(toursOnlyProducts, cacheKey);

    console.log(
      `✅ Cached ${toursOnlyProducts.length} tours-only products with key: ${cacheKey}`
    );

    const responseData = {
      products: toursOnlyProducts,
      totalCount: toursOnlyProducts.length,
      cached: false,
      lastUpdated: new Date().toISOString(),
      filterInfo: {
        type: "tours-only",
        excludes: ["GIFT_CARD", "vouchers", "gift cards", "certificates"],
        originalCount: allProducts.length,
        filteredCount: toursOnlyProducts.length,
        excludedCount: allProducts.length - toursOnlyProducts.length,
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
    console.error("Error fetching tours-only products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tours-only products from Rezdy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
