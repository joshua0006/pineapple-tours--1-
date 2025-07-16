import { NextRequest, NextResponse } from "next/server";
import { RezdyPickupLocation } from "@/lib/types/rezdy";
import { PickupStorage } from "@/lib/services/pickup-storage";

const REZDY_BASE_URL = "https://api.rezdy.com/v1";
const API_KEY = process.env.REZDY_API_KEY;

// Rate limiting for API calls
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 600; // 600ms between requests

// Request deduplication - track ongoing requests
const ongoingRequests = new Map<string, Promise<RezdyPickupLocation[]>>();

/**
 * Fetch pickup locations from Rezdy API with request deduplication
 */
async function fetchFromRezdyApi(productCode: string, forceRefresh = false): Promise<RezdyPickupLocation[]> {
  if (!API_KEY) {
    throw new Error("Rezdy API key not configured");
  }

  const requestKey = `${productCode}:${forceRefresh}`;

  // Check if there's already an ongoing request for this product
  if (!forceRefresh && ongoingRequests.has(requestKey)) {
    console.log(`🔄 Deduplicating request for ${productCode} - waiting for ongoing request`);
    return await ongoingRequests.get(requestKey)!;
  }

  // Create new request promise
  const requestPromise = (async (): Promise<RezdyPickupLocation[]> => {
    try {
      // Rate limiting
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

      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Product has no pickup locations
          return [];
        }
        throw new Error(`Rezdy API error: ${response.status}`);
      }

      const data = await response.json();
      return data.pickupLocations || [];
    } finally {
      // Clean up the ongoing request when done
      ongoingRequests.delete(requestKey);
    }
  })();

  // Store the request promise for deduplication
  ongoingRequests.set(requestKey, requestPromise);

  return await requestPromise;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productCode: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const { productCode } = await params;

    console.log(`📡 Pickup request for ${productCode} (refresh: ${refresh})`);

    // Define API client for PickupStorage
    const apiClient = {
      fetchFromApi: (productCode: string) => fetchFromRezdyApi(productCode, refresh),
    };

    let pickups: RezdyPickupLocation[];
    let fromCache = false;
    let fetchedAt: string;

    if (refresh) {
      // Force refresh from API
      console.log(`🔄 Force refreshing pickup data for ${productCode}`);
      pickups = await PickupStorage.refreshPickupData(productCode, apiClient);
      fetchedAt = new Date().toISOString();
    } else {
      // Try to load from file storage first
      const cachedPickups = await PickupStorage.loadPickupData(productCode);
      
      if (cachedPickups !== null) {
        // Found in storage
        console.log(`💾 Using stored pickup data for ${productCode} (${cachedPickups.length} locations)`);
        pickups = cachedPickups;
        fromCache = true;
        fetchedAt = 'cached'; // We could enhance this to track actual fetch date
      } else {
        // Not in storage, fetch from API and save
        console.log(`🆕 Fetching new pickup data for ${productCode}`);
        pickups = await PickupStorage.getPickupData(productCode, apiClient);
        fetchedAt = new Date().toISOString();
      }
    }

    return NextResponse.json({
      pickups,
      productCode,
      totalCount: pickups.length,
      cached: fromCache,
      lastUpdated: fetchedAt,
      hasPickups: pickups.length > 0,
      source: fromCache ? 'file_storage' : 'rezdy_api',
      cacheStats: {
        hitCount: fromCache ? 1 : 0,
        age: fromCache ? 'permanent' : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching product pickups:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product pickups",
        message: error instanceof Error ? error.message : "Unknown error",
        pickups: [],
        productCode: (await params).productCode,
        hasPickups: false,
      },
      { status: 500 }
    );
  }
}

// Storage invalidation endpoint (DELETE method)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productCode: string }> }
) {
  try {
    const { productCode } = await params;
    
    // Check if file exists before deletion
    const hasData = await PickupStorage.hasPickupData(productCode);
    
    // Delete the stored pickup data
    await PickupStorage.deletePickupData(productCode);
    
    return NextResponse.json({
      success: true,
      productCode,
      wasStored: hasData,
      message: hasData 
        ? "Stored pickup data deleted successfully" 
        : "No stored pickup data found for this product",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deleting stored pickup data:", error);
    return NextResponse.json(
      {
        error: "Failed to delete stored pickup data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}