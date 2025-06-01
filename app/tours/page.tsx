"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Filter, MapPin, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DynamicTourCard } from "@/components/dynamic-tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { ErrorState } from "@/components/error-state"
import { TourPagination } from "@/components/tour-pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { useSearch } from "@/hooks/use-search"

export default function ToursPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize with URL parameters if any
  const initialFilters = {
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || 'all',
    productType: searchParams.get('productType') || 'all',
    priceRange: searchParams.get('priceRange') || 'all',
    duration: searchParams.get('duration') || 'any',
    travelers: searchParams.get('travelers') || '2',
    sortBy: searchParams.get('sortBy') || 'name',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
  }

  const {
    data,
    loading,
    error,
    filters,
    updateFilter,
    search,
    clearFilter,
    clearSearch,
    hasActiveFilters,
    hasResults,
    totalResults,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
  } = useSearch(initialFilters)

  const [localQuery, setLocalQuery] = useState(filters.query)

  // Auto-search on component mount to show all tours
  useEffect(() => {
    search()
  }, []) // Only run on mount

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all' && value !== 'any' && value !== 2 && value !== 12 && value !== 1) {
        params.append(key, value.toString())
      }
    })

    const newUrl = params.toString() ? `/tours?${params.toString()}` : '/tours'
    router.replace(newUrl, { scroll: false })
  }, [filters, router])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('query', localQuery)
  }

  const handleRetry = () => {
    search()
  }

  const getFilterDisplayName = (key: string, value: string) => {
    const displayNames: Record<string, Record<string, string>> = {
      category: {
        family: 'Family',
        honeymoon: 'Honeymoon',
        adventure: 'Adventure',
        cultural: 'Cultural',
        nature: 'Nature',
        luxury: 'Luxury',
      },
      productType: {
        'day-tour': 'Day Tour',
        'multiday-tour': 'Multiday Tour',
        'private-tour': 'Private Tour',
        'transfer': 'Transfer',
      },
      priceRange: {
        'under-500': 'Under $500',
        '500-1000': '$500 - $1,000',
        '1000-2000': '$1,000 - $2,000',
        'over-2000': 'Over $2,000',
      },
      duration: {
        '1-3': '1-3 Days',
        '4-7': '4-7 Days',
        '8-14': '8-14 Days',
        '15+': '15+ Days',
      },
    }

    return displayNames[key]?.[value] || value
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-yellow-500 to-orange-500 py-16">
          <div className="container">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Discover Amazing Tours
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-xl">
                Explore our collection of handpicked tours and experiences from around the world
              </p>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="border-b bg-white py-6">
          <div className="container">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center space-x-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tours, locations, activities..."
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" size="sm">
                  Search
                </Button>
              </form>
              
              <div className="flex flex-wrap gap-2">
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Tours Categories */}
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="food-wine">Food & Wine</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="water-activities">Water Activities</SelectItem>
                    {/* Experiences Categories */}
                    <SelectItem value="workshops">Workshops</SelectItem>
                    <SelectItem value="classes">Classes</SelectItem>
                    <SelectItem value="tastings">Tastings</SelectItem>
                    {/* Transportation Categories */}
                    <SelectItem value="transfers">Transfers</SelectItem>
                    <SelectItem value="day-trips">Day Trips</SelectItem>
                    <SelectItem value="multiday-tours">Multi-day Tours</SelectItem>
                    <SelectItem value="airport-services">Airport Services</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.productType} onValueChange={(value) => updateFilter('productType', value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tour Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="day-tour">Day Tour</SelectItem>
                    <SelectItem value="multiday-tour">Multiday Tour</SelectItem>
                    <SelectItem value="private-tour">Private Tour</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                    <SelectItem value="over-2000">Over $2,000</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.duration} onValueChange={(value) => updateFilter('duration', value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Duration</SelectItem>
                    <SelectItem value="1-3">1-3 Days</SelectItem>
                    <SelectItem value="4-7">4-7 Days</SelectItem>
                    <SelectItem value="8-14">8-14 Days</SelectItem>
                    <SelectItem value="15+">15+ Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count and active filters */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading..." : (
                    totalPages > 1 
                      ? `${totalResults} tours found • Page ${currentPage} of ${totalPages}`
                      : `${totalResults} tours found`
                  )}
                </p>
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
              
              {/* Active filters */}
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{filters.query}"
                    <button
                      onClick={() => {
                        clearFilter('query')
                        setLocalQuery('')
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {getFilterDisplayName('category', filters.category)}
                    <button
                      onClick={() => clearFilter('category')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.productType !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {getFilterDisplayName('productType', filters.productType)}
                    <button
                      onClick={() => clearFilter('productType')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.priceRange !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: {getFilterDisplayName('priceRange', filters.priceRange)}
                    <button
                      onClick={() => clearFilter('priceRange')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.duration !== 'any' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Duration: {getFilterDisplayName('duration', filters.duration)}
                    <button
                      onClick={() => clearFilter('duration')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.checkIn && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Check-in: {filters.checkIn}
                    <button
                      onClick={() => clearFilter('checkIn')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.checkOut && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Check-out: {filters.checkOut}
                    <button
                      onClick={() => clearFilter('checkOut')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
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
                message="We're having trouble connecting to our booking system. Please try again in a moment."
                onRetry={handleRetry}
              />
            )}
            
            {!loading && !error && data && (
              <>
                {hasResults ? (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {data.products.map((product) => (
                        <DynamicTourCard key={product.productCode} product={product} />
                      ))}
                    </div>
                    
                    {/* Pagination Info and Controls */}
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <PaginationInfo
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        resultsPerPage={filters.limit}
                      />
                      <TourPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        hasPreviousPage={hasPreviousPage}
                        onPageChange={goToPage}
                        onNextPage={nextPage}
                        onPreviousPage={previousPage}
                      />
                    </div>
                  </>
                ) : (
                  <Card className="p-12 text-center">
                    <CardContent>
                      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No tours found</h3>
                      <p className="text-muted-foreground mb-4">
                        We couldn't find any tours matching your search criteria. Try adjusting your filters or search terms.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          onClick={clearSearch}
                        >
                          Clear all filters
                        </Button>
                        <Button 
                          onClick={() => router.push('/')}
                        >
                          Browse featured tours
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!loading && !error && !data && (
              <Card className="p-12 text-center">
                <CardContent>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start exploring tours</h3>
                  <p className="text-muted-foreground mb-4">
                    Use the search and filters above to find your perfect tour experience.
                  </p>
                  <Button onClick={() => search()}>
                    Load all tours
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-muted py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight">Can't find what you're looking for?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our travel experts can help you create a custom tour package tailored to your preferences and budget.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600">
                Contact Our Experts
              </Button>
              <Button size="lg" variant="outline">
                View Special Offers
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 