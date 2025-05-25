"use client"

import type React from "react"
import Link from "next/link"

import { useState, useEffect, useMemo } from "react"
import { Calendar as CalendarIcon, Users, CreditCard, MapPin, Clock } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRezdyAvailability } from "@/hooks/use-rezdy"
import { RezdyProduct, RezdySession } from "@/lib/types/rezdy"
import { formatPrice, getLocationString } from "@/lib/utils/product-utils"
import { cn } from "@/lib/utils"

interface BookingFormProps {
  product: RezdyProduct
  onClose?: () => void
}

export function BookingForm({ product, onClose }: BookingFormProps) {
  const [travelers, setTravelers] = useState(2)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [selectedSession, setSelectedSession] = useState<RezdySession | null>(null)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get availability for the next 60 days to show available dates
  const today = new Date()
  const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  const startDateRange = today.toISOString().split('T')[0]
  const endDateRange = endDate.toISOString().split('T')[0]

  // Fetch availability for the entire date range
  const { data: availabilityData, loading: availabilityLoading, error: availabilityError } = useRezdyAvailability(
    product.productCode,
    startDateRange,
    endDateRange,
    `ADULT:${travelers}`
  )

  // Extract available dates from the availability data
  const availableDates = useMemo(() => {
    if (!availabilityData || !availabilityData[0]?.sessions) {
      console.log('No availability data:', { availabilityData, loading: availabilityLoading, error: availabilityError })
      return new Set<string>()
    }
    
    const dates = new Set<string>()
    availabilityData[0].sessions.forEach(session => {
      const sessionDate = session.startTimeLocal.split('T')[0]
      dates.add(sessionDate)
    })
    console.log('Available dates:', Array.from(dates))
    return dates
  }, [availabilityData, availabilityLoading, availabilityError])

  // Debug logging
  useEffect(() => {
    console.log('BookingForm Debug:', {
      productCode: product.productCode,
      startDateRange,
      endDateRange,
      travelers,
      availabilityLoading,
      availabilityError,
      availabilityDataLength: availabilityData?.length,
      availableDatesCount: availableDates.size
    })
  }, [product.productCode, availabilityLoading, availabilityError, availabilityData, availableDates.size, startDateRange, endDateRange, travelers])

  // Get sessions for the selected date
  const availableSessions = useMemo(() => {
    if (!availabilityData || !availabilityData[0]?.sessions || !startDate) return []
    
    const selectedDateString = format(startDate, 'yyyy-MM-dd')
    const sessions = availabilityData[0].sessions.filter(session => 
      session.startTimeLocal.startsWith(selectedDateString)
    )
    console.log('Sessions for date', selectedDateString, ':', sessions)
    return sessions
  }, [availabilityData, startDate])

  const handleTravelersChange = (value: string) => {
    setTravelers(Number.parseInt(value))
    setSelectedSession(null) // Reset session when travelers change
  }

  const handleDateChange = (date: Date | undefined) => {
    setStartDate(date)
    setSelectedSession(null) // Reset session when date changes
  }

  const handleSessionSelect = (sessionId: string) => {
    const session = availableSessions.find(s => s.id === sessionId)
    setSelectedSession(session || null)
  }

  const handleNextStep = () => {
    setStep(2)
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  const handleSubmitBooking = async () => {
    if (!selectedSession) return

    setIsSubmitting(true)
    try {
      // Here you would integrate with the Rezdy booking API
      // For now, we'll simulate a booking
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success message or redirect
      alert('Booking submitted successfully! You will receive a confirmation email shortly.')
      onClose?.()
    } catch (error) {
      alert('There was an error processing your booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const basePrice = product.advertisedPrice || 0
  const sessionPrice = selectedSession?.totalPrice || basePrice * travelers
  const subtotal = sessionPrice
  const taxAndFees = Math.round(subtotal * 0.12)
  const total = subtotal + taxAndFees

  const location = getLocationString(product.locationAddress)

  // Helper function to check if a date is available
  const isDateAvailable = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return availableDates.has(dateString)
  }

  // Helper function to disable dates that are not available
  const isDateDisabled = (date: Date) => {
    // Only disable dates before today or after 60 days
    // Allow all other dates to be selectable - we'll show availability after selection
    return date < today || date > endDate
  }

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="travelers">Number of Travelers</Label>
            <div className="relative">
              <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select defaultValue="2" onValueChange={handleTravelersChange}>
                <SelectTrigger id="travelers" className="pl-9">
                  <SelectValue placeholder="Select number of travelers" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.min(product.quantityRequiredMax || 10, 10) }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Traveler' : 'Travelers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Date</Label>
            {availabilityLoading ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            ) : availabilityError ? (
              <div className="text-red-500 text-sm">Error loading availability: {availabilityError}</div>
            ) : (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleDateChange}
                      disabled={isDateDisabled}
                      modifiers={{
                        available: (date) => {
                          const dateString = format(date, 'yyyy-MM-dd')
                          return availableDates.has(dateString)
                        }
                      }}
                      modifiersStyles={{
                        available: {
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          fontWeight: 'bold'
                        }
                      }}
                      initialFocus
                    />
                    {availableDates.size > 0 && (
                      <div className="p-3 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fef3c7' }}></div>
                          <span>Available dates</span>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                {availabilityLoading ? (
                  <div className="text-xs text-muted-foreground">
                    Loading availability...
                  </div>
                ) : availableDates.size > 0 ? (
                  <div className="text-xs text-muted-foreground">
                    {availableDates.size} dates available in the next 60 days
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Select a date to check availability
                  </div>
                )}
              </>
            )}
          </div>

          {startDate && (
            <div className="space-y-2">
              <Label>Available Times</Label>
              {availableSessions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableSessions.map((session) => (
                    <Card 
                      key={session.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedSession?.id === session.id ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSessionSelect(session.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {new Date(session.startTimeLocal).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} - {new Date(session.endTimeLocal).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {session.seatsAvailable} seats available
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {session.totalPrice ? `$${session.totalPrice}` : formatPrice(basePrice * travelers)}
                            </div>
                            <div className="text-sm text-muted-foreground">total</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>No availability for {startDate ? format(startDate, "PPP") : "this date"}</p>
                  <p className="text-sm">Please select a different date or check back later</p>
                  {availabilityLoading && (
                    <p className="text-xs mt-2">Loading availability...</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!startDate && !availabilityLoading && availableDates.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>Available dates:</strong> We found {availableDates.size} available dates in the next 60 days. 
                Please select a date above to see available times.
              </div>
            </div>
          )}

          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tour</span>
              <span>{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Location</span>
              <span className="text-right">{location}</span>
            </div>
            <div className="flex justify-between">
              <span>Travelers</span>
              <span>{travelers} {travelers === 1 ? 'person' : 'people'}</span>
            </div>
            {selectedSession && (
              <div className="flex justify-between">
                <span>Date & Time</span>
                <span className="text-right">
                  {new Date(selectedSession.startTimeLocal).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} at {new Date(selectedSession.startTimeLocal).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxes & fees</span>
              <span>${taxAndFees}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
          
          <Button
            className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
            onClick={handleNextStep}
            disabled={!selectedSession}
          >
            Continue to Booking
          </Button>
          <div className="text-center text-xs text-muted-foreground">No charge will be made at this stage</div>
        </>
      ) : (
        <>
          <div className="rounded-lg bg-muted p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSession && new Date(selectedSession.startTimeLocal).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })} • {travelers} {travelers === 1 ? "traveler" : "travelers"}
                </div>
                <div className="text-sm text-muted-foreground">
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {location}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handlePrevStep}>
                Edit
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" placeholder="Enter first name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" placeholder="Enter last name" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter email address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter phone number" required />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="card-number" placeholder="0000 0000 0000 0000" className="pl-9" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="CVC" required />
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm leading-tight">
                I agree to the{" "}
                <Link href="/terms" className="text-primary underline">
                  terms and conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary underline">
                  privacy policy
                </Link>
              </Label>
            </div>
            
            <Button 
              className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Complete Booking • $${total}`}
            </Button>
            <div className="text-center text-xs text-muted-foreground">Your payment is secured with SSL encryption</div>
          </div>
        </>
      )}
    </div>
  )
}
