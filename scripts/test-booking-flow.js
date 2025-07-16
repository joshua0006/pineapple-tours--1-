#!/usr/bin/env node

/**
 * Test script to verify the booking registration flow with proper data structure
 * This tests the complete flow from guest details to Rezdy API submission
 */

const fetch = require('node-fetch');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/bookings/register`;

// Test booking data that matches the expected Rezdy structure
const testBookingData = {
  bookingData: {
    product: {
      code: "PWQF1Y",
      name: "Test Product - Scuba Diving Experience",
      description: "Amazing scuba diving experience"
    },
    session: {
      id: "session-test-123",
      startTime: "2025-10-01T09:00:00",
      endTime: "2025-10-01T12:00:00",
      pickupLocation: {
        name: "Divers hotel",
        locationName: "Divers hotel"
      }
    },
    guests: [
      {
        id: "1",
        firstName: "Rick",
        lastName: "Sanchez",
        age: 70,
        type: "ADULT",
        certificationLevel: "Open Water",
        certificationNumber: "123456798",
        certificationAgency: "PADI"
      },
      {
        id: "2",
        firstName: "Morty",
        lastName: "Smith",
        age: 14,
        type: "ADULT",
        certificationLevel: "Rescue Diver",
        certificationNumber: "111222333",
        certificationAgency: "SDI"
      }
    ],
    guestCounts: {
      adults: 2,
      children: 0,
      infants: 0
    },
    contact: {
      firstName: "Rick",
      lastName: "Sanchez",
      email: "ricksanchez@test.com",
      phone: "+61484123456",
      country: "Australia",
      specialRequests: "Gluten free lunch for Morty"
    },
    pricing: {
      basePrice: 250,
      sessionPrice: 500,
      subtotal: 500,
      taxAndFees: 15,
      total: 515
    },
    extras: [
      {
        id: "camera-rental",
        name: "Underwater camera rental",
        price: 25,
        quantity: 1,
        totalPrice: 25
      }
    ],
    payment: {
      method: "cash",
      type: "CASH"
    },
    selectedPriceOptions: {
      adult: { id: 1, label: "Adult", price: 250 }
    }
  },
  orderNumber: `ORDER-TEST-${Date.now()}`,
  sessionId: null // No Stripe session for cash payment
};

// Alternative test with credit card payment
const testBookingDataCard = {
  ...testBookingData,
  bookingData: {
    ...testBookingData.bookingData,
    payment: {
      method: "stripe",
      type: "CREDITCARD"
    }
  },
  sessionId: "pi_test_123456" // Simulated payment intent ID
};

async function testBookingRegistration(testData, testName) {
  console.log(`\n🧪 Testing ${testName}...`);
  console.log('📤 Sending booking data to:', API_ENDPOINT);
  console.log('📋 Order Number:', testData.orderNumber);
  console.log('💳 Payment Type:', testData.bookingData.payment.type);
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Booking registration successful!');
      console.log('📝 Result:', result);
      return true;
    } else {
      console.error('❌ Booking registration failed');
      console.error('Status:', response.status);
      console.error('Error:', result.error);
      console.error('Details:', result.details);
      return false;
    }
  } catch (error) {
    console.error('💥 Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting booking registration tests...\n');
  
  // Test 1: Cash payment
  const test1 = await testBookingRegistration(testBookingData, 'Cash Payment Booking');
  
  // Test 2: Credit card payment
  const test2 = await testBookingRegistration(testBookingDataCard, 'Credit Card Payment Booking');
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Cash Payment: ${test1 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Credit Card Payment: ${test2 ? '✅ PASSED' : '❌ FAILED'}`);
  
  process.exit(test1 && test2 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});