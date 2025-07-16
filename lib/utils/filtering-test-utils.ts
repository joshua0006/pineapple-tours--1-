import { RezdyProduct } from '@/lib/types/rezdy';
import { UnifiedPickupFilter } from '@/lib/services/unified-pickup-filter';
import { PickupLocationService } from '@/lib/services/pickup-location-service';

/**
 * Testing utilities for validating pickup location filtering consistency
 * between search form and tours page components
 */

export interface FilteringTestResult {
  testName: string;
  passed: boolean;
  details: {
    location: string;
    totalProducts: number;
    searchFormResults: number;
    toursPageResults: number;
    consistencyPercentage: number;
    discrepancies: {
      onlyInSearchForm: string[];
      onlyInToursPage: string[];
    };
  };
  recommendation: string;
}

/**
 * Test filtering consistency between search form and tours page approaches
 */
export async function testFilteringConsistency(
  products: RezdyProduct[],
  location: string
): Promise<FilteringTestResult> {
  try {
    // Simulate search form filtering (UnifiedPickupFilter)
    const searchFormResult = await UnifiedPickupFilter.filterProductsByLocation(
      products,
      location,
      {
        useApiData: true,
        enableFallback: true,
        cacheResults: false, // Don't cache during testing
      }
    );

    // Simulate tours page fallback filtering (text-based)
    const toursPageResults = PickupLocationService.filterProductsByPickupLocation(
      products,
      location
    );

    // Validate consistency
    const consistency = UnifiedPickupFilter.validateFilteringConsistency(
      products,
      location,
      searchFormResult.filteredProducts,
      toursPageResults
    );

    const passed = consistency.consistencyPercentage >= 90; // 90% threshold for test pass

    return {
      testName: `Filtering consistency test for ${location}`,
      passed,
      details: {
        location,
        totalProducts: products.length,
        searchFormResults: searchFormResult.filteredProducts.length,
        toursPageResults: toursPageResults.length,
        consistencyPercentage: consistency.consistencyPercentage,
        discrepancies: {
          onlyInSearchForm: consistency.discrepancies.onlyInSearchForm.map(p => p.productCode),
          onlyInToursPage: consistency.discrepancies.onlyInToursPage.map(p => p.productCode),
        },
      },
      recommendation: consistency.recommendation,
    };
  } catch (error) {
    return {
      testName: `Filtering consistency test for ${location}`,
      passed: false,
      details: {
        location,
        totalProducts: products.length,
        searchFormResults: 0,
        toursPageResults: 0,
        consistencyPercentage: 0,
        discrepancies: {
          onlyInSearchForm: [],
          onlyInToursPage: [],
        },
      },
      recommendation: `Test failed with error: ${error}`,
    };
  }
}

/**
 * Run comprehensive filtering tests for all supported locations
 */
export async function runComprehensiveFilteringTests(
  products: RezdyProduct[]
): Promise<{
  overallPassed: boolean;
  results: FilteringTestResult[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageConsistency: number;
  };
}> {
  const locations = UnifiedPickupFilter.getSupportedLocations();
  const results: FilteringTestResult[] = [];

  // Test each location
  for (const location of locations) {
    const result = await testFilteringConsistency(products, location);
    results.push(result);
  }

  // Test 'all' location case
  const allLocationResult = await testFilteringConsistency(products, 'all');
  results.push(allLocationResult);

  // Calculate summary
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.length - passedTests;
  const averageConsistency = results.reduce((sum, r) => sum + r.details.consistencyPercentage, 0) / results.length;
  const overallPassed = failedTests === 0 && averageConsistency >= 95;

  return {
    overallPassed,
    results,
    summary: {
      totalTests: results.length,
      passedTests,
      failedTests,
      averageConsistency,
    },
  };
}

/**
 * Generate a detailed test report
 */
export function generateTestReport(
  testResults: Awaited<ReturnType<typeof runComprehensiveFilteringTests>>
): string {
  const { overallPassed, results, summary } = testResults;

  let report = `# Pickup Location Filtering Test Report\n\n`;
  report += `## Summary\n`;
  report += `- **Overall Status**: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `- **Tests Run**: ${summary.totalTests}\n`;
  report += `- **Passed**: ${summary.passedTests}\n`;
  report += `- **Failed**: ${summary.failedTests}\n`;
  report += `- **Average Consistency**: ${summary.averageConsistency.toFixed(2)}%\n\n`;

  report += `## Detailed Results\n\n`;

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    report += `### ${status} ${result.testName}\n`;
    report += `- **Consistency**: ${result.details.consistencyPercentage.toFixed(2)}%\n`;
    report += `- **Search Form Results**: ${result.details.searchFormResults}\n`;
    report += `- **Tours Page Results**: ${result.details.toursPageResults}\n`;
    
    if (result.details.discrepancies.onlyInSearchForm.length > 0) {
      report += `- **Only in Search Form**: ${result.details.discrepancies.onlyInSearchForm.length} products\n`;
    }
    
    if (result.details.discrepancies.onlyInToursPage.length > 0) {
      report += `- **Only in Tours Page**: ${result.details.discrepancies.onlyInToursPage.length} products\n`;
    }
    
    report += `- **Recommendation**: ${result.recommendation}\n\n`;
  }

  return report;
}

/**
 * Quick test function that can be called from browser console
 */
export async function quickFilteringTest(products: RezdyProduct[], location = 'Brisbane'): Promise<void> {
  console.log(`🧪 Testing filtering consistency for ${location}...`);
  
  const result = await testFilteringConsistency(products, location);
  
  console.log(`📊 Test Results:`);
  console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Consistency: ${result.details.consistencyPercentage.toFixed(2)}%`);
  console.log(`   Search Form: ${result.details.searchFormResults} products`);
  console.log(`   Tours Page: ${result.details.toursPageResults} products`);
  console.log(`   Recommendation: ${result.recommendation}`);
  
  if (result.details.discrepancies.onlyInSearchForm.length > 0) {
    console.log(`   ⚠️ Products only in search form:`, result.details.discrepancies.onlyInSearchForm);
  }
  
  if (result.details.discrepancies.onlyInToursPage.length > 0) {
    console.log(`   ⚠️ Products only in tours page:`, result.details.discrepancies.onlyInToursPage);
  }
}

/**
 * Development helper: Add filtering consistency validator to products array
 */
export function addFilteringValidator(products: RezdyProduct[]): RezdyProduct[] & {
  testFiltering: (location: string) => Promise<void>;
  runAllTests: () => Promise<void>;
} {
  const extendedProducts = products as RezdyProduct[] & {
    testFiltering: (location: string) => Promise<void>;
    runAllTests: () => Promise<void>;
  };

  extendedProducts.testFiltering = async (location: string) => {
    await quickFilteringTest(products, location);
  };

  extendedProducts.runAllTests = async () => {
    const results = await runComprehensiveFilteringTests(products);
    console.log(generateTestReport(results));
  };

  return extendedProducts;
}