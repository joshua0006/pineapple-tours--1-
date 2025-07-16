#!/usr/bin/env node

/**
 * Bulk Pickup Data Fetcher
 * 
 * This script fetches pickup location data for all active tour products
 * and saves them to the local file storage for improved performance.
 * 
 * Usage:
 *   node scripts/bulk-fetch-pickup-data.js [--force] [--product-code=CODE] [--dry-run]
 * 
 * Options:
 *   --force: Refresh existing cached data
 *   --product-code=CODE: Fetch data for specific product only
 *   --dry-run: Show what would be fetched without making API calls
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  REZDY_BASE_URL: 'https://api.rezdy.com/v1',
  API_KEY: "5d306fa86b9e4bc5b8c1692ed2a95069",
  RATE_LIMIT_DELAY: 600, // 600ms between requests
  DATA_DIR: path.join(__dirname, '../data/pickups'),
  PRODUCTS_FILE: path.join(__dirname, '../tours-only-products.json'),
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run'),
  productCode: args.find(arg => arg.startsWith('--product-code='))?.split('=')[1],
};

// Rate limiting state
let lastRequestTime = 0;

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Apply rate limiting before making API request
 */
const rateLimitedDelay = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < CONFIG.RATE_LIMIT_DELAY) {
    const waitTime = CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest;
    console.log(`  ⏳ Rate limiting: waiting ${waitTime}ms...`);
    await sleep(waitTime);
  }
  lastRequestTime = Date.now();
};

/**
 * Fetch pickup data from Rezdy API with retry logic
 */
const fetchPickupData = async (productCode, retryCount = 0) => {
  if (!CONFIG.API_KEY) {
    throw new Error('REZDY_API_KEY environment variable not set');
  }

  try {
    await rateLimitedDelay();

    const url = `${CONFIG.REZDY_BASE_URL}/products/${productCode}/pickups?apiKey=${CONFIG.API_KEY}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Product has no pickup locations
        return [];
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.pickupLocations || [];
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`  ⚠️ Error fetching ${productCode} (attempt ${retryCount + 1}): ${error.message}`);
      console.log(`  🔄 Retrying in ${CONFIG.RETRY_DELAY}ms...`);
      await sleep(CONFIG.RETRY_DELAY);
      return fetchPickupData(productCode, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Save pickup data to local file storage
 */
const savePickupData = async (productCode, pickups) => {
  // Sanitize product code for filename
  const sanitizedCode = productCode.replace(/[^a-zA-Z0-9]/g, '_');
  const filePath = path.join(CONFIG.DATA_DIR, `${sanitizedCode}.json`);

  const data = {
    productCode,
    pickups,
    fetchedAt: new Date().toISOString(),
    source: 'rezdy_api',
    lastAccessed: new Date().toISOString(),
    accessCount: 1,
  };

  // Ensure directory exists
  await fs.mkdir(CONFIG.DATA_DIR, { recursive: true });
  
  // Write file
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  
  return filePath;
};

/**
 * Check if pickup data already exists for a product
 */
const hasExistingData = async (productCode) => {
  const sanitizedCode = productCode.replace(/[^a-zA-Z0-9]/g, '_');
  const filePath = path.join(CONFIG.DATA_DIR, `${sanitizedCode}.json`);
  
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Load product codes from tours-only-products.json
 */
const loadProductCodes = async () => {
  try {
    const data = await fs.readFile(CONFIG.PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    return products.map(product => product.productCode);
  } catch (error) {
    console.error('❌ Error loading product codes:', error.message);
    console.log('💡 Falling back to existing cached product codes...');
    
    // Fallback: scan existing files in data/pickups
    try {
      const files = await fs.readdir(CONFIG.DATA_DIR);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch {
      throw new Error('No product codes available and no cached data found');
    }
  }
};

/**
 * Display progress statistics
 */
const displayProgress = (current, total, successes, failures, hasPickups) => {
  const percentage = ((current / total) * 100).toFixed(1);
  const pickupRate = current > 0 ? ((hasPickups / current) * 100).toFixed(1) : 0;
  
  console.log(`\n📊 Progress: ${current}/${total} (${percentage}%)`);
  console.log(`✅ Successes: ${successes} | ❌ Failures: ${failures} | 📍 Has Pickups: ${hasPickups} (${pickupRate}%)`);
};

/**
 * Main execution function
 */
const main = async () => {
  console.log('🚀 Bulk Pickup Data Fetcher\n');
  
  // Load product codes
  console.log('📋 Loading product codes...');
  let productCodes;
  
  if (options.productCode) {
    productCodes = [options.productCode];
    console.log(`🎯 Single product mode: ${options.productCode}`);
  } else {
    productCodes = await loadProductCodes();
    console.log(`📦 Found ${productCodes.length} products`);
  }

  // Filter products based on options
  const productsToFetch = [];
  let alreadyCached = 0;

  for (const productCode of productCodes) {
    const hasData = await hasExistingData(productCode);
    
    if (hasData && !options.force) {
      alreadyCached++;
    } else {
      productsToFetch.push({ productCode, isUpdate: hasData });
    }
  }

  console.log(`\n📊 Status Summary:`);
  console.log(`✅ Already cached: ${alreadyCached}`);
  console.log(`🆕 To fetch: ${productsToFetch.filter(p => !p.isUpdate).length}`);
  console.log(`🔄 To update: ${productsToFetch.filter(p => p.isUpdate).length}`);
  console.log(`📝 Total operations: ${productsToFetch.length}`);

  if (options.dryRun) {
    console.log('\n🔍 Dry run mode - showing what would be processed:');
    productsToFetch.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productCode} (${product.isUpdate ? 'update' : 'new'})`);
    });
    return;
  }

  if (productsToFetch.length === 0) {
    console.log('\n🎉 All products already have cached pickup data!');
    console.log('💡 Use --force to refresh existing data');
    return;
  }

  // Confirm before proceeding
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirm = await new Promise(resolve => {
    rl.question(`\n❓ Proceed with fetching ${productsToFetch.length} products? This will take ~${Math.ceil(productsToFetch.length * CONFIG.RATE_LIMIT_DELAY / 1000)}s (y/N): `, resolve);
  });
  rl.close();

  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('❌ Operation cancelled');
    return;
  }

  // Process products
  console.log('\n🔄 Starting bulk fetch...\n');
  
  let successes = 0;
  let failures = 0;
  let hasPickupsCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < productsToFetch.length; i++) {
    const { productCode, isUpdate } = productsToFetch[i];
    
    try {
      console.log(`\n${i + 1}/${productsToFetch.length} Processing ${productCode} ${isUpdate ? '(update)' : '(new)'}...`);
      
      const pickups = await fetchPickupData(productCode);
      const filePath = await savePickupData(productCode, pickups);
      
      if (pickups.length > 0) {
        hasPickupsCount++;
        console.log(`  ✅ Saved ${pickups.length} pickup locations to ${path.basename(filePath)}`);
      } else {
        console.log(`  ℹ️ No pickup locations found for ${productCode}`);
      }
      
      successes++;
    } catch (error) {
      console.log(`  ❌ Failed to fetch ${productCode}: ${error.message}`);
      failures++;
    }

    // Show progress every 10 items or at the end
    if ((i + 1) % 10 === 0 || i === productsToFetch.length - 1) {
      displayProgress(i + 1, productsToFetch.length, successes, failures, hasPickupsCount);
    }
  }

  // Final summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgTime = (totalTime / productsToFetch.length).toFixed(1);
  
  console.log('\n🎉 Bulk fetch completed!\n');
  console.log('📈 Final Summary:');
  console.log(`⏱️ Total time: ${totalTime}s (avg: ${avgTime}s per product)`);
  console.log(`✅ Successful fetches: ${successes}`);
  console.log(`❌ Failed fetches: ${failures}`);
  console.log(`📍 Products with pickup locations: ${hasPickupsCount}`);
  console.log(`📊 Success rate: ${((successes / productsToFetch.length) * 100).toFixed(1)}%`);
  console.log(`📍 Pickup location rate: ${((hasPickupsCount / successes) * 100).toFixed(1)}%`);

  if (failures > 0) {
    console.log('\n⚠️ Some products failed to fetch. Consider running again with --force to retry.');
  } else {
    console.log('\n🚀 All pickup location data has been successfully cached!');
    console.log('💡 Your search form should now load much faster.');
  }
};

// Run the script
main().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});