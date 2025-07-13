import { NextRequest, NextResponse } from "next/server";
import { transformBookingDataToRezdy, validateBookingDataForRezdy, BookingFormData } from "@/lib/utils/booking-transform";
import { BookingService, PaymentConfirmation } from "@/lib/services/booking-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingData, orderNumber, sessionId } = body;

    if (!bookingData || !orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields: bookingData and orderNumber" },
        { status: 400 }
      );
    }

    const formData: BookingFormData = bookingData;

    // Validate booking data for Rezdy submission
    const validation = validateBookingDataForRezdy(formData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Invalid booking data", details: validation.errors },
        { status: 400 }
      );
    }

    try {
      // If sessionId is provided, it's from Stripe - retrieve the actual payment data
      let paymentConfirmation: PaymentConfirmation;
      
      if (sessionId) {
        // This is a Stripe payment - retrieve the actual payment intent
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(sessionId);
          
          if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json(
              { error: "Payment not completed. Please complete payment first." },
              { status: 400 }
            );
          }
          
          // Create proper payment confirmation from Stripe data
          paymentConfirmation = {
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert from cents to dollars
            currency: paymentIntent.currency.toUpperCase(),
            status: "success",
            paymentMethod: paymentIntent.payment_method?.type || "card",
            timestamp: new Date(paymentIntent.created * 1000).toISOString(),
            orderReference: orderNumber,
          };
          
          console.log("✅ Retrieved Stripe payment confirmation:", {
            transactionId: paymentConfirmation.transactionId,
            amount: paymentConfirmation.amount,
            status: paymentIntent.status,
            orderNumber
          });
          
        } catch (stripeError) {
          console.error("Failed to retrieve Stripe payment intent:", stripeError);
          return NextResponse.json(
            { error: "Failed to verify payment. Please contact support." },
            { status: 500 }
          );
        }
      } else {
        // Fallback: Create a basic payment confirmation (for testing or other payment methods)
        paymentConfirmation = {
          transactionId: orderNumber,
          amount: formData.pricing.total,
          currency: "AUD",
          status: "success",
          paymentMethod: "credit_card",
          timestamp: new Date().toISOString(),
          orderReference: orderNumber,
        };
        
        console.log("⚠️  Using fallback payment confirmation for order:", orderNumber);
      }

      // Debug: Log the booking data structure before processing
      console.log("🔍 Booking data structure:", {
        productCode: formData.product.code,
        sessionId: formData.session.id,
        sessionStartTime: formData.session.startTime,
        guestCount: formData.guests?.length || 0,
        guestCounts: formData.guestCounts,
        selectedPriceOptions: formData.selectedPriceOptions,
        totalAmount: formData.pricing.total,
        paymentAmount: paymentConfirmation.amount,
        paymentMethod: paymentConfirmation.paymentMethod
      });

      // Use the existing BookingService to register the booking
      const bookingService = new BookingService();
      const bookingRequest = BookingService.createBookingRequest(formData, paymentConfirmation);
      
      console.log("🚀 Submitting booking request to Rezdy...");
      const bookingResult = await bookingService.registerBooking(bookingRequest);

      if (bookingResult.success) {
        console.log("✅ Booking registration successful:", {
          bookingId: bookingResult.orderNumber,
          transactionId: paymentConfirmation.transactionId
        });
        
        return NextResponse.json({
          success: true,
          bookingId: bookingResult.orderNumber,
          transactionId: paymentConfirmation.transactionId,
          message: "Booking completed successfully",
        });
      } else {
        console.error("❌ Booking registration failed:", {
          error: bookingResult.error,
          orderNumber,
          transactionId: paymentConfirmation.transactionId
        });
        
        return NextResponse.json(
          { error: bookingResult.error || "Failed to create booking" },
          { status: 500 }
        );
      }
    } catch (rezdyError) {
      console.error("💥 Rezdy booking creation failed:", rezdyError);
      return NextResponse.json(
        { error: "Failed to process booking with tour provider" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Booking registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Test endpoint to create sample booking registration
export async function GET(request: NextRequest) {
  try {
    // Sample booking data for testing
    const sampleBookingData: BookingFormData = {
      product: {
        code: "PH1FEA", // Real product code from Rezdy system
        name: "Hop on Hop off Bus - Tamborine Mountain - From Brisbane",
        description:
          "Embark on an adventure from Brisbane to the enchanting heights of Tamborine Mountain",
      },
      session: {
        id: "session123",
        startTime: "2024-01-15T09:00:00",
        endTime: "2024-01-15T12:00:00",
        pickupLocation: {
          id: "pickup1",
          name: "Brisbane Central Station",
          address: "Brisbane Central Station, QLD, Australia",
        },
      },
      guests: [
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          age: 35,
          type: "ADULT",
        },
        {
          id: "2",
          firstName: "Jane",
          lastName: "Doe",
          age: 32,
          type: "ADULT",
        },
      ],
      contact: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+61400123456",
        country: "Australia",
      },
      pricing: {
        basePrice: 99,
        sessionPrice: 198,
        subtotal: 198,
        taxAndFees: 20,
        total: 218,
      },
      extras: [
        {
          id: "photo-package",
          name: "Professional Photo Package",
          price: 49,
          quantity: 1,
          totalPrice: 49,
        },
      ],
      payment: {
        method: "credit_card",
      },
    };

    const samplePaymentConfirmation: PaymentConfirmation = {
      transactionId: "TXN123456789",
      amount: 218, // Updated to match the new total
      currency: "AUD",
      status: "success",
      paymentMethod: "credit_card",
      timestamp: new Date().toISOString(),
      orderReference: "ORD-2024-001",
    };

    return NextResponse.json({
      sampleBookingData,
      samplePaymentConfirmation,
      message: "Sample data for testing booking registration",
      usage:
        "POST this data to /api/bookings/register to test the booking flow",
    });
  } catch (error) {
    console.error("Error generating sample data:", error);
    return NextResponse.json(
      { error: "Failed to generate sample data" },
      { status: 500 }
    );
  }
}
