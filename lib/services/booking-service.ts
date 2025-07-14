import { RezdyBooking, RezdyBookingItem, RezdyCustomer, RezdyProduct } from '@/lib/types/rezdy'
import { transformBookingDataToRezdy, validateBookingDataForRezdy, BookingFormData } from '@/lib/utils/booking-transform'
import { fetchAndCacheProduct, rezdyProductCache } from '@/lib/utils/rezdy-product-cache'

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
        request.bookingData
      )
      console.timeEnd("⏱️ transformBookingData");
      console.log("📦 Transformed Rezdy booking data", {
        productCode: rezdyBookingData.items[0]?.productCode,
        quantities: rezdyBookingData.items[0]?.quantities,
        totalQuantity: rezdyBookingData.items[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
        customerName: `${rezdyBookingData.customer.firstName} ${rezdyBookingData.customer.lastName}`,
        hasPhone: !!rezdyBookingData.customer.phone,
      });

      // Step 4: Verify amounts match
      const bookingTotal = request.bookingData.pricing.total;
      if (Math.abs(bookingTotal - request.paymentConfirmation.amount) > 0.01) {
        console.error('❌ Amount mismatch detected:', {
          bookingTotal: bookingTotal,
          paymentAmount: request.paymentConfirmation.amount,
          difference: Math.abs(bookingTotal - request.paymentConfirmation.amount)
        });
        return {
          success: false,
          error: `Amount mismatch: booking total ($${bookingTotal.toFixed(2)}) does not match payment amount ($${request.paymentConfirmation.amount.toFixed(2)})`,
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
            productCode: rezdyBookingData.items[0]?.productCode,
            payments: rezdyBookingData.payments?.map(p => ({
              amount: p.amount,
              type: p.type,
              recipient: p.recipient,
              hasType: !!p.type,
              typeValue: p.type
            }))
          }
        });
        return {
          success: false,
          error: `Booking validation failed: ${preSubmissionValidation.errors.join(', ')}`,
          paymentConfirmation: request.paymentConfirmation
        }
      }
      
      // Step 5.1: Additional validation logging
      console.log('✅ Pre-submission validation passed:', {
        customer: {
          name: `${rezdyBookingData.customer.firstName} ${rezdyBookingData.customer.lastName}`,
          email: rezdyBookingData.customer.email,
          hasPhone: !!rezdyBookingData.customer.phone
        },
        booking: {
          itemCount: rezdyBookingData.items.length,
          totalQuantity: rezdyBookingData.items[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
        },
        firstItem: rezdyBookingData.items[0] ? {
          productCode: rezdyBookingData.items[0].productCode,
          quantities: rezdyBookingData.items[0].quantities,
          totalQuantity: rezdyBookingData.items[0].quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
          hasPickup: !!rezdyBookingData.items[0].pickupId,
          extrasCount: rezdyBookingData.items[0].extras?.length || 0
        } : null
      });

      // Step 7: Pre-submission validation
      console.time("⏱️ preSubmissionValidation");
      const preValidation = await this.preValidateBooking(rezdyBookingData);
      console.timeEnd("⏱️ preSubmissionValidation");
      
      if (!preValidation.isValid) {
        console.error("❌ Pre-submission validation failed:", preValidation.errors);
        return {
          success: false,
          error: `Booking validation failed: ${preValidation.errors.join(', ')}`,
          paymentConfirmation: request.paymentConfirmation
        }
      }

      // Step 8: Submit to Rezdy API (or simulate in development)
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
   * Pre-validate booking before submitting to Rezdy
   */
  private async preValidateBooking(rezdyBooking: RezdyBooking): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = [];
    
    // Validate quantities
    const item = rezdyBooking.items[0];
    if (!item) {
      errors.push('No booking items found');
      return { isValid: false, errors };
    }
    
    if (!item.quantities || item.quantities.length === 0) {
      errors.push('No quantities specified');
      return { isValid: false, errors };
    }
    
    const totalQuantity = item.quantities.reduce((sum, q) => sum + q.value, 0);
    if (totalQuantity === 0) {
      errors.push('Total quantity must be greater than 0');
    }
    
    // Fetch product to validate price option labels
    const product = await fetchAndCacheProduct(item.productCode);
    if (product && product.priceOptions) {
      const availableLabels = product.priceOptions.map(opt => opt.label);
      
      for (const quantity of item.quantities) {
        if (!availableLabels.includes(quantity.optionLabel)) {
          errors.push(`Invalid price option label "${quantity.optionLabel}". Available options: ${availableLabels.join(', ')}`);
        }
        
        if (quantity.value <= 0) {
          errors.push(`Quantity for ${quantity.optionLabel} must be greater than 0`);
        }
      }
    }
    
    // Validate customer data
    if (!rezdyBooking.customer) {
      errors.push('Customer information is required');
    } else {
      if (!rezdyBooking.customer.firstName) errors.push('Customer first name is required');
      if (!rezdyBooking.customer.lastName) errors.push('Customer last name is required');
      if (!rezdyBooking.customer.email) errors.push('Customer email is required');
    }
    
    // Note: Amount validation has already been done against payment confirmation
    
    return {
      isValid: errors.length === 0,
      errors
    };
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
              pickupId: item.pickupId
            }))
          }
        });

        // Handle specific Rezdy error codes
        if (parsedError?.requestStatus?.error?.errorCode === "10") {
          const errorMessage = parsedError.requestStatus.error.errorMessage;
          
          console.error('❌ Rezdy Error Code 10 - Missing required data:', {
            errorMessage,
            bookingStructure: {
              hasStatus: !!rezdyBooking.status,
              hasCustomer: !!rezdyBooking.customer,
              hasItems: !!rezdyBooking.items && rezdyBooking.items.length > 0,
              hasPayments: !!rezdyBooking.payments && rezdyBooking.payments.length > 0,
              customerFields: rezdyBooking.customer ? {
                firstName: !!rezdyBooking.customer.firstName,
                lastName: !!rezdyBooking.customer.lastName,
                phone: !!rezdyBooking.customer.phone,
                email: !!rezdyBooking.customer.email
              } : null,
              firstItem: rezdyBooking.items[0] ? {
                productCode: !!rezdyBooking.items[0].productCode,
                startTime: !!rezdyBooking.items[0].startTimeLocal,
                quantitiesCount: rezdyBooking.items[0].quantities?.length || 0,
                totalQuantity: rezdyBooking.items[0].quantities?.reduce((sum, q) => sum + q.value, 0) || 0
              } : null,
              paymentsCount: rezdyBooking.payments?.length || 0
            },
            suggestions: [
              'Verify booking status is set to CONFIRMED',
              'Check all customer fields are present and valid',
              'Ensure quantities array has valid optionLabel and value > 0',
              'Confirm payments array is populated with correct structure',
              'Validate startTimeLocal format (YYYY-MM-DD HH:mm:ss)'
            ]
          });
          
          throw new Error(`Booking validation failed: ${errorMessage}. Please check all required fields and try again.`);
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
   * Map payment method to Rezdy payment type
   */
  private mapPaymentMethodToRezdy(paymentMethod: string): "CASH" | "CREDIT_CARD" {
    const lowerMethod = paymentMethod.toLowerCase()
    
    // Most payment methods map to CREDIT_CARD in the new Rezdy API structure
    if (lowerMethod === 'cash') {
      return 'CASH';
    }
    
    // All other payment methods (credit cards, debit cards, digital wallets) map to CREDIT_CARD
    return 'CREDIT_CARD';
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
    if (!rezdyBooking.customer || !rezdyBooking.customer.firstName || !rezdyBooking.customer.lastName || !rezdyBooking.customer.phone) {
      errors.push('Customer information is incomplete (firstName, lastName, phone required)')
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
    }

    // Validate payments array (required in new structure)
    if (!rezdyBooking.payments || rezdyBooking.payments.length === 0) {
      errors.push('At least one payment entry is required')
    } else {
      for (const payment of rezdyBooking.payments) {
        if (!payment.amount || payment.amount <= 0) {
          errors.push('Payment amount must be greater than 0')
        }
        if (!payment.type) {
          errors.push('Payment type cannot be empty. Please check all required fields and try again.')
        } else {
          // Validate payment type is one of the accepted values
          const validPaymentTypes: Array<"CASH" | "CREDIT_CARD"> = ["CASH", "CREDIT_CARD"];
          if (!validPaymentTypes.includes(payment.type)) {
            errors.push(`Invalid payment type "${payment.type}". Must be CASH or CREDIT_CARD`)
          }
        }
        if (!payment.recipient) {
          errors.push('Payment recipient is required')
        } else if (payment.recipient !== "SUPPLIER") {
          errors.push('Payment recipient must be "SUPPLIER"')
        }
      }
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