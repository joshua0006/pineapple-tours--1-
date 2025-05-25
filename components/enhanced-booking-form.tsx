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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PricingDisplay, PricingSummary } from "@/components/ui/pricing-display"
import { GuestManager, type GuestInfo } from "@/components/ui/guest-manager"
import { useRezdyAvailability } from "@/hooks/use-rezdy"
import { RezdyProduct, RezdySession } from "@/lib/types/rezdy"
import { formatPrice, getLocationString } from "@/lib/utils/product-utils"
import { calculatePricing, formatCurrency, getPricingSummaryText, getDiscountInfo, validatePricingOptions, type PricingBreakdown as PricingBreakdownType } from "@/lib/utils/pricing-utils"
import { cn } from "@/lib/utils"

interface EnhancedBookingFormProps {
  product: RezdyProduct
  onClose?: () => void
}

// GuestInfo is now imported from guest-manager component

// Use the PricingBreakdown type from pricing-utils
type PricingBreakdown = PricingBreakdownType



export function EnhancedBookingForm({ product, onClose }: EnhancedBookingFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Guest management
  const [guests, setGuests] = useState<GuestInfo[]>([
    { id: '1', firstName: '', lastName: '', age: 25, type: 'ADULT' },
    { id: '2', firstName: '', lastName: '', age: 25, type: 'ADULT' }
  ])
  
  // Booking details
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [selectedSession, setSelectedSession] = useState<RezdySession | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  
  // Contact information
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  // Get availability for the next 60 days
  const today = new Date()
  const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
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

  // Extract available dates
  const availableDates = useMemo(() => {
    if (!availabilityData || !availabilityData[0]?.sessions) return new Set<string>()
    
    const dates = new Set<string>()
    availabilityData[0].sessions.forEach(session => {
      const sessionDate = session.startTimeLocal.split('T')[0]
      dates.add(sessionDate)
    })
    return dates
  }, [availabilityData])

  // Get sessions for selected date
  const availableSessions = useMemo(() => {
    if (!availabilityData || !availabilityData[0]?.sessions || !startDate) return []
    
    const selectedDateString = format(startDate, 'yyyy-MM-dd')
    return availabilityData[0].sessions.filter(session => 
      session.startTimeLocal.startsWith(selectedDateString)
    )
  }, [availabilityData, startDate])

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo((): PricingBreakdown => {
    return calculatePricing(product, selectedSession, {
      adults: guestCounts.adults,
      children: guestCounts.children,
      infants: guestCounts.infants
    })
  }, [product, selectedSession, guestCounts])

  // Guest management is now handled by the GuestManager component

  // Date and session handlers
  const handleDateChange = (date: Date | undefined) => {
    setStartDate(date)
    setSelectedSession(null)
  }

  const handleSessionSelect = (sessionId: string) => {
    const session = availableSessions.find(s => s.id === sessionId)
    setSelectedSession(session || null)
  }

  // Step navigation
  const handleNextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Form submission
  const handleSubmitBooking = async () => {
    if (!selectedSession) return

    setIsSubmitting(true)
    try {
      // Prepare booking data
      const bookingData = {
        product: product.productCode,
        session: selectedSession.id,
        guests: guests.filter(g => g.firstName && g.lastName),
        contact: contactInfo,
        pricing: pricingBreakdown,
        specialRequests
      }

      // Here you would integrate with the Rezdy booking API
      console.log('Booking data:', bookingData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Booking submitted successfully! You will receive a confirmation email shortly.')
      onClose?.()
    } catch (error) {
      alert('There was an error processing your booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const location = getLocationString(product.locationAddress)

  // Helper functions
  const isDateAvailable = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return availableDates.has(dateString)
  }

  const isDateDisabled = (date: Date) => {
    return date < today || date > endDate
  }

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return selectedSession && guests.every(g => g.firstName && g.lastName)
      case 2:
        return contactInfo.firstName && contactInfo.lastName && contactInfo.email && contactInfo.phone
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= stepNumber 
                  ? "bg-yellow-500 text-black" 
                  : "bg-gray-200 text-gray-600"
              )}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  step > stepNumber ? "bg-yellow-500" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Step {step} of 3
        </div>
      </div>

      {/* Step 1: Tour Details & Guests */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
            
            {/* Date Selection */}
            <div className="space-y-4">
              <div>
                <Label>Tour Date</Label>
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
                        available: isDateAvailable
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
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              {startDate && availableSessions.length > 0 && (
                <div>
                  <Label>Available Times</Label>
                  <div className="grid gap-2 mt-2">
                    {availableSessions.map((session) => (
                      <Card 
                        key={session.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedSession?.id === session.id 
                            ? "ring-2 ring-yellow-500 bg-yellow-50" 
                            : "hover:bg-gray-50"
                        )}
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
                                ${session.totalPrice || product.advertisedPrice || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">per adult</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

                    <Separator />

          {/* Enhanced Guest Management */}
          <GuestManager
            guests={guests}
            onGuestsChange={setGuests}
            maxGuests={product.quantityRequiredMax || 10}
            minGuests={product.quantityRequiredMin || 1}
            requireAdult={true}
          />

          <Separator />

                    {/* Tour Information */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span>Tour</span>
                <span className="text-right font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Location</span>
                <span className="text-right">{location}</span>
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
            </CardContent>
          </Card>

          {/* Enhanced Pricing Display */}
          <PricingDisplay breakdown={pricingBreakdown} showDetails={true} />

          <Button
            className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
            onClick={handleNextStep}
            disabled={!canProceedToNextStep()}
          >
            Continue to Contact Information
          </Button>
        </div>
      )}

      {/* Step 2: Contact Information */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-firstName">First Name</Label>
                <Input
                  id="contact-firstName"
                  value={contactInfo.firstName}
                  onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-lastName">Last Name</Label>
                <Input
                  id="contact-lastName"
                  value={contactInfo.lastName}
                  onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email Address</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input
                  id="contact-phone"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-country">Country</Label>
                <Select value={contactInfo.country} onValueChange={(value) => setContactInfo({...contactInfo, country: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="emergency-contact">Emergency Contact Name</Label>
                <Input
                  id="emergency-contact"
                  value={contactInfo.emergencyContact}
                  onChange={(e) => setContactInfo({...contactInfo, emergencyContact: e.target.value})}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency-phone"
                  value={contactInfo.emergencyPhone}
                  onChange={(e) => setContactInfo({...contactInfo, emergencyPhone: e.target.value})}
                  placeholder="Emergency contact phone number"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="special-requests">Special Requests or Dietary Requirements</Label>
            <Textarea
              id="special-requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Please let us know about any dietary restrictions, accessibility needs, or special requests..."
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              className="flex-1 bg-yellow-500 text-black hover:bg-yellow-600"
              onClick={handleNextStep}
              disabled={!canProceedToNextStep()}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment & Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            
            {/* Booking Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{location}</span>
                  </div>
                  {selectedSession && (
                    <div className="flex justify-between text-sm">
                      <span>Date & Time</span>
                      <span>
                        {new Date(selectedSession.startTimeLocal).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })} at {new Date(selectedSession.startTimeLocal).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Guests</span>
                    <span>{guests.length} {guests.length === 1 ? 'guest' : 'guests'}</span>
                  </div>
                </div>
                <Separator />
                <PricingSummary breakdown={pricingBreakdown} />
              </CardContent>
            </Card>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="card-number" placeholder="0000 0000 0000 0000" className="pl-9" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" required />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="CVC" required />
                </div>
              </div>
              <div>
                <Label htmlFor="cardholder-name">Cardholder Name</Label>
                <Input id="cardholder-name" placeholder="Name on card" required />
              </div>
            </div>

            <div className="flex items-start space-x-2 mt-6">
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
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              className="flex-1 bg-yellow-500 text-black hover:bg-yellow-600"
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Complete Booking • ${formatCurrency(pricingBreakdown.total)}`}
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            Your payment is secured with SSL encryption
          </div>
        </div>
      )}
    </div>
  )
} 