"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DynamicTourCard } from "@/components/dynamic-tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { ErrorState } from "@/components/error-state"
import { TourPagination } from "@/components/tour-pagination"
import { EnhancedSearchForm } from "@/components/enhanced-search-form"
import { useRezdyDataManager } from "@/hooks/use-rezdy-data-manager"
import { RezdyProduct, ProductFilters } from "@/lib/types/rezdy"

export default function EnhancedSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const {
    data,
    filteredProducts,
    segmentedProducts,
    qualityMetrics,
    isLoading,
    error,
    refreshData
  } = useRezdyDataManager({
    enableCaching: true,
    enableValidation: true,
    enableSegmentation: true,
    autoRefresh: false
  })

  const [searchResults, setSearchResults] = useState<RezdyProduct[]>([])
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({
    searchTerm: searchParams.get('query') || '',
    productType: 'all',
    priceRange: 'all',
    availability: 'all',
    location: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'results' | 'analytics'>('results')
  
  const itemsPerPage = 12
  const totalPages = Math.ceil(searchResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedResults = searchResults.slice(startIndex, endIndex)
  
  // Pagination helpers
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }
  
  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  // Handle search results from EnhancedSearchForm
  const handleSearchResults = (results: RezdyProduct[]) => {
    setSearchResults(results)
    setCurrentPage(1) // Reset to first page when new search is performed
  }

  // Handle filter changes
  const handleFiltersChange = (filters: ProductFilters) => {
    setCurrentFilters(filters)
    
    // Update URL with current filters
    const params = new URLSearchParams()
    if (filters.searchTerm) params.set('query', filters.searchTerm)
    if (filters.productType !== 'all') params.set('type', filters.productType)
    if (filters.priceRange !== 'all') params.set('price', filters.priceRange)
    if (filters.location !== 'all') params.set('location', filters.location)
    
    const newUrl = params.toString() ? `/search/enhanced?${params.toString()}` : '/search/enhanced'
    router.replace(newUrl, { scroll: false })
  }

  // Initialize search results with filtered products
  useEffect(() => {
    if (filteredProducts.length > 0) {
      setSearchResults(filteredProducts)
    }
  }, [filteredProducts])

  // Handle retry for errors
  const handleRetry = () => {
    refreshData({ force: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-yellow-500 to-orange-500 py-12">
          <div className="container">
            <div className="flex items-center gap-4 text-white mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/analytics')}
                className="text-white hover:bg-white/20"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics Dashboard
              </Button>
            </div>
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Enhanced Search
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-xl">
                Advanced search with AI-powered suggestions and data insights
              </p>
            </div>
          </div>
        </section>

        {/* Enhanced Search Form */}
        <section className="bg-white py-8">
          <div className="container">
            <EnhancedSearchForm
              products={data.products}
              onResults={handleSearchResults}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </section>

        {/* View Mode Toggle */}
        <section className="border-b bg-muted py-4">
          <div className="container">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'results' | 'analytics')}>
              <TabsList>
                <TabsTrigger value="results">Search Results ({searchResults.length})</TabsTrigger>
                <TabsTrigger value="analytics">Data Insights</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'results' | 'analytics')}>
              {/* Search Results Tab */}
              <TabsContent value="results" className="space-y-6">
                {isLoading && <TourGridSkeleton count={12} />}
                
                {error && (
                  <ErrorState
                    title="Unable to load tours"
                    message="We're having trouble connecting to our booking system. Please try again in a moment."
                    onRetry={handleRetry}
                  />
                )}
                
                {!isLoading && !error && (
                  <>
                    {paginatedResults.length > 0 ? (
                      <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {paginatedResults.map((product) => (
                            <DynamicTourCard key={product.productCode} product={product} />
                          ))}
                        </div>
                        
                        {totalPages > 1 && (
                          <div className="flex justify-center">
                            <TourPagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              hasNextPage={hasNextPage}
                              hasPreviousPage={hasPreviousPage}
                              onPageChange={setCurrentPage}
                              onNextPage={handleNextPage}
                              onPreviousPage={handlePreviousPage}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">No tours found</h3>
                        <p className="text-muted-foreground mb-4">
                          Try adjusting your search criteria or browse our featured tours.
                        </p>
                        <Button onClick={() => router.push('/tours')}>
                          Browse All Tours
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Search Statistics */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">{searchResults.length}</h3>
                        <p className="text-sm text-muted-foreground">Results Found</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">{data.products.length}</h3>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">
                          {qualityMetrics ? Math.round((qualityMetrics.completeness.products_with_descriptions / data.products.length) * 100) : 0}%
                        </h3>
                        <p className="text-sm text-muted-foreground">Data Quality</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Segmented Products */}
                {segmentedProducts && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Product Segments</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h4 className="text-lg font-semibold text-green-600">
                              {segmentedProducts.high_demand.length}
                            </h4>
                            <p className="text-sm text-muted-foreground">High Demand</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h4 className="text-lg font-semibold text-blue-600">
                              {segmentedProducts.seasonal.length}
                            </h4>
                            <p className="text-sm text-muted-foreground">Seasonal</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h4 className="text-lg font-semibold text-purple-600">
                              {segmentedProducts.location_based.length}
                            </h4>
                            <p className="text-sm text-muted-foreground">Location Based</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h4 className="text-lg font-semibold text-orange-600">
                              {segmentedProducts.price_optimized.length}
                            </h4>
                            <p className="text-sm text-muted-foreground">Price Optimized</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-4">
                  <Button onClick={() => router.push('/analytics')}>
                    View Full Analytics Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => refreshData({ force: true })}>
                    Refresh Data
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 