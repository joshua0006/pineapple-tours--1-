"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Filter, MapPin, Star, X, ArrowLeft, RefreshCw, Calendar, Heart, Users } from "lucide-react"
import { addDays, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePicker } from "@/components/ui/date-picker"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DynamicTourCard } from "@/components/dynamic-tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { ErrorState } from "@/components/error-state"
import { TourPagination } from "@/components/tour-pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { SearchCategoryDropdown } from "@/components/search-category-dropdown"
import { useSearch } from "@/hooks/use-search"
import { useCityProducts } from "@/hooks/use-city-products"
import { useBookingPrompt } from "@/hooks/use-booking-prompt"
import { getCategoryDisplayName } from "@/lib/constants/categories"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { promptData, hasPromptData } = useBookingPrompt()
  
  // Get city data for the dropdown
  const { cities, loading: citiesLoading } = useCityProducts()
  
  // Initialize search with URL parameters (removed duration)
  const initialFilters = {
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || 'all',
    priceRange: searchParams.get('priceRange') || 'all',
    travelers: searchParams.get('travelers') || '2',
    sortBy: searchParams.get('sortBy') || 'relevance',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    city: searchParams.get('city') || '',
    location: searchParams.get('location') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
  }

  // Check if this search came from the booking prompt
  const isFromBookingPrompt = hasPromptData && (
    (searchParams.get('travelers') && searchParams.get('travelers') === promptData?.groupSize?.toString()) ||
    (searchParams.get('checkIn') && promptData?.bookingDate)
  )

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
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Trigger search on component mount to show all products
  useEffect(() => {
    search()
  }, []) // Only run on mount

  // Sync URL parameters with filters when searchParams change
  useEffect(() => {
    const urlFilters = {
      query: searchParams.get('query') || '',
      category: searchParams.get('category') || 'all',
      priceRange: searchParams.get('priceRange') || 'all',
      travelers: searchParams.get('travelers') || '2',
      sortBy: searchParams.get('sortBy') || 'relevance',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      city: searchParams.get('city') || '',
      location: searchParams.get('location') || '',
      page: parseInt(searchParams.get('page') || '1'),
    }

    // Only update if there are actual differences to avoid infinite loops
    const hasChanges = Object.entries(urlFilters).some(([key, value]) => {
      return filters[key as keyof typeof filters] !== value
    })

    if (hasChanges) {
      updateFilters(urlFilters)
      setLocalQuery(urlFilters.query)
    }
  }, [searchParams, updateFilters]) // React to searchParams changes

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
      priceRange: {
        'under-99': 'Under $99',
        '99-159': '$99 - $159',
        '159-299': '$159 - $299',
        'over-299': 'Over $299',
      },
    }

    if (key === 'category') {
      return getCategoryDisplayName(value)
    }

    return displayNames[key]?.[value] || value
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-coral-500 to-orange-500 py-12">
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
                {isFromBookingPrompt ? 'Your Perfect Tours' : 'Search Results'}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-xl">
                {isFromBookingPrompt ? (
                  `Tours for ${filters.travelers} traveler${filters.travelers !== '1' ? 's' : ''}${filters.checkIn && filters.checkOut ? ` • ${format(new Date(filters.checkIn), 'MMM dd')} - ${format(new Date(filters.checkOut), 'MMM dd, yyyy')}` : ''}`
                ) : hasResults ? (
                  `Found ${totalResults} tour${totalResults !== 1 ? 's' : ''} matching your search`
                ) : (
                  'Find your perfect tour experience'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Booking Prompt Success Banner */}
        {isFromBookingPrompt && (
          <section className="bg-yellow-50 border-b border-yellow-200 py-4">
            <div className="container">
              <div className="flex items-center justify-center gap-3 text-yellow-800">
                <Heart className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Great choice!</span>
                <span>We've found tours matching your preferences.</span>
                {filters.checkIn && filters.checkOut && (
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    Available for your dates
                  </Badge>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <section className="border-b bg-white py-6">
          <div className="container">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tours, locations, activities..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="pl-10 pr-20 h-12 text-base"
                />
                <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </div>
            </form>

            {/* Filter Section */}
            <div className="space-y-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.values(filters).filter(value => 
                        value && value !== '' && value !== 'all' && value !== 'any' && 
                        value !== 2 && value !== 12 && value !== 1 && value !== 'relevance'
                      ).length} active
                    </Badge>
                  )}
                </h3>
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

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {/* Tour Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tour Location</label>
                  <Select 
                    value={filters.city || filters.location || 'all'} 
                    onValueChange={(value) => {
                      if (value === 'all') {
                        clearFilter('city')
                        clearFilter('location')
                      } else {
                        updateFilter('city', value)
                        clearFilter('location')
                      }
                    }}
                    disabled={citiesLoading}
                  >
                    <SelectTrigger className="w-full h-10">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={citiesLoading ? "Loading..." : "All Locations"} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Check-in Date Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Check-in Date</label>
                  <div className="relative">
                    <DatePicker
                      date={filters.checkIn ? new Date(filters.checkIn) : undefined}
                      onDateChange={(date) => {
                        if (date) {
                          updateFilter('checkIn', format(date, 'yyyy-MM-dd'))
                          if (filters.checkOut) {
                            const checkOutDate = new Date(filters.checkOut)
                            if (checkOutDate <= date) {
                              updateFilter('checkOut', format(addDays(date, 1), 'yyyy-MM-dd'))
                            }
                          }
                        } else {
                          clearFilter('checkIn')
                        }
                      }}
                      placeholder="Select date"
                      minDate={new Date()}
                      maxDate={filters.checkOut ? addDays(new Date(filters.checkOut), -1) : addDays(new Date(), 365)}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                {/* Check-out Date Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Check-out Date</label>
                  <div className="relative">
                    <DatePicker
                      date={filters.checkOut ? new Date(filters.checkOut) : undefined}
                      onDateChange={(date) => {
                        if (date) {
                          updateFilter('checkOut', format(date, 'yyyy-MM-dd'))
                        } else {
                          clearFilter('checkOut')
                        }
                      }}
                      placeholder="Select date"
                      minDate={filters.checkIn ? addDays(new Date(filters.checkIn), 1) : addDays(new Date(), 1)}
                      maxDate={addDays(new Date(), 365)}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                {/* Travelers Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Travelers</label>
                  <Select value={filters.travelers} onValueChange={(value) => updateFilter('travelers', value)}>
                    <SelectTrigger className={`w-full h-10 ${isFromBookingPrompt ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}`}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="2 Travelers" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Traveler' : 'Travelers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <SearchCategoryDropdown
                    value={filters.category}
                    onValueChange={(value) => updateFilter('category', value)}
                  />
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Price Range</label>
                  <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
                    <SelectTrigger className="w-full h-10">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">$</span>
                        <SelectValue placeholder="All Prices" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-99">Under $99</SelectItem>
                      <SelectItem value="99-159">$99 - $159</SelectItem>
                      <SelectItem value="159-299">$159 - $299</SelectItem>
                      <SelectItem value="over-299">Over $299</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                    <SelectTrigger className="w-full h-10">
                      <div className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        <SelectValue placeholder="Relevance" />
                      </div>
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
            </div>

            {/* Active filters and results count */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {filters.checkIn && filters.checkOut ? "Checking availability..." : "Searching..."}
                    </span>
                  ) : (
                    totalPages > 1 
                      ? `${totalResults} tours found • Page ${currentPage} of ${totalPages}`
                      : `${totalResults} tours found`
                  )}
                </p>
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
                {(filters.city || filters.location) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {filters.city || filters.location}
                    <button
                      onClick={() => {
                        clearFilter('city')
                        clearFilter('location')
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getFilterDisplayName('category', filters.category)}
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
                    {getFilterDisplayName('priceRange', filters.priceRange)}
                    <button
                      onClick={() => clearFilter('priceRange')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.checkIn && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200">
                    <Calendar className="h-3 w-3" />
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
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200">
                    <Calendar className="h-3 w-3" />
                    Check-out: {filters.checkOut}
                    <button
                      onClick={() => clearFilter('checkOut')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.travelers !== '2' && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200">
                    <Users className="h-3 w-3" />
                    {filters.travelers} Travelers
                    <button
                      onClick={() => clearFilter('travelers')}
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