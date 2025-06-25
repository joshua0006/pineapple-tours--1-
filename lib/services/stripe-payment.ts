import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export interface StripePaymentRequest {
  amount: number; // Amount in cents
  currency: string;
  orderNumber: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  description: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentResult {
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  clientSecret?: string;
  error?: string;
}

export interface StripeConfirmationResult {
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    cardLast4?: string;
    timestamp: string;
  };
  error?: string;
}

export class StripePaymentService {
  /**
   * Create a payment intent for the booking
   */
  static async createPaymentIntent(
    paymentRequest: StripePaymentRequest
  ): Promise<StripePaymentResult> {
    try {
      // Validate amount
      if (paymentRequest.amount <= 0) {
        return {
          success: false,
          error: "Invalid payment amount",
        };
      }

      // Create customer if email is provided
      let customerId: string | undefined;
      if (paymentRequest.customerInfo.email) {
        try {
          const customer = await stripe.customers.create({
            email: paymentRequest.customerInfo.email,
            name: `${paymentRequest.customerInfo.firstName} ${paymentRequest.customerInfo.lastName}`,
            phone: paymentRequest.customerInfo.phone,
            metadata: {
              orderNumber: paymentRequest.orderNumber,
            },
          });
          customerId = customer.id;
        } catch (customerError) {
          console.warn(
            "Failed to create customer, continuing without:",
            customerError
          );
        }
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentRequest.amount,
        currency: paymentRequest.currency.toLowerCase(),
        customer: customerId,
        description: paymentRequest.description,
        metadata: {
          orderNumber: paymentRequest.orderNumber,
          customerName: `${paymentRequest.customerInfo.firstName} ${paymentRequest.customerInfo.lastName}`,
          customerEmail: paymentRequest.customerInfo.email,
          ...paymentRequest.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        // Enable receipt emails
        receipt_email: paymentRequest.customerInfo.email,
      });

      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error: unknown) {
      console.error("Stripe payment intent creation error:", error);

      if (error instanceof Stripe.errors.StripeError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to create payment intent",
      };
    }
  }

  /**
   * Confirm a payment intent and retrieve payment details
   */
  static async confirmPayment(
    paymentIntentId: string
  ): Promise<StripeConfirmationResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["payment_method"],
        }
      );

      if (paymentIntent.status === "succeeded") {
        // Extract payment method details
        const paymentMethod =
          paymentIntent.payment_method as Stripe.PaymentMethod;
        let cardLast4: string | undefined;
        let paymentMethodType: string | undefined;

        if (
          paymentMethod &&
          paymentMethod.type === "card" &&
          paymentMethod.card
        ) {
          cardLast4 = paymentMethod.card.last4;
          paymentMethodType = `${paymentMethod.card.brand} ****${paymentMethod.card.last4}`;
        }

        return {
          success: true,
          paymentIntent,
          transaction: {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency.toUpperCase(),
            status: paymentIntent.status,
            paymentMethod: paymentMethodType,
            cardLast4,
            timestamp: new Date(paymentIntent.created * 1000).toISOString(),
          },
        };
      } else {
        return {
          success: false,
          error: `Payment not completed. Status: ${paymentIntent.status}`,
        };
      }
    } catch (error: unknown) {
      console.error("Stripe payment confirmation error:", error);

      if (error instanceof Stripe.errors.StripeError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to confirm payment",
      };
    }
  }

  /**
   * Retrieve payment intent by ID
   */
  static async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error("Failed to retrieve payment intent:", error);
      return null;
    }
  }

  /**
   * Create a refund for a payment
   */
  static async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refund?: Stripe.Refund; error?: string }> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount, // If not provided, refunds the full amount
        reason: reason as Stripe.RefundCreateParams.Reason,
        metadata: {
          refundReason: reason || "Customer request",
          refundDate: new Date().toISOString(),
        },
      });

      return {
        success: true,
        refund,
      };
    } catch (error: unknown) {
      console.error("Stripe refund error:", error);

      if (error instanceof Stripe.errors.StripeError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to create refund",
      };
    }
  }

  /**
   * Validate webhook signature (for webhook endpoints)
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    endpointSecret: string
  ): Stripe.Event | null {
    try {
      return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      console.error("Webhook signature validation failed:", error);
      return null;
    }
  }

  /**
   * Format amount from dollars to cents
   */
  static formatAmountToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format amount from cents to dollars
   */
  static formatAmountFromCents(amountInCents: number): number {
    return amountInCents / 100;
  }
}
