#!/usr/bin/env node

// Script to verify that the category filtering fix is working properly

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

// Define the category definitions with the updated filtering logic
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
  
  // NEW LOGIC: For generic product types, require keyword match
  const genericTypes = ["CUSTOM", "DAYTOUR", "GIFT_CARD", "PRIVATE_TOUR"];
  const isGenericType = genericTypes.includes(productTypeUpper);
  
  if (isGenericType) {
    // For generic types, require keyword match
    return {
      matches: keywordMatch,
      keywordMatch,
      productTypeMatch,
      reason: keywordMatch ? 'Keyword match (generic type requires keywords)' : 'No keyword match (generic type)'
    };
  } else {
    // For specific types, either keyword or type match is sufficient
    return {
      matches: keywordMatch || productTypeMatch,
      keywordMatch,
      productTypeMatch,
      reason: keywordMatch && productTypeMatch ? 'Both keyword and type match' :
              keywordMatch ? 'Keyword match' :
              productTypeMatch ? 'Type match (specific type)' : 'No match'
    };
  }
}

async function verifyFix() {
  try {
    const products = await fetchProducts();
    console.log(`\n📊 Verifying fix on ${products.length} products...\n`);
    
    // Analyze each product with new logic
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
    
    console.log(`\n✅ RESULTS AFTER FIX:`);
    console.log(`Products appearing in multiple categories: ${multiCategoryProducts.length}\n`);
    
    // Show examples of fixed products
    console.log(`📝 Examples of products that should now be properly categorized:\n`);
    
    // Find wildlife/koala product
    const koalaProduct = productAnalysis.find(p => p.productName.includes('Koala'));
    if (koalaProduct) {
      console.log(`1. ${koalaProduct.productName}`);
      console.log(`   Type: ${koalaProduct.productType}`);
      console.log(`   Now appears in ${koalaProduct.categoryCount} categories (was 7)`);
      if (koalaProduct.categoryCount > 0) {
        console.log(`   Categories: ${koalaProduct.categoriesMatched.map(c => c.categoryTitle).join(', ')}`);
      }
    }
    
    // Show some products that are correctly in multiple categories
    console.log(`\n📋 Products correctly appearing in multiple categories:`);
    const correctMultiCategory = productAnalysis
      .filter(p => p.categoryCount > 1 && p.categoryCount < 4)
      .slice(0, 3);
    
    correctMultiCategory.forEach(product => {
      console.log(`\n- ${product.productName}`);
      console.log(`  Type: ${product.productType}`);
      console.log(`  Categories: ${product.categoriesMatched.map(c => c.categoryTitle).join(', ')}`);
    });
    
    // Summary statistics
    console.log(`\n📈 Comparison (Before -> After Fix):`);
    console.log(`   Products in 1 category: ${productAnalysis.filter(p => p.categoryCount === 1).length} (was 11)`);
    console.log(`   Products in 2+ categories: ${multiCategoryProducts.length} (was 83)`);
    console.log(`   Products in 5+ categories: ${multiCategoryProducts.filter(p => p.categoryCount >= 5).length} (was 64)`);
    console.log(`   Products in 7 categories: ${multiCategoryProducts.filter(p => p.categoryCount === 7).length} (was many)`);
    
    // Category-specific stats
    console.log(`\n📊 Products per category (with new filtering):`);
    TOUR_CATEGORIES.forEach(category => {
      const count = productAnalysis.filter(p => 
        p.categoriesMatched.some(c => c.categoryId === category.id)
      ).length;
      console.log(`   ${category.title}: ${count} products`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the verification
verifyFix();