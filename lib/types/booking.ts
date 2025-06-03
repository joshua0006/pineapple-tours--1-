import { RezdyProduct, RezdySession, RezdyPickupLocation } from './rezdy'

export interface BookingData {
  id?: string
  product: {
    code: string
    name: string
    hasPickupServices: boolean
    pickupServiceType: 'door-to-door' | 'designated-points' | 'shuttle' | 'none'
  }
  session: {
    id: string
    startTime: string
    endTime: string
  }
  pickupLocation?: RezdyPickupLocation | null
  participants: {
    adults: number
    children?: number
    infants?: number
  }
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
    country?: string
    emergencyContact?: string
    emergencyPhone?: string
    dietaryRequirements?: string
    accessibilityNeeds?: string
    specialRequests?: string
  }
  pricing: {
    basePrice: number
    sessionPrice: number
    subtotal: number
    taxAndFees: number
    total: number
  }
  payment?: {
    method: string
    status: 'pending' | 'confirmed' | 'failed'
    transactionId?: string
  }
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt?: string
  confirmationNumber?: string
  notes?: string
}

export interface PickupLocationSelection {
  location: RezdyPickupLocation
  isRequired: boolean
  serviceType: 'door-to-door' | 'designated-points' | 'shuttle' | 'none'
}

export interface BookingValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface BookingFormData {
  selectedDate?: Date
  selectedSession?: RezdySession
  selectedPickupLocation?: RezdyPickupLocation
  participants: {
    adults: number
    children: number
    infants: number
  }
  contact: {
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
  payment: {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
    billingAddress: string
    city: string
    postalCode: string
    country: string
  }
  preferences: {
    subscribeNewsletter: boolean
    agreeToTerms: boolean
  }
} 