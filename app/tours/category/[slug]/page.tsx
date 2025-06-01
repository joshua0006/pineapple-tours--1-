"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, Grid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DynamicTourCard } from "@/components/dynamic-tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { ErrorState } from "@/components/error-state"
import { useRezdyProducts } from "@/hooks/use-rezdy"
import { RezdyProduct } from "@/lib/types/rezdy"
import { getCategoryBySlug, filterProductsByCategory } from "@/lib/constants/categories"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const categorySlug = resolvedParams.slug
  
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { data: allProducts, loading, error } = useRezdyProducts(100, 0)
  
  // Get category configuration
  const categoryConfig = getCategoryBySlug(categorySlug)
  
  // Enhanced filtering logic using shared helper function
  const filteredProducts = allProducts && categoryConfig 
    ? filterProductsByCategory(allProducts, categoryConfig)
    : []
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.advertisedPrice || 0) - (b.advertisedPrice || 0)
      case 'price-high':
        return (b.advertisedPrice || 0) - (a.advertisedPrice || 0)
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  if (!categoryConfig) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-12">
            <ErrorState
              title="Category not found"
              message="The category you're looking for doesn't exist."
              onRetry={() => router.push('/tours')}
              showRetry={true}
            />
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b bg-muted/30">
          <div className="container py-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {categoryConfig.title}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {categoryConfig.description}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="secondary">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'tour' : 'tours'} available
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {categoryConfig.categoryGroup}
                  </Badge>
                </div>
              </div>
              
              {/* Filters and View Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center border rounded-md">
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
          </div>
        </section>

        {/* Tours Grid */}
        <section className="py-12">
          <div className="container">
            {loading && <TourGridSkeleton count={9} />}
            
            {error && (
              <ErrorState
                title="Unable to load tours"
                message="We're having trouble loading the tours. Please try again."
                onRetry={() => window.location.reload()}
              />
            )}
            
            {!loading && !error && (
              <>
                {sortedProducts.length > 0 ? (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1 max-w-4xl mx-auto'
                  }`}>
                    {sortedProducts.map((product) => (
                      <DynamicTourCard 
                        key={product.productCode} 
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <CardContent>
                      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Filter className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No tours found</h3>
                      <p className="text-muted-foreground mb-4">
                        We don't have any {categoryConfig.title.toLowerCase()} available at the moment.
                      </p>
                      <Button onClick={() => router.push('/tours')}>
                        Browse all tours
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 