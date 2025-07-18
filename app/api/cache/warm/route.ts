import { NextRequest, NextResponse } from "next/server";
import { CacheOptimizationService } from "@/lib/services/cache-optimization-service";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    
    if (categoryId) {
      // Warm specific category
      await CacheOptimizationService.preloadCategory(parseInt(categoryId));
      
      return NextResponse.json({
        success: true,
        message: `Cache warming initiated for category ${categoryId}`,
        categoryId: parseInt(categoryId),
      });
    } else {
      // Warm all popular categories
      await CacheOptimizationService.initializeCache();
      
      return NextResponse.json({
        success: true,
        message: "Cache warming initiated for all popular categories",
      });
    }
  } catch (error) {
    console.error("Cache warming error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to warm cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const health = searchParams.get("health") === "true";
    
    if (health) {
      // Return cache health status
      const healthStatus = CacheOptimizationService.getCacheHealthStatus();
      
      return NextResponse.json({
        ...healthStatus,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Return cache performance metrics
      const metrics = CacheOptimizationService.getCachePerformanceMetrics();
      
      return NextResponse.json({
        metrics,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Cache metrics error:", error);
    return NextResponse.json(
      {
        error: "Failed to get cache metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}