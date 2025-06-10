'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Zap, 
  TrendingUp, 
  Clock, 
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { clientCacheManager } from '@/lib/utils/client-cache-manager';

interface CacheMetrics {
  hit_rate: number;
  miss_rate: number;
  eviction_count: number;
  memory_usage: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  memoryUsage: number;
  redisConnected: boolean;
  size: number;
  config: any;
}

interface CacheAnalytics {
  hitRateByEndpoint: Record<string, number>;
  averageResponseTime: Record<string, number>;
  cacheEffectiveness: number;
  memoryTrends: number[];
  popularKeys: Array<{ key: string; accessCount: number }>;
}

export function CacheDashboard() {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [analytics, setAnalytics] = useState<CacheAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchCacheData = async () => {
    try {
      setIsLoading(true);
      const [metricsData, statsData, analyticsData] = await Promise.all([
        clientCacheManager.getMetrics(),
        clientCacheManager.getCacheStats(),
        clientCacheManager.getAnalytics()
      ]);
      
      setMetrics(metricsData);
      setStats(statsData);
      setAnalytics(analyticsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch cache data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clientCacheManager.clear();
      await fetchCacheData();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleWarmCache = async () => {
    try {
      await clientCacheManager.warmCache();
      await fetchCacheData();
    } catch (error) {
      console.error('Failed to warm cache:', error);
    }
  };

  useEffect(() => {
    fetchCacheData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchCacheData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 0.8) return 'text-green-600';
    if (hitRate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading cache metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cache Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and optimize your Rezdy data caching strategy
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={stats?.redisConnected ? "default" : "destructive"}>
            {stats?.redisConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Redis Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Memory Only
              </>
            )}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchCacheData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleWarmCache}>
            <Zap className="h-4 w-4 mr-1" />
            Warm Cache
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearCache}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHitRateColor(metrics?.hit_rate || 0)}`}>
              {formatPercentage(metrics?.hit_rate || 0)}
            </div>
            <Progress 
              value={(metrics?.hit_rate || 0) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.hits || 0} hits / {stats?.totalRequests || 0} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(stats?.memoryUsage || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.size || 0} cached entries
            </p>
            <p className="text-xs text-muted-foreground">
              Client-side cache
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Effectiveness</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics?.cacheEffectiveness || 0)}
            </div>
            <Progress 
              value={(analytics?.cacheEffectiveness || 0) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Overall system efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evictions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.evictions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cache evictions
            </p>
            <p className="text-xs text-muted-foreground">
              Policy: {stats?.config?.eviction_policy || 'LRU'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">
            <BarChart3 className="h-4 w-4 mr-1" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="popular">
            <PieChart className="h-4 w-4 mr-1" />
            Popular Keys
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChart className="h-4 w-4 mr-1" />
            Memory Trends
          </TabsTrigger>
          <TabsTrigger value="config">
            <Database className="h-4 w-4 mr-1" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Endpoint</CardTitle>
              <CardDescription>
                Cache hit rates and response times for different API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics?.hitRateByEndpoint || {}).map(([endpoint, hitRate]) => (
                  <div key={endpoint} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{endpoint}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatPercentage(hitRate)} hit rate
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {analytics?.averageResponseTime[endpoint]?.toFixed(0) || 0}ms
                      </span>
                      <Progress value={hitRate * 100} className="w-20" />
                    </div>
                  </div>
                ))}
                {Object.keys(analytics?.hitRateByEndpoint || {}).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No endpoint data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Accessed Cache Keys</CardTitle>
              <CardDescription>
                Top 10 most frequently accessed cache entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.popularKeys?.map((item, index) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {item.key}
                      </code>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {item.accessCount} accesses
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-4">
                    No popular keys data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage Trends</CardTitle>
              <CardDescription>
                Memory usage over time (last 100 data points)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.memoryTrends && analytics.memoryTrends.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {formatBytes(analytics.memoryTrends[analytics.memoryTrends.length - 1] || 0)}</span>
                      <span>Peak: {formatBytes(Math.max(...analytics.memoryTrends))}</span>
                      <span>Average: {formatBytes(analytics.memoryTrends.reduce((a, b) => a + b, 0) / analytics.memoryTrends.length)}</span>
                    </div>
                    <div className="h-32 bg-muted rounded flex items-end space-x-1 p-2">
                      {analytics.memoryTrends.slice(-50).map((usage, index) => {
                        const maxUsage = Math.max(...analytics.memoryTrends);
                        const height = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;
                        return (
                          <div
                            key={index}
                            className="bg-primary flex-1 rounded-sm"
                            style={{ height: `${height}%` }}
                            title={`${formatBytes(usage)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No memory trend data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Configuration</CardTitle>
              <CardDescription>
                Current cache settings and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">General Settings</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Max Size:</span>
                      <span>{stats?.config?.max_size || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Default TTL:</span>
                      <span>{stats?.config?.ttl || 'N/A'}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eviction Policy:</span>
                      <span>{stats?.config?.eviction_policy || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Compression:</span>
                      <Badge variant={stats?.config?.enableCompression ? "default" : "secondary"}>
                        {stats?.config?.enableCompression ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Redis:</span>
                      <Badge variant={stats?.config?.enableRedis ? "default" : "secondary"}>
                        {stats?.config?.enableRedis ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Analytics:</span>
                      <Badge variant={stats?.config?.enableAnalytics ? "default" : "secondary"}>
                        {stats?.config?.enableAnalytics ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        <span>Auto-refresh every 10 seconds</span>
      </div>
    </div>
  );
}