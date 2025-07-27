import { NextRequest, NextResponse } from "next/server";
import { validateBookingDataForRezdy, BookingFormData } from "@/lib/utils/booking-transform";
import { BookingService, PaymentConfirmation } from "@/lib/services/booking-service";
import { enhancedBookingService } from "@/lib/services/enhanced-booking-service";
import { bookingDataStore } from "@/lib/services/booking-data-store";
import { RezdyDirectBookingRequest } from "@/lib/types/rezdy";
import { bookingLogger } from "@/lib/utils/booking-debug-logger";

// Simple in-memory store to track recent booking attempts
// In production, this should be Redis or similar
const recentBookingAttempts = new Map<string, {
  timestamp: number;
  bookingId?: string;
  status: 'pending' | 'completed' | 'failed';
}>();

// Clean up old entries every hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [key, value] of recentBookingAttempts.entries()) {
    if (value.timestamp < oneHourAgo) {
      recentBookingAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Helper function to check if request is in direct Rezdy format
function isDirectRezdyFormat(body: unknown): body is RezdyDirectBookingRequest {
  const obj = body as Record<string, unknown>;
  return (
    obj.resellerReference !== undefined &&
    obj.customer !== undefined &&
    obj.items !== undefined &&
    obj.payments !== undefined &&
    !obj.bookingData // Ensure it's not the old format
  );
}

export async function POST(request: NextRequest) {
  let attemptKey: string | undefined;
  
  try {
    // Initialize booking logging session
    const loggingSessionId = bookingLogger.startSession('booking_attempt');
    bookingLogger.log('info', 'api', 'route_start', 'Booking registration route started', {
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    });

    const body = await request.json();

    // Check if this is a direct Rezdy format request
    if (isDirectRezdyFormat(body)) {
      console.log("📥 /api/bookings/register invoked with direct Rezdy format", {
        resellerReference: body.resellerReference,
        customer: body.customer,
        itemsCount: body.items.length,
        paymentsCount: body.payments.length,
        timestamp: new Date().toISOString()
      });

      // For direct Rezdy format, submit directly to the API using enhanced service
      const result = await enhancedBookingService.submitDirectRezdyBooking(body);

      if (result.success) {
        console.log("✅ Direct booking registration successful:", {
          bookingId: result.orderNumber,
          resellerReference: body.resellerReference,
          hasWarning: !!result.warning,
          parseError: result.parseError
        });
        
        // Check if there's a warning (post-creation issue)
        if (result.warning) {
          console.warn("⚠️ Direct booking created with warning:", result.warning);
          bookingLogger.endSession('completed', `Direct booking successful with warning: ${result.orderNumber}`);
          
          return NextResponse.json({
            success: true,
            bookingId: result.orderNumber,
            message: result.warning,
            warning: true,
            requiresSupport: result.parseError
          });
        }
        
        bookingLogger.endSession('completed', `Direct booking successful: ${result.orderNumber}`);
        return NextResponse.json({
          success: true,
          bookingId: result.orderNumber,
          message: "Booking completed successfully",
        });
      } else {
        console.error("❌ Direct booking registration failed:", {
          error: result.error,
          resellerReference: body.resellerReference
        });
        
        bookingLogger.endSession('failed', `Direct booking failed: ${result.error}`);
        return NextResponse.json(
          { error: result.error || "Failed to create booking" },
          { status: 500 }
        );
      }
    }

    // Handle legacy format
    const { bookingData, orderNumber, sessionId } = body;

    // Initial debug log
    console.log("📥 /api/bookings/register invoked", {
      orderNumber,
      hasBookingData: Boolean(bookingData),
      sessionId,
      timestamp: new Date().toISOString(),
      paymentData: bookingData?.payment,
      hasPaymentType: Boolean(bookingData?.payment?.type),
      hasPaymentMethod: Boolean(bookingData?.payment?.method)
    });

    if (!bookingData || !orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields: bookingData and orderNumber" },
        { status: 400 }
      );
    }

    // Check for duplicate booking attempts
    const attemptKey = `${orderNumber}-${sessionId || 'no-session'}`;
    const existingAttempt = recentBookingAttempts.get(attemptKey);
    
    if (existingAttempt) {
      const timeSinceAttempt = Date.now() - existingAttempt.timestamp;
      
      // If booking was completed within last 5 minutes, return the existing booking
      if (existingAttempt.status === 'completed' && timeSinceAttempt < 5 * 60 * 1000) {
        console.log("🔁 Duplicate booking attempt detected, returning existing booking:", {
          orderNumber,
          bookingId: existingAttempt.bookingId,
          timeSinceAttempt: Math.round(timeSinceAttempt / 1000) + 's'
        });
        
        return NextResponse.json({
          success: true,
          bookingId: existingAttempt.bookingId || orderNumber,
          transactionId: sessionId,
          message: "Booking already completed successfully",
          duplicate: true
        });
      }
      
      // If booking is still pending and it's been less than 30 seconds, reject
      if (existingAttempt.status === 'pending' && timeSinceAttempt < 30 * 1000) {
        console.log("⏳ Booking still in progress, rejecting duplicate:", {
          orderNumber,
          timeSinceAttempt: Math.round(timeSinceAttempt / 1000) + 's'
        });
        
        return NextResponse.json(
          { error: "Booking is already being processed. Please wait a moment and check your email for confirmation." },
          { status: 409 }
        );
      }
    }
    
    // Mark this attempt as pending
    recentBookingAttempts.set(attemptKey, {
      timestamp: Date.now(),
      status: 'pending'
    });

    const formData: BookingFormData = bookingData;

    console.log("📝 Parsed bookingData summary", {
      productCode: formData.product.code,
      sessionId: formData.session.id,
      participantCount:
        (formData.guests?.length || 0) ||
        (formData.guestCounts
          ? formData.guestCounts.adults +
            formData.guestCounts.children +
            formData.guestCounts.infants
          : 0),
      totalAmount: formData.pricing.total,
    });

    // Validate booking data for Rezdy submission
    const validation = validateBookingDataForRezdy(formData);

    console.log("✅ Validation result", {
      isValid: validation.isValid,
      errors: validation.errors,
    });

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
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        try {
          // First check if sessionId looks like a payment intent ID (starts with pi_)
          let paymentIntent;
          
          if (sessionId.startsWith('pi_')) {
            // It's already a payment intent ID, retrieve it directly
            console.log("📝 SessionId is a payment intent ID, retrieving directly");
            paymentIntent = await stripe.paymentIntents.retrieve(sessionId);
          } else if (sessionId.startsWith('cs_')) {
            // It's a checkout session ID, retrieve the session first
            console.log("📝 SessionId is a checkout session ID, retrieving session first");
            const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
            
            if (!checkoutSession.payment_intent) {
              console.error("❌ Checkout session has no payment intent:", {
                sessionId,
                sessionStatus: checkoutSession.status,
                paymentStatus: checkoutSession.payment_status
              });
              return NextResponse.json(
                { error: "Payment information not found. Please contact support." },
                { status: 400 }
              );
            }
            
            // Now retrieve the payment intent from the session
            paymentIntent = await stripe.paymentIntents.retrieve(
              checkoutSession.payment_intent as string
            );
          } else {
            // Unknown format, log error
            console.error("❌ Unknown sessionId format:", {
              sessionId,
              prefix: sessionId.substring(0, 3)
            });
            return NextResponse.json(
              { error: "Invalid payment session. Please contact support." },
              { status: 400 }
            );
          }
          
          console.log("🔍 Retrieved payment intent:", {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            paymentMethod: paymentIntent.payment_method
          });
          
          if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json(
              { error: "Payment not completed. Please complete payment first." },
              { status: 400 }
            );
          }
          
          // Get payment method details if available
          let paymentMethodType = "card";
          if (typeof paymentIntent.payment_method === 'string' && paymentIntent.payment_method) {
            try {
              const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
              paymentMethodType = paymentMethod.type;
              console.log("📝 Payment method type:", paymentMethodType);
            } catch (pmError) {
              console.warn("⚠️ Could not retrieve payment method details:", pmError);
            }
          }
          
          // Create proper payment confirmation from Stripe data
          paymentConfirmation = {
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert from cents to dollars
            currency: paymentIntent.currency.toUpperCase(),
            status: "success",
            paymentMethod: paymentMethodType,
            timestamp: new Date(paymentIntent.created * 1000).toISOString(),
            orderReference: orderNumber,
          };

          console.log("💳 Stripe payment confirmation created:", {
            transactionId: paymentConfirmation.transactionId,
            paymentMethod: paymentConfirmation.paymentMethod,
            amount: paymentConfirmation.amount,
            orderNumber
          });
          
          console.log("✅ Retrieved Stripe payment confirmation:", {
            transactionId: paymentConfirmation.transactionId,
            amount: paymentConfirmation.amount,
            status: paymentIntent.status,
            paymentMethod: paymentConfirmation.paymentMethod,
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
          paymentMethod: formData.payment?.method || "credit_card",
          timestamp: new Date().toISOString(),
          orderReference: orderNumber,
        };
        
        console.log("⚠️  Using fallback payment confirmation for order:", {
          orderNumber,
          paymentMethod: paymentConfirmation.paymentMethod,
          amount: paymentConfirmation.amount
        });
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
        paymentMethod: paymentConfirmation.paymentMethod,
        contact: {
          name: `${formData.contact.firstName} ${formData.contact.lastName}`,
          email: formData.contact.email,
          hasPhone: !!formData.contact.phone
        }
      });
      
      // Additional validation before creating booking request
      if (!formData.guests || formData.guests.length === 0) {
        if (!formData.guestCounts || (formData.guestCounts.adults + formData.guestCounts.children + formData.guestCounts.infants) === 0) {
          console.error("❌ No guests or guest counts provided:", {
            guests: formData.guests,
            guestCounts: formData.guestCounts
          });
          return NextResponse.json(
            { error: "Guest information is missing. Please provide guest details." },
            { status: 400 }
          );
        }
      }

      // Use the enhanced BookingService to register the booking with full logging
      const bookingRequest = enhancedBookingService.createBookingRequest(formData, paymentConfirmation);

      console.group("📤 BOOKING REGISTRATION ROUTE - Creating Rezdy Request");
      console.log("🎯 Route Processing Summary:", {
        route: "/api/bookings/register",
        orderNumber: orderNumber,
        sessionId: sessionId,
        isLegacyFormat: true,
        paymentSource: sessionId ? "Stripe" : "Fallback"
      });
      
      console.log("📋 Complete BookingRequest Structure:", {
        bookingData: {
          product: bookingRequest.bookingData.product,
          session: bookingRequest.bookingData.session,
          guests: {
            count: bookingRequest.bookingData.guests?.length || 0,
            details: bookingRequest.bookingData.guests?.map(g => ({
              name: `${g.firstName} ${g.lastName}`,
              type: g.type,
              age: g.age
            })) || []
          },
          guestCounts: bookingRequest.bookingData.guestCounts,
          contact: bookingRequest.bookingData.contact,
          pricing: bookingRequest.bookingData.pricing,
          payment: bookingRequest.bookingData.payment,
          selectedPriceOptions: bookingRequest.bookingData.selectedPriceOptions,
          extras: bookingRequest.bookingData.extras
        },
        paymentConfirmation: paymentConfirmation
      });
      
      console.log("💳 Payment Analysis:", {
        bookingPayment: {
          method: bookingRequest.bookingData.payment?.method,
          type: bookingRequest.bookingData.payment?.type,
          hasType: !!bookingRequest.bookingData.payment?.type,
          isValidType: bookingRequest.bookingData.payment?.type === "CASH" || bookingRequest.bookingData.payment?.type === "CREDITCARD"
        },
        paymentConfirmation: {
          transactionId: paymentConfirmation.transactionId,
          amount: paymentConfirmation.amount,
          currency: paymentConfirmation.currency,
          method: paymentConfirmation.paymentMethod,
          status: paymentConfirmation.status
        },
        validation: {
          amountMatch: Math.abs(bookingRequest.bookingData.pricing.total - paymentConfirmation.amount) <= 0.01,
          willUseSafetyNet: !bookingRequest.bookingData.payment?.type
        }
      });
      
      console.groupEnd();

      console.log("🚀 Submitting booking request to Rezdy...");
      const bookingResult = await enhancedBookingService.registerBooking(bookingRequest);

      if (bookingResult.success) {
        console.log("✅ Booking registration successful:", {
          bookingId: bookingResult.orderNumber,
          transactionId: paymentConfirmation.transactionId,
          hasWarning: !!bookingResult.warning,
          parseError: bookingResult.parseError
        });
        
        // Clear booking data from server store after successful registration
        await bookingDataStore.remove(orderNumber);
        console.log("🧹 Cleared booking data from server store for order:", orderNumber);
        
        // Update attempt status to completed
        recentBookingAttempts.set(attemptKey, {
          timestamp: Date.now(),
          status: 'completed',
          bookingId: bookingResult.orderNumber
        });
        
        // Check if there's a warning (post-creation issue)
        if (bookingResult.warning) {
          console.warn("⚠️ Booking created with warning:", bookingResult.warning);
          bookingLogger.endSession('completed', `Legacy booking successful with warning: ${bookingResult.orderNumber}`);
          
          return NextResponse.json({
            success: true,
            bookingId: bookingResult.orderNumber,
            transactionId: paymentConfirmation.transactionId,
            message: bookingResult.warning,
            warning: true,
            requiresSupport: bookingResult.parseError
          });
        }
        
        bookingLogger.endSession('completed', `Legacy booking successful: ${bookingResult.orderNumber}`);
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
        
        // All Rezdy registration failures should be reported as errors
        // This ensures proper debugging and prevents silent failures
        console.error("❌ Rezdy registration failed - returning error to user:", {
          orderNumber,
          sessionId,
          error: bookingResult.error,
          paymentSuccessful: !!sessionId
        });
        
        // Determine error status based on error type
        const isValidationError = bookingResult.error?.includes("validation failed") || 
                                 bookingResult.error?.includes("Payment type cannot be empty") ||
                                 bookingResult.error?.includes("Amount mismatch") ||
                                 bookingResult.error?.includes("is required") ||
                                 bookingResult.error?.includes("Invalid");
        
        // Update attempt status to failed
        recentBookingAttempts.set(attemptKey, {
          timestamp: Date.now(),
          status: 'failed'
        });
        
        bookingLogger.endSession('failed', `Legacy booking failed: ${bookingResult.error}`);
        return NextResponse.json(
          { 
            error: bookingResult.error || "Failed to create booking",
            // Include payment info for customer service follow-up if payment was successful
            paymentInfo: sessionId ? {
              transactionId: paymentConfirmation.transactionId,
              orderNumber: orderNumber,
              message: "Payment was processed successfully. Please contact support with this information."
            } : undefined
          },
          { status: isValidationError ? 400 : 500 }
        );
      }
    } catch (rezdyError) {
      console.error("💥 Rezdy booking creation failed:", rezdyError);
      
      // Check if it's a validation error (should be 400) or system error (500)
      const errorMessage = rezdyError instanceof Error ? rezdyError.message : "Failed to process booking with tour provider";
      const isValidationError = errorMessage.includes("validation failed") || 
                               errorMessage.includes("cannot be empty") ||
                               errorMessage.includes("is required") ||
                               errorMessage.includes("Invalid");
      
      // Report all exceptions as errors - no more success masking
      console.error("❌ Exception during Rezdy registration - returning error to user:", {
        orderNumber,
        sessionId,
        error: errorMessage,
        paymentSuccessful: !!sessionId
      });
      
      // Update attempt status to failed
      recentBookingAttempts.set(attemptKey, {
        timestamp: Date.now(),
        status: 'failed'
      });
      
      bookingLogger.endSession('failed', `Exception during booking: ${errorMessage}`);
      return NextResponse.json(
        { 
          error: errorMessage,
          // Include payment info for customer service follow-up if payment was successful
          paymentInfo: sessionId ? {
            transactionId: sessionId,
            orderNumber: orderNumber,
            message: "Payment was processed successfully. Please contact support with this information."
          } : undefined
        },
        { status: isValidationError ? 400 : 500 }
      );
    }
  } catch (error) {
    console.error("Booking registration error:", error);
    
    // Update attempt status to failed if we have an attemptKey
    if (typeof attemptKey !== 'undefined') {
      recentBookingAttempts.set(attemptKey, {
        timestamp: Date.now(),
        status: 'failed'
      });
    }
    
    bookingLogger.endSession('failed', `Internal server error: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Test endpoint to create sample booking registration
export async function GET() {
  try {
    // Sample direct Rezdy format
    const sampleDirectRezdyFormat: RezdyDirectBookingRequest = {
      resellerReference: "ORDER12345",
      resellerComments: "This comment is visible to both supplier and reseller",
      customer: {
        firstName: "Rick",
        lastName: "Sanchez",
        phone: "+61484123456",
        email: "ricksanchez@test.com"
      },
      items: [
        {
          productCode: "PWQF1Y",
          startTimeLocal: "2025-10-01 09:00:00",
          quantities: [
            {
              optionLabel: "Adult",
              value: 2
            }
          ],
          extras: [
            {
              name: "Underwater camera rental",
              quantity: 1
            }
          ],
          participants: [
            {
              fields: [
                {
                  label: "First Name",
                  value: "Rick"
                },
                {
                  label: "Last Name",
                  value: "Sanchez"
                },
                {
                  label: "Certification level",
                  value: "Open Water"
                },
                {
                  label: "Certification number",
                  value: "123456798"
                },
                {
                  label: "Certification agency",
                  value: "PADI"
                }
              ]
            },
            {
              fields: [
                {
                  label: "First Name",
                  value: "Morty"
                },
                {
                  label: "Last Name",
                  value: "Smith"
                },
                {
                  label: "Certification level",
                  value: "Rescue Diver"
                },
                {
                  label: "Certification number",
                  value: "111222333"
                },
                {
                  label: "Certification agency",
                  value: "SDI"
                }
              ]
            }
          ]
        } as RezdyBookingItem
      ],
      fields: [
        {
          label: "Special Requirements",
          value: "Gluten free lunch for Morty"
        }
      ],
      payments: [
        {
          amount: 515,
          type: "CASH",
          recipient: "SUPPLIER",
          label: "Paid in cash to API specification demo"
        }
      ]
    };

    // Note: pickup information is included in the booking item as per official Rezdy API documentation
    const sampleWithPickup = {
      ...sampleDirectRezdyFormat,
      items: [
        {
          ...sampleDirectRezdyFormat.items[0],
          pickupId: "divers_hotel_pickup",  // Optional pickup ID for reference
          pickupLocation: {
            locationName: "Divers hotel"    // Pickup location info within main booking item
          }
        }
      ]
    };

    // Sample booking data for testing (legacy format)
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
      directRezdyFormat: {
        sample: sampleDirectRezdyFormat,
        sampleWithPickup: sampleWithPickup,
        usage: "POST this data to /api/bookings/register for direct Rezdy format (1:1 mapping)"
      },
      legacyFormat: {
        sampleBookingData,
        samplePaymentConfirmation,
        usage: "POST this data to /api/bookings/register for legacy format (with transformation)"
      },
      message: "Sample data for testing booking registration - supports both formats"
    });
  } catch (error) {
    console.error("Error generating sample data:", error);
    return NextResponse.json(
      { error: "Failed to generate sample data" },
      { status: 500 }
    );
  }
}
