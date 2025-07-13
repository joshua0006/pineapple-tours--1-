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
      console.groupCollapsed(`🏁 BookingService.registerBooking - order ${request.paymentConfirmation.orderReference || 'unknown'}`);

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
      console.time("⏱️ transformBookingData");
      const rezdyBookingData = transformBookingDataToRezdy(
        request.bookingData,
        request.paymentConfirmation.orderReference
      )
      console.timeEnd("⏱️ transformBookingData");
      console.log("📦 Transformed Rezdy booking data", {
        productCode: rezdyBookingData.items[0]?.productCode,
        quantities: rezdyBookingData.items[0]?.quantities,
        totalQuantity: rezdyBookingData.items[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
        totalAmount: rezdyBookingData.totalAmount,
        paymentOption: rezdyBookingData.paymentOption,
      });

      // Step 4: Set payment status and method based on Westpac confirmation
      rezdyBookingData.paymentOption = this.mapPaymentMethodToRezdy(request.paymentConfirmation.paymentMethod)
      rezdyBookingData.status = 'CONFIRMED' // Mark as confirmed since payment is successful
      
      // Step 4.1: Add payment reference information to support Rezdy requirements
      if (request.paymentConfirmation.transactionId) {
        rezdyBookingData.orderNumber = rezdyBookingData.orderNumber || request.paymentConfirmation.transactionId;
      }

      // Step 5: Verify amounts match
      if (Math.abs(rezdyBookingData.totalAmount - request.paymentConfirmation.amount) > 0.01) {
        console.error('❌ Amount mismatch detected:', {
          bookingTotal: rezdyBookingData.totalAmount,
          paymentAmount: request.paymentConfirmation.amount,
          difference: Math.abs(rezdyBookingData.totalAmount - request.paymentConfirmation.amount)
        });
        return {
          success: false,
          error: `Amount mismatch: booking total ($${rezdyBookingData.totalAmount.toFixed(2)}) does not match payment amount ($${request.paymentConfirmation.amount.toFixed(2)})`,
          paymentConfirmation: request.paymentConfirmation
        }
      }

      // Step 6: Final validation before Rezdy submission
      const preSubmissionValidation = this.validateRezdyBookingData(rezdyBookingData);
      if (!preSubmissionValidation.isValid) {
        console.error('❌ Pre-submission validation failed:', {
          errors: preSubmissionValidation.errors,
          bookingData: {
            customer: rezdyBookingData.customer,
            itemCount: rezdyBookingData.items.length,
            totalAmount: rezdyBookingData.totalAmount,
            paymentOption: rezdyBookingData.paymentOption,
            status: rezdyBookingData.status
          }
        });
        return {
          success: false,
          error: `Pre-submission validation failed: ${preSubmissionValidation.errors.join(', ')}`,
          paymentConfirmation: request.paymentConfirmation
        }
      }
      
      // Step 6.1: Additional validation logging
      console.log('✅ Pre-submission validation passed:', {
        customer: {
          name: `${rezdyBookingData.customer.firstName} ${rezdyBookingData.customer.lastName}`,
          email: rezdyBookingData.customer.email,
          hasPhone: !!rezdyBookingData.customer.phone
        },
        booking: {
          orderNumber: rezdyBookingData.orderNumber,
          itemCount: rezdyBookingData.items.length,
          totalQuantity: rezdyBookingData.items[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
          totalAmount: rezdyBookingData.totalAmount,
          paymentOption: rezdyBookingData.paymentOption,
          status: rezdyBookingData.status
        },
        firstItem: rezdyBookingData.items[0] ? {
          productCode: rezdyBookingData.items[0].productCode,
          quantities: rezdyBookingData.items[0].quantities,
          totalQuantity: rezdyBookingData.items[0].quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
          amount: rezdyBookingData.items[0].amount,
          hasPickup: !!rezdyBookingData.items[0].pickupId,
          extrasCount: rezdyBookingData.items[0].extras?.length || 0
        } : null
      });

      // Step 7: Submit to Rezdy API (or simulate in development)
      console.time("⏱️ submitToRezdyApi");
      const rezdyResult = await this.submitToRezdyApi(rezdyBookingData)
      console.timeEnd("⏱️ submitToRezdyApi");
      console.log("📨 Rezdy submission result", rezdyResult);
      
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
    } finally {
      console.groupEnd();
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
          body: errorText,
          requestPayload: rezdyBooking
        })

        // Parse Rezdy error response for specific error codes
        let parsedError;
        try {
          parsedError = JSON.parse(errorText);
        } catch {
          parsedError = null;
        }

        // Log detailed error information
        console.error('🚨 Rezdy API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorCode: parsedError?.requestStatus?.error?.errorCode,
          errorMessage: parsedError?.requestStatus?.error?.errorMessage,
          fullError: parsedError,
          bookingPayload: {
            customer: rezdyBooking.customer,
            items: rezdyBooking.items.map(item => ({
              productCode: item.productCode,
              quantities: item.quantities,
              totalQuantity: item.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
              amount: item.amount,
              pickupId: item.pickupId
            })),
            totalAmount: rezdyBooking.totalAmount,
            paymentOption: rezdyBooking.paymentOption,
            status: rezdyBooking.status
          }
        });

        // Handle specific Rezdy error codes
        if (parsedError?.requestStatus?.error?.errorCode === "10") {
          const errorMessage = parsedError.requestStatus.error.errorMessage;
          console.error('❌ Rezdy Error Code 10 - Missing required data:', {
            errorMessage,
            quantities: rezdyBooking.items[0]?.quantities,
            totalQuantity: rezdyBooking.items[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
            paymentOption: rezdyBooking.paymentOption,
            totalAmount: rezdyBooking.totalAmount,
            status: rezdyBooking.status,
            suggestions: [
              'Check if quantities array is populated with optionLabel and value',
              'Verify total quantity is > 0',
              'Ensure optionLabel matches exact price option labels from product',
              'Ensure paymentOption is not CREDITCARD (use OTHER for pre-paid bookings)',
              'Confirm all required customer fields are present'
            ]
          });
          
          throw new Error(`Booking validation failed: ${errorMessage}. Please contact support with order number ${rezdyBooking.orderNumber}.`);
        }

        // Handle other specific error codes
        if (parsedError?.requestStatus?.error?.errorCode) {
          const errorCode = parsedError.requestStatus.error.errorCode;
          const errorMessage = parsedError.requestStatus.error.errorMessage || 'Unknown error';
          
          console.error(`❌ Rezdy Error Code ${errorCode}:`, {
            message: errorMessage,
            details: parsedError.requestStatus.error
          });
          
          throw new Error(`Booking failed (Error ${errorCode}): ${errorMessage}`);
        }

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
      // All Stripe card-based payment methods should map to OTHER
      // to avoid Rezdy's credit card validation since payment is already processed
      'credit_card': 'OTHER',
      'debit_card': 'OTHER', 
      'visa': 'OTHER',
      'mastercard': 'OTHER',
      'amex': 'OTHER',
      'card': 'OTHER',
      'link': 'OTHER', // Stripe Link payments
      // Non-card payment methods
      'paypal': 'PAYPAL',
      'bank_transfer': 'BANKTRANSFER',
      'cash': 'CASH',
      'other': 'OTHER',
      // Additional Stripe payment methods
      'apple_pay': 'OTHER',
      'google_pay': 'OTHER',
      'afterpay': 'OTHER',
      'klarna': 'OTHER',
      'affirm': 'OTHER'
    }

    const lowerMethod = paymentMethod.toLowerCase()
    const mapped = methodMap[lowerMethod] || 'OTHER' // Default to OTHER instead of CREDITCARD
    
    console.log(`🔄 Mapping payment method: ${paymentMethod} -> ${mapped} (avoiding CREDITCARD to prevent Rezdy validation issues)`);
    
    return mapped;
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
   * Validate Rezdy booking data specifically for API requirements
   */
  private validateRezdyBookingData(rezdyBooking: RezdyBooking): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate required Rezdy fields
    if (!rezdyBooking.customer || !rezdyBooking.customer.firstName || !rezdyBooking.customer.lastName || !rezdyBooking.customer.email) {
      errors.push('Customer information is incomplete (firstName, lastName, email required)')
    }

    if (!rezdyBooking.items || rezdyBooking.items.length === 0) {
      errors.push('At least one booking item is required')
    } else {
      const item = rezdyBooking.items[0]
      
      if (!item.productCode) {
        errors.push('Product code is required')
      }
      
      if (!item.startTimeLocal) {
        errors.push('Start time is required')
      }
      
      if (!item.quantities || item.quantities.length === 0) {
        errors.push('Quantities are required - ensure guest counts or individual guests are provided')
      } else {
        // Validate quantities specifically for Rezdy
        let totalQuantity = 0;
        for (const quantity of item.quantities) {
          if (!quantity.optionLabel) {
            errors.push('Option label is required for each quantity')
          }
          if (!quantity.value || quantity.value <= 0) {
            errors.push(`Invalid quantity value for ${quantity.optionLabel}: ${quantity.value}`)
          } else {
            totalQuantity += quantity.value;
          }
        }
        
        if (totalQuantity === 0) {
          errors.push('Total quantity must be greater than 0')
        }
      }
      
      if (!item.amount || item.amount <= 0) {
        errors.push('Item amount must be greater than 0')
      }
    }

    if (!rezdyBooking.totalAmount || rezdyBooking.totalAmount <= 0) {
      errors.push('Total amount must be greater than 0')
    }

    if (!rezdyBooking.paymentOption) {
      errors.push('Payment option is required')
    }

    // Additional validation for payment status
    if (rezdyBooking.status === 'CONFIRMED' && rezdyBooking.paymentOption === 'CREDITCARD') {
      // For confirmed bookings with credit card, ensure we have proper payment confirmation
      console.log('✅ Rezdy booking validation passed for confirmed credit card payment:', {
        totalAmount: rezdyBooking.totalAmount,
        paymentOption: rezdyBooking.paymentOption,
        status: rezdyBooking.status,
        participantCount: rezdyBooking.items[0]?.participants?.reduce((sum, p) => sum + p.number, 0) || 0
      });
    }

    return {
      isValid: errors.length === 0,
      errors
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