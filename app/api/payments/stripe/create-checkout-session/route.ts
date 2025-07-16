import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { bookingDataStore } from "@/lib/services/booking-data-store";
import { BookingFormData } from "@/lib/utils/booking-transform";
import { StripePaymentService } from "@/lib/services/stripe-payment";

// Initialise Stripe instance (reuse same API version as other Stripe integrations)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.bookingData || !body.orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields: bookingData and orderNumber" },
        { status: 400 }
      );
    }

    const bookingData: BookingFormData = body.bookingData;
    const orderNumber: string = body.orderNumber;

    // Basic validation – ensure total amount and contact info exist
    if (
      !bookingData?.pricing?.total ||
      bookingData.pricing.total <= 0 ||
      !bookingData.contact?.email
    ) {
      return NextResponse.json(
        { error: "Invalid booking data supplied" },
        { status: 400 }
      );
    }

    // Store booking data temporarily (for webhook / confirmation step)
    // Ensure payment data includes Stripe payment type
    const bookingDataWithPayment: BookingFormData = {
      ...bookingData,
      payment: {
        method: "stripe",
        type: "CREDITCARD" as const
      }
    };
    
    console.log("💾 Storing booking data for Stripe checkout:", {
      orderNumber: orderNumber,
      hasPayment: !!bookingDataWithPayment.payment,
      paymentType: bookingDataWithPayment.payment?.type,
      paymentMethod: bookingDataWithPayment.payment?.method,
      productName: bookingDataWithPayment.product?.name,
      totalAmount: bookingDataWithPayment.pricing?.total,
      contactEmail: bookingDataWithPayment.contact?.email
    });
    
    await bookingDataStore.store(orderNumber, bookingDataWithPayment);

    // Determine success & cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/booking/guest-details?orderNumber=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/booking/payment-failed?orderNumber=${orderNumber}`;
    
    console.log("🔗 Success URL pattern:", successUrl);
    console.log("📋 Order number in URL:", orderNumber);

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: bookingData.contact.email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: bookingData.product.name,
              description: `Booking for ${bookingData.product.name}`,
            },
            unit_amount: StripePaymentService.formatAmountToCents(
              bookingData.pricing.total
            ),
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderNumber,
        productCode: bookingData.product.code,
        bookingType: "tour_booking",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log("✅ Checkout session created successfully:", {
      sessionId: session.id,
      orderNumber: orderNumber,
      checkoutUrl: session.url
    });
    
    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderNumber,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
