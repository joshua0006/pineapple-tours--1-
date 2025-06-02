"use client"

import { useState, useCallback, useEffect } from "react"

interface BookingPromptData {
  groupSize: number
  bookingDate: Date | undefined
  hasInteracted: boolean
}

interface UseBookingPromptReturn {
  promptData: BookingPromptData | null
  setPromptData: (data: BookingPromptData | null) => void
  clearPromptData: () => void
  hasPromptData: boolean
  isPromptDismissed: boolean
}

const STORAGE_KEY = 'pineapple-tours-booking-prompt'

export function useBookingPrompt(): UseBookingPromptReturn {
  const [promptData, setPromptDataState] = useState<BookingPromptData | null>(null)
  const [isPromptDismissed, setIsPromptDismissed] = useState(false)

  // Load data from session storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.hasInteracted) {
          setIsPromptDismissed(true)
        }
        if (data.groupSize || data.bookingDate) {
          setPromptDataState({
            groupSize: data.groupSize || 2,
            bookingDate: data.bookingDate ? new Date(data.bookingDate) : undefined,
            hasInteracted: data.hasInteracted || false
          })
        }
      }
    } catch (error) {
      console.warn('Failed to load booking prompt data from session storage:', error)
    }
  }, [])

  const setPromptData = useCallback((data: BookingPromptData | null) => {
    setPromptDataState(data)
    
    if (data) {
      try {
        const storageData = {
          ...data,
          bookingDate: data.bookingDate?.toISOString()
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
      } catch (error) {
        console.warn('Failed to save booking prompt data to session storage:', error)
      }
    }
  }, [])

  const clearPromptData = useCallback(() => {
    setPromptDataState(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear booking prompt data from session storage:', error)
    }
  }, [])

  return {
    promptData,
    setPromptData,
    clearPromptData,
    hasPromptData: promptData !== null,
    isPromptDismissed
  }
} 