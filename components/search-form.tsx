"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addDays, format } from "date-fns"
import { Search, MapPin, Calendar, Users, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCityProducts } from "@/hooks/use-city-products"

interface SearchFormProps {
  onSearch?: (searchData: any) => void;
  showRedirect?: boolean;
  onCityChange?: (city: string, products: any[]) => void;
}

export function SearchForm({ onSearch, showRedirect = true, onCityChange }: SearchFormProps) {
  const router = useRouter()
  
  // Use the city products hook for dynamic city data
  const { cities, selectedCity, setSelectedCity, filteredProducts, loading, error, refreshData } = useCityProducts()
  
  // Debug: Alert when component loads
  useEffect(() => {
    console.log('SearchForm: Component loaded with data:', {
      cities: cities.length,
      selectedCity,
      filteredProducts: filteredProducts.length,
      loading,
      error,
      timestamp: new Date().toISOString()
    });
    
    // Also log the first few products to see if they have location data
    if (filteredProducts.length > 0) {
      console.log('SearchForm: First 3 products:', filteredProducts.slice(0, 3).map(p => ({
        name: p.name,
        productCode: p.productCode,
        locationAddress: p.locationAddress
      })));
    }
  }, [cities, selectedCity, filteredProducts, loading, error]);
  
  // Form state for tours search
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [travelers, setTravelers] = useState("2")

  // Handle city selection change
  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (onCityChange) {
      onCityChange(city, filteredProducts)
    }
  }

  // Notify parent component when filtered products change
  useEffect(() => {
    if (onCityChange) {
      onCityChange(selectedCity, filteredProducts)
    }
  }, [selectedCity, filteredProducts, onCityChange])

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
      if (selectedCity && selectedCity !== 'all') {
        params.append('city', selectedCity)
      }
      if (travelers !== '2') params.append('travelers', travelers)
      if (checkInDate) params.append('checkIn', format(checkInDate, 'yyyy-MM-dd'))
      if (checkOutDate) params.append('checkOut', format(checkOutDate, 'yyyy-MM-dd'))
      
      router.push(`/search?${params.toString()}`)
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white p-6">
        {/* City Selection Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="city-select" className="text-base font-medium">Select Destination</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
            <Select value={selectedCity} onValueChange={handleCityChange} disabled={loading}>
              <SelectTrigger id="city-select" className="pl-9">
                <SelectValue placeholder={loading ? "Loading cities..." : "Select destination"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">
              Error loading cities: {error}
            </p>
          )}
          {selectedCity === 'all' ? (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredProducts.length} total tour{filteredProducts.length !== 1 ? 's' : ''} available across all destinations
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredProducts.length} tour{filteredProducts.length !== 1 ? 's' : ''} available in {selectedCity}
            </p>
          )}
        </div>

        <form onSubmit={handleToursSearch} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="check-in">Check-in Date</Label>
            <DatePicker
              id="check-in"
              date={checkInDate}
              onDateChange={setCheckInDate}
              placeholder="Select check-in date"
              minDate={new Date()}
              maxDate={checkOutDate ? addDays(checkOutDate, -1) : addDays(new Date(), 365)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-out">Check-out Date</Label>
            <DatePicker
              id="check-out"
              date={checkOutDate}
              onDateChange={setCheckOutDate}
              placeholder="Select check-out date"
              minDate={checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1)}
              maxDate={addDays(new Date(), 365)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelers">Travelers</Label>
            <div className="relative">
              <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select value={travelers} onValueChange={setTravelers}>
                <SelectTrigger id="travelers" className="pl-9">
                  <SelectValue placeholder="Number of travelers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Traveler</SelectItem>
                  <SelectItem value="2">2 Travelers</SelectItem>
                  <SelectItem value="3">3 Travelers</SelectItem>
                  <SelectItem value="4">4 Travelers</SelectItem>
                  <SelectItem value="5">5+ Travelers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="md:col-span-3">
            <Button type="submit" className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
              <Search className="mr-2 h-4 w-4" />
              Search Vacations
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
