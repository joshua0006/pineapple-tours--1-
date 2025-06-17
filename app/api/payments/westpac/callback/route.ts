import { NextRequest, NextResponse } from "next/server";
import {
  WestpacPaymentService,
  WestpacCallbackData,
} from "@/lib/services/westpac-payment";
import {
  registerBookingWithPayment,
  BookingService,
} from "@/lib/services/booking-service";
import { BookingFormData } from "@/lib/utils/booking-transform";
import { bookingDataStore } from "@/lib/services/booking-data-store";

export async function POST(request: NextRequest) {
  // Get base URL with fallback for development
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const body = await request.json();

    // Extract callback data from Westpac
    const callbackData: WestpacCallbackData = {
      orderNumber: body.orderNumber || body.merchantReference,
      paymentStatus: body.paymentStatus || body.status,
      responseCode: body.responseCode || body.code,
      responseText: body.responseText || body.message,
      transactionId: body.transactionId,
      amount: body.amount ? parseFloat(body.amount) / 100 : undefined, // Convert from cents
      currency: body.currency || "AUD",
      paymentMethod: body.paymentMethod,
      cardLast4: body.cardLast4,
      timestamp: body.timestamp || new Date().toISOString(),
      signature: body.signature,
    };

    // Validate required callback data
    if (!callbackData.orderNumber || !callbackData.paymentStatus) {
      return NextResponse.json(
        {
          error:
            "Missing required callback data: orderNumber and paymentStatus",
        },
        { status: 400 }
      );
    }

    // Process payment callback
    const paymentService = new WestpacPaymentService();
    const paymentResult = await paymentService.processCallback(callbackData);

    if (!paymentResult.success) {
      console.error("Payment callback processing failed:", paymentResult.error);

      // For failed payments, redirect to failure page
      const failureUrl = `${baseUrl}/booking/payment-failed?orderNumber=${
        callbackData.orderNumber
      }&error=${encodeURIComponent(paymentResult.error || "Payment failed")}`;

      return NextResponse.redirect(failureUrl);
    }

    // Retrieve stored booking data
    const bookingData = await retrieveBookingData(callbackData.orderNumber);
    if (!bookingData) {
      console.error(
        "Booking data not found for order:",
        callbackData.orderNumber
      );

      const errorUrl = `${baseUrl}/booking/error?orderNumber=${callbackData.orderNumber}&error=booking-data-not-found`;
      return NextResponse.redirect(errorUrl);
    }

    // Create payment confirmation
    const paymentConfirmation = BookingService.createPaymentConfirmation(
      paymentResult.transaction!
    );

    // Register booking with Rezdy
    const bookingResult = await registerBookingWithPayment(
      bookingData,
      paymentConfirmation
    );

    if (bookingResult.success) {
      console.log("Booking successfully registered:", {
        orderNumber: bookingResult.orderNumber,
        transactionId: paymentConfirmation.transactionId,
      });

      // Redirect to success page with booking details
      const successUrl = `${baseUrl}/booking/confirmation?orderNumber=${bookingResult.orderNumber}&transactionId=${paymentConfirmation.transactionId}`;

      return NextResponse.redirect(successUrl);
    } else {
      console.error("Booking registration failed:", bookingResult.error);

      // Payment succeeded but booking failed - needs manual intervention
      const errorUrl = `${baseUrl}/booking/error?orderNumber=${callbackData.orderNumber}&error=booking-registration-failed&transactionId=${paymentConfirmation.transactionId}`;

      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error("Payment callback error:", error);

    const errorUrl = `${baseUrl}/booking/error?error=callback-processing-failed`;
    return NextResponse.redirect(errorUrl);
  }
}

export async function GET(request: NextRequest) {
  // Handle GET callbacks (some payment providers use GET for returns)
  const searchParams = request.nextUrl.searchParams;

  const callbackData: WestpacCallbackData = {
    orderNumber:
      searchParams.get("orderNumber") ||
      searchParams.get("merchantReference") ||
      "",
    paymentStatus: (searchParams.get("paymentStatus") ||
      searchParams.get("status") ||
      "FAILURE") as any,
    responseCode:
      searchParams.get("responseCode") || searchParams.get("code") || "",
    responseText:
      searchParams.get("responseText") || searchParams.get("message") || "",
    transactionId: searchParams.get("transactionId") || undefined,
    amount: searchParams.get("amount")
      ? parseFloat(searchParams.get("amount")!) / 100
      : undefined,
    currency: searchParams.get("currency") || "AUD",
    paymentMethod: searchParams.get("paymentMethod") || undefined,
    cardLast4: searchParams.get("cardLast4") || undefined,
    timestamp: searchParams.get("timestamp") || new Date().toISOString(),
    signature: searchParams.get("signature") || undefined,
  };

  // Create a mock request body and process the same way as POST
  const mockRequest = {
    json: async () => ({
      orderNumber: callbackData.orderNumber,
      paymentStatus: callbackData.paymentStatus,
      responseCode: callbackData.responseCode,
      responseText: callbackData.responseText,
      transactionId: callbackData.transactionId,
      amount: callbackData.amount ? callbackData.amount * 100 : undefined, // Convert back to cents for consistency
      currency: callbackData.currency,
      paymentMethod: callbackData.paymentMethod,
      cardLast4: callbackData.cardLast4,
      timestamp: callbackData.timestamp,
      signature: callbackData.signature,
    }),
  } as NextRequest;

  return POST(mockRequest);
}

/**
 * Retrieve stored booking data
 */
async function retrieveBookingData(
  orderNumber: string
): Promise<BookingFormData | null> {
  console.log(`Attempting to retrieve booking data for order ${orderNumber}`);

  const bookingData = await bookingDataStore.retrieve(orderNumber);

  if (bookingData) {
    // Clean up the stored data after successful retrieval
    await bookingDataStore.remove(orderNumber);
  }

  return bookingData;
}
