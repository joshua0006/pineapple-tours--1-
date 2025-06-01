"use client"

import { useState } from "react"
import { RezdyProduct } from "@/lib/types/rezdy"
import { RezdyProductCard } from "./rezdy-product-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Package, RefreshCw, Grid, List } from "lucide-react"
import { getCityFromLocation } from "@/lib/utils/product-utils"

interface CityProductDisplayProps {
  products: RezdyProduct[]
  selectedCity: string
  loading?: boolean
  error?: string | null
  onProductSelect?: (product: RezdyProduct) => void
  onRefresh?: () => void
}

export function CityProductDisplay({
  products,
  selectedCity,
  loading = false,
  error = null,
  onProductSelect,
  onRefresh
}: CityProductDisplayProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Group products by city for better organization
  const productsByCity = products.reduce((acc, product) => {
    const city = getCityFromLocation(product.locationAddress) || 'Unknown Location'
    if (!acc[city]) {
      acc[city] = []
    }
    acc[city].push(product)
    return acc
  }, {} as Record<string, RezdyProduct[]>)

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-medium">Loading Products...</span>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">Error Loading Products</CardTitle>
          <CardDescription className="mb-4">{error}</CardDescription>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">
            {selectedCity === 'all' ? 'No Products Available' : `No Tours Found in ${selectedCity}`}
          </CardTitle>
          <CardDescription className="mb-4">
            {selectedCity === 'all' 
              ? 'There are currently no tours available. Please try again later.'
              : `We don't have any tours available in ${selectedCity} at the moment. Try selecting a different destination.`
            }
          </CardDescription>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-medium">
            {selectedCity === 'all' ? 'All Destinations' : selectedCity}
          </span>
          <Badge variant="secondary">
            {products.length} tour{products.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button onClick={onRefresh} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products display */}
      {selectedCity === 'all' ? (
        // Show products grouped by city when "all" is selected
        <div className="space-y-8">
          {Object.entries(productsByCity).map(([city, cityProducts]) => (
            <div key={city} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">{city}</h3>
                <Badge variant="outline">
                  {cityProducts.length} tour{cityProducts.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className={
                viewMode === 'grid' 
                  ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              }>
                {cityProducts.map((product) => (
                  <RezdyProductCard
                    key={product.productCode}
                    product={product}
                    onViewDetails={onProductSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show products for selected city
        <div className={
          viewMode === 'grid' 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        }>
          {products.map((product) => (
            <RezdyProductCard
              key={product.productCode}
              product={product}
              onViewDetails={onProductSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
} 