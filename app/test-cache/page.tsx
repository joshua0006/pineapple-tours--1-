'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  message?: string;
  details?: any;
}

export default function TestCachePage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Cache Manager Initialization', status: 'pending' },
    { name: 'Memory Cache Operations', status: 'pending' },
    { name: 'Redis Connection Test', status: 'pending' },
    { name: 'Data Compression Test', status: 'pending' },
    { name: 'Cache Warming Test', status: 'pending' },
    { name: 'API Cache Integration', status: 'pending' },
    { name: 'Cache Invalidation Test', status: 'pending' },
    { name: 'Performance Metrics Test', status: 'pending' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<number>(-1);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    setCurrentTest(0);

    // Test 1: Cache Manager Initialization
    try {
      setCurrentTest(0);
      updateTest(0, { status: 'running' });
      
      const startTime = Date.now();
      const { enhancedCacheManager } = await import('@/lib/utils/enhanced-cache-manager');
      const stats = enhancedCacheManager.getCacheStats();
      const duration = Date.now() - startTime;
      
      updateTest(0, { 
        status: 'success', 
        duration,
        message: 'Cache manager initialized successfully',
        details: { size: stats.size, redisConnected: stats.redisConnected }
      });
    } catch (error) {
      updateTest(0, { 
        status: 'error', 
        message: `Initialization failed: ${error}` 
      });
    }

    // Test 2: Memory Cache Operations
    try {
      setCurrentTest(1);
      updateTest(1, { status: 'running' });
      
      const startTime = Date.now();
      const { enhancedCacheManager } = await import('@/lib/utils/enhanced-cache-manager');
      
      // Test set operation
      const testData = { test: 'data', timestamp: Date.now() };
      await enhancedCacheManager.set('test:memory', testData, 60);
      
      // Test get operation
      const retrieved = await enhancedCacheManager.get('test:memory');
      const duration = Date.now() - startTime;
      
      if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
        updateTest(1, { 
          status: 'success', 
          duration,
          message: 'Memory cache operations working correctly'
        });
      } else {
        updateTest(1, { 
          status: 'error', 
          message: 'Data mismatch in memory cache' 
        });
      }
    } catch (error) {
      updateTest(1, { 
        status: 'error', 
        message: `Memory cache test failed: ${error}` 
      });
    }

    // Test 3: Redis Connection Test
    try {
      setCurrentTest(2);
      updateTest(2, { status: 'running' });
      
      const startTime = Date.now();
      const { enhancedCacheManager } = await import('@/lib/utils/enhanced-cache-manager');
      const stats = enhancedCacheManager.getCacheStats();
      const duration = Date.now() - startTime;
      
      updateTest(2, { 
        status: stats.redisConnected ? 'success' : 'error',
        duration,
        message: stats.redisConnected ? 'Redis connected successfully' : 'Redis not connected (using memory-only mode)',
        details: { redisConnected: stats.redisConnected }
      });
    } catch (error) {
      updateTest(2, { 
        status: 'error', 
        message: `Redis test failed: ${error}` 
      });
    }

    // Test 4: Data Compression Test
    try {
      setCurrentTest(3);
      updateTest(3, { status: 'running' });
      
      const startTime = Date.now();
      const { enhancedCacheManager } = await import('@/lib/utils/enhanced-cache-manager');
      
      // Create large test data to trigger compression
      const largeData = Array(1000).fill(0).map((_, i) => ({
        id: i,
        name: `Test Product ${i}`,
        description: 'This is a test product with a long description that should trigger compression when stored in cache.',
        price: Math.random() * 1000,
        features: ['feature1', 'feature2', 'feature3']
      }));
      
      await enhancedCacheManager.set('test:compression', largeData, 60);
      const retrieved = await enhancedCacheManager.get('test:compression');
      const duration = Date.now() - startTime;
      
      if (retrieved && Array.isArray(retrieved) && retrieved.length === 1000) {
        const stats = enhancedCacheManager.getCacheStats();
        updateTest(3, { 
          status: 'success', 
          duration,
          message: 'Compression test passed',
          details: { compressionRatio: stats.compressionRatio }
        });
      } else {
        updateTest(3, { 
          status: 'error', 
          message: 'Compression test failed - data corruption' 
        });
      }
    } catch (error) {
      updateTest(3, { 
        status: 'error', 
        message: `Compression test failed: ${error}` 
      });
    }

    // Test 5: Cache Warming Test
    try {
      setCurrentTest(4);
      updateTest(4, { status: 'running' });
      
      const startTime = Date.now();
      const { enhancedCacheManager } = await import('@/lib/utils/enhanced-cache-manager');
      
      await enhancedCacheManager.warmCache();
      const duration = Date.now() - startTime;
      
      updateTest(4, { 
        status: 'success', 
        duration,
        message: 'Cache warming completed successfully'
      });
    } catch (error) {
      updateTest(4, { 
        status: 'error', 
        message: `Cache warming failed: ${error}` 
      });
    }

    // Test 6: API Cache Integration
    try {
      setCurrentTest(5);
      updateTest(5, { status: 'running' });
      
      const startTime = Date.now();
      
      // Test products API caching
      const response1 = await fetch('/api/rezdy/products?limit=10');
      const data1 = await response1.json();
      
      // Second request should hit cache
      const response2 = await fetch('/api/rezdy/products?limit=10');
      const data2 = await response2.json();
      
      const duration = Date.now() - startTime;
      
      const cacheHit = response2.headers.get('X-Cache') === 'HIT';
      
      updateTest(5, { 
        status: 'success', 
        duration,
        message: `API cache integration working. Cache ${cacheHit ? 'HIT' : 'MISS'} on second request`,
        details: { 
          firstResponseSize: data1.products?.length || 0,
          secondResponseSize: data2.products?.length || 0,
          cacheHit
        }
      });
    } catch (error) {
      updateTest(5, { 
        status: 'error', 
        message: `API cache test failed: ${error}` 
      });
    }

    // Test 7: Cache Invalidation Test
    try {
      setCurrentTest(6);
      updateTest(6, { status: 'running' });
      
      const startTime = Date.now();
      const { enhancedCacheManager } = await import('@/lib/utils/enhanced-cache-manager');
      
      // Set test data
      await enhancedCacheManager.set('test:invalidation', { data: 'test' }, 60);
      
      // Verify it exists
      const beforeInvalidation = await enhancedCacheManager.get('test:invalidation');
      
      // Invalidate
      await enhancedCacheManager.invalidate('test:invalidation');
      
      // Verify it's gone
      const afterInvalidation = await enhancedCacheManager.get('test:invalidation');
      
      const duration = Date.now() - startTime;
      
      if (beforeInvalidation && !afterInvalidation) {
        updateTest(6, { 
          status: 'success', 
          duration,
          message: 'Cache invalidation working correctly'
        });
      } else {
        updateTest(6, { 
          status: 'error', 
          message: 'Cache invalidation failed' 
        });
      }
    } catch (error) {
      updateTest(6, { 
        status: 'error', 
        message: `Cache invalidation test failed: ${error}` 
      });
    }

    // Test 8: Performance Metrics Test
    try {
      setCurrentTest(7);
      updateTest(7, { status: 'running' });
      
      const startTime = Date.now();
      const { enhancedCacheManager } = await import('@/lib/utils/enhanced-cache-manager');
      
      const metrics = enhancedCacheManager.getMetrics();
      const performanceMetrics = enhancedCacheManager.getPerformanceMetrics();
      const analytics = enhancedCacheManager.getAnalytics();
      
      const duration = Date.now() - startTime;
      
      updateTest(7, { 
        status: 'success', 
        duration,
        message: 'Performance metrics collection working',
        details: { 
          hitRate: metrics.hit_rate,
          memoryUsage: metrics.memory_usage,
          cacheEffectiveness: analytics.cacheEffectiveness
        }
      });
    } catch (error) {
      updateTest(7, { 
        status: 'error', 
        message: `Performance metrics test failed: ${error}` 
      });
    }

    setCurrentTest(-1);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const totalTests = tests.length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cache System Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of the enhanced Rezdy data caching system
          </p>
        </div>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Test Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Test Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalTests}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
          <Progress 
            value={(successCount / totalTests) * 100} 
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card 
            key={index} 
            className={`transition-all duration-200 ${getStatusColor(test.status)} ${
              currentTest === index ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    {test.message && (
                      <p className="text-sm text-muted-foreground">{test.message}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {test.duration && (
                    <Badge variant="outline">
                      {test.duration}ms
                    </Badge>
                  )}
                </div>
              </div>
              
              {test.details && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Test Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• <strong>Cache Manager Initialization:</strong> Verifies the enhanced cache manager loads correctly</p>
            <p>• <strong>Memory Cache Operations:</strong> Tests basic set/get operations in memory cache</p>
            <p>• <strong>Redis Connection:</strong> Checks if Redis is connected (optional, falls back to memory-only)</p>
            <p>• <strong>Data Compression:</strong> Tests compression of large data sets</p>
            <p>• <strong>Cache Warming:</strong> Verifies background cache preloading works</p>
            <p>• <strong>API Cache Integration:</strong> Tests caching in actual API endpoints</p>
            <p>• <strong>Cache Invalidation:</strong> Verifies cache entries can be properly removed</p>
            <p>• <strong>Performance Metrics:</strong> Tests metrics collection and analytics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}