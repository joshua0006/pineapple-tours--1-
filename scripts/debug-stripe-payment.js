#!/usr/bin/env node

/**
 * Debug script to test Stripe payment flow and identify errors
 * Usage: node scripts/debug-stripe-payment.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_ORDER_NUMBER = 'test-' + Date.now();

// Mock booking data for testing
const mockBookingData = {
  product: {
    code: 'SYHW',
    name: 'Sydney Harbour Bridge Walk'
  },
  session: {
    id: 'session_123',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 7200000).toISOString() // +2 hours
  },
  contact: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+61400000000'
  },
  pricing: {
    subtotal: 150,
    taxes: 15,
    serviceFees: 5,
    total: 170
  },
  guests: [
    { type: 'adult', firstName: 'Test', lastName: 'Guest' }
  ],
  guestCounts: {
    adults: 1,
    children: 0,
    infants: 0
  }
};

// Test functions
async function testPaymentIntentCreation() {
  console.log('🧪 Testing payment intent creation...');
  
  const postData = JSON.stringify({
    bookingData: mockBookingData,
    orderNumber: TEST_ORDER_NUMBER
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/payments/stripe/create-payment-intent',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📧 Payment Intent API Response:', {
            status: res.statusCode,
            success: response.success,
            hasClientSecret: !!response.clientSecret,
            error: response.error
          });
          
          if (response.success) {
            console.log('✅ Payment intent created successfully');
            resolve(response);
          } else {
            console.log('❌ Payment intent creation failed:', response.error);
            reject(new Error(response.error));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function checkStripeConfig() {
  console.log('🔑 Checking Stripe configuration...');
  
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  console.log('Stripe Config Status:', {
    hasPublishableKey: !!publishableKey,
    publishableKeyFormat: publishableKey ? publishableKey.substring(0, 7) + '...' : 'missing',
    hasSecretKey: !!secretKey,
    secretKeyFormat: secretKey ? secretKey.substring(0, 7) + '...' : 'missing'
  });
  
  if (!publishableKey || !publishableKey.startsWith('pk_')) {
    console.error('❌ Invalid or missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    return false;
  }
  
  if (!secretKey || !secretKey.startsWith('sk_')) {
    console.error('❌ Invalid or missing STRIPE_SECRET_KEY');
    return false;
  }
  
  console.log('✅ Stripe configuration appears valid');
  return true;
}

async function testServerHealth() {
  console.log('🏥 Testing server health...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server is healthy');
        resolve(true);
      } else {
        console.log('⚠️ Server health check failed:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log('❌ Server is not running:', error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Server health check timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Network monitoring for Stripe requests
function monitorStripeRequests() {
  console.log('📡 Monitoring for Stripe network requests...');
  console.log('Note: This script cannot intercept browser requests.');
  console.log('Please check browser DevTools Network tab for:');
  console.log('- POST requests to errors.stripe.com');
  console.log('- Failed requests to api.stripe.com');
  console.log('- Any 4xx/5xx responses from Stripe endpoints');
}

// Main debug function
async function debugStripePayment() {
  console.log('🚀 Starting Stripe Payment Debug Session');
  console.log('=====================================\n');
  
  try {
    // 1. Check Stripe configuration
    const configValid = await checkStripeConfig();
    if (!configValid) {
      console.log('\n❌ Debug session stopped due to invalid Stripe configuration');
      process.exit(1);
    }
    
    console.log('');
    
    // 2. Test server health
    const serverHealthy = await testServerHealth();
    if (!serverHealthy) {
      console.log('\n❌ Debug session stopped - server not running');
      console.log('Please start the development server with: npm run dev');
      process.exit(1);
    }
    
    console.log('');
    
    // 3. Test payment intent creation
    try {
      const paymentIntent = await testPaymentIntentCreation();
      console.log('\n✅ Payment intent creation test passed');
      
      // 4. Monitor for Stripe requests
      console.log('');
      monitorStripeRequests();
      
    } catch (error) {
      console.log('\n❌ Payment intent creation test failed');
      console.error('Error details:', error.message);
    }
    
  } catch (error) {
    console.error('\n💥 Debug session failed:', error);
  }
  
  console.log('\n=====================================');
  console.log('🏁 Debug session completed');
  console.log('\nTo investigate further:');
  console.log('1. Open browser DevTools -> Network tab');
  console.log('2. Navigate to the payment page');
  console.log('3. Look for failed requests or error responses');
  console.log('4. Check Console tab for JavaScript errors');
}

// Run the debug session
if (require.main === module) {
  debugStripePayment().catch(console.error);
}

module.exports = {
  debugStripePayment,
  testPaymentIntentCreation,
  checkStripeConfig,
  testServerHealth
};