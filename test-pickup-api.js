#!/usr/bin/env node

/**
 * Test script for pickup location API
 * Run with: node test-pickup-api.js
 */

const testProductCode = 'PH1FEA'; // Using the product code from the existing data

async function testPickupAPI() {
  console.log('🧪 Testing pickup location API...');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/rezdy/products/${testProductCode}/pickups`;
  
  try {
    console.log(`📡 Making request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      return;
    }
    
    console.log('✅ API Response:', {
      productCode: data.productCode,
      totalCount: data.totalCount,
      hasPickups: data.hasPickups,
      source: data.source,
      environment: data.environment,
      cached: data.cached
    });
    
    if (data.pickups && data.pickups.length > 0) {
      console.log('📍 Sample pickup locations:');
      data.pickups.slice(0, 3).forEach((pickup, index) => {
        console.log(`  ${index + 1}. ${pickup.locationName}`);
        if (pickup.address) console.log(`     Address: ${pickup.address}`);
        if (pickup.minutesPrior) console.log(`     Arrival: ${Math.abs(pickup.minutesPrior)} minutes early`);
      });
    } else {
      console.log('ℹ️  No pickup locations found');
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testPickupAPI();
}

module.exports = testPickupAPI;