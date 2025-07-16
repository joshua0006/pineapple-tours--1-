"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAllProducts } from '@/hooks/use-all-products';
import { runComprehensiveFilteringTests, generateTestReport, FilteringTestResult } from '@/lib/utils/filtering-test-utils';

/**
 * Development page for testing pickup location filtering consistency
 * between search form and tours page components
 */
export default function TestFilteringConsistencyPage() {
  const { products, loading } = useAllProducts();
  const [testResults, setTestResults] = useState<{
    overallPassed: boolean;
    results: FilteringTestResult[];
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      averageConsistency: number;
    };
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testReport, setTestReport] = useState<string>('');

  const runTests = async () => {
    if (products.length === 0) return;

    setIsRunningTests(true);
    setTestResults(null);
    setTestReport('');

    try {
      const results = await runComprehensiveFilteringTests(products);
      setTestResults(results);
      setTestReport(generateTestReport(results));
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    if (passed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (passed: boolean) => {
    if (passed) {
      return <Badge className="bg-green-100 text-green-800">PASSED</Badge>;
    } else {
      return <Badge variant="destructive">FAILED</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Pickup Location Filtering Test Suite</h1>
        <p className="text-muted-foreground mb-4">
          This page tests the consistency between search form and tours page filtering logic.
          It validates that both components return the same results when filtering products by pickup location.
        </p>
        
        {loading && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>Loading product data...</AlertDescription>
          </Alert>
        )}

        {!loading && products.length > 0 && (
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              {isRunningTests && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isRunningTests ? 'Running Tests...' : 'Run Filtering Tests'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {products.length} products loaded
            </span>
          </div>
        )}
      </div>

      {testResults && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.overallPassed)}
                Test Summary
                {getStatusBadge(testResults.overallPassed)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{testResults.summary.totalTests}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.summary.passedTests}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.summary.failedTests}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {testResults.summary.averageConsistency.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. Consistency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Test Results */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Individual Test Results</h2>
            {testResults.results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.passed)}
                      {result.testName}
                    </div>
                    {getStatusBadge(result.passed)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="font-medium">Consistency</div>
                      <div className="text-sm text-muted-foreground">
                        {result.details.consistencyPercentage.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Search Form Results</div>
                      <div className="text-sm text-muted-foreground">
                        {result.details.searchFormResults} products
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Tours Page Results</div>
                      <div className="text-sm text-muted-foreground">
                        {result.details.toursPageResults} products
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Total Products</div>
                      <div className="text-sm text-muted-foreground">
                        {result.details.totalProducts} available
                      </div>
                    </div>
                  </div>

                  {(result.details.discrepancies.onlyInSearchForm.length > 0 || 
                    result.details.discrepancies.onlyInToursPage.length > 0) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Discrepancies found:</strong>
                        {result.details.discrepancies.onlyInSearchForm.length > 0 && (
                          <div className="mt-1">
                            • {result.details.discrepancies.onlyInSearchForm.length} products only in search form results
                          </div>
                        )}
                        {result.details.discrepancies.onlyInToursPage.length > 0 && (
                          <div className="mt-1">
                            • {result.details.discrepancies.onlyInToursPage.length} products only in tours page results
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Recommendation:</div>
                    <div className="text-sm">{result.recommendation}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Test Report */}
          {testReport && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Test Report</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                  {testReport}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && products.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No products available for testing. Please ensure the product data is loaded.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}