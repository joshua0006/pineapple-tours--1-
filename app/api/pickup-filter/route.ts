import { NextRequest, NextResponse } from 'next/server';
import { UnifiedPickupFilter } from '@/lib/services/unified-pickup-filter';
import { RegionFilterService } from '@/lib/services/region-filter-service';
import { RezdyProduct, RegionFilterOptions } from '@/lib/types/rezdy';

/**
 * Enhanced product filtering API endpoint
 * Supports both city-based and region-based filtering
 * - Region filtering: Uses pickup location regions (Brisbane, Gold Coast, Tamborine Mountain)
 * - City filtering: Fallback to locationAddress.city data from Rezdy products
 */
export async function POST(request: NextRequest) {
  try {
    const { products, location, region, options } = await request.json();

    // Validate input
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products must be an array' },
        { status: 400 }
      );
    }

    // Must have either location or region
    if ((!location || typeof location !== 'string') && (!region || typeof region !== 'string')) {
      return NextResponse.json(
        { error: 'Either location or region must be provided as a string' },
        { status: 400 }
      );
    }

    // Prioritize region-based filtering if region is provided
    if (region && typeof region === 'string') {
      const regionOptions: RegionFilterOptions = {
        includeAllRegions: region.toLowerCase() === 'all',
        exactMatch: options?.exactMatch || false,
        fallbackToCity: options?.fallbackToCity !== false, // Default true
        ...options
      };

      const result = RegionFilterService.filterProductsByRegion(
        products as RezdyProduct[],
        region,
        regionOptions
      );

      return NextResponse.json({
        filteredProducts: result.filteredProducts,
        filterStats: {
          ...result.filterStats,
          filterType: 'region',
          // Map to existing interface for backward compatibility
          totalProducts: result.filterStats.totalProducts,
          filteredCount: result.filterStats.filteredCount,
          localDataUsed: result.filterStats.matchedPickupIds.length,
          fallbackUsed: result.filterStats.unmatchedProducts,
          location: result.filterStats.region,
          filteringMethod: result.filterStats.filteringMethod === 'region_based' ? 'pickup_data' : 'city_based',
          accuracy: result.filterStats.accuracy,
          dataSource: 'region_data',
        }
      });
    }

    // Fallback to city-based filtering (existing behavior)
    if (location && typeof location === 'string') {
      const result = await UnifiedPickupFilter.filterProductsByLocation(
        products as RezdyProduct[],
        location,
        {
          enableFallback: true,
          ...options
        }
      );

      return NextResponse.json({
        ...result,
        filterStats: {
          ...result.filterStats,
          filterType: 'city'
        }
      });
    }

    return NextResponse.json(
      { error: 'No valid filtering criteria provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Filter API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Enhanced product filtering API endpoint',
    usage: {
      region_filtering: 'POST with { products: RezdyProduct[], region: string, options?: RegionFilterOptions }',
      city_filtering: 'POST with { products: RezdyProduct[], location: string, options?: object }',
      supported_regions: ['BRISBANE', 'GOLD_COAST', 'TAMBORINE_MOUNTAIN', 'ALL']
    },
    features: {
      region_based: 'Uses pickup location regions for precise filtering',
      city_fallback: 'Falls back to city-based filtering when pickup IDs not found',
      backward_compatible: 'Maintains compatibility with existing city-based filtering'
    },
    examples: {
      region_filter: {
        products: '[]',
        region: 'BRISBANE',
        options: { fallbackToCity: true, exactMatch: false }
      },
      city_filter: {
        products: '[]',
        location: 'Brisbane',
        options: { enableFallback: true }
      }
    }
  });
}