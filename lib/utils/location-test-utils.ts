import { RezdyProduct } from '@/lib/types/rezdy';
import { getCityFromLocation, getUniqueCitiesFromProducts, filterProductsByCity } from './product-utils';

/**
 * Test data for location extraction and filtering
 */
export const mockProducts: RezdyProduct[] = [
  {
    productCode: 'SYD001',
    name: 'Sydney Harbour Bridge Climb',
    locationAddress: 'Sydney Harbour Bridge, Sydney, NSW 2000, Australia',
    advertisedPrice: 250,
  },
  {
    productCode: 'MEL001',
    name: 'Melbourne Coffee Tour',
    locationAddress: {
      addressLine: '123 Collins Street',
      city: 'Melbourne',
      state: 'VIC',
      postCode: '3000',
      countryCode: 'AU',
    },
    advertisedPrice: 80,
  },
  {
    productCode: 'BRI001',
    name: 'Brisbane River Cruise',
    locationAddress: 'South Bank, Brisbane, QLD 4101',
    advertisedPrice: 45,
  },
  {
    productCode: 'SYD002',
    name: 'Sydney Opera House Tour',
    locationAddress: {
      addressLine: 'Bennelong Point',
      city: 'Sydney',
      state: 'NSW',
      postCode: '2000',
      countryCode: 'AU',
    },
    advertisedPrice: 35,
  },
  {
    productCode: 'PER001',
    name: 'Perth Wine Tasting',
    locationAddress: 'Swan Valley, Perth, WA 6056',
    advertisedPrice: 120,
  },
];

/**
 * Test city extraction from various location formats
 */
export function testCityExtraction() {
  const testCases = [
    {
      input: 'Sydney Harbour Bridge, Sydney, NSW 2000, Australia',
      expected: 'Sydney',
      description: 'String format with multiple parts'
    },
    {
      input: { city: 'Melbourne', state: 'VIC' },
      expected: 'Melbourne',
      description: 'Object format with city field'
    },
    {
      input: 'Brisbane',
      expected: 'Brisbane',
      description: 'Single city name'
    },
    {
      input: '',
      expected: null,
      description: 'Empty string'
    },
    {
      input: null,
      expected: null,
      description: 'Null input'
    },
  ];

  console.log('🧪 Testing City Extraction:');
  
  testCases.forEach(({ input, expected, description }) => {
    const result = getCityFromLocation(input);
    const passed = result === expected;
    console.log(`${passed ? '✅' : '❌'} ${description}: ${input} → ${result} (expected: ${expected})`);
  });
}

/**
 * Test unique cities extraction from products
 */
export function testUniqueCitiesExtraction() {
  console.log('\n🧪 Testing Unique Cities Extraction:');
  
  const cities = getUniqueCitiesFromProducts(mockProducts);
  const expectedCities = ['Brisbane', 'Melbourne', 'Perth', 'Sydney'];
  
  console.log('Extracted cities:', cities);
  console.log('Expected cities:', expectedCities);
  
  const passed = JSON.stringify(cities.sort()) === JSON.stringify(expectedCities.sort());
  console.log(`${passed ? '✅' : '❌'} Unique cities extraction: ${passed ? 'PASSED' : 'FAILED'}`);
  
  return { cities, expectedCities, passed };
}

/**
 * Test product filtering by city
 */
export function testProductFiltering() {
  console.log('\n🧪 Testing Product Filtering by City:');
  
  const testCases = [
    {
      city: 'Sydney',
      expectedCount: 2,
      expectedCodes: ['SYD001', 'SYD002']
    },
    {
      city: 'Melbourne',
      expectedCount: 1,
      expectedCodes: ['MEL001']
    },
    {
      city: 'Brisbane',
      expectedCount: 1,
      expectedCodes: ['BRI001']
    },
    {
      city: 'Perth',
      expectedCount: 1,
      expectedCodes: ['PER001']
    },
    {
      city: 'Adelaide',
      expectedCount: 0,
      expectedCodes: []
    },
    {
      city: 'all',
      expectedCount: 5,
      expectedCodes: ['SYD001', 'MEL001', 'BRI001', 'SYD002', 'PER001']
    }
  ];

  testCases.forEach(({ city, expectedCount, expectedCodes }) => {
    const filtered = filterProductsByCity(mockProducts, city);
    const actualCodes = filtered.map(p => p.productCode).sort();
    const expectedCodesSorted = expectedCodes.sort();
    
    const countPassed = filtered.length === expectedCount;
    const codesPassed = JSON.stringify(actualCodes) === JSON.stringify(expectedCodesSorted);
    const passed = countPassed && codesPassed;
    
    console.log(`${passed ? '✅' : '❌'} Filter by "${city}": ${filtered.length} products (expected: ${expectedCount})`);
    if (!passed) {
      console.log(`   Actual codes: [${actualCodes.join(', ')}]`);
      console.log(`   Expected codes: [${expectedCodesSorted.join(', ')}]`);
    }
  });
}

/**
 * Test API parameter generation
 */
export function testAPIParameterGeneration() {
  console.log('\n🧪 Testing API Parameter Generation:');
  
  const testCases = [
    {
      filters: { city: 'Sydney', category: 'adventure' },
      expectedParams: 'city=Sydney&category=adventure',
      description: 'City and category filters'
    },
    {
      filters: { location: 'Melbourne', priceRange: '500-1000' },
      expectedParams: 'location=Melbourne&priceRange=500-1000',
      description: 'Location and price range filters'
    },
    {
      filters: { query: 'harbour bridge', city: 'Sydney' },
      expectedParams: 'query=harbour+bridge&city=Sydney',
      description: 'Query and city filters'
    }
  ];

  testCases.forEach(({ filters, expectedParams, description }) => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all' && value !== 'any') {
        searchParams.append(key, value.toString());
      }
    });
    
    const actualParams = searchParams.toString();
    const passed = actualParams === expectedParams;
    
    console.log(`${passed ? '✅' : '❌'} ${description}: ${actualParams}`);
    if (!passed) {
      console.log(`   Expected: ${expectedParams}`);
    }
  });
}

/**
 * Run all location filtering tests
 */
export function runAllLocationTests() {
  console.log('🚀 Running Location Filtering Tests\n');
  
  testCityExtraction();
  testUniqueCitiesExtraction();
  testProductFiltering();
  testAPIParameterGeneration();
  
  console.log('\n✨ Location filtering tests completed!');
}

/**
 * Validate real product data for location consistency
 */
export function validateProductLocationData(products: RezdyProduct[]) {
  console.log('\n🔍 Validating Real Product Location Data:');
  
  const stats = {
    total: products.length,
    withLocation: 0,
    withStringLocation: 0,
    withObjectLocation: 0,
    withValidCity: 0,
    uniqueCities: new Set<string>(),
    invalidLocations: [] as string[],
  };

  products.forEach(product => {
    if (product.locationAddress) {
      stats.withLocation++;
      
      if (typeof product.locationAddress === 'string') {
        stats.withStringLocation++;
      } else if (typeof product.locationAddress === 'object') {
        stats.withObjectLocation++;
      }
      
      const city = getCityFromLocation(product.locationAddress);
      if (city && city !== 'Location TBD') {
        stats.withValidCity++;
        stats.uniqueCities.add(city);
      } else {
        stats.invalidLocations.push(product.productCode);
      }
    }
  });

  console.log(`📊 Location Data Statistics:`);
  console.log(`   Total products: ${stats.total}`);
  console.log(`   With location data: ${stats.withLocation} (${((stats.withLocation / stats.total) * 100).toFixed(1)}%)`);
  console.log(`   String format: ${stats.withStringLocation}`);
  console.log(`   Object format: ${stats.withObjectLocation}`);
  console.log(`   With valid city: ${stats.withValidCity} (${((stats.withValidCity / stats.total) * 100).toFixed(1)}%)`);
  console.log(`   Unique cities found: ${stats.uniqueCities.size}`);
  
  if (stats.invalidLocations.length > 0) {
    console.log(`⚠️  Products with invalid locations: ${stats.invalidLocations.slice(0, 5).join(', ')}${stats.invalidLocations.length > 5 ? '...' : ''}`);
  }
  
  console.log(`🏙️  Cities found: ${Array.from(stats.uniqueCities).sort().join(', ')}`);
  
  return stats;
} 