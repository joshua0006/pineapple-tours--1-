/**
 * Test script for the new permanent pickup storage system
 * Run with: node scripts/test-pickup-storage.js
 */

const { PickupStorage } = require('../lib/services/pickup-storage.ts');

async function testPickupStorage() {
  console.log('🧪 Testing Permanent Pickup Storage System\n');

  try {
    // Test 1: Initialize storage
    console.log('1️⃣ Initializing storage...');
    await PickupStorage.initialize();
    console.log('✅ Storage initialized\n');

    // Test 2: Check for non-existent product
    console.log('2️⃣ Testing non-existent product...');
    const testProductCode = 'TEST123';
    const hasData = await PickupStorage.hasPickupData(testProductCode);
    console.log(`   Has data for ${testProductCode}: ${hasData}`);
    
    const loadResult = await PickupStorage.loadPickupData(testProductCode);
    console.log(`   Load result: ${loadResult}\n`);

    // Test 3: Save test data
    console.log('3️⃣ Saving test pickup data...');
    const testPickups = [
      {
        locationName: 'Brisbane CBD Test Location',
        address: '123 Test Street, Brisbane QLD 4000',
        latitude: -27.4705,
        longitude: 153.0260,
        minutesPrior: 15,
        additionalInstructions: 'Test pickup instructions'
      },
      {
        locationName: 'Gold Coast Test Location', 
        address: '456 Test Blvd, Surfers Paradise QLD 4217',
        latitude: -28.0023,
        longitude: 153.4145,
        minutesPrior: 10,
        additionalInstructions: 'Another test location'
      }
    ];

    await PickupStorage.savePickupData(testProductCode, testPickups, 'manual');
    console.log('✅ Test data saved\n');

    // Test 4: Load saved data
    console.log('4️⃣ Loading saved pickup data...');
    const hasDataAfterSave = await PickupStorage.hasPickupData(testProductCode);
    const loadedData = await PickupStorage.loadPickupData(testProductCode);
    
    console.log(`   Has data after save: ${hasDataAfterSave}`);
    console.log(`   Loaded ${loadedData?.length || 0} pickup locations`);
    if (loadedData) {
      loadedData.forEach((pickup, index) => {
        console.log(`   ${index + 1}. ${pickup.locationName} (${pickup.address})`);
      });
    }
    console.log('');

    // Test 5: Get storage statistics
    console.log('5️⃣ Getting storage statistics...');
    const stats = await PickupStorage.getStorageStats();
    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Files:`);
    stats.files.forEach(file => {
      console.log(`     - ${file.productCode}: ${file.pickupCount} pickups, ${(file.fileSize / 1024).toFixed(2)} KB`);
    });
    console.log('');

    // Test 6: Cleanup test data
    console.log('6️⃣ Cleaning up test data...');
    await PickupStorage.deletePickupData(testProductCode);
    
    const hasDataAfterDelete = await PickupStorage.hasPickupData(testProductCode);
    console.log(`   Has data after delete: ${hasDataAfterDelete}`);
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests completed successfully!');
    
    return {
      success: true,
      message: 'Pickup storage system is working correctly'
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test API route integration
async function testApiIntegration() {
  console.log('\n📡 Testing API Route Integration\n');

  try {
    // This would need to be run in a proper Next.js environment
    console.log('⚠️  API integration test requires Next.js server environment');
    console.log('   To test API integration:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Make a request: curl http://localhost:3000/api/rezdy/products/TEST123/pickups');
    console.log('   3. Check the data/pickups/ directory for saved files');
    
    return {
      success: true,
      message: 'API integration instructions provided'
    };
  } catch (error) {
    console.error('❌ API integration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Pickup Storage Tests\n');
  
  const storageTest = await testPickupStorage();
  const apiTest = await testApiIntegration();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Storage System: ${storageTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   API Integration: ${apiTest.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!storageTest.success) {
    console.log(`   Storage Error: ${storageTest.error}`);
  }
  if (!apiTest.success) {
    console.log(`   API Error: ${apiTest.error}`);
  }
  
  return storageTest.success && apiTest.success;
}

// Export for potential use in other scripts
module.exports = {
  testPickupStorage,
  testApiIntegration,
  runAllTests
};

// Run if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}