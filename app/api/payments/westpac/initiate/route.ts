import { NextRequest, NextResponse } from "next/server";
import { WestpacPaymentService } from "@/lib/services/westpac-payment";
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

    // Create payment request
    const paymentRequest = WestpacPaymentService.createPaymentRequest(
      orderNumber,
      bookingData.pricing.total,
      {
        firstName: bookingData.contact.firstName,
        lastName: bookingData.contact.lastName,
        email: bookingData.contact.email,
        phone: bookingData.contact.phone,
      },
      `${bookingData.product.name} - Pineapple Tours`
    );

    // Store booking data temporarily (in production, use Redis or database)
    // This will be retrieved when processing the payment callback
    await storeBookingData(orderNumber, bookingData);

    // Initiate payment with Westpac
    const paymentService = new WestpacPaymentService();
    const result = await paymentService.initiatePayment(paymentRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        redirectUrl: result.redirectUrl,
        paymentToken: result.paymentToken,
        orderNumber,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

/**
 * Store booking data temporarily for callback processing
 */
async function storeBookingData(
  orderNumber: string,
  bookingData: BookingFormData
): Promise<void> {
  await bookingDataStore.store(orderNumber, bookingData);

  console.log(`Stored booking data for order ${orderNumber}:`, {
    productCode: bookingData.product.code,
    sessionId: bookingData.session.id,
    guestCount: bookingData.guests.length,
    total: bookingData.pricing.total,
    contactEmail: bookingData.contact.email,
  });
}
