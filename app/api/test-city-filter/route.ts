import { NextRequest, NextResponse } from 'next/server'
import { CityFilterService } from '@/lib/services/city-filter'
import { UnifiedPickupFilter } from '@/lib/services/unified-pickup-filter'
import { RezdyProduct } from '@/lib/types/rezdy'

/**
 * Test endpoint for city-based filtering functionality
 * Tests the new CityFilterService and UnifiedPickupFilter
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch products from the Rezdy API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/rezdy/products?limit=20`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const products: RezdyProduct[] = data.products || data.data || []
    
    // Test city extraction using new service
    const availableCities = CityFilterService.extractUniqueCities(products)
    
    // Test city summary
    const citySummary = CityFilterService.getCitySummary(products)
    
    // Test filtering with 'all'
    const allResult = CityFilterService.filterProductsByCity(products, 'all')
    
    // Test filtering with a specific city
    const firstCity = availableCities[0]
    const cityFilterResult = firstCity ? CityFilterService.filterProductsByCity(products, firstCity.city) : null
    
    // Test unified filter (which now uses city filtering)
    const unifiedAllResult = await UnifiedPickupFilter.filterProductsByLocation(products, 'all')
    const unifiedCityResult = firstCity ? await UnifiedPickupFilter.filterProductsByLocation(products, firstCity.city) : null
    
    // Test individual product city checking
    const productTests = products.slice(0, 3).map((product: RezdyProduct) => {
      const cityCheck = firstCity ? CityFilterService.hasProductFromCity(product, firstCity.city) : null
      return {
        productCode: product.productCode,
        name: product.name,
        locationAddress: product.locationAddress,
        cityCheck: cityCheck ? {
          city: firstCity.city,
          hasCity: cityCheck.hasCity,
          confidence: cityCheck.confidence,
          method: cityCheck.method
        } : null
      }
    })
    
    // Test configuration validation
    const configValidation = CityFilterService.validateConfiguration()
    const unifiedConfigValidation = UnifiedPickupFilter.validateConfiguration()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        totalProducts: products.length,
        availableCities: availableCities,
        citiesCount: availableCities.length,
        citySummary: {
          totalProducts: citySummary.totalProducts,
          citiesWithProducts: citySummary.citiesWithProducts,
          supportedCityCoverage: citySummary.supportedCityCoverage,
          topCities: citySummary.cities.slice(0, 5)
        },
        cityFiltering: {
          allProducts: {
            total: allResult.filteredProducts.length,
            accuracy: allResult.filterStats.accuracy,
            matchMethod: allResult.filterStats.matchMethod
          },
          firstCityFilter: cityFilterResult ? {
            city: firstCity.city,
            total: cityFilterResult.filteredProducts.length,
            accuracy: cityFilterResult.filterStats.accuracy,
            matchMethod: cityFilterResult.filterStats.matchMethod
          } : null
        },
        unifiedFiltering: {
          allProducts: {
            total: unifiedAllResult.filteredProducts.length,
            accuracy: unifiedAllResult.filterStats.accuracy,
            method: unifiedAllResult.filterStats.filteringMethod,
            dataSource: unifiedAllResult.filterStats.dataSource
          },
          firstCityFilter: unifiedCityResult ? {
            city: firstCity.city,
            total: unifiedCityResult.filteredProducts.length,
            accuracy: unifiedCityResult.filterStats.accuracy,
            method: unifiedCityResult.filterStats.filteringMethod,
            dataSource: unifiedCityResult.filterStats.dataSource
          } : null
        },
        productTests,
        configuration: {
          cityFilter: configValidation,
          unifiedFilter: unifiedConfigValidation
        },
        firstProduct: products[0] ? {
          name: products[0].name,
          locationAddress: products[0].locationAddress
        } : null
      }
    })
  } catch (error) {
    console.error('City filter test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 