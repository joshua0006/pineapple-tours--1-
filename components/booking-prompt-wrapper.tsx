"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { BookingPromptPopup } from "./booking-prompt-popup"
import { useBookingPrompt } from "@/hooks/use-booking-prompt"
import { format, addDays } from "date-fns"

interface BookingPromptData {
  groupSize: number
  bookingDate: Date | undefined
  hasInteracted: boolean
}

export function BookingPromptWrapper() {
  const router = useRouter()
  const { setPromptData } = useBookingPrompt()

  const handleStartBooking = useCallback((data: BookingPromptData) => {
    // Store the booking data for use in the booking flow
    setPromptData(data)
    
    // Navigate to the search page with pre-filled data
    const searchParams = new URLSearchParams()
    
    // Set travelers parameter (this is what the search API expects)
    searchParams.set('travelers', data.groupSize.toString())
    
    // Set date parameters for check-in and check-out
    if (data.bookingDate) {
      const checkInDate = data.bookingDate
      const checkOutDate = addDays(checkInDate, 1) // Default to 1 night stay
      
      searchParams.set('checkIn', format(checkInDate, 'yyyy-MM-dd'))
      searchParams.set('checkOut', format(checkOutDate, 'yyyy-MM-dd'))
    }
    
    // Add a default sort to show most relevant results first
    searchParams.set('sortBy', 'relevance')
    
    // Navigate to search page with the parameters
    router.push(`/search?${searchParams.toString()}`)
  }, [router, setPromptData])

  const handleDismiss = useCallback(() => {
    // Optional: Track dismissal for analytics
    console.log('Booking prompt dismissed')
  }, [])

  return (
    <BookingPromptPopup 
      onStartBooking={handleStartBooking}
      onDismiss={handleDismiss}
    />
  )
} 