"use client"

/**
 * Enhanced Search Form with Rezdy Data Management Integration
 * 
 * This component provides a simplified search interface with three main inputs:
 * - Participants: Number of people for the tour
 * - Tour Date: When the tour should take place
 * - Pick up Location: Where participants will be picked up
 * 
 * Rezdy Integration Features:
 * - Real-time data fetching from Rezdy API with caching
 * - Data validation and cleaning pipeline
 * - Product segmentation and filtering
 * - Quality metrics and error handling
 * - Smart cache invalidation and refresh capabilities
 * - Dynamic location extraction from product data
 * 
 * The form integrates with the comprehensive data management system
 * documented in DATA_MANAGEMENT_IMPLEMENTATION.md and follows the
 * strategies outlined in REZDY_DATA_MANAGEMENT_STRATEGIES.md
 */

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { addDays, format } from "date-fns"
import { Search, MapPin, Calendar, Users, CalendarDays, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useBookingPrompt } from "@/hooks/use-booking-prompt"
import { useCityProducts } from "@/hooks/use-city-products"
import { useRezdyDataManager } from "@/hooks/use-rezdy-data-manager"

// Static pickup locations (fallback)
const STATIC_PICKUP_LOCATIONS = [
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
  onLocationChange?: (location: string, products: any[]) => void;
}

export function SearchForm({ onSearch, showRedirect = true, onLocationChange }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { promptData } = useBookingPrompt()
  const { cities, loading: citiesLoading } = useCityProducts()
  
  // Rezdy data management integration
  const {
    data: rezdyData,
    isLoading: rezdyLoading,
    error: rezdyError,
    refreshData
  } = useRezdyDataManager({
    enableCaching: true,
    enableValidation: true,
    enableSegmentation: false, // We're doing our own filtering
    autoRefresh: false
  })

  // Extract unique pickup locations from Rezdy products with tour counts
  const pickupLocations = useMemo(() => {
    const locationCounts = new Map<string, number>()
    
    // Add static locations
    STATIC_PICKUP_LOCATIONS.forEach(location => {
      if (!locationCounts.has(location)) {
        locationCounts.set(location, 0)
      }
    })
    
    // Add locations from Rezdy products and count tours
    rezdyData.products.forEach(product => {
      let locationName = ''
      
      if (product.locationAddress) {
        if (typeof product.locationAddress === 'string') {
          locationName = product.locationAddress
        } else if (product.locationAddress.city) {
          locationName = product.locationAddress.city
        }
      }
      
      if (locationName) {
        locationCounts.set(locationName, (locationCounts.get(locationName) || 0) + 1)
      }
    })
    
    return Array.from(locationCounts.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => a.location.localeCompare(b.location))
  }, [rezdyData.products])


  
  // Form state for simplified search
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [tourDate, setTourDate] = useState<Date | undefined>()
  const [participants, setParticipants] = useState("2")

  // Initialize form with URL parameters or booking prompt data
  useEffect(() => {
    // Check URL parameters first (these take priority)
    const urlParticipants = searchParams.get('participants')
    const urlTourDate = searchParams.get('tourDate')
    const urlLocation = searchParams.get('location')

    // Handle participants parameter
    if (urlParticipants) {
      setParticipants(urlParticipants)
    } else if (promptData?.groupSize) {
      setParticipants(promptData.groupSize.toString())
    }

    // Handle tour date parameter
    if (urlTourDate) {
      setTourDate(new Date(urlTourDate))
    } else if (promptData?.bookingDate) {
      setTourDate(promptData.bookingDate)
    }

    // Handle location parameter
    if (urlLocation) {
      setSelectedLocation(urlLocation)
    }
  }, [searchParams, promptData])

  // Handle location selection change
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
  }

  // Filter products based on selected location
  const currentLocationProducts = useMemo(() => {
    if (selectedLocation === 'all') {
      return rezdyData.products
    }
    
    return rezdyData.products.filter(product => {
      if (product.locationAddress) {
        if (typeof product.locationAddress === 'string') {
          return product.locationAddress.toLowerCase().includes(selectedLocation.toLowerCase())
        } else if (product.locationAddress.city) {
          return product.locationAddress.city.toLowerCase().includes(selectedLocation.toLowerCase())
        }
      }
      return false
    })
  }, [selectedLocation, rezdyData.products])

  // Notify parent component when location changes
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(selectedLocation, currentLocationProducts)
    }
  }, [selectedLocation, currentLocationProducts, onLocationChange])

  const handleToursSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const searchData = {
      participants: participants,
      tourDate: tourDate ? format(tourDate, 'yyyy-MM-dd') : '',
      location: selectedLocation === 'all' ? '' : selectedLocation,
      pickupLocation: selectedLocation === 'all' ? '' : selectedLocation,
      searchType: 'tours',
      // Additional Rezdy-specific parameters
      productType: 'tour',
      availability: 'available',
      sortBy: 'relevance',
      // Include filtered products from Rezdy data
      products: currentLocationProducts,
      totalProducts: rezdyData.products.length,
      dataQuality: rezdyError ? 'error' : 'good'
    }

    if (onSearch) {
      onSearch(searchData)
    } else if (showRedirect) {
      // Redirect to search results page
      const params = new URLSearchParams()
      
      // Include all parameters if they have values
      if (participants) params.append('participants', participants)
      if (selectedLocation && selectedLocation !== 'all') params.append('location', selectedLocation)
      if (tourDate) params.append('tourDate', format(tourDate, 'yyyy-MM-dd'))
      
      router.push(`/search?${params.toString()}`)
    }
  }

  // Check if form was pre-populated from booking prompt
  const isPrePopulated = promptData && (promptData.groupSize > 0 || promptData.bookingDate)

  // Check if date is selected for enhanced UI feedback
  const hasDateSelected = tourDate
  const dateText = hasDateSelected 
    ? format(tourDate!, 'MMM dd, yyyy')
    : null

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-3 sm:p-6">
        <div className="mb-3 sm:mb-6">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isPrePopulated ? "Complete Your Booking" : "Find a Tour"}
            </h2>
            {rezdyError && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshData()}
                disabled={rezdyLoading}
                className="text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${rezdyLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            {isPrePopulated 
              ? "We've pre-filled your preferences. Adjust as needed and search for available tours."
              : "Search for tours by selecting participants, date, and pickup location"
            }
            {hasDateSelected && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                <CalendarDays className="w-3 h-3 mr-1" />
                <span>{dateText}</span>
              </span>
            )}
            {rezdyData.products.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                {rezdyData.products.length} tours available
              </span>
            )}
            {rezdyError && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                Data sync issue
              </span>
            )}
          </p>
        </div>
        
        <form onSubmit={handleToursSearch}>
          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Participants */}
            <div className="space-y-2">
              <Label htmlFor="participants" className="text-sm font-medium text-gray-700">
                Participants
              </Label>
              <div className="relative">
                <Select value={participants} onValueChange={setParticipants}>
                  <SelectTrigger 
                    id="participants" 
                    className={`h-12 border-gray-300 text-sm focus:border-coral-500 focus:ring-coral-500 ${
                      isPrePopulated && promptData?.groupSize ? 'ring-2 ring-coral-200 bg-coral-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select participants" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Participant' : 'Participants'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tour Date */}
            <div className="space-y-2">
              <Label htmlFor="tour-date" className="text-sm font-medium text-gray-700">
                Tour Date
              </Label>
              <div className="relative">
                <DatePicker
                  id="tour-date"
                  date={tourDate}
                  onDateChange={setTourDate}
                  placeholder="Select tour date"
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 365)}
                  className={`h-12 border-gray-300 text-sm focus:border-coral-500 focus:ring-coral-500 ${
                    tourDate ? 'border-coral-300 bg-coral-50' : ''
                  } ${isPrePopulated && tourDate ? 'ring-2 ring-coral-200' : ''}`}
                />
              </div>
            </div>

            {/* Pick up Location */}
            <div className="space-y-2">
              <Label htmlFor="pickup-location" className="text-sm font-medium text-gray-700">
                Pick up Location
              </Label>
              <div className="relative">
                <Select value={selectedLocation} onValueChange={handleLocationChange} disabled={citiesLoading || rezdyLoading}>
                  <SelectTrigger id="pickup-location" className="h-12 border-gray-300 text-sm focus:border-coral-500 focus:ring-coral-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={citiesLoading || rezdyLoading ? "Loading..." : "Select pickup location"} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Locations
                      {rezdyData.products.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({rezdyData.products.length} tours)
                        </span>
                      )}
                    </SelectItem>
                    {pickupLocations.map(({ location, count }) => (
                      <SelectItem key={location} value={location}>
                        {location}
                        {count > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({count} tours)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-6">
            <Button 
              type="submit" 
              className={`w-full h-12 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md ${
                hasDateSelected 
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                  : 'bg-accent hover:bg-accent/90 text-accent-foreground'
              } ${isPrePopulated ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
            >
              <Search className="mr-2 h-4 w-4" />
              {isPrePopulated 
                ? 'Find My Tours' 
                : hasDateSelected 
                  ? 'Search Available Tours' 
                  : 'Search Tours'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

