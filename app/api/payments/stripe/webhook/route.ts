import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { StripePaymentService } from "@/lib/services/stripe-payment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = StripePaymentService.validateWebhookSignature(
      body,
      signature,
      webhookSecret
    );

    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event);
        break;
      case "payment_intent.canceled":
        await handlePaymentCanceled(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(event: any) {
  const paymentIntent = event.data.object;

  console.log("Payment succeeded:", {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    orderNumber: paymentIntent.metadata?.orderNumber,
  });

  // Note: In the new flow, we don't automatically complete the booking here
  // The booking will be completed after the customer provides guest details
  // This webhook just confirms that payment was successful
  
  // You could add additional processing here if needed:
  // - Send payment confirmation email
  // - Update payment status in database
  // - Log payment success for analytics
}

async function handlePaymentFailed(event: any) {
  const paymentIntent = event.data.object;

  console.log("Payment failed:", {
    paymentIntentId: paymentIntent.id,
    orderNumber: paymentIntent.metadata?.orderNumber,
    lastPaymentError: paymentIntent.last_payment_error,
  });

  // Handle failed payment
  // For example, notify customer, clean up booking data, etc.
}

async function handlePaymentCanceled(event: any) {
  const paymentIntent = event.data.object;

  console.log("Payment canceled:", {
    paymentIntentId: paymentIntent.id,
    orderNumber: paymentIntent.metadata?.orderNumber,
  });

  // Handle canceled payment
  // For example, clean up booking data, notify customer, etc.
}
