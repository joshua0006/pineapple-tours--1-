"use client"

import { useState } from "react"
import { RezdyProduct } from "@/lib/types/rezdy"
import { SearchForm } from "@/components/search-form"
import { CityProductDisplay } from "@/components/city-product-display"
import { useCityProducts } from "@/hooks/use-city-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, TrendingUp } from "lucide-react"

export default function CitySearchPage() {
  const [selectedProduct, setSelectedProduct] = useState<RezdyProduct | null>(null)
  const [searchData, setSearchData] = useState<any>(null)
  
  // Use the city products hook
  const { 
    products, 
    cities, 
    selectedCity, 
    setSelectedCity,
    filteredProducts, 
    loading, 
    error, 
    refreshData 
  } = useCityProducts()

  const handleCityChange = (city: string, cityProducts: RezdyProduct[]) => {
    console.log(`City changed to: ${city}, Products: ${cityProducts.length}`)
    setSelectedCity(city)
  }

  const handleSearch = (data: any) => {
    setSearchData(data)
    console.log('Search data:', data)
    // If a city is selected in the search, update our city selection
    if (data.city && data.city !== selectedCity) {
      setSelectedCity(data.city)
    }
  }

  const handleProductSelect = (product: RezdyProduct) => {
    setSelectedProduct(product)
    console.log('Selected product:', product)
  }

  // Get city statistics
  const cityStats = cities.map(city => {
    const cityProducts = products.filter(product => {
      const productCity = product.locationAddress
      if (typeof productCity === 'string') {
        return productCity.toLowerCase().includes(city.toLowerCase())
      }
      if (productCity && typeof productCity === 'object') {
        return productCity.city?.toLowerCase() === city.toLowerCase()
      }
      return false
    })
    return {
      name: city,
      count: cityProducts.length,
      avgPrice: cityProducts.reduce((sum, p) => sum + (p.advertisedPrice || 0), 0) / cityProducts.length || 0
    }
  }).sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">City-Based Tour Search</h1>
          </div>
          <p className="text-muted-foreground">
            Discover tours by location with our intelligent city filtering system
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-500" />
                  Search Tours by Location
                </CardTitle>
                <CardDescription>
                  Select a location to see available tours, or search by tour type and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Simple City Selector for Testing */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Location:</label>
                    <select 
                      value={selectedCity} 
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Locations</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Original Search Form */}
                  <SearchForm 
                    onSearch={handleSearch}
                    onCityChange={handleCityChange}
                    showRedirect={false}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Search Results Summary */}
            {searchData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Location:</strong> {searchData.city === 'all' ? 'All Cities' : searchData.city || 'Any'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <strong>Travelers:</strong> {searchData.travelers}
                      </span>
                    </div>
                    {searchData.checkIn && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          <strong>Check-in:</strong> {searchData.checkIn}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Display */}
            <CityProductDisplay
              products={filteredProducts}
              selectedCity={selectedCity}
              loading={loading}
              error={error}
              onProductSelect={handleProductSelect}
              onRefresh={refreshData}
            />
            
            {/* Debug Information */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div>Total Products: {products.length}</div>
                  <div>Cities Available: {cities.length}</div>
                  <div>Selected City: {selectedCity}</div>
                  <div>Filtered Products: {filteredProducts.length}</div>
                  <div>Loading: {loading.toString()}</div>
                  <div>Error: {error || 'None'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* City Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                  Popular Locations
                </CardTitle>
                <CardDescription>
                  Top locations by tour availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cityStats.slice(0, 8).map((city) => (
                      <div key={city.name} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{city.name}</span>
                        <Badge variant="secondary">{city.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Selection Info */}
            {selectedCity !== 'all' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{selectedCity}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {filteredProducts.length} tour{filteredProducts.length !== 1 ? 's' : ''} available
                    </div>
                    {filteredProducts.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Price range: ${Math.min(...filteredProducts.map(p => p.advertisedPrice || 0))} - ${Math.max(...filteredProducts.map(p => p.advertisedPrice || 0))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Product Details */}
            {selectedProduct && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Tour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium">{selectedProduct.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.shortDescription}
                    </p>
                    {selectedProduct.advertisedPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-yellow-600">
                          ${selectedProduct.advertisedPrice}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Product Code: {selectedProduct.productCode}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Products:</span>
                    <Badge variant="outline">{products.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Cities:</span>
                    <Badge variant="outline">{cities.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Filter:</span>
                    <Badge variant="secondary">
                      {selectedCity === 'all' ? 'All' : selectedCity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Filtered Results:</span>
                    <Badge variant="default">{filteredProducts.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 