import { NextRequest, NextResponse } from 'next/server'
import { BookingService, PaymentConfirmation } from '@/lib/services/booking-service'
import { BookingFormData } from '@/lib/utils/booking-transform'

// This endpoint receives payment confirmation webhooks from Westpac
// and registers the booking with Rezdy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate webhook signature/authentication (implement based on Westpac specs)
    const isValidWebhook = await validateWebhookSignature(request, body)
    if (!isValidWebhook) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Extract payment confirmation data from Westpac webhook
    const paymentConfirmation = extractPaymentConfirmation(body)
    if (!paymentConfirmation) {
      return NextResponse.json(
        { error: 'Invalid payment confirmation data' },
        { status: 400 }
      )
    }

    // Retrieve booking data from database/cache using order reference
    const bookingData = await retrieveBookingData(paymentConfirmation.orderReference)
    if (!bookingData) {
      return NextResponse.json(
        { error: 'Booking data not found for order reference' },
        { status: 404 }
      )
    }

    // Register booking with Rezdy
    const bookingService = new BookingService()
    const request_data = BookingService.createBookingRequest(bookingData, paymentConfirmation)
    const result = await bookingService.registerBooking(request_data)

    if (result.success) {
      // Store the successful booking registration
      await storeBookingRegistration(result)
      
      // Send confirmation email to customer
      await sendBookingConfirmationEmail(result, bookingData)
      
      return NextResponse.json({
        success: true,
        orderNumber: result.orderNumber,
        message: 'Booking successfully registered with Rezdy'
      })
    } else {
      // Log the error but return success to webhook (we don't want Westpac to retry)
      console.error('Failed to register booking with Rezdy:', result.error)
      
      // Store the failed attempt for manual review
      await storeFailedBooking(paymentConfirmation, bookingData, result.error)
      
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Payment confirmed but booking registration failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Payment confirmation webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error processing payment confirmation' },
      { status: 500 }
    )
  }
}

/**
 * Validate webhook signature from Westpac
 * Implement this based on Westpac's webhook authentication requirements
 */
async function validateWebhookSignature(request: NextRequest, body: any): Promise<boolean> {
  // TODO: Implement signature validation based on Westpac requirements
  // This might involve HMAC signature verification with a shared secret
  
  const signature = request.headers.get('x-westpac-signature')
  const timestamp = request.headers.get('x-westpac-timestamp')
  
  // For now, just check if required headers are present
  return !!(signature && timestamp)
}

/**
 * Extract payment confirmation from Westpac webhook payload
 */
function extractPaymentConfirmation(webhookBody: any): PaymentConfirmation | null {
  try {
    // Adapt this structure based on actual Westpac webhook format
    const payment = webhookBody.payment || webhookBody
    
    if (!payment.transactionId || !payment.amount || payment.status !== 'approved') {
      return null
    }

    return {
      transactionId: payment.transactionId,
      amount: parseFloat(payment.amount),
      currency: payment.currency || 'AUD',
      status: payment.status === 'approved' ? 'success' : 'failed',
      paymentMethod: payment.paymentMethod || 'credit_card',
      timestamp: payment.timestamp || new Date().toISOString(),
      orderReference: payment.orderReference || payment.merchantReference
    }
  } catch (error) {
    console.error('Error extracting payment confirmation:', error)
    return null
  }
}

/**
 * Retrieve booking data from storage using order reference
 * This could be from database, Redis cache, etc.
 */
async function retrieveBookingData(orderReference?: string): Promise<BookingFormData | null> {
  if (!orderReference) {
    return null
  }

  try {
    // TODO: Implement actual data retrieval
    // This might involve:
    // - Database query
    // - Redis cache lookup
    // - Session storage retrieval
    
    // For now, return null - implement based on your storage strategy
    console.log('Retrieving booking data for order reference:', orderReference)
    return null
    
  } catch (error) {
    console.error('Error retrieving booking data:', error)
    return null
  }
}

/**
 * Store successful booking registration
 */
async function storeBookingRegistration(result: any): Promise<void> {
  try {
    // TODO: Implement storage of successful booking registration
    // - Update database with Rezdy order number
    // - Log the successful transaction
    // - Update booking status
    
    console.log('Storing booking registration:', result.orderNumber)
  } catch (error) {
    console.error('Error storing booking registration:', error)
  }
}

/**
 * Store failed booking for manual review
 */
async function storeFailedBooking(
  paymentConfirmation: PaymentConfirmation,
  bookingData: BookingFormData,
  error?: string
): Promise<void> {
  try {
    // TODO: Implement storage of failed booking attempts
    // - Store for manual review and retry
    // - Alert administrators
    // - Log the failure details
    
    console.log('Storing failed booking for review:', {
      transactionId: paymentConfirmation.transactionId,
      error
    })
  } catch (error) {
    console.error('Error storing failed booking:', error)
  }
}

/**
 * Send booking confirmation email to customer
 */
async function sendBookingConfirmationEmail(
  result: any,
  bookingData: BookingFormData
): Promise<void> {
  try {
    // TODO: Implement email sending
    // - Use your email service (SendGrid, AWS SES, etc.)
    // - Include booking details, Rezdy order number
    // - Include pickup instructions if applicable
    
    console.log('Sending confirmation email for order:', result.orderNumber)
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
} 