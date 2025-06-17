#!/usr/bin/env node

/**
 * Test script for Westpac payment integration
 * Run with: node scripts/test-payment-flow.js
 */

const crypto = require("crypto");

// Test data
const testBookingData = {
  product: {
    code: "TOUR001",
    name: "Sydney Harbour Bridge Climb",
    description: "Climb the iconic Sydney Harbour Bridge",
  },
  session: {
    id: "session123",
    startTime: "2024-01-15T09:00:00",
    endTime: "2024-01-15T12:00:00",
    pickupLocation: {
      id: "pickup1",
      name: "Circular Quay",
    },
  },
  guests: [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      age: 30,
      type: "ADULT",
    },
  ],
  contact: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+61400123456",
  },
  pricing: {
    basePrice: 89,
    sessionPrice: 89,
    subtotal: 89,
    taxAndFees: 8.9,
    total: 97.9,
  },
  extras: [],
};

const testOrderNumber = `TEST-${Date.now()}-${Math.floor(
  Math.random() * 1000
)}`;

async function testPaymentInitiation() {
  console.log("🧪 Testing Payment Initiation...");

  try {
    const response = await fetch(
      "http://localhost:3000/api/payments/westpac/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingData: testBookingData,
          orderNumber: testOrderNumber,
        }),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ Payment initiation successful");
      console.log(`   Order Number: ${result.orderNumber}`);
      console.log(`   Redirect URL: ${result.redirectUrl}`);
      console.log(`   Payment Token: ${result.paymentToken}`);
      return result;
    } else {
      console.log("❌ Payment initiation failed");
      console.log(`   Error: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log("❌ Payment initiation error");
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function testPaymentCallback(orderNumber) {
  console.log("\n🧪 Testing Payment Callback...");

  const callbackData = {
    orderNumber: orderNumber,
    paymentStatus: "SUCCESS",
    responseCode: "00",
    responseText: "Transaction Approved",
    transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    amount: 9790, // $97.90 in cents
    currency: "AUD",
    paymentMethod: "VISA",
    cardLast4: "1234",
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/payments/westpac/callback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(callbackData),
      }
    );

    if (response.redirected) {
      console.log("✅ Payment callback processed successfully");
      console.log(`   Redirected to: ${response.url}`);
      return true;
    } else {
      const result = await response.json();
      console.log("❌ Payment callback failed");
      console.log(`   Error: ${result.error || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    console.log("❌ Payment callback error");
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testBookingRegistration() {
  console.log("\n🧪 Testing Manual Booking Registration...");

  const paymentConfirmation = {
    transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    amount: 97.9,
    currency: "AUD",
    status: "success",
    paymentMethod: "credit_card",
    timestamp: new Date().toISOString(),
    orderReference: testOrderNumber,
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/bookings/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingData: testBookingData,
          paymentConfirmation: paymentConfirmation,
        }),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ Booking registration successful");
      console.log(`   Order Number: ${result.orderNumber}`);
      console.log(
        `   Rezdy Booking: ${result.rezdyBooking ? "Created" : "Simulated"}`
      );
      return result;
    } else {
      console.log("❌ Booking registration failed");
      console.log(`   Error: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log("❌ Booking registration error");
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

function testSignatureGeneration() {
  console.log("\n🧪 Testing HMAC Signature Generation...");

  const testParams = {
    merchantId: "TEST_MERCHANT",
    orderNumber: testOrderNumber,
    amount: "9790",
    currency: "AUD",
    timestamp: new Date().toISOString(),
  };

  const secretKey = "test_secret_key";

  // Sort parameters by key
  const sortedKeys = Object.keys(testParams).sort();
  const signatureString = sortedKeys
    .map((key) => `${key}=${testParams[key]}`)
    .join("&");

  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureString)
    .digest("hex");

  console.log("✅ Signature generation test");
  console.log(`   Signature String: ${signatureString}`);
  console.log(`   Generated Signature: ${signature}`);

  // Test verification
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureString)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );

  console.log(`   Verification: ${isValid ? "✅ Valid" : "❌ Invalid"}`);

  return isValid;
}

async function runTests() {
  console.log("🚀 Starting Westpac Payment Integration Tests\n");

  // Test 1: Signature generation
  const signatureTest = testSignatureGeneration();

  // Test 2: Payment initiation
  const paymentResult = await testPaymentInitiation();

  // Test 3: Payment callback (only if initiation succeeded)
  let callbackResult = false;
  if (paymentResult) {
    callbackResult = await testPaymentCallback(paymentResult.orderNumber);
  }

  // Test 4: Manual booking registration
  const bookingResult = await testBookingRegistration();

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log(`   Signature Generation: ${signatureTest ? "✅" : "❌"}`);
  console.log(`   Payment Initiation: ${paymentResult ? "✅" : "❌"}`);
  console.log(`   Payment Callback: ${callbackResult ? "✅" : "❌"}`);
  console.log(`   Booking Registration: ${bookingResult ? "✅" : "❌"}`);

  const allPassed =
    signatureTest && paymentResult && callbackResult && bookingResult;
  console.log(
    `\n🎯 Overall Result: ${
      allPassed ? "✅ All tests passed!" : "❌ Some tests failed"
    }`
  );

  if (!allPassed) {
    console.log("\n💡 Troubleshooting Tips:");
    console.log(
      "   - Ensure the development server is running on http://localhost:3000"
    );
    console.log("   - Check that all required environment variables are set");
    console.log("   - Verify the API endpoints are accessible");
    console.log("   - Check the console logs for detailed error messages");
  }

  process.exit(allPassed ? 0 : 1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  });
}

module.exports = {
  testPaymentInitiation,
  testPaymentCallback,
  testBookingRegistration,
  testSignatureGeneration,
  runTests,
};
