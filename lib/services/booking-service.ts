import { RezdyBooking, RezdyBookingItem, RezdyCustomer } from '@/lib/types/rezdy'
import { transformBookingDataToRezdy, validateBookingDataForRezdy, BookingFormData } from '@/lib/utils/booking-transform'

export interface PaymentConfirmation {
  transactionId: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending'
  paymentMethod: string
  timestamp: string
  orderReference?: string
}

export interface BookingRegistrationResult {
  success: boolean
  orderNumber?: string
  rezdyBooking?: RezdyBooking
  error?: string
  paymentConfirmation?: PaymentConfirmation
}

export interface BookingRequest {
  bookingData: BookingFormData
  paymentConfirmation: PaymentConfirmation
}

export class BookingService {
  private readonly rezdyApiUrl: string
  private readonly rezdyApiKey: string
  private readonly isDevelopment: boolean

  constructor() {
    this.rezdyApiUrl = process.env.REZDY_API_URL || 'https://api.rezdy.com/v1'
    this.rezdyApiKey = process.env.REZDY_API_KEY || ''
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Complete booking flow: validate payment -> register with Rezdy -> return result
   */
  async registerBooking(request: BookingRequest): Promise<BookingRegistrationResult> {
    try {
      // Step 1: Validate payment confirmation
      const paymentValidation = this.validatePaymentConfirmation(request.paymentConfirmation)
      if (!paymentValidation.isValid) {
        return {
          success: false,
          error: `Payment validation failed: ${paymentValidation.errors.join(', ')}`,
          paymentConfirmation: request.paymentConfirmation
        }
      }

      // Step 2: Validate booking data for Rezdy submission
      const bookingValidation = validateBookingDataForRezdy(request.bookingData)
      if (!bookingValidation.isValid) {
        return {
          success: false,
          error: `Booking data validation failed: ${bookingValidation.errors.join(', ')}`,
          paymentConfirmation: request.paymentConfirmation
        }
      }

      // Step 3: Transform booking data to Rezdy format
      const rezdyBookingData = transformBookingDataToRezdy(
        request.bookingData,
        request.paymentConfirmation.orderReference
      )

      // Step 4: Set payment status and method based on Westpac confirmation
      rezdyBookingData.paymentOption = this.mapPaymentMethodToRezdy(request.paymentConfirmation.paymentMethod)
      rezdyBookingData.status = 'CONFIRMED' // Mark as confirmed since payment is successful

      // Step 5: Verify amounts match
      if (Math.abs(rezdyBookingData.totalAmount - request.paymentConfirmation.amount) > 0.01) {
        return {
          success: false,
          error: `Amount mismatch: booking total (${rezdyBookingData.totalAmount}) does not match payment amount (${request.paymentConfirmation.amount})`,
          paymentConfirmation: request.paymentConfirmation
        }
      }

      // Step 6: Submit to Rezdy API (or simulate in development)
      const rezdyResult = await this.submitToRezdyApi(rezdyBookingData)
      
      if (rezdyResult.success && rezdyResult.orderNumber) {
        return {
          success: true,
          orderNumber: rezdyResult.orderNumber,
          rezdyBooking: rezdyResult.booking,
          paymentConfirmation: request.paymentConfirmation
        }
      } else {
        return {
          success: false,
          error: rezdyResult.error || 'Failed to register booking with Rezdy',
          paymentConfirmation: request.paymentConfirmation
        }
      }

    } catch (error) {
      console.error('Booking registration error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during booking registration',
        paymentConfirmation: request.paymentConfirmation
      }
    }
  }

  /**
   * Submit booking to Rezdy API
   */
  private async submitToRezdyApi(rezdyBooking: RezdyBooking): Promise<{
    success: boolean
    orderNumber?: string
    booking?: RezdyBooking
    error?: string
  }> {
    try {
      // If no API key is configured, simulate the booking in development
      if (!this.rezdyApiKey) {
        if (this.isDevelopment) {
          console.warn('⚠️  Rezdy API key not configured - simulating booking registration for development')
          
          // Simulate successful booking with mock order number
          const mockOrderNumber = `DEV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
          const mockBooking = {
            ...rezdyBooking,
            orderNumber: mockOrderNumber,
            createdDate: new Date().toISOString()
          }
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          return {
            success: true,
            orderNumber: mockOrderNumber,
            booking: mockBooking
          }
        } else {
          throw new Error('Rezdy API key not configured. Please set REZDY_API_KEY environment variable.')
        }
      }

      const url = `${this.rezdyApiUrl}/bookings?apiKey=${this.rezdyApiKey}`
      
      console.log('Submitting booking to Rezdy API:', {
        url: url.replace(this.rezdyApiKey, '***'),
        bookingData: rezdyBooking
      })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rezdyBooking),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Rezdy API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`Rezdy API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Rezdy API success response:', result)
      
      return {
        success: true,
        orderNumber: result.orderNumber,
        booking: result
      }

    } catch (error) {
      console.error('Rezdy API submission error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit to Rezdy API'
      }
    }
  }

  /**
   * Validate payment confirmation from Westpac
   */
  private validatePaymentConfirmation(payment: PaymentConfirmation): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!payment.transactionId) {
      errors.push('Transaction ID is required')
    }

    if (!payment.amount || payment.amount <= 0) {
      errors.push('Payment amount must be greater than 0')
    }

    if (payment.status !== 'success') {
      errors.push(`Payment status must be 'success', received: ${payment.status}`)
    }

    if (!payment.paymentMethod) {
      errors.push('Payment method is required')
    }

    if (!payment.timestamp) {
      errors.push('Payment timestamp is required')
    }

    // Validate timestamp is recent (within last hour for security)
    if (payment.timestamp) {
      const paymentTime = new Date(payment.timestamp)
      const now = new Date()
      const timeDiff = now.getTime() - paymentTime.getTime()
      const oneHour = 60 * 60 * 1000

      if (timeDiff > oneHour) {
        errors.push('Payment confirmation is too old (must be within 1 hour)')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Map Westpac payment method to Rezdy payment option
   */
  private mapPaymentMethodToRezdy(paymentMethod: string): string {
    const methodMap: { [key: string]: string } = {
      'credit_card': 'CREDITCARD',
      'debit_card': 'CREDITCARD', 
      'visa': 'CREDITCARD',
      'mastercard': 'CREDITCARD',
      'amex': 'CREDITCARD',
      'paypal': 'PAYPAL',
      'bank_transfer': 'BANKTRANSFER',
      'cash': 'CASH',
      'other': 'OTHER'
    }

    const lowerMethod = paymentMethod.toLowerCase()
    return methodMap[lowerMethod] || 'CREDITCARD' // Default to CREDITCARD
  }

  /**
   * Create a booking request from form data and payment confirmation
   */
  static createBookingRequest(
    bookingData: BookingFormData,
    paymentConfirmation: PaymentConfirmation
  ): BookingRequest {
    return {
      bookingData,
      paymentConfirmation
    }
  }

  /**
   * Create payment confirmation from Westpac response
   */
  static createPaymentConfirmation(westpacResponse: {
    transactionId: string
    amount: number
    currency?: string
    paymentMethod: string
    orderReference?: string
    [key: string]: any
  }): PaymentConfirmation {
    return {
      transactionId: westpacResponse.transactionId,
      amount: westpacResponse.amount,
      currency: westpacResponse.currency || 'AUD',
      status: 'success', // Assume success if creating confirmation
      paymentMethod: westpacResponse.paymentMethod,
      timestamp: new Date().toISOString(),
      orderReference: westpacResponse.orderReference
    }
  }
}

/**
 * Utility function to create and register a booking
 */
export async function registerBookingWithPayment(
  bookingData: BookingFormData,
  paymentConfirmation: PaymentConfirmation
): Promise<BookingRegistrationResult> {
  const bookingService = new BookingService()
  const request = BookingService.createBookingRequest(bookingData, paymentConfirmation)
  return await bookingService.registerBooking(request)
} 