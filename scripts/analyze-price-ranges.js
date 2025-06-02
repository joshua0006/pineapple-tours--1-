const fs = require('fs');

// Configuration - use local API endpoint
const LOCAL_API_BASE = 'http://localhost:3000/api';

async function fetchAllProducts() {
  const allProducts = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  console.log('Fetching all products from local API...');

  while (hasMore) {
    try {
      const url = `${LOCAL_API_BASE}/rezdy/products?limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        allProducts.push(...data.products);
        console.log(`Fetched ${data.products.length} products (offset: ${offset})`);
        offset += limit;
        
        // Check if we have more products to fetch
        hasMore = data.products.length === limit;
      } else {
        hasMore = false;
      }
      
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error fetching products at offset ${offset}:`, error);
      hasMore = false;
    }
  }

  console.log(`Total products fetched: ${allProducts.length}`);
  return allProducts;
}

function analyzePriceRanges(products) {
  console.log('\n=== PRICE RANGE ANALYSIS ===\n');
  
  // Filter products with valid prices
  const productsWithPrices = products.filter(product => 
    product.advertisedPrice && 
    typeof product.advertisedPrice === 'number' && 
    product.advertisedPrice > 0
  );

  console.log(`Products with valid prices: ${productsWithPrices.length} out of ${products.length}`);
  
  if (productsWithPrices.length === 0) {
    console.log('No products with valid prices found.');
    return;
  }

  // Extract and sort prices
  const prices = productsWithPrices
    .map(product => product.advertisedPrice)
    .sort((a, b) => a - b);

  // Calculate statistics
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const median = prices[Math.floor(prices.length / 2)];

  console.log(`\nPrice Statistics:`);
  console.log(`- Minimum: $${min.toFixed(2)}`);
  console.log(`- Maximum: $${max.toFixed(2)}`);
  console.log(`- Mean: $${mean.toFixed(2)}`);
  console.log(`- Median: $${median.toFixed(2)}`);

  // Calculate percentiles
  const percentiles = [10, 25, 50, 75, 90, 95, 99];
  console.log(`\nPercentiles:`);
  percentiles.forEach(p => {
    const index = Math.floor((p / 100) * prices.length);
    const value = prices[Math.min(index, prices.length - 1)];
    console.log(`- ${p}th percentile: $${value.toFixed(2)}`);
  });

  // Analyze current price ranges
  console.log(`\n=== CURRENT PRICE RANGE ANALYSIS ===`);
  const currentRanges = {
    'under-500': prices.filter(p => p < 500).length,
    '500-1000': prices.filter(p => p >= 500 && p < 1000).length,
    '1000-2000': prices.filter(p => p >= 1000 && p < 2000).length,
    'over-2000': prices.filter(p => p >= 2000).length
  };

  console.log(`Current range distribution:`);
  Object.entries(currentRanges).forEach(([range, count]) => {
    const percentage = ((count / prices.length) * 100).toFixed(1);
    console.log(`- ${range}: ${count} products (${percentage}%)`);
  });

  // Suggest optimal price ranges based on quartiles
  console.log(`\n=== SUGGESTED OPTIMAL PRICE RANGES ===`);
  
  const q1 = prices[Math.floor(prices.length * 0.25)];
  const q2 = prices[Math.floor(prices.length * 0.50)];
  const q3 = prices[Math.floor(prices.length * 0.75)];
  
  console.log(`Based on quartiles:`);
  console.log(`- Budget: Under $${Math.ceil(q1)} (25% of products)`);
  console.log(`- Mid-range: $${Math.ceil(q1)} - $${Math.ceil(q2)} (25% of products)`);
  console.log(`- Premium: $${Math.ceil(q2)} - $${Math.ceil(q3)} (25% of products)`);
  console.log(`- Luxury: Over $${Math.ceil(q3)} (25% of products)`);

  // Alternative suggestion based on natural breaks
  console.log(`\nBased on natural price breaks:`);
  const naturalBreaks = findNaturalBreaks(prices, 4);
  console.log(`- Budget: Under $${naturalBreaks[0]}`);
  console.log(`- Mid-range: $${naturalBreaks[0]} - $${naturalBreaks[1]}`);
  console.log(`- Premium: $${naturalBreaks[1]} - $${naturalBreaks[2]}`);
  console.log(`- Luxury: Over $${naturalBreaks[2]}`);

  // Generate price distribution histogram
  console.log(`\n=== PRICE DISTRIBUTION ===`);
  const bucketSize = 100;
  const buckets = {};
  
  prices.forEach(price => {
    const bucket = Math.floor(price / bucketSize) * bucketSize;
    const bucketKey = `$${bucket}-${bucket + bucketSize - 1}`;
    buckets[bucketKey] = (buckets[bucketKey] || 0) + 1;
  });

  console.log(`Price distribution (by $${bucketSize} buckets):`);
  Object.entries(buckets)
    .sort(([a], [b]) => parseInt(a.split('-')[0].slice(1)) - parseInt(b.split('-')[0].slice(1)))
    .forEach(([range, count]) => {
      const percentage = ((count / prices.length) * 100).toFixed(1);
      const bar = '█'.repeat(Math.ceil(count / prices.length * 50));
      console.log(`${range.padEnd(15)}: ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
    });

  // Save detailed analysis to file
  const analysis = {
    totalProducts: products.length,
    productsWithPrices: productsWithPrices.length,
    priceStatistics: {
      min,
      max,
      mean,
      median
    },
    percentiles: percentiles.reduce((acc, p) => {
      const index = Math.floor((p / 100) * prices.length);
      acc[`p${p}`] = prices[Math.min(index, prices.length - 1)];
      return acc;
    }, {}),
    currentRangeDistribution: currentRanges,
    suggestedRanges: {
      quartileBased: {
        budget: { max: Math.ceil(q1), label: `Under $${Math.ceil(q1)}` },
        midRange: { min: Math.ceil(q1), max: Math.ceil(q2), label: `$${Math.ceil(q1)} - $${Math.ceil(q2)}` },
        premium: { min: Math.ceil(q2), max: Math.ceil(q3), label: `$${Math.ceil(q2)} - $${Math.ceil(q3)}` },
        luxury: { min: Math.ceil(q3), label: `Over $${Math.ceil(q3)}` }
      },
      naturalBreaks: {
        budget: { max: naturalBreaks[0], label: `Under $${naturalBreaks[0]}` },
        midRange: { min: naturalBreaks[0], max: naturalBreaks[1], label: `$${naturalBreaks[0]} - $${naturalBreaks[1]}` },
        premium: { min: naturalBreaks[1], max: naturalBreaks[2], label: `$${naturalBreaks[1]} - $${naturalBreaks[2]}` },
        luxury: { min: naturalBreaks[2], label: `Over $${naturalBreaks[2]}` }
      }
    },
    priceDistribution: buckets,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('price-analysis.json', JSON.stringify(analysis, null, 2));
  console.log(`\nDetailed analysis saved to price-analysis.json`);

  return analysis;
}

function findNaturalBreaks(prices, numBreaks) {
  // Simple implementation of natural breaks (Jenks)
  // For a more sophisticated implementation, we'd use the actual Jenks algorithm
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const breaks = [];
  
  for (let i = 1; i < numBreaks; i++) {
    const index = Math.floor((i / numBreaks) * sortedPrices.length);
    breaks.push(Math.ceil(sortedPrices[index]));
  }
  
  return breaks;
}

// Main execution
async function main() {
  try {
    console.log('Starting price range analysis...');
    console.log('Make sure the development server is running on http://localhost:3000');
    
    const products = await fetchAllProducts();
    const analysis = analyzePriceRanges(products);
    
    console.log(`\n=== RECOMMENDED IMPLEMENTATION ===`);
    console.log(`\nUpdate your price range dropdowns with these optimized ranges:`);
    
    if (analysis && analysis.suggestedRanges) {
      const ranges = analysis.suggestedRanges.quartileBased;
      console.log(`\nQuartile-based ranges (recommended):`);
      console.log(`- Budget: ${ranges.budget.label}`);
      console.log(`- Mid-range: ${ranges.midRange.label}`);
      console.log(`- Premium: ${ranges.premium.label}`);
      console.log(`- Luxury: ${ranges.luxury.label}`);
      
      console.log(`\n=== CODE UPDATES NEEDED ===`);
      console.log(`\nUpdate the following files with the new price ranges:`);
      console.log(`1. app/tours/page.tsx - getFilterDisplayName function`);
      console.log(`2. app/search/page.tsx - getFilterDisplayName function`);
      console.log(`3. app/api/search/route.ts - price range filter logic`);
      console.log(`4. components/enhanced-search-form.tsx - price range options`);
      
      console.log(`\nNew price range values:`);
      console.log(`- under-${ranges.budget.max}: '${ranges.budget.label}'`);
      console.log(`- ${ranges.budget.max}-${ranges.midRange.max}: '${ranges.midRange.label}'`);
      console.log(`- ${ranges.midRange.max}-${ranges.premium.max}: '${ranges.premium.label}'`);
      console.log(`- over-${ranges.premium.max}: '${ranges.luxury.label}'`);
    }
    
  } catch (error) {
    console.error('Error in main execution:', error);
    console.log('\nMake sure:');
    console.log('1. The development server is running (npm run dev)');
    console.log('2. The Rezdy API is properly configured');
    console.log('3. You have internet connectivity');
    process.exit(1);
  }
}

// Run the analysis
main(); 