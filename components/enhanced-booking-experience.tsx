"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Calendar as CalendarIcon, Users, CreditCard, MapPin, Clock, Star, Shield, CheckCircle, AlertCircle, Info, Phone, Mail, Globe, Heart, Share2, Calendar, ArrowLeft, ArrowRight } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PricingDisplay } from "@/components/ui/pricing-display"
import { GuestManager, type GuestInfo } from "@/components/ui/guest-manager"
import { ExtrasSelector } from "@/components/ui/extras-selector"
import { useRezdyAvailability } from "@/hooks/use-rezdy"
import { RezdyProduct, RezdySession, RezdyPickupLocation } from "@/lib/types/rezdy"
import { formatPrice, getLocationString } from "@/lib/utils/product-utils"
import { calculatePricing, formatCurrency, getPricingSummaryText, validatePricingOptions, type PricingBreakdown, type SelectedExtra } from "@/lib/utils/pricing-utils"
import { cn } from "@/lib/utils"

interface EnhancedBookingExperienceProps {
  product: RezdyProduct
  onClose?: () => void
  onBookingComplete?: (bookingData: any) => void
  // Optional cart item data for pre-populating the form
  preSelectedSession?: RezdySession
  preSelectedParticipants?: {
    adults: number
    children?: number
    infants?: number
  }
  preSelectedExtras?: SelectedExtra[]
}

interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  emergencyContact: string
  emergencyPhone: string
  dietaryRequirements: string
  accessibilityNeeds: string
  specialRequests: string
}

interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  billingAddress: string
  city: string
  postalCode: string
  country: string
}

const BOOKING_STEPS = [
  { id: 1, title: "Date & Guest Details", description: "Choose your tour date and add guest information" },
  { id: 2, title: "Contact Info", description: "Provide contact and special requirements" },
  { id: 3, title: "Payment", description: "Complete your booking with secure payment" },
  { id: 4, title: "Confirmation", description: "Review and confirm your booking" }
]

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Italy", "Spain", "Japan", "South Korea", "China", "India", "Brazil", "Mexico", "Argentina", "Other"
]

export function EnhancedBookingExperience({ product, onClose, onBookingComplete, preSelectedSession, preSelectedParticipants, preSelectedExtras }: EnhancedBookingExperienceProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingErrors, setBookingErrors] = useState<string[]>([])
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSession, setSelectedSession] = useState<RezdySession | null>(preSelectedSession || null)
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<RezdyPickupLocation | null>(null)
  const [guests, setGuests] = useState<GuestInfo[]>([
    { id: '1', firstName: '', lastName: '', age: 25, type: 'ADULT' }
  ])
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>(preSelectedExtras || [])
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    emergencyContact: '',
    emergencyPhone: '',
    dietaryRequirements: '',
    accessibilityNeeds: '',
    specialRequests: ''
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    postalCode: '',
    country: ''
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false)

  // Initialize form data from cart item if provided
  useEffect(() => {
    if (preSelectedSession) {
      // Set the selected date from the session
      const sessionDate = new Date(preSelectedSession.startTimeLocal)
      setSelectedDate(sessionDate)
      
      // Auto-select first pickup location if available
      if (preSelectedSession.pickupLocations && preSelectedSession.pickupLocations.length > 0) {
        setSelectedPickupLocation(preSelectedSession.pickupLocations[0])
      }
    }
    
    if (preSelectedParticipants) {
      // Create guest list based on participant counts
      const newGuests: GuestInfo[] = []
      let guestId = 1
      
      // Add adults
      for (let i = 0; i < preSelectedParticipants.adults; i++) {
        newGuests.push({
          id: guestId.toString(),
          firstName: '',
          lastName: '',
          age: 25,
          type: 'ADULT'
        })
        guestId++
      }
      
      // Add children
      if (preSelectedParticipants.children) {
        for (let i = 0; i < preSelectedParticipants.children; i++) {
          newGuests.push({
            id: guestId.toString(),
            firstName: '',
            lastName: '',
            age: 12,
            type: 'CHILD'
          })
          guestId++
        }
      }
      
      // Add infants
      if (preSelectedParticipants.infants) {
        for (let i = 0; i < preSelectedParticipants.infants; i++) {
          newGuests.push({
            id: guestId.toString(),
            firstName: '',
            lastName: '',
            age: 1,
            type: 'INFANT'
          })
          guestId++
        }
      }
      
      if (newGuests.length > 0) {
        setGuests(newGuests)
      }
    }
  }, [preSelectedSession, preSelectedParticipants])

  // Date range for availability
  const today = new Date()
  const endDate = addDays(today, 90) // 3 months ahead
  const startDateRange = today.toISOString().split('T')[0]
  const endDateRange = endDate.toISOString().split('T')[0]

  // Calculate guest counts
  const guestCounts = useMemo(() => {
    const counts = { adults: 0, children: 0, infants: 0 }
    guests.forEach(guest => {
      if (guest.type === 'ADULT') counts.adults++
      else if (guest.type === 'CHILD') counts.children++
      else if (guest.type === 'INFANT') counts.infants++
    })
    return counts
  }, [guests])

  // Fetch availability
  const { data: availabilityData, loading: availabilityLoading, error: availabilityError } = useRezdyAvailability(
    product.productCode,
    startDateRange,
    endDateRange,
    `ADULT:${guestCounts.adults},CHILD:${guestCounts.children},INFANT:${guestCounts.infants}`
  )

  // Fallback mock data for when API is not working
  const mockAvailabilityData = useMemo(() => {
    const sessions = []
    const today = new Date()
    
    // Generate mock sessions for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const sessionDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      const dateString = sessionDate.toISOString().split('T')[0]
      
      // Skip weekends for some variety
      if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) continue
      
      // Morning session
      sessions.push({
        id: `mock-session-${i}-morning`,
        startTimeLocal: `${dateString}T09:00:00`,
        endTimeLocal: `${dateString}T17:00:00`,
        seatsAvailable: Math.floor(Math.random() * 15) + 5, // 5-20 seats
        totalPrice: product.advertisedPrice || 89,
        pickupLocations: []
      })
      
      // Afternoon session (some days)
      if (Math.random() > 0.3) {
        sessions.push({
          id: `mock-session-${i}-afternoon`,
          startTimeLocal: `${dateString}T14:00:00`,
          endTimeLocal: `${dateString}T22:00:00`,
          seatsAvailable: Math.floor(Math.random() * 12) + 3, // 3-15 seats
          totalPrice: product.advertisedPrice || 89,
          pickupLocations: []
        })
      }
    }
    
    return [{ productCode: product.productCode, sessions }]
  }, [product.productCode, product.advertisedPrice])

  // Use mock data if API fails or returns no data
  const effectiveAvailabilityData = useMemo(() => {
    // If we have real data with sessions, use it
    if (availabilityData && availabilityData[0]?.sessions && availabilityData[0].sessions.length > 0) {
      return availabilityData
    }
    
    // If API is still loading, don't use mock data yet
    if (availabilityLoading) {
      return null
    }
    
    // If API failed or returned no sessions, use mock data
    if (availabilityError || !availabilityData || !availabilityData[0]?.sessions || availabilityData[0].sessions.length === 0) {
      console.log('Using mock availability data due to API issue:', { availabilityError, availabilityData })
      return mockAvailabilityData
    }
    
    return availabilityData
  }, [availabilityData, availabilityLoading, availabilityError, mockAvailabilityData])

  // Debug logging for availability data
  useEffect(() => {
    console.log('Enhanced Booking Experience - Availability Debug:', {
      productCode: product.productCode,
      startDateRange,
      endDateRange,
      guestCounts,
      availabilityLoading,
      availabilityError,
      availabilityData,
      effectiveAvailabilityData,
      sessionsCount: effectiveAvailabilityData?.[0]?.sessions?.length || 0,
      firstSessionExample: effectiveAvailabilityData?.[0]?.sessions?.[0]
    })
  }, [product.productCode, startDateRange, endDateRange, guestCounts, availabilityLoading, availabilityError, availabilityData, effectiveAvailabilityData])

  // Extract available dates with seat availability
  const availableDates = useMemo(() => {
    if (!effectiveAvailabilityData || !effectiveAvailabilityData[0]?.sessions) return new Set<string>()
    
    const dates = new Set<string>()
    effectiveAvailabilityData[0].sessions.forEach(session => {
      if (session.seatsAvailable > 0 && session.startTimeLocal) {
        const sessionDate = session.startTimeLocal.split('T')[0]
        dates.add(sessionDate)
      }
    })
    return dates
  }, [effectiveAvailabilityData])

  // Get seat availability for a specific date
  const getDateSeatAvailability = useMemo(() => {
    if (!effectiveAvailabilityData || !effectiveAvailabilityData[0]?.sessions) return new Map<string, number>()
    
    const seatMap = new Map<string, number>()
    effectiveAvailabilityData[0].sessions.forEach(session => {
      if (session.startTimeLocal) {
        const sessionDate = session.startTimeLocal.split('T')[0]
        const currentSeats = seatMap.get(sessionDate) || 0
        seatMap.set(sessionDate, Math.max(currentSeats, session.seatsAvailable))
      }
    })
    return seatMap
  }, [effectiveAvailabilityData])

  // Get all dates that have sessions (regardless of availability)
  const datesWithSessions = useMemo(() => {
    if (!effectiveAvailabilityData || !effectiveAvailabilityData[0]?.sessions) return new Set<string>()
    
    const dates = new Set<string>()
    effectiveAvailabilityData[0].sessions.forEach(session => {
      if (session.startTimeLocal) {
        const sessionDate = session.startTimeLocal.split('T')[0]
        dates.add(sessionDate)
      }
    })
    return dates
  }, [effectiveAvailabilityData])

  // Get sessions for selected date
  const availableSessions = useMemo(() => {
    if (!effectiveAvailabilityData || !effectiveAvailabilityData[0]?.sessions || !selectedDate) return []
    
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd')
    return effectiveAvailabilityData[0].sessions.filter(session => 
      session.startTimeLocal && session.startTimeLocal.startsWith(selectedDateString)
    ).sort((a, b) => {
      if (!a.startTimeLocal || !b.startTimeLocal) return 0
      return new Date(a.startTimeLocal).getTime() - new Date(b.startTimeLocal).getTime()
    })
  }, [effectiveAvailabilityData, selectedDate])

  // Calculate pricing
  const pricingBreakdown = useMemo((): PricingBreakdown => {
    return calculatePricing(product, selectedSession, {
      adults: guestCounts.adults,
      children: guestCounts.children,
      infants: guestCounts.infants,
      extras: selectedExtras
    })
  }, [product, selectedSession, guestCounts, selectedExtras])

  // Validation
  const validationErrors = useMemo(() => {
    return validatePricingOptions({
      adults: guestCounts.adults,
      children: guestCounts.children,
      infants: guestCounts.infants,
      extras: selectedExtras
    }, product)
  }, [guestCounts, selectedExtras, product])

  // Step validation
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedSession && validationErrors.length === 0 && guests.every(g => g.firstName.trim() && g.lastName.trim())
      case 2:
        return contactInfo.firstName && contactInfo.lastName && contactInfo.email && contactInfo.phone
      case 3:
        return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.cardholderName && agreeToTerms
      default:
        return false
    }
  }

  // Event handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSession(null)
    setSelectedPickupLocation(null)
  }

  const handleSessionSelect = (session: RezdySession) => {
    setSelectedSession(session)
    // Auto-select first pickup location if available
    if (session.pickupLocations && session.pickupLocations.length > 0) {
      setSelectedPickupLocation(session.pickupLocations[0])
    }
  }

  const handleNextStep = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
      setBookingErrors([])
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setBookingErrors([])
    }
  }

  const handleCompleteBooking = async () => {
    setIsSubmitting(true)
    setBookingErrors([])

    try {
      // Prepare comprehensive booking data
      const bookingData = {
        product: {
          code: product.productCode,
          name: product.name,
          description: product.shortDescription
        },
        session: {
          id: selectedSession?.id,
          startTime: selectedSession?.startTimeLocal,
          endTime: selectedSession?.endTimeLocal,
          pickupLocation: selectedPickupLocation
        },
        guests: guests.filter(g => g.firstName.trim() && g.lastName.trim()),
        contact: contactInfo,
        payment: {
          ...paymentInfo,
          // Don't store sensitive payment info in real implementation
          cardNumber: paymentInfo.cardNumber.slice(-4)
        },
        pricing: pricingBreakdown,
        extras: selectedExtras,
        preferences: {
          subscribeNewsletter,
          dietaryRequirements: contactInfo.dietaryRequirements,
          accessibilityNeeds: contactInfo.accessibilityNeeds,
          specialRequests: contactInfo.specialRequests
        },
        timestamp: new Date().toISOString()
      }

      // Simulate API call - replace with actual Rezdy booking API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Move to confirmation step
      setCurrentStep(4)
      
      // Notify parent component
      onBookingComplete?.(bookingData)
      
    } catch (error) {
      setBookingErrors(['Failed to process booking. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDateAvailable = (date: Date): boolean => {
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      return availableDates.has(dateString)
    } catch {
      return false
    }
  }

  const isDateDisabled = (date: Date): boolean => {
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      const hasAvailabilityData = Boolean(effectiveAvailabilityData && effectiveAvailabilityData[0]?.sessions && effectiveAvailabilityData[0].sessions.length > 0)
      
      // Disable if date is in the past or beyond our range
      if (date < today || date > endDate) {
        return true
      }
      
      // If we don't have availability data yet, don't disable dates (let them load)
      if (!hasAvailabilityData) {
        return false
      }
      
      // If we have availability data, only disable dates that have sessions but no seats
      const hasSessionsOnDate = datesWithSessions.has(dateString)
      const hasSeatsOnDate = (getDateSeatAvailability.get(dateString) || 0) > 0
      
      // Disable if there are sessions on this date but no seats available
      return hasSessionsOnDate && !hasSeatsOnDate
    } catch {
      return true
    }
  }

  const isDateSoldOut = (date: Date): boolean => {
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      const hasAvailabilityData = Boolean(effectiveAvailabilityData && effectiveAvailabilityData[0]?.sessions && effectiveAvailabilityData[0].sessions.length > 0)
      
      // Only mark as sold out if we have availability data, there are sessions on this date, but no seats available
      if (!hasAvailabilityData) {
        return false
      }
      
      const hasSessionsOnDate = datesWithSessions.has(dateString)
      const hasSeatsOnDate = (getDateSeatAvailability.get(dateString) || 0) > 0
      
      return hasSessionsOnDate && !hasSeatsOnDate
    } catch {
      return false
    }
  }

  const getStepProgress = () => {
    return ((currentStep - 1) / (BOOKING_STEPS.length - 1)) * 100
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{getLocationString(product.locationAddress)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Step {currentStep} of {BOOKING_STEPS.length}</span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {BOOKING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
                currentStep >= step.id 
                  ? "bg-yellow-500 text-black" 
                  : "bg-gray-200 text-gray-600"
              )}>
                {currentStep > step.id ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : step.id}
              </div>
              {index < BOOKING_STEPS.length - 1 && (
                <div className={cn(
                  "w-12 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors flex-shrink-0",
                  currentStep > step.id ? "bg-yellow-500" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {(bookingErrors.length > 0 || validationErrors.length > 0) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {[...bookingErrors, ...validationErrors].map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Data Alert */}
        {!availabilityLoading && (availabilityError || !availabilityData || !availabilityData[0]?.sessions?.length) && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Demo availability data is being displayed. In a live environment, this would show real-time tour availability from the booking system.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Step 1: Date & Guest Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Date & Time Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Select Date & Time
                    </CardTitle>
                    <p className="text-muted-foreground">Choose your preferred tour date and session first</p>
                    {selectedSession && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          Session selected for {selectedDate && format(selectedDate, "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <Label className="text-base font-medium">Select Date</Label>
                      <div className="mt-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "Choose your tour date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              disabled={isDateDisabled}
                              modifiers={{
                                available: isDateAvailable,
                                soldOut: isDateSoldOut
                              }}
                              modifiersStyles={{
                                available: {
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  fontWeight: 'bold'
                                },
                                soldOut: {
                                  backgroundColor: '#fee2e2',
                                  color: '#991b1b',
                                  textDecoration: 'line-through'
                                }
                              }}
                              initialFocus
                            />
                            <div className="p-3 border-t space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                                <span>Available dates</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-3 h-3 bg-red-200 rounded"></div>
                                <span>Sold out</span>
                              </div>
                              {availabilityLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                                  <span>Loading availability...</span>
                                </div>
                              )}
                              {availabilityError && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Error loading availability</span>
                                </div>
                              )}
                              {!availabilityLoading && !availabilityError && effectiveAvailabilityData && (
                                <div className="text-xs text-muted-foreground">
                                  {effectiveAvailabilityData[0]?.sessions?.length || 0} sessions found
                                  {availabilityError || !availabilityData || !availabilityData[0]?.sessions?.length ? ' (using demo data)' : ''}
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <Label className="text-base font-medium">Select Time</Label>
                        {availabilityLoading ? (
                          <div className="mt-2 space-y-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                          </div>
                        ) : availableSessions.length > 0 ? (
                          <div className="mt-2 space-y-3">
                            {availableSessions
                              .filter(session => session.startTimeLocal && session.endTimeLocal)
                              .map((session) => {
                              const startTime = new Date(session.startTimeLocal!)
                              const endTime = new Date(session.endTimeLocal!)
                              const isSelected = selectedSession?.id === session.id
                              
                              return (
                                <Card 
                                  key={session.id}
                                  className={cn(
                                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                                    isSelected ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:bg-gray-50",
                                    session.seatsAvailable === 0 && "opacity-50 cursor-not-allowed"
                                  )}
                                  onClick={() => session.seatsAvailable > 0 && handleSessionSelect(session)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className="text-center">
                                          <div className="text-lg font-bold">
                                            {format(startTime, 'HH:mm')}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {format(endTime, 'HH:mm')}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="font-medium">
                                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>
                                              {session.seatsAvailable > 0 
                                                ? `${session.seatsAvailable} seats available`
                                                : 'Sold out'
                                              }
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold">
                                          {formatCurrency(session.totalPrice || product.advertisedPrice || 0)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">per adult</div>
                                        {typeof session.id === 'string' && session.id.startsWith('mock-') ? (
                                          <div className="text-xs text-blue-600 mt-1">Demo</div>
                                        ) : null}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="mt-2 p-4 text-center text-muted-foreground bg-gray-50 rounded-lg">
                            No sessions available for this date. Please select another date.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pickup Location Selection */}
                    {selectedSession && selectedSession.pickupLocations && selectedSession.pickupLocations.length > 0 && (
                      <div>
                        <Label className="text-base font-medium">Pickup Location</Label>
                        <div className="mt-2 space-y-2">
                          {selectedSession.pickupLocations.map((location) => (
                            <Card 
                              key={location.id}
                              className={cn(
                                "cursor-pointer transition-all duration-200",
                                selectedPickupLocation?.id === location.id 
                                  ? "ring-2 ring-yellow-500 bg-yellow-50" 
                                  : "hover:bg-gray-50"
                              )}
                              onClick={() => setSelectedPickupLocation(location)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                  <div className="flex-1">
                                    <div className="font-medium">{location.name}</div>
                                    {typeof location.address === 'string' ? (
                                      <div className="text-sm text-muted-foreground">{location.address}</div>
                                    ) : location.address && (
                                      <div className="text-sm text-muted-foreground">
                                        {(() => {
                                          const addressParts = [
                                            location.address.addressLine,
                                            location.address.city,
                                            location.address.state,
                                            location.address.postCode
                                          ].filter(Boolean)
                                          return addressParts.join(', ')
                                        })()}
                                      </div>
                                    )}
                                    {location.pickupTime && (
                                      <div className="text-sm text-yellow-600 font-medium">
                                        Pickup: {location.pickupTime}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date Selection Validation */}
                    {!selectedSession && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Please select a date and time session before adding guest details.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Guest Details Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {BOOKING_STEPS[0].title}
                    </CardTitle>
                    <p className="text-muted-foreground">Add guest information for your selected session</p>
                    {guests.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          {guestCounts.adults + guestCounts.children + guestCounts.infants} guests added
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <GuestManager
                      guests={guests}
                      onGuestsChange={setGuests}
                      maxGuests={product.quantityRequiredMax || 10}
                      minGuests={product.quantityRequiredMin || 1}
                      requireAdult={true}
                    />
                  </CardContent>
                </Card>

                {/* Optional Extras */}
                {product.extras && product.extras.length > 0 && (
                  <ExtrasSelector
                    extras={product.extras}
                    selectedExtras={selectedExtras}
                    onExtrasChange={setSelectedExtras}
                    guestCount={guestCounts.adults + guestCounts.children + guestCounts.infants}
                  />
                )}

                {/* Guest Details Validation */}
                {guests.length > 0 && !guests.every(g => g.firstName.trim() && g.lastName.trim()) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Please complete all guest names to proceed to the next step.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {BOOKING_STEPS[1].title}
                  </CardTitle>
                  <p className="text-muted-foreground">{BOOKING_STEPS[1].description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-first-name">First Name *</Label>
                      <Input
                        id="contact-first-name"
                        value={contactInfo.firstName}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-last-name">Last Name *</Label>
                      <Input
                        id="contact-last-name"
                        value={contactInfo.lastName}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-email">Email Address *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Phone Number *</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact-country">Country</Label>
                    <Select value={contactInfo.country} onValueChange={(value) => setContactInfo(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergency-contact">Emergency Contact</Label>
                      <Input
                        id="emergency-contact"
                        value={contactInfo.emergencyContact}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-phone">Emergency Phone</Label>
                      <Input
                        id="emergency-phone"
                        type="tel"
                        value={contactInfo.emergencyPhone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="dietary-requirements">Dietary Requirements</Label>
                    <Textarea
                      id="dietary-requirements"
                      value={contactInfo.dietaryRequirements}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, dietaryRequirements: e.target.value }))}
                      placeholder="Please specify any dietary restrictions or allergies"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="accessibility-needs">Accessibility Needs</Label>
                    <Textarea
                      id="accessibility-needs"
                      value={contactInfo.accessibilityNeeds}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, accessibilityNeeds: e.target.value }))}
                      placeholder="Please specify any accessibility requirements"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="special-requests">Special Requests</Label>
                    <Textarea
                      id="special-requests"
                      value={contactInfo.specialRequests}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
                      placeholder="Any other special requests or information"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {BOOKING_STEPS[2].title}
                  </CardTitle>
                  <p className="text-muted-foreground">{BOOKING_STEPS[2].description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardholder-name">Cardholder Name *</Label>
                    <Input
                      id="cardholder-name"
                      value={paymentInfo.cardholderName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                      placeholder="Name on card"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-number">Card Number *</Label>
                    <Input
                      id="card-number"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry-date">Expiry Date *</Label>
                      <Input
                        id="expiry-date"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="billing-address">Billing Address</Label>
                    <Input
                      id="billing-address"
                      value={paymentInfo.billingAddress}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, billingAddress: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="billing-city">City</Label>
                      <Input
                        id="billing-city"
                        value={paymentInfo.city}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-postal">Postal Code</Label>
                      <Input
                        id="billing-postal"
                        value={paymentInfo.postalCode}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder="Postal code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-country">Country</Label>
                      <Select value={paymentInfo.country} onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, country: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                        required 
                      />
                      <Label htmlFor="terms" className="text-sm leading-tight">
                        I agree to the{" "}
                        <a href="/terms" className="text-primary underline" target="_blank">
                          terms and conditions
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-primary underline" target="_blank">
                          privacy policy
                        </a>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="newsletter" 
                        checked={subscribeNewsletter}
                        onCheckedChange={(checked) => setSubscribeNewsletter(checked as boolean)}
                      />
                      <Label htmlFor="newsletter" className="text-sm leading-tight">
                        Subscribe to our newsletter for exclusive offers and travel tips
                      </Label>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your payment information is secured with 256-bit SSL encryption and processed by our secure payment partner.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Booking Confirmed!
                  </CardTitle>
                  <p className="text-muted-foreground">Your tour has been successfully booked</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Confirmation email has been sent to {contactInfo.email}. 
                      Please check your inbox and spam folder.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-medium">Booking Details:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Tour:</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">
                          {selectedDate && format(selectedDate, "EEEE, MMMM do, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-medium">
                          {selectedSession && selectedSession.startTimeLocal && format(new Date(selectedSession.startTimeLocal), "h:mm a")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guests:</span>
                        <span className="font-medium">
                          {guestCounts.adults + guestCounts.children + guestCounts.infants} total
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Paid:</span>
                        <span className="font-bold text-lg">{formatCurrency(pricingBreakdown.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={onClose} className="flex-1">
                      Close
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                      Print Confirmation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Product Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{getLocationString(product.locationAddress)}</div>
                  </div>

                  {selectedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{format(selectedDate, "MMM dd, yyyy")}</span>
                    </div>
                  )}

                  {selectedSession && selectedSession.startTimeLocal && selectedSession.endTimeLocal && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(selectedSession.startTimeLocal), "h:mm a")} - 
                        {format(new Date(selectedSession.endTimeLocal), "h:mm a")}
                      </span>
                    </div>
                  )}

                  {guests.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{guestCounts.adults + guestCounts.children + guestCounts.infants} guests</span>
                    </div>
                  )}

                  {selectedPickupLocation && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedPickupLocation.name}</div>
                        {selectedPickupLocation.pickupTime && (
                          <div className="text-muted-foreground">Pickup: {selectedPickupLocation.pickupTime}</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              {selectedSession && (
                <PricingDisplay 
                  breakdown={pricingBreakdown} 
                  showDetails={true}
                />
              )}

              {/* Trust Indicators */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure SSL Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Free Cancellation 24h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>4.9/5 Customer Rating</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button 
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
                className="flex items-center gap-2 bg-yellow-500 text-black hover:bg-yellow-600"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleCompleteBooking}
                disabled={!canProceedToNextStep() || isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Processing...' : `Complete Booking • ${formatCurrency(pricingBreakdown.total)}`}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 