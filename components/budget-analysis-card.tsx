'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { RezdyProduct } from '@/lib/types/rezdy';

interface BudgetCategory {
  count: number;
  products: RezdyProduct[];
  avgPrice: number;
  totalRevenue: number;
  percentage: number;
}

interface BudgetAnalysisCardProps {
  products: RezdyProduct[];
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function BudgetAnalysisCard({ 
  products, 
  onCategorySelect, 
  selectedCategory,
  showDetails = true,
  compact = false
}: BudgetAnalysisCardProps) {
  
  // Helper function to categorize products by budget
  const categorizeByBudget = (product: RezdyProduct) => {
    const price = product.advertisedPrice || 0;
    if (price === 0) return 'unknown';
    if (price < 100) return 'budget';
    if (price >= 100 && price < 300) return 'mid-range';
    if (price >= 300) return 'luxury';
    return 'unknown';
  };

  // Budget analysis with enhanced statistics
  const budgetAnalysis = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        budget: { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 },
        'mid-range': { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 },
        luxury: { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 },
        unknown: { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 }
      };
    }

    const analysis: Record<string, BudgetCategory> = {
      budget: { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 },
      'mid-range': { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 },
      luxury: { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 },
      unknown: { count: 0, products: [], avgPrice: 0, totalRevenue: 0, percentage: 0 }
    };

    // Filter out gift cards and categorize products
    const validProducts = products.filter(p => p.productType !== 'GIFT_CARD');
    
    validProducts.forEach(product => {
      const category = categorizeByBudget(product);
      analysis[category].products.push(product);
      analysis[category].count++;
      analysis[category].totalRevenue += product.advertisedPrice || 0;
    });

    // Calculate percentages and average prices
    const totalProducts = validProducts.length;
    Object.keys(analysis).forEach(key => {
      const category = analysis[key];
      category.percentage = totalProducts > 0 ? (category.count / totalProducts) * 100 : 0;
      category.avgPrice = category.count > 0 ? category.totalRevenue / category.count : 0;
    });

    return analysis;
  }, [products]);

  const totalProducts = Object.values(budgetAnalysis).reduce((sum, cat) => sum + cat.count, 0);
  const totalRevenue = Object.values(budgetAnalysis).reduce((sum, cat) => sum + cat.totalRevenue, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budget': return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'mid-range': return <Minus className="h-4 w-4 text-blue-600" />;
      case 'luxury': return <ArrowUpRight className="h-4 w-4 text-purple-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'budget': return 'bg-green-100 text-green-800 border-green-200';
      case 'mid-range': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'luxury': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (category: string) => {
    switch (category) {
      case 'budget': return 'bg-green-500';
      case 'mid-range': return 'bg-blue-500';
      case 'luxury': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (compact) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(budgetAnalysis).map(([category, data]) => (
          <Card 
            key={category} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onCategorySelect?.(category)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="font-medium capitalize text-sm">
                    {category === 'mid-range' ? 'Mid-Range' : category}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {data.count}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg:</span>
                  <span className="font-medium">${data.avgPrice.toFixed(0)}</span>
                </div>
                <Progress 
                  value={data.percentage} 
                  className="h-2"
                  style={{
                    '--progress-background': getProgressColor(category)
                  } as React.CSSProperties}
                />
                <div className="text-xs text-muted-foreground text-center">
                  {data.percentage.toFixed(1)}% of products
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Budget Category Analysis
        </CardTitle>
        <CardDescription>
          Product distribution and revenue analysis by price ranges
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Total Products</span>
            </div>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(0)}</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Avg Price</span>
            </div>
            <div className="text-2xl font-bold">
              ${totalProducts > 0 ? (totalRevenue / totalProducts).toFixed(0) : '0'}
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(budgetAnalysis).map(([category, data]) => (
            <Card 
              key={category} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onCategorySelect?.(category)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <h3 className="font-semibold capitalize">
                      {category === 'mid-range' ? 'Mid-Range' : category}
                    </h3>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getCategoryColor(category)}
                  >
                    {data.count}
                  </Badge>
                </div>
                
                {showDetails && (
                  <div className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Price:</span>
                        <span className="font-medium">${data.avgPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-medium">${data.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Range:</span>
                        <span className="font-medium text-xs">
                          {category === 'budget' && 'Under $100'}
                          {category === 'mid-range' && '$100-$299'}
                          {category === 'luxury' && '$300+'}
                          {category === 'unknown' && 'No Price'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Market Share</span>
                        <span>{data.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={data.percentage} 
                        className="h-2"
                        style={{
                          '--progress-background': getProgressColor(category)
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Insights */}
        {showDetails && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Budget Insights
            </h4>
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Most Popular:</span>
                <span className="ml-2 font-medium">
                  {Object.entries(budgetAnalysis)
                    .sort((a, b) => b[1].count - a[1].count)[0]?.[0]
                    ?.replace('mid-range', 'Mid-Range') || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Highest Revenue:</span>
                <span className="ml-2 font-medium">
                  {Object.entries(budgetAnalysis)
                    .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)[0]?.[0]
                    ?.replace('mid-range', 'Mid-Range') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 