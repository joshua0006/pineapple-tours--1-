"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addDays, format } from "date-fns"
import { Search, MapPin, Calendar, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"

interface SearchFormProps {
  onSearch?: (searchData: any) => void;
  showRedirect?: boolean;
}

export function SearchForm({ onSearch, showRedirect = true }: SearchFormProps) {
  const router = useRouter()
  const [searchType, setSearchType] = useState("destination")
  
  // Form state for destination search
  const [destination, setDestination] = useState("")
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [travelers, setTravelers] = useState("2")
  
  // Form state for tour type search
  const [tourType, setTourType] = useState("all")
  const [duration, setDuration] = useState("any")
  const [budget, setBudget] = useState("any")
  const [tourTravelers, setTourTravelers] = useState("2")

  const handleDestinationSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const searchData = {
      query: destination,
      category: 'all',
      travelers: travelers,
      checkIn: checkInDate ? format(checkInDate, 'yyyy-MM-dd') : '',
      checkOut: checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : '',
      searchType: 'destination'
    }

    if (onSearch) {
      onSearch(searchData)
    } else if (showRedirect) {
      // Redirect to search results page
      const params = new URLSearchParams()
      if (destination) params.append('query', destination)
      if (travelers !== '2') params.append('travelers', travelers)
      if (checkInDate) params.append('checkIn', format(checkInDate, 'yyyy-MM-dd'))
      if (checkOutDate) params.append('checkOut', format(checkOutDate, 'yyyy-MM-dd'))
      
      router.push(`/search?${params.toString()}`)
    }
  }

  const handleTourTypeSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const searchData = {
      query: '',
      category: tourType,
      duration: duration,
      priceRange: budget,
      travelers: tourTravelers,
      searchType: 'tour'
    }

    if (onSearch) {
      onSearch(searchData)
    } else if (showRedirect) {
      // Redirect to search results page
      const params = new URLSearchParams()
      if (tourType !== 'all') params.append('category', tourType)
      if (duration !== 'any') params.append('duration', duration)
      if (budget !== 'any') params.append('priceRange', budget)
      if (tourTravelers !== '2') params.append('travelers', tourTravelers)
      
      router.push(`/search?${params.toString()}`)
    }
  }

  return (
    <Tabs defaultValue="destination" className="w-full" onValueChange={setSearchType}>
      <div className="bg-white p-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="destination">Search by Destination</TabsTrigger>
          <TabsTrigger value="tour">Search by Tour Type</TabsTrigger>
        </TabsList>
        <TabsContent value="destination" className="mt-0">
          <form onSubmit={handleDestinationSearch} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="destination" 
                  placeholder="Where do you want to go?" 
                  className="pl-9"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
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
            <div className="md:col-span-4">
              <Button type="submit" className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
                <Search className="mr-2 h-4 w-4" />
                Search Vacations
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="tour" className="mt-0">
          <form onSubmit={handleTourTypeSearch} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="tour-type">Tour Type</Label>
              <Select value={tourType} onValueChange={setTourType}>
                <SelectTrigger id="tour-type">
                  <SelectValue placeholder="Select tour type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tours</SelectItem>
                  <SelectItem value="family">Family Vacation</SelectItem>
                  <SelectItem value="honeymoon">Honeymoon</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Duration</SelectItem>
                  <SelectItem value="1-3">1-3 Days</SelectItem>
                  <SelectItem value="4-7">4-7 Days</SelectItem>
                  <SelectItem value="8-14">8-14 Days</SelectItem>
                  <SelectItem value="15+">15+ Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger id="budget">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Budget</SelectItem>
                  <SelectItem value="under-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                  <SelectItem value="over-2000">Over $2,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tour-travelers">Travelers</Label>
              <div className="relative">
                <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select value={tourTravelers} onValueChange={setTourTravelers}>
                  <SelectTrigger id="tour-travelers" className="pl-9">
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
            <div className="md:col-span-4">
              <Button type="submit" className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
                <Search className="mr-2 h-4 w-4" />
                Find Tours
              </Button>
            </div>
          </form>
        </TabsContent>
      </div>
    </Tabs>
  )
}
