import { NextRequest, NextResponse } from "next/server";
import { StripePaymentService } from "@/lib/services/stripe-payment";
import { BookingFormData } from "@/lib/utils/booking-transform";
import { bookingDataStore } from "@/lib/services/booking-data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.bookingData || !body.orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields: bookingData and orderNumber" },
        { status: 400 }
      );
    }

    const bookingData: BookingFormData = body.bookingData;
    const orderNumber: string = body.orderNumber;

    // Validate booking data has required contact info
    if (
      !bookingData.contact.firstName ||
      !bookingData.contact.lastName ||
      !bookingData.contact.email
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required contact information: firstName, lastName, email",
        },
        { status: 400 }
      );
    }

    // Validate pricing
    if (!bookingData.pricing.total || bookingData.pricing.total <= 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    // Store booking data temporarily for later retrieval
    await storeBookingData(orderNumber, bookingData);

    // Create payment intent with Stripe
    const paymentResult = await StripePaymentService.createPaymentIntent({
      amount: StripePaymentService.formatAmountToCents(
        bookingData.pricing.total
      ),
      currency: "AUD",
      orderNumber,
      customerInfo: {
        firstName: bookingData.contact.firstName,
        lastName: bookingData.contact.lastName,
        email: bookingData.contact.email,
        phone: bookingData.contact.phone,
      },
      description: `${bookingData.product.name} - Pineapple Tours`,
      metadata: {
        productCode: bookingData.product.code,
        sessionId: bookingData.session.id,
        guestCount: bookingData.guests.length.toString(),
        bookingType: "tour_booking",
      },
    });

    if (paymentResult.success) {
      return NextResponse.json({
        success: true,
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntent?.id,
        orderNumber,
        // Include payment data for client to update sessionStorage
        paymentData: {
          method: "stripe",
          type: "CREDITCARD" as const
        },
        shouldUpdateSessionStorage: true
      });
    } else {
      // Clean up stored booking data if payment intent creation failed
      await bookingDataStore.remove(orderNumber);

      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

/**
 * Store booking data temporarily for payment confirmation
 */
async function storeBookingData(
  orderNumber: string,
  bookingData: BookingFormData
): Promise<void> {
  // Ensure payment data includes Stripe payment type
  const bookingDataWithPayment: BookingFormData = {
    ...bookingData,
    payment: {
      method: "stripe",
      type: "CREDITCARD" as const
    }
  };
  
  await bookingDataStore.store(orderNumber, bookingDataWithPayment);

  console.log(`Stored booking data for order ${orderNumber}:`, {
    productCode: bookingData.product.code,
    sessionId: bookingData.session.id,
    guestCount: bookingData.guests.length,
    total: bookingData.pricing.total,
    contactEmail: bookingData.contact.email,
    payment: bookingDataWithPayment.payment
  });
}
