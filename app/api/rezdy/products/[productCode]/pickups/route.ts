import { NextRequest, NextResponse } from "next/server";
import { RezdyPickupLocation } from "@/lib/types/rezdy";

const REZDY_BASE_URL = "https://api.rezdy.com/v1";
const API_KEY = process.env.REZDY_API_KEY;

// Enhanced in-memory cache for pickups with LRU eviction
const pickupsCache = new Map<
  string,
  { 
    data: RezdyPickupLocation[]; 
    timestamp: number; 
    etag: string | null;
    lastAccessed: number;
    hitCount: number;
  }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const CACHE_SIZE_LIMIT = 1000; // Maximum number of cached entries
const BACKGROUND_REFRESH_THRESHOLD = 20 * 60 * 1000; // 20 minutes - refresh in background after this

// Rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 600; // 600ms between requests

// Cache management utilities
function evictLeastRecentlyUsed() {
  if (pickupsCache.size <= CACHE_SIZE_LIMIT) return;
  
  let oldestKey = '';
  let oldestTime = Date.now();
  
  for (const [key, value] of pickupsCache.entries()) {
    if (value.lastAccessed < oldestTime) {
      oldestTime = value.lastAccessed;
      oldestKey = key;
    }
  }
  
  if (oldestKey) {
    pickupsCache.delete(oldestKey);
  }
}

function updateCacheEntry(key: string, data: RezdyPickupLocation[], etag: string | null) {
  const now = Date.now();
  const existing = pickupsCache.get(key);
  
  pickupsCache.set(key, {
    data,
    timestamp: now,
    etag,
    lastAccessed: now,
    hitCount: (existing?.hitCount || 0) + 1,
  });
  
  evictLeastRecentlyUsed();
}

function getCacheEntry(key: string) {
  const entry = pickupsCache.get(key);
  if (entry) {
    entry.lastAccessed = Date.now();
    entry.hitCount += 1;
  }
  return entry;
}

// Background refresh function (fire-and-forget)
async function backgroundRefresh(productCode: string, cachedEntry: any) {
  try {
    // Wait for rate limit
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    lastRequestTime = Date.now();

    const url = `${REZDY_BASE_URL}/products/${productCode}/pickups?apiKey=${API_KEY}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (cachedEntry?.etag) {
      headers["If-None-Match"] = cachedEntry.etag;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (response.status === 304) {
      // Data hasn't changed, just update timestamp
      cachedEntry.timestamp = Date.now();
      return;
    }

    if (response.ok) {
      const data = await response.json();
      const etag = response.headers.get("etag");
      const pickups: RezdyPickupLocation[] = data.pickupLocations || [];
      
      updateCacheEntry(`pickups-${productCode}`, pickups, etag);
      console.log(`Background refresh completed for product ${productCode}`);
    }
  } catch (error) {
    console.error(`Background refresh failed for product ${productCode}:`, error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productCode: string }> }
) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Rezdy API key not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const { productCode } = await params;

    // Check cache first
    const cacheKey = `pickups-${productCode}`;
    const cached = getCacheEntry(cacheKey);
    const now = Date.now();

    if (
      !refresh &&
      cached &&
      now - cached.timestamp < CACHE_TTL &&
      cached.data
    ) {
      // Check if we should trigger background refresh
      if (now - cached.timestamp > BACKGROUND_REFRESH_THRESHOLD) {
        // Fire background refresh (don't wait for it)
        backgroundRefresh(productCode, cached).catch(console.error);
      }

      return NextResponse.json({
        pickups: cached.data,
        productCode,
        totalCount: cached.data.length,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString(),
        hasPickups: cached.data.length > 0,
        cacheStats: {
          hitCount: cached.hitCount,
          age: now - cached.timestamp,
        },
      });
    }

    // Rate limiting
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    lastRequestTime = Date.now();

    // Fetch from Rezdy API
    const url = `${REZDY_BASE_URL}/products/${productCode}/pickups?apiKey=${API_KEY}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add If-None-Match header if we have an etag
    if (cached?.etag) {
      headers["If-None-Match"] = cached.etag;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    // Handle 304 Not Modified
    if (response.status === 304 && cached) {
      // Data hasn't changed, update timestamp and return cached data
      cached.timestamp = now;
      return NextResponse.json({
        pickups: cached.data,
        productCode,
        totalCount: cached.data.length,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString(),
        hasPickups: cached.data.length > 0,
      });
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json({
          pickups: [],
          productCode,
          message: "No pickups found for this product",
          cached: false,
          lastUpdated: new Date().toISOString(),
          hasPickups: false,
        });
      }
      
      throw new Error(`Rezdy API error: ${response.status}`);
    }

    const data = await response.json();
    const etag = response.headers.get("etag");

    // Extract pickup locations from the response
    const pickups: RezdyPickupLocation[] = data.pickupLocations || [];

    // Cache the result
    updateCacheEntry(cacheKey, pickups, etag);

    return NextResponse.json({
      pickups,
      productCode,
      totalCount: pickups.length,
      cached: false,
      lastUpdated: new Date().toISOString(),
      hasPickups: pickups.length > 0,
      requestStatus: data.requestStatus,
      cacheStats: {
        hitCount: 0,
        age: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching product pickups:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product pickups",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Cache invalidation endpoint (DELETE method)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productCode: string }> }
) {
  try {
    const { productCode } = await params;
    const cacheKey = `pickups-${productCode}`;
    
    const wasDeleted = pickupsCache.delete(cacheKey);
    
    return NextResponse.json({
      success: true,
      productCode,
      cached: wasDeleted,
      message: wasDeleted 
        ? "Cache invalidated successfully" 
        : "No cache entry found for this product",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    return NextResponse.json(
      {
        error: "Failed to invalidate cache",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}