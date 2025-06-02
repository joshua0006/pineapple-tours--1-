"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { addDays, format } from "date-fns"
import { Search, MapPin, Calendar, Users, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useBookingPrompt } from "@/hooks/use-booking-prompt"

// Static destinations data based on the provided image
const STATIC_DESTINATIONS = [
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
  
  // Static state management
  const [selectedCity, setSelectedCity] = useState<string>('all')
  
  // Form state for tours search
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [travelers, setTravelers] = useState("2")

  // Initialize form with URL parameters or booking prompt data
  useEffect(() => {
    // Check URL parameters first (these take priority)
    const urlTravelers = searchParams.get('travelers')
    const urlCheckIn = searchParams.get('checkIn')
    const urlCheckOut = searchParams.get('checkOut')
    const urlCity = searchParams.get('city')

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
      query: '',
      category: 'all',
      travelers: travelers,
      checkIn: checkInDate ? format(checkInDate, 'yyyy-MM-dd') : '',
      checkOut: checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : '',
      searchType: 'tours',
      location: selectedCity === 'all' ? '' : selectedCity,
      city: selectedCity === 'all' ? '' : selectedCity
    }

    if (onSearch) {
      onSearch(searchData)
    } else if (showRedirect) {
      // Redirect to search results page
      const params = new URLSearchParams()
      
      // Always include travelers parameter
      params.append('travelers', travelers)
      
      // Include city if selected
      if (selectedCity && selectedCity !== 'all') {
        params.append('city', selectedCity)
      }
      
      // Include dates if selected
      if (checkInDate) params.append('checkIn', format(checkInDate, 'yyyy-MM-dd'))
      if (checkOutDate) params.append('checkOut', format(checkOutDate, 'yyyy-MM-dd'))
      
      // Add default sort for better results
      params.append('sortBy', 'relevance')
      
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
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isPrePopulated ? "Complete Your Booking" : "Find Your Perfect Vacation"}
          </h2>
          <p className="text-sm text-gray-600">
            {isPrePopulated 
              ? "We've pre-filled your preferences. Adjust as needed and search for available tours."
              : "Search for tours and experiences by destination"
            }
            {hasDatesSelected && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                <CalendarDays className="w-3 h-3 mr-1" />
                {dateRangeText}
              </span>
            )}
          </p>
        </div>
        
        <form onSubmit={handleToursSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Destination */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="destination" className="text-sm font-medium text-gray-700">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={selectedCity} onValueChange={handleCityChange}>
                  <SelectTrigger id="destination" className="pl-10 h-12 border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Where do you want to go?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Destinations</SelectItem>
                    {STATIC_DESTINATIONS.map((destination) => (
                      <SelectItem key={destination} value={destination}>
                        {destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="check-in" className="text-sm font-medium text-gray-700">
                Check-in Date
                {checkInDate && (
                  <span className="ml-1 text-xs text-orange-600 font-normal">
                    ({format(checkInDate, 'EEE')})
                  </span>
                )}
              </Label>
              <div className="relative">
                <DatePicker
                  id="check-in"
                  date={checkInDate}
                  onDateChange={setCheckInDate}
                  placeholder="Select date"
                  minDate={new Date()}
                  maxDate={checkOutDate ? addDays(checkOutDate, -1) : addDays(new Date(), 365)}
                  className={`h-12 border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500 ${
                    checkInDate ? 'border-orange-300 bg-orange-50' : ''
                  } ${isPrePopulated && checkInDate ? 'ring-2 ring-yellow-200' : ''}`}
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="check-out" className="text-sm font-medium text-gray-700">
                Check-out Date
                {checkOutDate && (
                  <span className="ml-1 text-xs text-orange-600 font-normal">
                    ({format(checkOutDate, 'EEE')})
                  </span>
                )}
              </Label>
              <div className="relative">
                <DatePicker
                  id="check-out"
                  date={checkOutDate}
                  onDateChange={setCheckOutDate}
                  placeholder="Select date"
                  minDate={checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1)}
                  maxDate={addDays(new Date(), 365)}
                  className={`h-12 border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500 ${
                    checkOutDate ? 'border-orange-300 bg-orange-50' : ''
                  } ${isPrePopulated && checkOutDate ? 'ring-2 ring-yellow-200' : ''}`}
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="space-y-2">
              <Label htmlFor="travelers" className="text-sm font-medium text-gray-700">Travelers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={travelers} onValueChange={setTravelers}>
                  <SelectTrigger 
                    id="travelers" 
                    className={`pl-10 h-12 border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500 ${
                      isPrePopulated && promptData?.groupSize ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''
                    }`}
                  >
                    <SelectValue placeholder="2 Travelers" />
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

            {/* Search Button */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Button 
                type="submit" 
                className={`w-full h-12 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md ${
                  hasDatesSelected 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } ${isPrePopulated ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {isPrePopulated 
                    ? 'Find My Tours' 
                    : hasDatesSelected 
                      ? 'Search Available Tours' 
                      : 'Search Vacations'
                  }
                </span>
                <span className="sm:hidden">Search</span>
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
