import crypto from "crypto";

export interface WestpacPaymentRequest {
  merchantId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  customerDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  description?: string;
}

export interface WestpacPaymentResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
  paymentToken?: string;
}

export interface WestpacCallbackData {
  orderNumber: string;
  paymentStatus: "SUCCESS" | "FAILURE" | "PENDING" | "CANCELLED";
  responseCode: string;
  responseText: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  cardLast4?: string;
  timestamp: string;
  signature?: string;
}

export interface WestpacPaymentResult {
  success: boolean;
  transaction?: {
    transactionId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    orderReference: string;
    status: string;
    cardLast4?: string;
    timestamp: string;
  };
  error?: string;
}

export class WestpacPaymentService {
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly isDevelopment: boolean;

  constructor() {
    this.merchantId = process.env.WESTPAC_MERCHANT_ID || "";
    this.secretKey = process.env.WESTPAC_SECRET_KEY || "";
    this.baseUrl =
      process.env.WESTPAC_BASE_URL || "https://quickstream.westpac.com.au";
    this.isDevelopment = process.env.NODE_ENV === "development";

    if (!this.merchantId && !this.isDevelopment) {
      throw new Error(
        "Westpac merchant ID not configured. Please set WESTPAC_MERCHANT_ID environment variable."
      );
    }
  }

  /**
   * Initiate payment with Westpac Quick Stream
   * Returns redirect URL for hosted payment page
   */
  async initiatePayment(
    paymentRequest: WestpacPaymentRequest
  ): Promise<WestpacPaymentResponse> {
    try {
      // In development mode, return mock redirect URL
      if (this.isDevelopment || !this.merchantId) {
        console.log(
          "🔄 Development mode: Simulating Westpac payment initiation"
        );

        // Store payment request for callback simulation
        await this.storePaymentRequest(paymentRequest);

        return {
          success: true,
          redirectUrl: `/api/payments/westpac/mock-payment?orderNumber=${paymentRequest.orderNumber}&amount=${paymentRequest.amount}`,
          paymentToken: `mock-token-${paymentRequest.orderNumber}`,
        };
      }

      // Prepare payment parameters
      const paymentParams = {
        merchantId: this.merchantId,
        orderNumber: paymentRequest.orderNumber,
        amount: (paymentRequest.amount * 100).toString(), // Convert to cents
        currency: paymentRequest.currency,
        returnUrl: paymentRequest.returnUrl,
        cancelUrl: paymentRequest.cancelUrl,
        description: paymentRequest.description || "Pineapple Tours Booking",
        customerFirstName: paymentRequest.customerDetails?.firstName || "",
        customerLastName: paymentRequest.customerDetails?.lastName || "",
        customerEmail: paymentRequest.customerDetails?.email || "",
        customerPhone: paymentRequest.customerDetails?.phone || "",
        timestamp: new Date().toISOString(),
      };

      // Generate signature for security
      const signature = this.generateSignature(paymentParams);
      const signedParams = { ...paymentParams, signature };

      // Make request to Westpac Quick Stream API
      const response = await fetch(`${this.baseUrl}/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signedParams),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Westpac API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();

      return {
        success: true,
        redirectUrl: result.redirectUrl,
        paymentToken: result.paymentToken,
      };
    } catch (error) {
      console.error("Westpac payment initiation error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to initiate payment",
      };
    }
  }

  /**
   * Process payment callback from Westpac
   */
  async processCallback(
    callbackData: WestpacCallbackData
  ): Promise<WestpacPaymentResult> {
    try {
      // Verify callback signature if provided
      if (
        callbackData.signature &&
        !this.verifyCallbackSignature(callbackData)
      ) {
        return {
          success: false,
          error: "Invalid callback signature",
        };
      }

      // Check payment status
      if (callbackData.paymentStatus !== "SUCCESS") {
        return {
          success: false,
          error: `Payment ${callbackData.paymentStatus.toLowerCase()}: ${
            callbackData.responseText
          }`,
        };
      }

      // Create successful transaction result
      return {
        success: true,
        transaction: {
          transactionId: callbackData.transactionId || `TXN${Date.now()}`,
          amount: callbackData.amount || 0,
          currency: callbackData.currency || "AUD",
          paymentMethod: this.mapPaymentMethod(callbackData.paymentMethod),
          orderReference: callbackData.orderNumber,
          status: "approved",
          cardLast4: callbackData.cardLast4,
          timestamp: callbackData.timestamp,
        },
      };
    } catch (error) {
      console.error("Westpac callback processing error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process payment callback",
      };
    }
  }

  /**
   * Generate signature for payment request
   */
  private generateSignature(params: Record<string, string>): string {
    if (!this.secretKey) {
      return "mock-signature";
    }

    // Sort parameters by key
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    // Generate HMAC-SHA256 signature
    return crypto
      .createHmac("sha256", this.secretKey)
      .update(signatureString)
      .digest("hex");
  }

  /**
   * Verify callback signature
   */
  private verifyCallbackSignature(callbackData: WestpacCallbackData): boolean {
    if (!this.secretKey || !callbackData.signature) {
      return true; // Skip verification in development
    }

    const { signature, ...params } = callbackData;

    // Convert all values to strings for signature generation
    const stringParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      stringParams[key] = value?.toString() || "";
    });

    const expectedSignature = this.generateSignature(stringParams);

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  }

  /**
   * Map Westpac payment method to standard format
   */
  private mapPaymentMethod(method?: string): string {
    if (!method) return "credit_card";

    const methodMap: { [key: string]: string } = {
      VISA: "visa",
      MASTERCARD: "mastercard",
      AMEX: "amex",
      DINERS: "diners",
      DISCOVER: "discover",
      PAYPAL: "paypal",
    };

    return methodMap[method.toUpperCase()] || "credit_card";
  }

  /**
   * Store payment request for development/testing
   */
  private async storePaymentRequest(
    paymentRequest: WestpacPaymentRequest
  ): Promise<void> {
    // In a real implementation, this would store in Redis or database
    // For now, we'll just log it
    console.log("Stored payment request:", {
      orderNumber: paymentRequest.orderNumber,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create payment request from booking data
   */
  static createPaymentRequest(
    orderNumber: string,
    amount: number,
    customerDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    },
    description?: string
  ): WestpacPaymentRequest {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return {
      merchantId: process.env.WESTPAC_MERCHANT_ID || "TEST_MERCHANT",
      orderNumber,
      amount,
      currency: "AUD",
      returnUrl: `${baseUrl}/api/payments/westpac/callback`,
      cancelUrl: `${baseUrl}/booking/cancelled?orderNumber=${orderNumber}`,
      customerDetails,
      description: description || "Pineapple Tours Booking",
    };
  }
}
