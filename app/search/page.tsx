"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Filter, MapPin, Star, X, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DynamicTourCard } from "@/components/dynamic-tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { ErrorState } from "@/components/error-state"
import { TourPagination } from "@/components/tour-pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { useSearch } from "@/hooks/use-search"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize search with URL parameters
  const initialFilters = {
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || 'all',
    priceRange: searchParams.get('priceRange') || 'all',
    duration: searchParams.get('duration') || 'any',
    travelers: searchParams.get('travelers') || '2',
    sortBy: searchParams.get('sortBy') || 'relevance',
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
    updateFilters,
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

  // Trigger search on component mount if there are initial filters
  useEffect(() => {
    if (hasActiveFilters || searchParams.get('query')) {
      search()
    }
  }, []) // Only run on mount

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all' && value !== 'any' && value !== 2 && value !== 12 && value !== 1) {
        params.append(key, value.toString())
      }
    })

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
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
            </div>
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Search Results
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-xl">
                {hasResults 
                  ? `Found ${totalResults} tour${totalResults !== 1 ? 's' : ''} matching your search`
                  : 'Find your perfect tour experience'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
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
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="honeymoon">Honeymoon</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
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

            {/* Active filters and results count */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {loading ? "Searching..." : (
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

        {/* Results */}
        <section className="py-8">
          <div className="container">
            {error && (
              <ErrorState
                title="Search Error"
                message={error}
                onRetry={handleRetry}
              />
            )}

            {loading && (
              <TourGridSkeleton count={6} />
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
                  <div className="text-center py-12">
                    <div className="mx-auto max-w-md">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tours found</h3>
                      <p className="text-muted-foreground mb-4">
                        We couldn't find any tours matching your search criteria. Try adjusting your filters or search terms.
                      </p>
                      <div className="space-y-2">
                        <Button onClick={clearSearch} variant="outline" className="w-full">
                          Clear all filters
                        </Button>
                        <Button onClick={() => router.push('/tours')} className="w-full">
                          Browse all tours
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!loading && !error && !data && !hasActiveFilters && (
              <div className="text-center py-12">
                <div className="mx-auto max-w-md">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start your search</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter keywords, select filters, or browse by category to find your perfect tour.
                  </p>
                  <Button onClick={() => router.push('/tours')}>
                    Browse all tours
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 