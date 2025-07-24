import { RezdyBooking, RezdyBookingItem, RezdyProductBookingItem, RezdyPickupLocationItem, RezdyCustomer, RezdyProduct, RezdyDirectBookingRequest } from '@/lib/types/rezdy'
import { transformBookingDataToRezdy, transformBookingDataToDirectRezdy, validateBookingDataForRezdy, BookingFormData } from '@/lib/utils/booking-transform'
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
   * Submit a booking in direct Rezdy format (no transformation needed)
   */
  async submitDirectRezdyBooking(bookingRequest: RezdyDirectBookingRequest): Promise<BookingRegistrationResult> {
    try {
      console.groupCollapsed(`🎯 Direct Rezdy booking submission - ${bookingRequest.resellerReference}`);

      // Pass the request directly to Rezdy API without transformation
      // This ensures 1:1 structure compliance with Rezdy API specification
      console.log("📦 Direct Rezdy booking structure (1:1 mapping):", {
        resellerReference: bookingRequest.resellerReference,
        customer: bookingRequest.customer,
        itemsCount: bookingRequest.items.length,
        paymentsCount: bookingRequest.payments.length,
        hasFields: bookingRequest.fields && bookingRequest.fields.length > 0,
        resellerComments: bookingRequest.resellerComments
      });

      // Log items for debugging
      console.log("📋 Items in request:", bookingRequest.items.map((item, index) => {
        if ('productCode' in item) {
          return {
            index,
            type: 'BookingItem',
            productCode: item.productCode,
            startTimeLocal: item.startTimeLocal,
            quantities: item.quantities,
            participants: item.participants?.length || 0,
            extras: item.extras?.length || 0
          };
        } else if ('pickupLocation' in item) {
          return {
            index,
            type: 'PickupLocation',
            locationName: item.pickupLocation.locationName
          };
        }
        return { index, type: 'Unknown' };
      }));

      // Validate the direct booking structure
      const validationResult = this.validateDirectRezdyBooking(bookingRequest);
      if (!validationResult.isValid) {
        console.error('❌ Direct booking validation failed:', {
          errors: validationResult.errors,
          bookingData: bookingRequest
        });
        return {
          success: false,
          error: `Booking validation failed: ${validationResult.errors.join(', ')}`
        };
      }

      // Submit to Rezdy API directly without any transformation
      console.time("⏱️ submitToRezdyApi");
      const rezdyResult = await this.submitToRezdyApiDirect(bookingRequest);
      console.timeEnd("⏱️ submitToRezdyApi");
      console.log("📨 Rezdy submission result", rezdyResult);
      
      if (rezdyResult.success && rezdyResult.orderNumber) {
        return {
          success: true,
          orderNumber: rezdyResult.orderNumber,
          rezdyBooking: rezdyResult.booking
        };
      } else {
        return {
          success: false,
          error: rezdyResult.error || 'Failed to register booking with Rezdy'
        };
      }

    } catch (error) {
      console.error('Direct booking registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during booking registration'
      };
    } finally {
      console.groupEnd();
    }
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

      // Step 3: Transform booking data to direct Rezdy format using new field mappings
      console.time("⏱️ transformBookingDataToDirectRezdy");
      const rezdyDirectRequest = transformBookingDataToDirectRezdy(
        request.bookingData,
        request.paymentConfirmation.transactionId // Use Stripe payment intent ID as resellerReference
      )
      console.timeEnd("⏱️ transformBookingDataToDirectRezdy");
      console.group("📦 BOOKING SERVICE - Transformed Direct Rezdy Request");
      console.log("🔄 Transform Summary:", {
        transformationSource: "BookingFormData -> RezdyDirectBookingRequest",
        resellerReference: rezdyDirectRequest.resellerReference,
        orderNumber: request.paymentConfirmation.orderReference,
        transformSuccess: true,
        timestamp: new Date().toISOString()
      });
      
      console.log("📋 Complete Direct Rezdy Request Structure:", {
        resellerReference: rezdyDirectRequest.resellerReference,
        resellerComments: rezdyDirectRequest.resellerComments,
        customer: rezdyDirectRequest.customer,
        items: rezdyDirectRequest.items.map((item, index) => ({
          index,
          type: 'BookingItem',
          productCode: item.productCode,
          startTimeLocal: item.startTimeLocal,
          quantities: item.quantities,
          totalQuantity: item.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
          participants: item.participants,
          participantsCount: item.participants?.length || 0,
          extras: item.extras,
          extrasCount: item.extras?.length || 0,
          pickupId: item.pickupId
        })),
        payments: rezdyDirectRequest.payments,
        fields: rezdyDirectRequest.fields,
        fieldsCount: rezdyDirectRequest.fields?.length || 0
      });
      
      console.log("💳 Payment Structure Analysis:", {
        paymentsCount: rezdyDirectRequest.payments?.length || 0,
        payments: rezdyDirectRequest.payments?.map((p, index) => ({
          index,
          amount: p.amount,
          type: p.type,
          recipient: p.recipient,
          label: p.label,
          isValidType: p.type === "CASH" || p.type === "CREDITCARD"
        })),
        paymentConfirmation: {
          originalMethod: request.paymentConfirmation.paymentMethod,
          mappedToRezdy: rezdyDirectRequest.payments?.[0]?.type,
          amount: request.paymentConfirmation.amount
        }
      });
      
      console.log("👥 Guest & Quantity Mapping:", {
        originalGuests: request.bookingData.guests?.length || 0,
        guestCounts: request.bookingData.guestCounts,
        rezdyQuantities: rezdyDirectRequest.items[0]?.quantities,
        totalQuantity: rezdyDirectRequest.items[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
        participants: rezdyDirectRequest.items[0]?.participants?.length || 0,
        pickupId: rezdyDirectRequest.items[0]?.pickupId
      });
      
      console.groupEnd();

      // Validate the direct request structure before submission
      const directValidation = this.validateDirectRezdyBooking(rezdyDirectRequest);
      if (!directValidation.isValid) {
        console.error('❌ Direct request validation failed:', {
          errors: directValidation.errors,
          requestData: rezdyDirectRequest
        });
        return {
          success: false,
          error: `Direct booking validation failed: ${directValidation.errors.join(', ')}`
        };
      }

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

      // Additional validation logging
      console.log('✅ Direct request validation passed:', {
        resellerReference: rezdyDirectRequest.resellerReference,
        customer: {
          name: `${rezdyDirectRequest.customer.firstName} ${rezdyDirectRequest.customer.lastName}`,
          email: rezdyDirectRequest.customer.email,
          hasPhone: !!rezdyDirectRequest.customer.phone
        },
        booking: {
          itemCount: rezdyDirectRequest.items.length,
          totalQuantity: rezdyDirectRequest.items[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
        },
        firstItem: rezdyDirectRequest.items[0] ? {
          productCode: rezdyDirectRequest.items[0].productCode,
          quantities: rezdyDirectRequest.items[0].quantities,
          totalQuantity: rezdyDirectRequest.items[0].quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
          extrasCount: rezdyDirectRequest.items[0].extras?.length || 0,
          pickupId: rezdyDirectRequest.items[0].pickupId
        } : null
      });

      // Submit direct request to Rezdy API
      console.time("⏱️ submitDirectRezdyBooking");
      const rezdyResult = await this.submitToRezdyApiDirect(rezdyDirectRequest)
      console.timeEnd("⏱️ submitDirectRezdyBooking");
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
   * Submit booking to Rezdy API with retry logic
   */
  private async submitToRezdyApi(rezdyBooking: RezdyBooking): Promise<{
    success: boolean
    orderNumber?: string
    booking?: RezdyBooking
    error?: string
  }> {
    const maxRetries = 3;
    const retryDelays = [1000, 2000, 5000]; // 1s, 2s, 5s

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Rezdy API submission attempt ${attempt}/${maxRetries}`);
      
      try {
        const result = await this.attemptRezdySubmission(rezdyBooking);
        
        if (result.success) {
          if (attempt > 1) {
            console.log(`✅ Rezdy API succeeded on retry attempt ${attempt}`);
          }
          return result;
        }
        
        // If this is the last attempt, return the failure
        if (attempt === maxRetries) {
          console.error(`❌ Rezdy API failed after ${maxRetries} attempts`);
          return result;
        }
        
        // Log retry attempt
        console.warn(`⚠️ Rezdy API attempt ${attempt} failed, retrying in ${retryDelays[attempt - 1]}ms...`);
        console.warn(`📋 Failure reason:`, result.error);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelays[attempt - 1]));
        
      } catch (error) {
        console.error(`❌ Rezdy API attempt ${attempt} threw error:`, error);
        
        // If this is the last attempt, return the error
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit to Rezdy API after retries'
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelays[attempt - 1]));
      }
    }
    
    return {
      success: false,
      error: 'Failed to submit to Rezdy API after maximum retries'
    };
  }

  /**
   * Validate direct Rezdy booking request format
   */
  private validateDirectRezdyBooking(bookingRequest: RezdyDirectBookingRequest): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate reseller reference
    if (!bookingRequest.resellerReference || bookingRequest.resellerReference.trim() === '') {
      errors.push('Reseller reference is required')
    }

    // Validate customer
    if (!bookingRequest.customer) {
      errors.push('Customer information is required')
    } else {
      if (!bookingRequest.customer.firstName || bookingRequest.customer.firstName.trim() === '') {
        errors.push('Customer first name is required')
      }
      if (!bookingRequest.customer.lastName || bookingRequest.customer.lastName.trim() === '') {
        errors.push('Customer last name is required')
      }
      if (!bookingRequest.customer.phone || bookingRequest.customer.phone.trim() === '') {
        errors.push('Customer phone is required')
      }
      if (!bookingRequest.customer.email || bookingRequest.customer.email.trim() === '') {
        errors.push('Customer email is required')
      }
    }

    // Validate items array
    if (!bookingRequest.items || bookingRequest.items.length === 0) {
      errors.push('At least one item is required')
    } else {
      let hasBookingItem = false;
      bookingRequest.items.forEach((item, index) => {
        if ('productCode' in item) {
          // This is a product booking item
          hasBookingItem = true;
          const bookingItem = item as RezdyProductBookingItem;
          
          if (!bookingItem.productCode || bookingItem.productCode.trim() === '') {
            errors.push(`Item ${index}: Product code is required`)
          }
          
          if (!bookingItem.startTimeLocal || bookingItem.startTimeLocal.trim() === '') {
            errors.push(`Item ${index}: Start time is required`)
          }
          
          if (!bookingItem.quantities || bookingItem.quantities.length === 0) {
            errors.push(`Item ${index}: Quantities are required`)
          } else {
            let totalQuantity = 0;
            bookingItem.quantities.forEach((q, qIndex) => {
              if (!q.optionLabel || q.optionLabel.trim() === '') {
                errors.push(`Item ${index}, quantity ${qIndex}: Option label is required`)
              }
              if (!q.value || q.value <= 0) {
                errors.push(`Item ${index}, quantity ${qIndex}: Value must be greater than 0`)
              } else {
                totalQuantity += q.value;
              }
            });
            
            if (totalQuantity === 0) {
              errors.push(`Item ${index}: Total quantity must be greater than 0`)
            }
          }
          
          if (!bookingItem.participants) {
            errors.push(`Item ${index}: Participants array is required (can be empty)`)
          }
        } else if ('pickupLocation' in item) {
          // This is a pickup location item
          const pickupItem = item as RezdyPickupLocationItem;
          
          if (!pickupItem.pickupLocation || !pickupItem.pickupLocation.locationName || pickupItem.pickupLocation.locationName.trim() === '') {
            errors.push(`Item ${index}: Pickup location name is required`)
          }
        } else {
          // Unknown item type
          errors.push(`Item ${index}: Invalid item type - must be either a booking item with productCode or pickup location item`)
        }
      });
      
      if (!hasBookingItem) {
        errors.push('At least one booking item with productCode is required')
      }
    }

    // Validate payments
    if (!bookingRequest.payments || bookingRequest.payments.length === 0) {
      errors.push('At least one payment is required')
    } else {
      bookingRequest.payments.forEach((payment, index) => {
        if (!payment.amount || payment.amount <= 0) {
          errors.push(`Payment ${index}: Amount must be greater than 0`)
        }
        
        if (!payment.type) {
          errors.push(`Payment ${index}: Type is required`)
        } else if (payment.type !== "CASH" && payment.type !== "CREDITCARD") {
          errors.push(`Payment ${index}: Type must be CASH or CREDITCARD`)
        }
        
        if (!payment.recipient || payment.recipient !== "SUPPLIER") {
          errors.push(`Payment ${index}: Recipient must be SUPPLIER`)
        }
        
        if (!payment.label || payment.label.trim() === '') {
          errors.push(`Payment ${index}: Label is required`)
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Submit direct booking request to Rezdy API without transformation
   */
  private async submitToRezdyApiDirect(bookingRequest: RezdyDirectBookingRequest): Promise<{
    success: boolean
    orderNumber?: string
    booking?: any
    error?: string
  }> {
    // If no API key is configured, simulate the booking in development
    if (!this.rezdyApiKey) {
      if (this.isDevelopment) {
        console.warn('⚠️  Rezdy API key not configured - simulating booking registration for development')
        
        // Simulate successful booking with mock order number
        const mockOrderNumber = `DEV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        const mockBooking = {
          ...bookingRequest,
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
        return {
          success: false,
          error: 'Rezdy API key not configured. Please set REZDY_API_KEY environment variable.'
        }
      }
    }

    try {
      const url = `${this.rezdyApiUrl}/bookings?apiKey=${this.rezdyApiKey}`
      
      console.group('🚀 REZDY API DIRECT SUBMISSION - Exact 1:1 Structure');
      console.log('🎯 API Submission Details:', {
        url: url,
        method: 'POST',
        contentType: 'application/json',
        timestamp: new Date().toISOString()
      });
      
      // Extract pickup information for detailed logging
      const bookingItem = bookingRequest.items.find(item => 'productCode' in item);
      const pickupInfo = bookingItem && 'pickupId' in bookingItem ? {
        hasPickupId: true,
        pickupId: (bookingItem as any).pickupId
      } : {
        hasPickupId: false,
        pickupId: null
      };
      
      console.log('📍 PICKUP LOCATION IN PAYLOAD:', pickupInfo);
      
      console.log('📋 EXACT REZDY PAYLOAD (1:1 Structure):', JSON.stringify(bookingRequest, null, 2));
      
      // Additional payload validation logging
      console.group('🔍 PAYLOAD VALIDATION SUMMARY');
      console.log('✅ Validation Status:', {
        hasResellerReference: !!bookingRequest.resellerReference,
        hasCustomer: !!bookingRequest.customer,
        customerValid: !!(bookingRequest.customer?.firstName && bookingRequest.customer?.lastName && bookingRequest.customer?.email),
        hasItems: !!(bookingRequest.items && bookingRequest.items.length > 0),
        hasBookingItem: bookingRequest.items.some(item => 'productCode' in item),
        hasPayments: !!(bookingRequest.payments && bookingRequest.payments.length > 0),
        paymentTypesValid: bookingRequest.payments?.every(p => p.type === "CASH" || p.type === "CREDITCARD") || false,
        hasValidQuantities: bookingRequest.items.some(item => 'quantities' in item && item.quantities && item.quantities.length > 0)
      });
      
      // Log critical fields for debugging
      const mainItem = bookingRequest.items.find(item => 'productCode' in item);
      if (mainItem) {
        console.log('🎯 MAIN BOOKING ITEM ANALYSIS:', {
          productCode: mainItem.productCode,
          startTime: mainItem.startTimeLocal,
          quantities: mainItem.quantities,
          totalQuantity: mainItem.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
          hasParticipants: !!(mainItem.participants && mainItem.participants.length >= 0),
          participantCount: mainItem.participants?.length || 0,
          hasPickupId: !!(mainItem as any).pickupId,
          pickupId: (mainItem as any).pickupId
        });
      }
      console.groupEnd();
      
      console.groupEnd();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingRequest),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Rezdy API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })

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
          fullError: parsedError
        });

        // Extract specific error information
        let errorMessage = parsedError?.requestStatus?.error?.errorMessage || errorText;
        const errorCode = parsedError?.requestStatus?.error?.errorCode;
        
        // Provide more specific error messages based on common Rezdy error codes
        if (errorCode === 10) {
          errorMessage = "Invalid booking data: Please check that all required fields are provided and quantities are greater than 0";
        } else if (errorCode === 20) {
          errorMessage = "Payment validation failed: Payment type must be either CASH or CREDITCARD";
        } else if (errorMessage.includes("Payment type cannot be empty")) {
          errorMessage = "Payment type is required. Please ensure payment information is complete.";
        } else if (errorMessage.includes("optionLabel")) {
          errorMessage = "Invalid price option selected. Please refresh and try again.";
        }
        
        throw new Error(`Rezdy API error: ${response.status} ${response.statusText} - ${errorMessage}`)
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
   * Single attempt to submit booking to Rezdy API
   */
  private async attemptRezdySubmission(rezdyBooking: RezdyBooking): Promise<{
    success: boolean
    orderNumber?: string
    booking?: RezdyBooking
    error?: string
  }> {
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
        return {
          success: false,
          error: 'Rezdy API key not configured. Please set REZDY_API_KEY environment variable.'
        }
      }
    }

    try {
      // Fix: Use query parameter for Rezdy API authentication instead of Authorization header
      const url = `${this.rezdyApiUrl}/bookings?apiKey=${this.rezdyApiKey}`
      
      // Enhanced pre-submission validation
      const validationResult = this.validateRezdyBookingData(rezdyBooking);
      if (!validationResult.isValid) {
        console.error("❌ CRITICAL: Booking validation failed before Rezdy API call!", {
          errors: validationResult.errors,
          booking: {
            hasStatus: !!rezdyBooking.status,
            hasCustomer: !!rezdyBooking.customer,
            hasItems: !!rezdyBooking.items && rezdyBooking.items.length > 0,
            hasPayments: !!rezdyBooking.payments && rezdyBooking.payments.length > 0
          }
        });
        throw new Error(`Booking validation failed: ${validationResult.errors.join(', ')}`);
      }

      // MANDATORY VALIDATION: Ensure payment structure is correct before API call
      if (!rezdyBooking.payments || rezdyBooking.payments.length === 0) {
        console.error("❌ CRITICAL: No payments array before Rezdy API call!");
        throw new Error("Payment validation failed: Payment type cannot be empty. Please check all required fields and try again.");
      }

      for (let i = 0; i < rezdyBooking.payments.length; i++) {
        const payment = rezdyBooking.payments[i];
        
        // Validate payment type exists and is valid
        if (!payment.type) {
          console.error(`❌ CRITICAL: Payment ${i} has no type before Rezdy API call!`, payment);
          throw new Error("Payment validation failed: Payment type cannot be empty. Please check all required fields and try again.");
        }
        
        if (payment.type !== "CASH" && payment.type !== "CREDITCARD") {
          console.error(`❌ CRITICAL: Payment ${i} has invalid type before Rezdy API call!`, {
            paymentType: payment.type,
            payment
          });
          throw new Error(`Payment validation failed: Invalid payment type "${payment.type}". Must be CASH or CREDITCARD.`);
        }
        
        // Validate other required fields
        if (!payment.recipient) {
          console.error(`❌ CRITICAL: Payment ${i} has no recipient before Rezdy API call!`, payment);
          payment.recipient = "SUPPLIER"; // Emergency fix
          console.log(`⚠️ EMERGENCY FIX: Set payment ${i} recipient to SUPPLIER`);
        }
        
        if (!payment.amount || payment.amount <= 0) {
          console.error(`❌ CRITICAL: Payment ${i} has invalid amount before Rezdy API call!`, payment);
          throw new Error("Payment validation failed: Payment amount must be greater than 0.");
        }
      }
      
      // Log final payment validation result
      console.log("✅ PAYMENT VALIDATION PASSED:", {
        paymentCount: rezdyBooking.payments.length,
        payments: rezdyBooking.payments.map((p, i) => ({
          index: i,
          type: p.type,
          amount: p.amount,
          recipient: p.recipient,
          hasValidType: p.type === "CASH" || p.type === "CREDITCARD"
        }))
      });

      console.group('🚀 REZDY API SUBMISSION - Final 1:1 Data Structure');
      console.log('🎯 API Submission Details:', {
        url: url,
        method: 'POST',
        contentType: 'application/json',
        timestamp: new Date().toISOString()
      });
      
      console.log('📋 EXACT REZDY PAYLOAD (1:1 Structure):', rezdyBooking);
      
      console.log('🔍 Payload Structure Analysis:', {
        status: rezdyBooking.status,
        customer: {
          firstName: rezdyBooking.customer.firstName,
          lastName: rezdyBooking.customer.lastName,
          email: rezdyBooking.customer.email,
          phone: rezdyBooking.customer.phone,
          fullName: `${rezdyBooking.customer.firstName} ${rezdyBooking.customer.lastName}`
        },
        items: rezdyBooking.items.map((item, index) => ({
          index,
          productCode: item.productCode,
          startTimeLocal: item.startTimeLocal,
          quantities: item.quantities,
          totalQuantity: item.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
          participants: item.participants,
          participantsCount: item.participants?.length || 0,
          extras: item.extras || [],
          extrasCount: item.extras?.length || 0,
          pickupId: item.pickupId
        })),
        payments: rezdyBooking.payments?.map((payment, index) => ({
          index,
          amount: payment.amount,
          type: payment.type,
          recipient: payment.recipient,
          label: payment.label,
          isValid: {
            hasAmount: !!payment.amount && payment.amount > 0,
            hasType: !!payment.type,
            isValidType: payment.type === "CASH" || payment.type === "CREDITCARD",
            hasRecipient: !!payment.recipient,
            isValidRecipient: payment.recipient === "SUPPLIER"
          }
        })),
        fields: rezdyBooking.fields,
        fieldsCount: rezdyBooking.fields.length,
        comments: rezdyBooking.comments,
        commentsLength: rezdyBooking.comments?.length || 0,
        pickupLocation: rezdyBooking.pickupLocation,
        hasPickupLocation: !!rezdyBooking.pickupLocation
      });
      
      console.log('✅ Pre-submission Validation Summary:', {
        hasValidStatus: !!rezdyBooking.status,
        hasValidCustomer: !!(rezdyBooking.customer?.firstName && rezdyBooking.customer?.lastName && rezdyBooking.customer?.email && rezdyBooking.customer?.phone),
        hasValidItems: !!(rezdyBooking.items && rezdyBooking.items.length > 0),
        hasValidQuantities: !!(rezdyBooking.items?.[0]?.quantities && rezdyBooking.items[0].quantities.length > 0),
        totalQuantity: rezdyBooking.items?.[0]?.quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
        hasValidPayments: !!(rezdyBooking.payments && rezdyBooking.payments.length > 0),
        paymentTypesValid: rezdyBooking.payments?.every(p => p.type === "CASH" || p.type === "CREDITCARD") || false,
        hasRequiredFields: !!(rezdyBooking.fields && rezdyBooking.comments !== undefined)
      });
      
      console.groupEnd();

      // Log the complete booking payload for debugging (in development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Complete Rezdy booking payload:', JSON.stringify(rezdyBooking, null, 2));
      }
      
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
              status: rezdyBooking.status,
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
                totalQuantity: rezdyBooking.items[0].quantities?.reduce((sum, q) => sum + q.value, 0) || 0,
                quantities: rezdyBooking.items[0].quantities,
                participantsCount: rezdyBooking.items[0].participants?.length || 0
              } : null,
              paymentsCount: rezdyBooking.payments?.length || 0,
              paymentDetails: rezdyBooking.payments?.[0] ? {
                hasAmount: !!rezdyBooking.payments[0].amount,
                hasType: !!rezdyBooking.payments[0].type,
                hasRecipient: !!rezdyBooking.payments[0].recipient,
                type: rezdyBooking.payments[0].type,
                recipient: rezdyBooking.payments[0].recipient
              } : null,
              fieldsCount: rezdyBooking.fields?.length || 0,
              hasComments: !!rezdyBooking.comments
            },
            suggestions: [
              'Verify booking status is set to CONFIRMED or PROCESSING',
              'Check all customer fields are present and valid (firstName, lastName, phone, email)',
              'Ensure quantities array has valid optionLabel and value > 0',
              'Confirm payments array is populated with type (CASH/CREDITCARD) and recipient (SUPPLIER)',
              'Validate startTimeLocal format (YYYY-MM-DD HH:mm:ss)',
              'Ensure participants array exists (can be empty)',
              'Check fields array exists and comments is a string'
            ]
          });
          
          // Create a more specific error message based on what's missing
          let specificError = "Booking validation failed";
          if (!rezdyBooking.status) {
            specificError += " - Missing booking status";
          }
          if (!rezdyBooking.customer?.email) {
            specificError += " - Missing customer email";
          }
          if (!rezdyBooking.payments?.[0]?.type) {
            specificError += " - Missing payment type";
          }
          if (!rezdyBooking.items?.[0]?.quantities?.length) {
            specificError += " - Missing quantities";
          }
          
          throw new Error(`${specificError}: ${errorMessage}. Please check all required fields and try again.`);
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
  private mapPaymentMethodToRezdy(paymentMethod: string): "CASH" | "CREDITCARD" {
    const lowerMethod = paymentMethod.toLowerCase()
    
    // Only cash payments should be mapped to CASH
    if (lowerMethod === 'cash') {
      return 'CASH';
    }
    
    // ALL other payment methods map to CREDITCARD per Rezdy API requirements
    // This includes: card, stripe, westpac, sepa_debit, ideal, bancontact, etc.
    console.log(`💳 Mapping payment method "${paymentMethod}" to CREDITCARD`);
    return 'CREDITCARD';
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

    // Validate required booking status
    if (!rezdyBooking.status) {
      errors.push('Booking status is required')
    } else if (rezdyBooking.status !== "CONFIRMED" && rezdyBooking.status !== "PROCESSING") {
      errors.push(`Invalid booking status: ${rezdyBooking.status}`)
    }

    // Validate required customer fields
    if (!rezdyBooking.customer) {
      errors.push('Customer information is required')
    } else {
      if (!rezdyBooking.customer.firstName || rezdyBooking.customer.firstName.trim() === '') {
        errors.push('Customer first name is required')
      }
      if (!rezdyBooking.customer.lastName || rezdyBooking.customer.lastName.trim() === '') {
        errors.push('Customer last name is required')
      }
      if (!rezdyBooking.customer.phone || rezdyBooking.customer.phone.trim() === '') {
        errors.push('Customer phone is required')
      }
      if (!rezdyBooking.customer.email || rezdyBooking.customer.email.trim() === '') {
        errors.push('Customer email is required')
      }
    }

    // Validate booking items
    if (!rezdyBooking.items || rezdyBooking.items.length === 0) {
      errors.push('At least one booking item is required')
    } else {
      const item = rezdyBooking.items[0]
      
      if (!item.productCode || item.productCode.trim() === '') {
        errors.push('Product code is required')
      }
      
      if (!item.startTimeLocal || item.startTimeLocal.trim() === '') {
        errors.push('Start time is required')
      }
      
      // Validate quantities array (critical for Rezdy API)
      if (!item.quantities || item.quantities.length === 0) {
        errors.push('Quantities are required - ensure guest counts or individual guests are provided')
      } else {
        let totalQuantity = 0;
        for (const quantity of item.quantities) {
          if (!quantity.optionLabel || quantity.optionLabel.trim() === '') {
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

      // Validate participants array exists
      if (!item.participants) {
        errors.push('Participants array is required (can be empty)')
      } else if (Array.isArray(item.participants)) {
        // Validate participant structure if not empty
        for (let i = 0; i < item.participants.length; i++) {
          const participant = item.participants[i];
          if (!participant.fields || !Array.isArray(participant.fields)) {
            errors.push(`Participant ${i}: fields array is required`)
          }
        }
      }
    }

    // Validate payments array (critical for Rezdy API)
    if (!rezdyBooking.payments || rezdyBooking.payments.length === 0) {
      errors.push('At least one payment entry is required')
    } else {
      for (let i = 0; i < rezdyBooking.payments.length; i++) {
        const payment = rezdyBooking.payments[i];
        
        if (!payment.amount || payment.amount <= 0) {
          errors.push(`Payment ${i}: amount must be greater than 0`)
        }
        
        if (!payment.type) {
          errors.push(`Payment ${i}: type cannot be empty. Please check all required fields and try again.`)
        } else {
          // Validate payment type is one of the accepted values
          const validPaymentTypes: Array<"CASH" | "CREDITCARD"> = ["CASH", "CREDITCARD"];
          if (!validPaymentTypes.includes(payment.type)) {
            errors.push(`Payment ${i}: invalid payment type "${payment.type}". Must be CASH or CREDITCARD`)
          }
        }
        
        if (!payment.recipient) {
          errors.push(`Payment ${i}: recipient is required`)
        } else if (payment.recipient !== "SUPPLIER") {
          errors.push(`Payment ${i}: recipient must be "SUPPLIER", got "${payment.recipient}"`)
        }
      }
    }

    // Validate required fields and comments arrays exist
    if (!rezdyBooking.fields) {
      errors.push('Fields array is required (can be empty)')
    } else if (!Array.isArray(rezdyBooking.fields)) {
      errors.push('Fields must be an array')
    }

    if (!rezdyBooking.comments) {
      errors.push('Comments field is required (can be empty string)')
    } else if (typeof rezdyBooking.comments !== 'string') {
      errors.push('Comments must be a string')
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