import { NextRequest, NextResponse } from 'next/server'
import { getCityFromLocation, getUniqueCitiesFromProducts, filterProductsByCity } from '@/lib/utils/product-utils'
import { RezdyProduct } from '@/lib/types/rezdy'

export async function GET(request: NextRequest) {
  try {
    // Fetch products from the Rezdy API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/rezdy/products?limit=10`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const products: RezdyProduct[] = data.products || data.data || []
    
    // Test city extraction
    const cities = getUniqueCitiesFromProducts(products)
    
    // Test filtering with 'all'
    const allProducts = filterProductsByCity(products, 'all')
    
    // Test filtering with a specific city
    const firstCity = cities[0]
    const filteredProducts = firstCity ? filterProductsByCity(products, firstCity) : []
    
    // Test individual city extraction
    const cityExtractionTests = products.slice(0, 3).map((product: RezdyProduct) => ({
      productCode: product.productCode,
      name: product.name,
      locationAddress: product.locationAddress,
      extractedCity: getCityFromLocation(product.locationAddress)
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        totalProducts: products.length,
        cities: cities,
        citiesCount: cities.length,
        allProductsFilter: allProducts.length,
        firstCityFilter: {
          city: firstCity,
          count: filteredProducts.length
        },
        cityExtractionTests,
        firstProduct: products[0] ? {
          name: products[0].name,
          locationAddress: products[0].locationAddress
        } : null
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 