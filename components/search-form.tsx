"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { addDays, format } from "date-fns"
import { Search, MapPin, Calendar, Users, CalendarDays, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchCategoryDropdown } from "@/components/search-category-dropdown"
import { useBookingPrompt } from "@/hooks/use-booking-prompt"
import { useCityProducts } from "@/hooks/use-city-products"

// Static tours data based on the provided image
const STATIC_TOURS = [
  "Brisbane",
  "Broadbeach", 
  "Currumbin wildlife sanctuary",
  "Gold Coast",
  "Miami",
  "Mount Nathan",
  "Mount Tamborine",
  "Surfers Paradise",
  "Tamborine Mountain"
];

interface SearchFormProps {
  onSearch?: (searchData: any) => void;
  showRedirect?: boolean;
  onCityChange?: (city: string, products: any[]) => void;
}

export function SearchForm({ onSearch, showRedirect = true, onCityChange }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { promptData } = useBookingPrompt()
  const { cities, loading: citiesLoading } = useCityProducts()
  
  // Form state for tours search
  const [query, setQuery] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [category, setCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [travelers, setTravelers] = useState("2")

  // Initialize form with URL parameters or booking prompt data
  useEffect(() => {
    // Check URL parameters first (these take priority)
    const urlQuery = searchParams.get('query')
    const urlTravelers = searchParams.get('travelers')
    const urlCheckIn = searchParams.get('checkIn')
    const urlCheckOut = searchParams.get('checkOut')
    const urlCity = searchParams.get('city')
    const urlCategory = searchParams.get('category')
    const urlPriceRange = searchParams.get('priceRange')

    // Handle query parameter
    if (urlQuery) {
      setQuery(urlQuery)
    }

    // Handle travelers parameter
    if (urlTravelers) {
      setTravelers(urlTravelers)
    } else if (promptData?.groupSize) {
      setTravelers(promptData.groupSize.toString())
    }

    // Handle date parameters
    if (urlCheckIn && urlCheckOut) {
      setCheckInDate(new Date(urlCheckIn))
      setCheckOutDate(new Date(urlCheckOut))
    } else if (promptData?.bookingDate) {
      setCheckInDate(promptData.bookingDate)
      setCheckOutDate(addDays(promptData.bookingDate, 1))
    }

    // Handle city parameter
    if (urlCity) {
      setSelectedCity(urlCity)
    }

    // Handle category parameter
    if (urlCategory) {
      setCategory(urlCategory)
    }

    // Handle price range parameter
    if (urlPriceRange) {
      setPriceRange(urlPriceRange)
    }
  }, [searchParams, promptData])

  // Handle city selection change
  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (onCityChange) {
      // For static implementation, we pass empty products array
      onCityChange(city, [])
    }
  }

  // Notify parent component when city changes
  useEffect(() => {
    if (onCityChange) {
      onCityChange(selectedCity, [])
    }
  }, [selectedCity, onCityChange])

  // Auto-adjust check-out date when check-in date changes
  useEffect(() => {
    if (checkInDate && (!checkOutDate || checkOutDate <= checkInDate)) {
      setCheckOutDate(addDays(checkInDate, 1))
    }
  }, [checkInDate, checkOutDate])

  const handleToursSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const searchData = {
      query: query,
      category: category,
      priceRange: priceRange,
      travelers: travelers,
      checkIn: checkInDate ? format(checkInDate, 'yyyy-MM-dd') : '',
      checkOut: checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : '',
      sortBy: 'relevance', // Default sort by relevance
      searchType: 'tours',
      location: selectedCity === 'all' ? '' : selectedCity,
      city: selectedCity === 'all' ? '' : selectedCity
    }

    if (onSearch) {
      onSearch(searchData)
    } else if (showRedirect) {
      // Redirect to search results page
      const params = new URLSearchParams()
      
      // Include all parameters if they have values
      if (query) params.append('query', query)
      if (category && category !== 'all') params.append('category', category)
      if (priceRange && priceRange !== 'all') params.append('priceRange', priceRange)
      if (travelers) params.append('travelers', travelers)
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity)
      if (checkInDate) params.append('checkIn', format(checkInDate, 'yyyy-MM-dd'))
      if (checkOutDate) params.append('checkOut', format(checkOutDate, 'yyyy-MM-dd'))
      
      router.push(`/search?${params.toString()}`)
    }
  }

  // Check if dates are selected for enhanced UI feedback
  const hasDatesSelected = checkInDate && checkOutDate
  const dateRangeText = hasDatesSelected 
    ? `${format(checkInDate!, 'MMM dd')} - ${format(checkOutDate!, 'MMM dd, yyyy')}`
    : null

  // Check if form was pre-populated from booking prompt
  const isPrePopulated = promptData && (promptData.groupSize > 0 || promptData.bookingDate)

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-3 sm:p-6">
        <div className="mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
            {isPrePopulated ? "Complete Your Booking" : "Find Your Perfect Vacation"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {isPrePopulated 
              ? "We've pre-filled your preferences. Adjust as needed and search for available tours."
              : "Search for tours and experiences by tour location"
            }
            {hasDatesSelected && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                <CalendarDays className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{dateRangeText}</span>
                <span className="sm:hidden">{format(checkInDate!, 'MMM dd')} - {format(checkOutDate!, 'MMM dd')}</span>
              </span>
            )}
          </p>
        </div>
        
        <form onSubmit={handleToursSearch}>
          {/* Search Query Input */}
          <div className="mb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tours, locations, activities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-4 items-end">
            {/* Tour Location */}
            <div className="space-y-1 col-span-1">
              <Label htmlFor="tour-location" className="text-xs font-medium text-gray-700 hidden sm:block">Tour Location</Label>
              <div className="relative">
                <Select value={selectedCity} onValueChange={handleCityChange} disabled={citiesLoading}>
                  <SelectTrigger id="tour-location" className="h-10 border-gray-300 text-xs sm:text-sm focus:border-orange-500 focus:ring-orange-500">
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
            </div>

            {/* Travelers */}
            <div className="space-y-1 col-span-1">
              <Label htmlFor="travelers" className="text-xs font-medium text-gray-700 hidden sm:block">Travelers</Label>
              <div className="relative">
                <Select value={travelers} onValueChange={setTravelers}>
                  <SelectTrigger 
                    id="travelers" 
                    className={`h-10 border-gray-300 text-xs sm:text-sm focus:border-orange-500 focus:ring-orange-500 ${
                      isPrePopulated && promptData?.groupSize ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''
                    }`}
                  >
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
            </div>

            {/* Check-in Date */}
            <div className="space-y-1 col-span-1">
              <Label htmlFor="check-in" className="text-xs font-medium text-gray-700 hidden sm:block">
                Check-in Date
              </Label>
              <div className="relative">
                <DatePicker
                  id="check-in"
                  date={checkInDate}
                  onDateChange={setCheckInDate}
                  placeholder="Select date"
                  minDate={new Date()}
                  maxDate={checkOutDate ? addDays(checkOutDate, -1) : addDays(new Date(), 365)}
                  className={`h-10 border-gray-300 text-xs sm:text-sm focus:border-orange-500 focus:ring-orange-500 ${
                    checkInDate ? 'border-orange-300 bg-orange-50' : ''
                  } ${isPrePopulated && checkInDate ? 'ring-2 ring-yellow-200' : ''}`}
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div className="space-y-1 col-span-1">
              <Label htmlFor="check-out" className="text-xs font-medium text-gray-700 hidden sm:block">
                Check-out Date
              </Label>
              <div className="relative">
                <DatePicker
                  id="check-out"
                  date={checkOutDate}
                  onDateChange={setCheckOutDate}
                  placeholder="Select date"
                  minDate={checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1)}
                  maxDate={addDays(new Date(), 365)}
                  className={`h-10 border-gray-300 text-xs sm:text-sm focus:border-orange-500 focus:ring-orange-500 ${
                    checkOutDate ? 'border-orange-300 bg-orange-50' : ''
                  } ${isPrePopulated && checkOutDate ? 'ring-2 ring-yellow-200' : ''}`}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1 col-span-1">
              <Label htmlFor="category" className="text-xs font-medium text-gray-700 hidden sm:block">Category</Label>
              <SearchCategoryDropdown
                value={category}
                onValueChange={setCategory}
                className="h-10"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-1 col-span-1">
              <Label htmlFor="price-range" className="text-xs font-medium text-gray-700 hidden sm:block">Price Range</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger id="price-range" className="h-10 border-gray-300 text-xs sm:text-sm focus:border-orange-500 focus:ring-orange-500">
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
          </div>

          {/* Search Button */}
          <div className="mt-4">
            <Button 
              type="submit" 
              className={`w-full h-12 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md ${
                hasDatesSelected 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              } ${isPrePopulated ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
            >
              <Search className="mr-2 h-4 w-4" />
              {isPrePopulated 
                ? 'Find My Tours' 
                : hasDatesSelected 
                  ? 'Search Available Tours' 
                  : 'Search Vacations'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
