import { NextRequest, NextResponse } from 'next/server';
import { LocalPickupIndexService } from '@/lib/services/local-pickup-index';
import { EnhancedPickupFilter } from '@/lib/services/enhanced-pickup-filter';

/**
 * API endpoint for getting detailed pickup information for individual products
 * Uses local data first, only fetches from Rezdy API if no local data exists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productCode: string } }
) {
  try {
    const { productCode } = params;
    
    if (!productCode) {
      return NextResponse.json(
        { error: 'Product code is required' },
        { status: 400 }
      );
    }

    // PRIORITY 1: Check local pickup data first
    const localPickupData = await LocalPickupIndexService.getProductPickupData(productCode);
    
    if (localPickupData && localPickupData.hasPickupData) {
      return NextResponse.json({
        productCode,
        pickups: localPickupData.pickups,
        locationMappings: localPickupData.locationMappings,
        source: 'local_files',
        accuracy: 'high',
        lastAccessed: localPickupData.lastAccessed,
        accessCount: localPickupData.accessCount,
      });
    }

    // PRIORITY 2: Fallback to Rezdy API for individual product (selective usage)
    try {
      const rezdyPickups = await EnhancedPickupFilter.getProductPickupLocations(productCode);
      
      if (rezdyPickups.length > 0) {
        return NextResponse.json({
          productCode,
          pickups: rezdyPickups,
          locationMappings: [], // Could be computed if needed
          source: 'rezdy_api',
          accuracy: 'high',
          note: 'Fetched from Rezdy API - consider adding to local data files'
        });
      }
    } catch (apiError) {
      console.warn(`Failed to fetch pickup data from Rezdy API for ${productCode}:`, apiError);
    }

    // PRIORITY 3: No pickup data available
    return NextResponse.json({
      productCode,
      pickups: [],
      locationMappings: [],
      source: 'none',
      accuracy: 'low',
      message: 'No pickup data available for this product'
    });

  } catch (error) {
    console.error('Error getting pickup details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get pickup details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get pickup location statistics and index metadata
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { productCode: string } }
) {
  try {
    if (params.productCode === 'stats') {
      // Return pickup location statistics
      const stats = await LocalPickupIndexService.getLocationStats();
      const metadata = await LocalPickupIndexService.getIndexMetadata();
      
      return NextResponse.json({
        stats,
        metadata,
        message: 'Local pickup data statistics'
      });
    }

    if (params.productCode === 'refresh') {
      // Refresh the local pickup index
      const refreshedIndex = await LocalPickupIndexService.refreshIndex();
      
      return NextResponse.json({
        totalProducts: refreshedIndex.totalProducts,
        productsWithPickups: refreshedIndex.productsWithPickups,
        lastUpdated: refreshedIndex.lastUpdated,
        message: 'Local pickup index refreshed successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use stats or refresh.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in pickup details POST:', error);
    return NextResponse.json(
      { 
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}