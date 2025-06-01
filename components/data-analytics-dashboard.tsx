"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

import { useRezdyDataManager } from '@/hooks/use-rezdy-data-manager';
import {
  DataQualityMetrics,
  DataIssue,
  RevenueAnalytics,
  CustomerAnalytics,
  PerformanceMetrics,
  SegmentedProducts,
  SegmentedCustomers
} from '@/lib/types/rezdy';

interface DataAnalyticsDashboardProps {
  className?: string;
}

export function DataAnalyticsDashboard({ className }: DataAnalyticsDashboardProps) {
  const {
    data,
    processedData,
    segmentedProducts,
    segmentedCustomers,
    qualityMetrics,
    dataIssues,
    performanceMetrics,
    refreshData,
    clearCache,
    isLoading,
    error,
    lastUpdated
  } = useRezdyDataManager({
    enableCaching: true,
    enableValidation: true,
    enableSegmentation: true,
    autoRefresh: false
  });

  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = async () => {
    await refreshData({ force: true, include_analytics: true });
  };

  const handleClearCache = () => {
    clearCache();
  };

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Analytics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your Rezdy data management and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleClearCache}>
            <Database className="mr-2 h-4 w-4" />
            Clear Cache
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium">
              {isLoading ? 'Syncing...' : 'Data Current'}
            </span>
          </div>
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {data.products.length} Products • {data.bookings.length} Bookings • {data.customers.length} Customers
          </span>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${processedData?.insights.revenue_insights.total_revenue.toLocaleString() || '0'}`}
              change="+12.5%"
              icon={DollarSign}
              trend="up"
            />
            <MetricCard
              title="Total Customers"
              value={processedData?.insights.customer_insights.total_customers.toString() || '0'}
              change="+8.2%"
              icon={Users}
              trend="up"
            />
            <MetricCard
              title="Active Products"
              value={data.products.filter(p => p.status === 'ACTIVE').length.toString()}
              change="+3.1%"
              icon={Package}
              trend="up"
            />
            <MetricCard
              title="Data Quality Score"
              value={`${Math.round((processedData?.metadata.quality_score || 0) * 100)}%`}
              change={qualityMetrics ? getQualityTrend(qualityMetrics) : '0%'}
              icon={CheckCircle}
              trend={qualityMetrics ? getQualityTrendDirection(qualityMetrics) : 'neutral'}
            />
          </div>

          {/* Trending Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Trending Products
              </CardTitle>
              <CardDescription>
                Most popular products based on recent bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedData?.insights.trending_products.slice(0, 5).map((product, index) => (
                  <div key={product.productCode} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.productCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.advertisedPrice || 0}</p>
                      <p className="text-sm text-muted-foreground">{product.productType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Issues Alert */}
          {dataIssues.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Data Quality Issues Detected</AlertTitle>
              <AlertDescription>
                {dataIssues.length} issues found. Check the Data Quality tab for details.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
                <CardDescription>Top performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData?.insights.revenue_insights.revenue_by_product.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productCode" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Key revenue performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <span className="font-medium">
                    ${processedData?.insights.revenue_insights.total_revenue.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Order Value</span>
                  <span className="font-medium">
                    ${Math.round(processedData?.insights.revenue_insights.average_order_value || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Growth Rate</span>
                  <span className="font-medium text-green-600">
                    +{processedData?.insights.revenue_insights.revenue_growth_rate || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Segmentation */}
          {segmentedProducts && (
            <Card>
              <CardHeader>
                <CardTitle>Product Performance Segments</CardTitle>
                <CardDescription>Products categorized by performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <SegmentCard
                    title="High Demand"
                    count={segmentedProducts.high_demand.length}
                    color="bg-green-100 text-green-800"
                  />
                  <SegmentCard
                    title="Seasonal"
                    count={segmentedProducts.seasonal.length}
                    color="bg-blue-100 text-blue-800"
                  />
                  <SegmentCard
                    title="Location Based"
                    count={segmentedProducts.location_based.length}
                    color="bg-purple-100 text-purple-800"
                  />
                  <SegmentCard
                    title="Price Optimized"
                    count={segmentedProducts.price_optimized.length}
                    color="bg-orange-100 text-orange-800"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
                <CardDescription>Key customer metrics and insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Customers</span>
                  <span className="font-medium">
                    {processedData?.insights.customer_insights.total_customers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>New Customers</span>
                  <span className="font-medium">
                    {processedData?.insights.customer_insights.new_customers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Lifetime Value</span>
                  <span className="font-medium">
                    ${Math.round(processedData?.insights.customer_insights.customer_lifetime_value || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Churn Rate</span>
                  <span className="font-medium">
                    {processedData?.insights.customer_insights.churn_rate || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
                <CardDescription>Customer segments breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {segmentedCustomers && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>VIP Customers</span>
                      <Badge variant="secondary">{segmentedCustomers.vip.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>At Risk</span>
                      <Badge variant="destructive">{segmentedCustomers.at_risk.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Potential</span>
                      <Badge variant="default">{segmentedCustomers.growth_potential.length}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          {qualityMetrics && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Completeness</CardTitle>
                  <CardDescription>Data field completion rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QualityMetric
                    label="Products with Descriptions"
                    value={qualityMetrics.completeness.products_with_descriptions}
                    total={data.products.length}
                  />
                  <QualityMetric
                    label="Products with Images"
                    value={qualityMetrics.completeness.products_with_images}
                    total={data.products.length}
                  />
                  <QualityMetric
                    label="Products with Pricing"
                    value={qualityMetrics.completeness.products_with_pricing}
                    total={data.products.length}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accuracy</CardTitle>
                  <CardDescription>Data format validation results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QualityMetric
                    label="Valid Email Addresses"
                    value={qualityMetrics.accuracy.valid_email_addresses}
                    total={data.bookings.length}
                  />
                  <QualityMetric
                    label="Valid Phone Numbers"
                    value={qualityMetrics.accuracy.valid_phone_numbers}
                    total={data.bookings.length}
                  />
                  <QualityMetric
                    label="Valid Dates"
                    value={qualityMetrics.accuracy.valid_dates}
                    total={data.bookings.length}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consistency</CardTitle>
                  <CardDescription>Data standardization metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QualityMetric
                    label="Standardized Product Types"
                    value={qualityMetrics.consistency.standardized_product_types}
                    total={data.products.length}
                  />
                  <QualityMetric
                    label="Consistent Pricing Format"
                    value={qualityMetrics.consistency.consistent_pricing_format}
                    total={data.products.length}
                  />
                  <QualityMetric
                    label="Uniform Date Formats"
                    value={qualityMetrics.consistency.uniform_date_formats}
                    total={data.bookings.length}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data Issues */}
          {dataIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Data Issues</CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-4 w-4 ${getSeverityColor(issue.severity)}`} />
                        <div>
                          <p className="font-medium">{issue.type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{issue.message}</p>
                        </div>
                      </div>
                      <Badge variant={getSeverityVariant(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {performanceMetrics && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(performanceMetrics.cache_hit_ratio * 100)}%
                  </div>
                  <Progress value={performanceMetrics.cache_hit_ratio * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(performanceMetrics.data_freshness * 100)}%
                  </div>
                  <Progress value={performanceMetrics.data_freshness * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.api_response_time}ms
                  </div>
                  <p className="text-xs text-muted-foreground">Average response time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.error_rate}%
                  </div>
                  <p className="text-xs text-muted-foreground">System error rate</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
          {trend === 'up' && <TrendingUp className="inline h-3 w-3 mr-1" />}
          {trend === 'down' && <TrendingDown className="inline h-3 w-3 mr-1" />}
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}

interface SegmentCardProps {
  title: string;
  count: number;
  color: string;
}

function SegmentCard({ title, count, color }: SegmentCardProps) {
  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <h3 className="font-medium">{title}</h3>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

interface QualityMetricProps {
  label: string;
  value: number;
  total: number;
}

function QualityMetric({ label, value, total }: QualityMetricProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}/{total}</span>
      </div>
      <Progress value={percentage} className="mt-1" />
    </div>
  );
}

// Helper Functions
function getQualityTrend(metrics: DataQualityMetrics): string {
  // Simple calculation - would be more sophisticated in real implementation
  return '+2.3%';
}

function getQualityTrendDirection(metrics: DataQualityMetrics): 'up' | 'down' | 'neutral' {
  // Simple calculation - would be more sophisticated in real implementation
  return 'up';
}

function getSeverityColor(severity?: string): string {
  switch (severity) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-blue-600';
    default: return 'text-gray-600';
  }
}

function getSeverityVariant(severity?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'outline';
    case 'low': return 'secondary';
    default: return 'default';
  }
} 