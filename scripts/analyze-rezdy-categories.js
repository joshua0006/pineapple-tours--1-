const fs = require('fs');
const path = require('path');

// Try to load environment variables from .env.local if it exists
let API_KEY = process.env.REZDY_API_KEY;

// If no API key in environment, try to read from .env.local file
if (!API_KEY) {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/REZDY_API_KEY=(.+)/);
      if (match) {
        API_KEY = match[1].trim();
      }
    }
  } catch (error) {
    console.log('Could not read .env.local file');
  }
}

const REZDY_BASE_URL = 'https://api.rezdy.com/v1';

// Categories to analyze
const TARGET_CATEGORIES = [
  'Winery Tours',
  'Brewery Tours', 
  'Hop-On Hop-Off',
  'Bus Charter',
  'Day Tours',
  'Corporate Tours',
  'Hens Party',
  'Barefoot Luxury'
];

// Keywords to search for in product data
const CATEGORY_KEYWORDS = {
  'Winery Tours': ['winery', 'wine', 'vineyard', 'cellar', 'vintage', 'wine tasting', 'wine tour'],
  'Brewery Tours': ['brewery', 'beer', 'craft beer', 'brewing', 'ale', 'lager', 'beer tasting', 'brewery tour'],
  'Hop-On Hop-Off': ['hop-on', 'hop off', 'hop on hop off', 'sightseeing bus', 'city tour bus', 'tourist bus'],
  'Bus Charter': ['bus charter', 'charter bus', 'private bus', 'group transport', 'coach charter'],
  'Day Tours': ['day tour', 'full day', 'day trip', 'day excursion', 'all day', 'daily tour'],
  'Corporate Tours': ['corporate', 'business', 'team building', 'company', 'corporate event', 'business tour'],
  'Hens Party': ['hens party', 'hen party', 'bachelorette', 'bridal party', 'girls night', 'ladies night'],
  'Barefoot Luxury': ['barefoot luxury', 'luxury', 'premium', 'exclusive', 'vip', 'high-end', 'upscale']
};

async function fetchAllProducts() {
  if (!API_KEY) {
    console.error('❌ REZDY_API_KEY not found in environment variables or .env.local file');
    console.log('💡 Please set REZDY_API_KEY in your environment or .env.local file');
    return null;
  }

  try {
    console.log('🔍 Fetching products from Rezdy API...');
    
    const url = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=1000&offset=0`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const products = data.products || data.data || [];
    
    console.log(`✅ Successfully fetched ${products.length} products`);
    return products;
    
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    return null;
  }
}

function analyzeProductForCategory(product, category, keywords) {
  const searchText = [
    product.name || '',
    product.shortDescription || '',
    product.description || '',
    product.productType || '',
    ...(product.categories || [])
  ].join(' ').toLowerCase();

  const matchedKeywords = keywords.filter(keyword => 
    searchText.includes(keyword.toLowerCase())
  );

  return {
    matches: matchedKeywords.length > 0,
    matchedKeywords,
    confidence: matchedKeywords.length / keywords.length
  };
}

function categorizeProducts(products) {
  const results = {
    summary: {},
    detailed: {},
    productTypes: new Set(),
    allCategories: new Set()
  };

  // Initialize results structure
  TARGET_CATEGORIES.forEach(category => {
    results.summary[category] = {
      count: 0,
      products: []
    };
    results.detailed[category] = [];
  });

  // Analyze each product
  products.forEach(product => {
    // Track product types and categories
    if (product.productType) {
      results.productTypes.add(product.productType);
    }
    if (product.categories) {
      product.categories.forEach(cat => results.allCategories.add(cat));
    }

    // Check against each target category
    TARGET_CATEGORIES.forEach(category => {
      const keywords = CATEGORY_KEYWORDS[category];
      const analysis = analyzeProductForCategory(product, category, keywords);
      
      if (analysis.matches) {
        results.summary[category].count++;
        results.summary[category].products.push({
          productCode: product.productCode,
          name: product.name,
          productType: product.productType,
          price: product.advertisedPrice
        });
        
        results.detailed[category].push({
          product: {
            productCode: product.productCode,
            name: product.name,
            shortDescription: product.shortDescription,
            productType: product.productType,
            categories: product.categories,
            price: product.advertisedPrice
          },
          analysis: {
            matchedKeywords: analysis.matchedKeywords,
            confidence: analysis.confidence
          }
        });
      }
    });
  });

  // Convert Sets to Arrays for JSON serialization
  results.productTypes = Array.from(results.productTypes).sort();
  results.allCategories = Array.from(results.allCategories).sort();

  return results;
}

function generateReport(results, totalProducts) {
  console.log('\n📊 REZDY PRODUCT CATEGORIZATION ANALYSIS');
  console.log('=' .repeat(50));
  
  console.log(`\n📈 OVERVIEW:`);
  console.log(`Total products analyzed: ${totalProducts}`);
  console.log(`Unique product types: ${results.productTypes.length}`);
  console.log(`Unique categories: ${results.allCategories.length}`);
  
  console.log(`\n🏷️  PRODUCT TYPES FOUND:`);
  results.productTypes.forEach(type => {
    console.log(`  • ${type}`);
  });
  
  if (results.allCategories.length > 0) {
    console.log(`\n📂 EXISTING CATEGORIES:`);
    results.allCategories.forEach(cat => {
      console.log(`  • ${cat}`);
    });
  }
  
  console.log(`\n🎯 TARGET CATEGORY ANALYSIS:`);
  TARGET_CATEGORIES.forEach(category => {
    const count = results.summary[category].count;
    const percentage = ((count / totalProducts) * 100).toFixed(1);
    const status = count > 0 ? '✅' : '❌';
    
    console.log(`${status} ${category}: ${count} products (${percentage}%)`);
    
    if (count > 0) {
      console.log(`   Keywords found: ${CATEGORY_KEYWORDS[category].join(', ')}`);
      results.summary[category].products.slice(0, 3).forEach(product => {
        console.log(`   • ${product.name} (${product.productCode})`);
      });
      if (count > 3) {
        console.log(`   ... and ${count - 3} more`);
      }
    }
  });
  
  console.log(`\n💡 RECOMMENDATIONS:`);
  const foundCategories = TARGET_CATEGORIES.filter(cat => results.summary[cat].count > 0);
  const missingCategories = TARGET_CATEGORIES.filter(cat => results.summary[cat].count === 0);
  
  if (foundCategories.length > 0) {
    console.log(`✅ Can filter by: ${foundCategories.join(', ')}`);
  }
  
  if (missingCategories.length > 0) {
    console.log(`❌ Cannot filter by: ${missingCategories.join(', ')}`);
    console.log(`   These categories have no matching products in the current dataset.`);
  }
}

async function main() {
  console.log('🍍 Pineapple Tours - Rezdy Category Analysis');
  console.log('Analyzing if products can be categorized by specific terms...\n');
  
  const products = await fetchAllProducts();
  
  if (!products) {
    console.error('❌ Failed to fetch products. Exiting.');
    return;
  }
  
  if (products.length === 0) {
    console.log('⚠️  No products found in Rezdy API response.');
    return;
  }
  
  console.log('🔍 Analyzing products for target categories...');
  const results = categorizeProducts(products);
  
  // Generate and display report
  generateReport(results, products.length);
  
  // Save detailed results to file
  const outputFile = path.join(__dirname, '..', 'rezdy-category-analysis.json');
  const outputData = {
    timestamp: new Date().toISOString(),
    totalProducts: products.length,
    targetCategories: TARGET_CATEGORIES,
    keywords: CATEGORY_KEYWORDS,
    results: results
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Detailed analysis saved to: ${outputFile}`);
  
  // Save sample products for each found category
  const samplesFile = path.join(__dirname, '..', 'rezdy-category-samples.json');
  const samples = {};
  TARGET_CATEGORIES.forEach(category => {
    if (results.summary[category].count > 0) {
      samples[category] = results.detailed[category].slice(0, 5); // Top 5 matches
    }
  });
  
  fs.writeFileSync(samplesFile, JSON.stringify(samples, null, 2));
  console.log(`📋 Sample products saved to: ${samplesFile}`);
}

// Run the analysis
main().catch(console.error); 