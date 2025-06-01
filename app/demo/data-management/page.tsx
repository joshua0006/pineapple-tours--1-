"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  Search, 
  BarChart3, 
  Filter, 
  Zap, 
  CheckCircle, 
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { EnhancedSearchForm } from '@/components/enhanced-search-form';
import { DataAnalyticsDashboard } from '@/components/data-analytics-dashboard';
import { useRezdyDataManager } from '@/hooks/use-rezdy-data-manager';

export default function DataManagementDemoPage() {
  const [activeDemo, setActiveDemo] = useState('overview');
  
  const {
    data,
    processedData,
    segmentedProducts,
    segmentedCustomers,
    qualityMetrics,
    dataIssues,
    performanceMetrics,
    isLoading,
    error,
    lastUpdated
  } = useRezdyDataManager({
    enableCaching: true,
    enableValidation: true,
    enableSegmentation: true,
    autoRefresh: false
  });

  const features = [
    {
      id: 'data-validation',
      title: 'Data Validation & Cleaning',
      description: 'Comprehensive validation schemas and automated data cleaning pipelines',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: {
        'Validation Rules': '15+',
        'Data Quality Score': qualityMetrics ? `${Math.round((qualityMetrics.completeness.products_with_descriptions / data.products.length) * 100)}%` : 'N/A',
        'Issues Detected': dataIssues.length.toString()
      }
    },
    {
      id: 'data-segmentation',
      title: 'Advanced Segmentation',
      description: 'Multi-dimensional product and customer segmentation with real-time filtering',
      icon: Filter,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: {
        'Product Segments': segmentedProducts ? '4' : 'N/A',
        'Customer Segments': segmentedCustomers ? '3' : 'N/A',
        'Filter Criteria': '12+'
      }
    },
    {
      id: 'cache-management',
      title: 'Smart Caching',
      description: 'Multi-level caching with intelligent invalidation and performance optimization',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      stats: {
        'Cache Hit Ratio': performanceMetrics ? `${Math.round(performanceMetrics.cache_hit_ratio * 100)}%` : 'N/A',
        'Data Freshness': performanceMetrics ? `${Math.round(performanceMetrics.data_freshness * 100)}%` : 'N/A',
        'Eviction Policies': '3'
      }
    },
    {
      id: 'analytics-reporting',
      title: 'Analytics & Reporting',
      description: 'Real-time analytics dashboard with comprehensive insights and KPIs',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      stats: {
        'Revenue Analytics': processedData ? 'Active' : 'N/A',
        'Customer Insights': processedData ? 'Active' : 'N/A',
        'Performance Metrics': '4+'
      }
    }
  ];

  const demoSections = [
    {
      id: 'enhanced-search',
      title: 'Enhanced Search Experience',
      description: 'AI-powered search with intelligent suggestions and advanced filtering',
      component: 'search'
    },
    {
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description: 'Comprehensive data insights and performance monitoring',
      component: 'analytics'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="container">
            <div className="text-center text-white">
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                Data Management Demo
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Rezdy Data Management Strategies
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-xl">
                Experience our comprehensive data management system featuring advanced validation, 
                segmentation, caching, and analytics capabilities for optimal performance and insights.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Database className="mr-2 h-5 w-5" />
                  Explore Features
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="border-b bg-muted py-6">
          <div className="container">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.products.length}</div>
                <div className="text-sm text-muted-foreground">Products Loaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data.bookings.length}</div>
                <div className="text-sm text-muted-foreground">Bookings Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data.customers.length}</div>
                <div className="text-sm text-muted-foreground">Customers Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Core Features</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Comprehensive data management capabilities built for scale and performance
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(feature.stats).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demos */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Interactive Demos</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Try out our data management features in action
              </p>
            </div>

            <Tabs value={activeDemo} onValueChange={setActiveDemo}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="search">Enhanced Search</TabsTrigger>
                <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {demoSections.map((section) => (
                    <Card key={section.id}>
                      <CardHeader>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => setActiveDemo(section.component)}
                          className="w-full"
                        >
                          Try Demo
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Search className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="font-semibold">Enhanced Search</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Experience AI-powered search with smart suggestions
                        </p>
                        <Link href="/search/enhanced">
                          <Button variant="outline" size="sm">
                            Open Search
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold">Analytics Dashboard</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          View comprehensive data insights and metrics
                        </p>
                        <Link href="/analytics">
                          <Button variant="outline" size="sm">
                            Open Analytics
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Database className="mx-auto h-8 w-8 text-green-600 mb-2" />
                        <h3 className="font-semibold">Data Management</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Explore validation, caching, and segmentation
                        </p>
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="search" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Enhanced Search Demo</CardTitle>
                    <CardDescription>
                      Try our advanced search with AI-powered suggestions and multi-dimensional filtering
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EnhancedSearchForm
                      products={data.products}
                      onResults={(results) => console.log('Search results:', results)}
                      onFiltersChange={(filters) => console.log('Filters changed:', filters)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard Demo</CardTitle>
                    <CardDescription>
                      Explore real-time data insights, quality metrics, and performance monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[600px] overflow-auto">
                      <DataAnalyticsDashboard />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Technical Implementation */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Technical Implementation</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built with modern technologies and best practices
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                    Data Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Zod schema validation</li>
                    <li>• Automated data cleaning</li>
                    <li>• Quality monitoring</li>
                    <li>• Error tracking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="mr-2 h-5 w-5 text-blue-600" />
                    Segmentation Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Multi-dimensional filtering</li>
                    <li>• Real-time segmentation</li>
                    <li>• Customer analytics</li>
                    <li>• Product categorization</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                    Cache Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• LRU/FIFO/TTL policies</li>
                    <li>• Smart invalidation</li>
                    <li>• Performance monitoring</li>
                    <li>• Memory optimization</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-yellow-500 to-orange-500 py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to Experience Advanced Data Management?
            </h2>
            <p className="mt-4 text-xl text-white/90">
              Explore our enhanced search and analytics features
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/search/enhanced">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                  <Search className="mr-2 h-5 w-5" />
                  Try Enhanced Search
                </Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
} 