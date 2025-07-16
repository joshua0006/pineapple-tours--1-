import { NextRequest, NextResponse } from "next/server";

// Import the cache from the main pickups route
// Note: This is a simplified approach - in production, you'd want to use a shared cache service
const getCacheStats = () => {
  // This would need to be refactored to share the cache instance
  // For now, we'll return basic stats
  return {
    message: "Cache stats endpoint - would need to be integrated with shared cache",
    timestamp: new Date().toISOString(),
  };
};

export async function GET(request: NextRequest) {
  try {
    const stats = getCacheStats();
    
    return NextResponse.json({
      cacheStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return NextResponse.json(
      {
        error: "Failed to get cache stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}