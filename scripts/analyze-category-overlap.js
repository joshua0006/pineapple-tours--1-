#!/usr/bin/env node

// Script to analyze which products appear in multiple categories
// This helps identify why some products are showing up in all category pages

const path = require('path');
const fs = require('fs');

// Read the environment file directly
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const API_KEY = envVars.REZDY_API_KEY || envVars.NEXT_PUBLIC_REZDY_API_KEY;
const REZDY_BASE_URL = 'https://api.rezdy.com/v1';

// Define the category definitions inline (copied from the constants file)
const TOUR_CATEGORIES = [
  {
    id: "winery-tours",
    title: "Winery Tours",
    keywords: ["winery", "wine", "vineyard", "cellar", "vintage", "wine tasting", "wine tour"],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "GIFT_CARD", "CUSTOM"]
  },
  {
    id: "brewery-tours",
    title: "Brewery Tours",
    keywords: ["brewery", "beer", "craft beer", "brewing", "ale", "lager", "beer tasting", "brewery tour"],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "CUSTOM"]
  },
  {
    id: "hop-on-hop-off",
    title: "Hop-On Hop-Off",
    keywords: ["hop-on", "hop off", "hop on hop off", "sightseeing bus", "city tour bus", "tourist bus"],
    productTypes: ["CUSTOM", "TRANSFER", "ACTIVITY"]
  },
  {
    id: "bus-charter",
    title: "Bus Charter",
    keywords: ["bus charter", "charter bus", "private bus", "group transport", "coach charter"],
    productTypes: ["CHARTER", "CUSTOM"]
  },
  {
    id: "day-tours",
    title: "Day Tours",
    keywords: ["day tour", "full day", "day trip", "day excursion", "all day", "daily tour"],
    productTypes: ["DAYTOUR", "GIFT_CARD"]
  },
  {
    id: "corporate-tours",
    title: "Corporate Tours",
    keywords: ["corporate", "business", "team building", "company", "corporate event", "business tour"],
    productTypes: ["DAYTOUR", "CHARTER", "CUSTOM"]
  },
  {
    id: "barefoot-luxury",
    title: "Barefoot Luxury",
    keywords: ["barefoot luxury", "luxury", "premium", "exclusive", "vip", "high-end", "upscale"],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "GIFT_CARD"]
  },
  {
    id: "hens-party",
    title: "Hens Party",
    keywords: ["hens party", "hen party", "bachelorette", "bridal party", "girls night", "ladies night", "celebration"],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "CUSTOM"]
  }
];

async function fetchProducts() {
  const url = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=100`;
  
  console.log('🔄 Fetching products from Rezdy...');
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  
  const data = await response.json();
  return data.products || [];
}

function doesProductMatchCategory(product, category) {
  const searchText = `${product.name || ""} ${product.shortDescription || ""} ${product.description || ""}`.toLowerCase();
  const productTypeUpper = product.productType?.toUpperCase() || "";
  
  // Check keyword match
  const keywordMatch = category.keywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
  
  // Check product type match
  const productTypeMatch = category.productTypes.some(type => 
    productTypeUpper === type
  );
  
  return {
    matches: keywordMatch || productTypeMatch,
    keywordMatch,
    productTypeMatch,
    matchedKeywords: category.keywords.filter(keyword => 
      searchText.includes(keyword.toLowerCase())
    ),
    matchedType: productTypeMatch ? productTypeUpper : null
  };
}

async function analyzeProductCategoryOverlap() {
  try {
    const products = await fetchProducts();
    console.log(`\n📊 Analyzing ${products.length} products...\n`);
    
    // Analyze each product
    const productAnalysis = products.map(product => {
      const categoriesMatched = [];
      
      TOUR_CATEGORIES.forEach(category => {
        const matchResult = doesProductMatchCategory(product, category);
        if (matchResult.matches) {
          categoriesMatched.push({
            categoryId: category.id,
            categoryTitle: category.title,
            ...matchResult
          });
        }
      });
      
      return {
        productCode: product.productCode,
        productName: product.name,
        productType: product.productType,
        categoriesMatched,
        categoryCount: categoriesMatched.length
      };
    });
    
    // Find products that appear in multiple categories
    const multiCategoryProducts = productAnalysis
      .filter(p => p.categoryCount > 1)
      .sort((a, b) => b.categoryCount - a.categoryCount);
    
    console.log(`\n🚨 Products appearing in multiple categories:`);
    console.log(`Found ${multiCategoryProducts.length} products in 2+ categories\n`);
    
    // Show top 10 most problematic products
    multiCategoryProducts.slice(0, 10).forEach(product => {
      console.log(`\n📦 ${product.productName}`);
      console.log(`   Code: ${product.productCode}`);
      console.log(`   Type: ${product.productType}`);
      console.log(`   Appears in ${product.categoryCount} categories:`);
      
      product.categoriesMatched.forEach(cat => {
        console.log(`   - ${cat.categoryTitle}:`);
        if (cat.keywordMatch) {
          console.log(`     Keywords: ${cat.matchedKeywords.join(', ')}`);
        }
        if (cat.productTypeMatch) {
          console.log(`     Type match: ${cat.matchedType}`);
        }
      });
    });
    
    // Summary statistics
    console.log(`\n📈 Summary Statistics:`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Products in 1 category: ${productAnalysis.filter(p => p.categoryCount === 1).length}`);
    console.log(`   Products in 2+ categories: ${multiCategoryProducts.length}`);
    console.log(`   Products in 3+ categories: ${multiCategoryProducts.filter(p => p.categoryCount >= 3).length}`);
    console.log(`   Products in 4+ categories: ${multiCategoryProducts.filter(p => p.categoryCount >= 4).length}`);
    console.log(`   Products in 5+ categories: ${multiCategoryProducts.filter(p => p.categoryCount >= 5).length}`);
    
    // Category overlap by product type
    console.log(`\n🏷️ Category overlap by product type:`);
    const typeStats = {};
    productAnalysis.forEach(p => {
      const type = p.productType || 'UNKNOWN';
      if (!typeStats[type]) {
        typeStats[type] = {
          total: 0,
          multiCategory: 0,
          avgCategories: 0,
          categoryList: new Set()
        };
      }
      typeStats[type].total++;
      if (p.categoryCount > 1) {
        typeStats[type].multiCategory++;
      }
      typeStats[type].avgCategories += p.categoryCount;
      p.categoriesMatched.forEach(cat => {
        typeStats[type].categoryList.add(cat.categoryTitle);
      });
    });
    
    Object.entries(typeStats).forEach(([type, stats]) => {
      stats.avgCategories = (stats.avgCategories / stats.total).toFixed(1);
      console.log(`\n   ${type}:`);
      console.log(`     Total products: ${stats.total}`);
      console.log(`     Multi-category products: ${stats.multiCategory} (${((stats.multiCategory/stats.total)*100).toFixed(0)}%)`);
      console.log(`     Average categories per product: ${stats.avgCategories}`);
      console.log(`     Appears in: ${Array.from(stats.categoryList).join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the analysis
analyzeProductCategoryOverlap();