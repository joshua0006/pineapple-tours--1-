import { NextRequest, NextResponse } from 'next/server'
import { registerBookingWithPayment, PaymentConfirmation } from '@/lib/services/booking-service'
import { BookingFormData } from '@/lib/utils/booking-transform'

// Manual booking registration endpoint
// Use this for testing or when webhook processing fails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.bookingData || !body.paymentConfirmation) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingData and paymentConfirmation' },
        { status: 400 }
      )
    }

    const bookingData: BookingFormData = body.bookingData
    const paymentConfirmation: PaymentConfirmation = body.paymentConfirmation

    // Register booking with Rezdy
    const result = await registerBookingWithPayment(bookingData, paymentConfirmation)

    if (result.success) {
      return NextResponse.json({
        success: true,
        orderNumber: result.orderNumber,
        rezdyBooking: result.rezdyBooking,
        message: 'Booking successfully registered with Rezdy'
      }, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        paymentConfirmation: result.paymentConfirmation
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Manual booking registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register booking' },
      { status: 500 }
    )
  }
}

// Test endpoint to create sample booking registration
export async function GET(request: NextRequest) {
  try {
    // Sample booking data for testing
    const sampleBookingData: BookingFormData = {
      product: {
        code: 'PH1FEA', // Real product code from Rezdy system
        name: 'Hop on Hop off Bus - Tamborine Mountain - From Brisbane',
        description: 'Embark on an adventure from Brisbane to the enchanting heights of Tamborine Mountain'
      },
      session: {
        id: 'session123',
        startTime: '2024-01-15T09:00:00',
        endTime: '2024-01-15T12:00:00',
        pickupLocation: {
          id: 'pickup1',
          name: 'Brisbane Central Station',
          address: 'Brisbane Central Station, QLD, Australia'
        }
      },
      guests: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          age: 35,
          type: 'ADULT'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Doe',
          age: 32,
          type: 'ADULT'
        }
      ],
      contact: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+61400123456',
        country: 'Australia'
      },
      pricing: {
        basePrice: 99,
        sessionPrice: 198,
        subtotal: 198,
        taxAndFees: 20,
        total: 218
      },
      extras: [
        {
          id: 'photo-package',
          name: 'Professional Photo Package',
          price: 49,
          quantity: 1,
          totalPrice: 49
        }
      ],
      payment: {
        method: 'credit_card'
      }
    }

    const samplePaymentConfirmation: PaymentConfirmation = {
      transactionId: 'TXN123456789',
      amount: 218, // Updated to match the new total
      currency: 'AUD',
      status: 'success',
      paymentMethod: 'credit_card',
      timestamp: new Date().toISOString(),
      orderReference: 'ORD-2024-001'
    }

    return NextResponse.json({
      sampleBookingData,
      samplePaymentConfirmation,
      message: 'Sample data for testing booking registration',
      usage: 'POST this data to /api/bookings/register to test the booking flow'
    })

  } catch (error) {
    console.error('Error generating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to generate sample data' },
      { status: 500 }
    )
  }
} 