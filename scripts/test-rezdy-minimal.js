/**
 * Minimal test script for direct Rezdy booking format
 * This tests the absolute minimum required fields
 * Run with: node scripts/test-rezdy-minimal.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Minimal direct Rezdy booking request
const directBookingRequest = {
  "resellerReference": "ORDER12345",
  "customer": {
    "firstName": "Rick",
    "lastName": "Sanchez",
    "phone": "+61484123456",
    "email": "ricksanchez@test.com"
  },
  "items": [
    {
      "productCode": "PH1FEA",
      "startTimeLocal": "2025-10-01 09:00:00",
      "quantities": [
        {
          "optionLabel": "Adult",
          "value": 2
        }
      ],
      "participants": []
    }
  ],
  "payments": [
    {
      "amount": 515,
      "type": "CREDITCARD",
      "recipient": "SUPPLIER",
      "label": "Payment via credit card"
    }
  ]
};

async function testDirectBooking() {
  console.log('📋 Testing minimal direct Rezdy booking format...\n');
  console.log('Request body:', JSON.stringify(directBookingRequest, null, 2));
  console.log('\n🚀 Sending request to /api/bookings/register...\n');

  try {
    const response = await fetch(`${API_URL}/api/bookings/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(directBookingRequest),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Error:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run the test
testDirectBooking();