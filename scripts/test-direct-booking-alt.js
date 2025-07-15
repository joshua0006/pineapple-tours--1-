/**
 * Alternative test script for direct Rezdy booking format
 * This tests a different structure where pickupLocation is part of the booking item
 * Run with: node scripts/test-direct-booking-alt.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Sample direct Rezdy booking request with pickup in booking item
const directBookingRequest = {
  "resellerReference": "ORDER12345",
  "resellerComments": "This comment is visible to both supplier and reseller",
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
      "extras": [
        {
          "name": "Underwater camera rental",
          "quantity": 1
        }
      ],
      "participants": [
        {
          "fields": [
            {
              "label": "First Name",
              "value": "Rick"
            },
            {
              "label": "Last Name",
              "value": "Sanchez"
            },
            {
              "label": "Certification level",
              "value": "Open Water"
            },
            {
              "label": "Certification number",
              "value": "123456798"
            },
            {
              "label": "Certification agency",
              "value": "PADI"
            }
          ]
        },
        {
          "fields": [
            {
              "label": "First Name",
              "value": "Morty"
            },
            {
              "label": "Last Name",
              "value": "Smith"
            },
            {
              "label": "Certification level",
              "value": "Rescue Diver"
            },
            {
              "label": "Certification number",
              "value": "111222333"
            },
            {
              "label": "Certification agency",
              "value": "SDI"
            }
          ]
        }
      ]
    }
  ],
  "fields": [
    {
      "label": "Special Requirements",
      "value": "Gluten free lunch for Morty"
    },
    {
      "label": "Pickup Location",
      "value": "Divers hotel"
    }
  ],
  "payments": [
    {
      "amount": 515,
      "type": "CASH",
      "recipient": "SUPPLIER",
      "label": "Paid in cash to API specification demo"
    }
  ]
};

async function testDirectBooking() {
  console.log('📋 Testing direct Rezdy booking format (Alternative structure)...\n');
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