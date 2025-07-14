import { NextRequest, NextResponse } from "next/server";
import { StripePaymentService } from "@/lib/services/stripe-payment";
import {
  registerBookingWithPayment,
  BookingService,
} from "@/lib/services/booking-service";
import { BookingFormData } from "@/lib/utils/booking-transform";
import { bookingDataStore } from "@/lib/services/booking-data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.paymentIntentId || !body.orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields: paymentIntentId and orderNumber" },
        { status: 400 }
      );
    }

    const paymentIntentId: string = body.paymentIntentId;
    const orderNumber: string = body.orderNumber;

    // Confirm payment with Stripe
    const confirmationResult = await StripePaymentService.confirmPayment(
      paymentIntentId
    );

    if (!confirmationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: confirmationResult.error,
        },
        { status: 400 }
      );
    }

    // Retrieve stored booking data
    const bookingData = await retrieveBookingData(orderNumber);
    if (!bookingData) {
      console.error("Booking data not found for order:", orderNumber);
      return NextResponse.json(
        {
          success: false,
          error: "Booking data not found",
        },
        { status: 404 }
      );
    }

    // Create payment confirmation
    const paymentConfirmation = BookingService.createPaymentConfirmation({
      transactionId: confirmationResult.transaction!.id,
      amount: StripePaymentService.formatAmountFromCents(
        confirmationResult.transaction!.amount
      ),
      currency: confirmationResult.transaction!.currency,
      paymentMethod: confirmationResult.transaction!.paymentMethod || "card",
      orderReference: orderNumber,
    });

    // Register booking with Rezdy
    const bookingResult = await registerBookingWithPayment(
      bookingData,
      paymentConfirmation
    );

    if (bookingResult.success) {
      console.log("Booking successfully registered:", {
        orderNumber: bookingResult.orderNumber,
        transactionId: paymentConfirmation.transactionId,
        paymentIntentId,
      });

      return NextResponse.json({
        success: true,
        orderNumber: bookingResult.orderNumber,
        transactionId: paymentConfirmation.transactionId,
        paymentIntentId,
        rezdyBooking: bookingResult.rezdyBooking,
      });
    } else {
      console.error("Booking registration failed:", bookingResult.error);

      // Payment succeeded but booking failed - needs manual intervention
      return NextResponse.json(
        {
          success: false,
          error: "Booking registration failed",
          paymentSucceeded: true,
          transactionId: paymentConfirmation.transactionId,
          orderNumber,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}

/**
 * Retrieve stored booking data
 */
async function retrieveBookingData(
  orderNumber: string
): Promise<BookingFormData | null> {
  console.log(`Attempting to retrieve booking data for order ${orderNumber}`);

  // Use fallback retrieval to handle different order number formats
  const bookingData = await bookingDataStore.retrieveWithFallbacks(orderNumber);

  if (bookingData) {
    // Clean up the stored data after successful retrieval
    // Try to remove all possible variations
    await bookingDataStore.remove(orderNumber);
    
    // Also try removing common variations to ensure cleanup
    const variations = [
      orderNumber.replace(/^ORD-/, ''),
      orderNumber.startsWith('ORD-') ? orderNumber : `ORD-${orderNumber}`,
    ];
    
    for (const variation of variations) {
      if (variation !== orderNumber) {
        await bookingDataStore.remove(variation);
      }
    }
  }

  return bookingData;
}
