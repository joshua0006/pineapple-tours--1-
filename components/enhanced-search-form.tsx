"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  DollarSign,
  ChevronDown,
  X,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

import { useProductFiltering } from '@/hooks/use-rezdy-data-manager';
import { dataSegmentationEngine } from '@/lib/utils/data-segmentation';
import { cacheManager } from '@/lib/utils/cache-manager';
import {
  RezdyProduct,
  ProductFilters,
  FilterCriteria,
  SegmentedProducts
} from '@/lib/types/rezdy';

interface EnhancedSearchFormProps {
  products: RezdyProduct[];
  onResults: (results: RezdyProduct[]) => void;
  onFiltersChange?: (filters: ProductFilters) => void;
  className?: string;
}

interface AdvancedFilters {
  priceRange: [number, number];
  duration: string;
  groupSize: [number, number];
  categories: string[];
  locations: string[];
  features: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export function EnhancedSearchForm({ 
  products, 
  onResults, 
  onFiltersChange,
  className 
}: EnhancedSearchFormProps) {
  const { filteredProducts, filters, setFilters } = useProductFiltering(products);
  
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [segmentedProducts, setSegmentedProducts] = useState<SegmentedProducts | null>(null);
  
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    priceRange: [0, 500],
    duration: 'any',
    groupSize: [1, 50],
    categories: [],
    locations: [],
    features: [],
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  // Generate search suggestions based on product data
  const generateSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    
    products.forEach(product => {
      // Add product names
      if (product.name) {
        suggestions.add(product.name);
      }
      
      // Add categories
      product.categories?.forEach(category => {
        suggestions.add(category);
      });
      
      // Add product types
      if (product.productType) {
        suggestions.add(product.productType);
      }
      
      // Add location keywords
      if (typeof product.locationAddress === 'string') {
        const locationWords = product.locationAddress.split(/[\s,]+/);
        locationWords.forEach(word => {
          if (word.length > 3) {
            suggestions.add(word);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 10);
  }, [products]);

  // Handle search input changes with suggestions
  const handleSearchChange = async (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    
    if (value.length > 2) {
      // Check cache for search suggestions
      const cacheKey = `suggestions:${value.toLowerCase()}`;
      const cachedSuggestions = await cacheManager.get<string[]>(cacheKey);
      
      if (cachedSuggestions) {
        setSearchSuggestions(cachedSuggestions);
      } else {
        // Generate new suggestions
        const filtered = generateSuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setSearchSuggestions(filtered);
        
        // Cache the suggestions
        await cacheManager.set(cacheKey, filtered, 300); // 5 minutes
      }
      
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    const criteria: FilterCriteria = {
      temporal: {
        date_range: {
          start: advancedFilters.dateRange.from || new Date(),
          end: advancedFilters.dateRange.to || new Date()
        },
        season: getCurrentSeason(),
        day_of_week: [],
        time_of_day: 'morning'
      },
      commercial: {
        price_range: {
          min: advancedFilters.priceRange[0],
          max: advancedFilters.priceRange[1]
        },
        product_types: [],
        capacity_range: {
          min: advancedFilters.groupSize[0],
          max: advancedFilters.groupSize[1]
        }
      },
      geographical: {
        locations: advancedFilters.locations,
        regions: [],
        pickup_points: []
      },
      operational: {
        availability_status: 'available',
        lead_time: 0,
        group_size: {
          min: advancedFilters.groupSize[0],
          max: advancedFilters.groupSize[1]
        }
      }
    };

    const segmented = dataSegmentationEngine.segmentProducts(products, criteria);
    setSegmentedProducts(segmented);
    
    // Apply multi-dimensional filtering
    const filtered = dataSegmentationEngine.applyMultiDimensionalFilter(products, criteria);
    onResults(filtered);
  };

  // Quick filter presets
  const quickFilters = [
    { label: 'Popular', action: () => applyQuickFilter('popular') },
    { label: 'Budget Friendly', action: () => applyQuickFilter('budget') },
    { label: 'Premium', action: () => applyQuickFilter('premium') },
    { label: 'Family Friendly', action: () => applyQuickFilter('family') },
    { label: 'Adventure', action: () => applyQuickFilter('adventure') },
    { label: 'Cultural', action: () => applyQuickFilter('cultural') }
  ];

  const applyQuickFilter = (type: string) => {
    switch (type) {
      case 'popular':
        setFilters(prev => ({ ...prev, productType: 'TOUR' }));
        break;
      case 'budget':
        setFilters(prev => ({ ...prev, priceRange: 'under-99' }));
        break;
      case 'premium':
        setFilters(prev => ({ ...prev, priceRange: 'over-299' }));
        break;
      case 'family':
        setFilters(prev => ({ ...prev, searchTerm: 'family' }));
        break;
      case 'adventure':
        setFilters(prev => ({ ...prev, searchTerm: 'adventure' }));
        break;
      case 'cultural':
        setFilters(prev => ({ ...prev, searchTerm: 'cultural' }));
        break;
    }
  };

  // Smart search with AI-like suggestions
  const getSmartSuggestions = () => {
    if (!segmentedProducts) return [];
    
    const suggestions = [];
    
    if (segmentedProducts.high_demand.length > 0) {
      suggestions.push({
        type: 'trending',
        title: 'Trending Now',
        products: segmentedProducts.high_demand.slice(0, 3),
        icon: TrendingUp
      });
    }
    
    if (segmentedProducts.seasonal.length > 0) {
      suggestions.push({
        type: 'seasonal',
        title: 'Perfect for This Season',
        products: segmentedProducts.seasonal.slice(0, 3),
        icon: CalendarIcon
      });
    }
    
    if (segmentedProducts.price_optimized.length > 0) {
      suggestions.push({
        type: 'value',
        title: 'Best Value',
        products: segmentedProducts.price_optimized.slice(0, 3),
        icon: DollarSign
      });
    }
    
    return suggestions;
  };

  // Update results when filters change
  useEffect(() => {
    onResults(filteredProducts);
    onFiltersChange?.(filters);
  }, [filteredProducts, filters, onResults, onFiltersChange]);

  // Initialize segmentation
  useEffect(() => {
    if (products.length > 0) {
      const segmented = dataSegmentationEngine.segmentProducts(products);
      setSegmentedProducts(segmented);
    }
  }, [products]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Mode Toggle */}
      <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'simple' | 'advanced')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple Search</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Search</TabsTrigger>
        </TabsList>

        {/* Simple Search */}
        <TabsContent value="simple" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Main Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tours, experiences, locations..."
                    value={filters.searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                  
                  {/* Search Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-3 py-2 text-left hover:bg-muted"
                          onClick={() => {
                            setFilters(prev => ({ ...prev, searchTerm: suggestion }));
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                  {quickFilters.map((filter, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={filter.action}
                      className="text-xs"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>

                {/* Basic Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="productType">Type</Label>
                    <Select
                      value={filters.productType}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, productType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="TOUR">Tours</SelectItem>
                        <SelectItem value="EXPERIENCE">Experiences</SelectItem>
                        <SelectItem value="TRANSFER">Transfers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priceRange">Price Range</Label>
                    <Select
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Price</SelectItem>
                        <SelectItem value="under-99">Under $99</SelectItem>
                        <SelectItem value="99-159">$99 - $159</SelectItem>
                        <SelectItem value="159-299">$159 - $299</SelectItem>
                        <SelectItem value="over-299">Over $299</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Location</SelectItem>
                        <SelectItem value="sydney">Sydney</SelectItem>
                        <SelectItem value="melbourne">Melbourne</SelectItem>
                        <SelectItem value="brisbane">Brisbane</SelectItem>
                        <SelectItem value="perth">Perth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={filters.availability}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Suggestions */}
          {segmentedProducts && (
            <div className="space-y-4">
              {getSmartSuggestions().map((suggestion, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <suggestion.icon className="mr-2 h-5 w-5" />
                      {suggestion.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {suggestion.products.map((product) => (
                        <div
                          key={product.productCode}
                          className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                          onClick={() => setFilters(prev => ({ ...prev, searchTerm: product.name }))}
                        >
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${product.advertisedPrice || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Advanced Search */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Advanced Filters
              </CardTitle>
              <CardDescription>
                Use detailed criteria to find exactly what you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Range Slider */}
              <div>
                <Label>Price Range: ${advancedFilters.priceRange[0]} - ${advancedFilters.priceRange[1]}</Label>
                <Slider
                  value={advancedFilters.priceRange}
                  onValueChange={(value) => setAdvancedFilters(prev => ({ 
                    ...prev, 
                    priceRange: value as [number, number] 
                  }))}
                  max={500}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Group Size */}
              <div>
                <Label>Group Size: {advancedFilters.groupSize[0]} - {advancedFilters.groupSize[1]} people</Label>
                <Slider
                  value={advancedFilters.groupSize}
                  onValueChange={(value) => setAdvancedFilters(prev => ({ 
                    ...prev, 
                    groupSize: value as [number, number] 
                  }))}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {advancedFilters.dateRange.from ? (
                          format(advancedFilters.dateRange.from, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={advancedFilters.dateRange.from}
                        onSelect={(date) => setAdvancedFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: date }
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {advancedFilters.dateRange.to ? (
                          format(advancedFilters.dateRange.to, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={advancedFilters.dateRange.to}
                        onSelect={(date) => setAdvancedFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: date }
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label>Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {[
                    'Adventure', 'Cultural', 'Food & Wine', 'Nature', 'Urban', 'Family',
                    'Romantic', 'Luxury', 'Photography', 'Water Activities',
                    'Workshops', 'Classes', 'Tastings',
                    'Transfers', 'Day Trips', 'Multi-day Tours', 'Airport Services'
                  ].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={advancedFilters.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              categories: [...prev.categories, category]
                            }));
                          } else {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              categories: prev.categories.filter(c => c !== category)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={category} className="text-sm">{category}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Advanced Filters Button */}
              <Button onClick={applyAdvancedFilters} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Apply Advanced Filters
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Filters Display */}
      {(filters.searchTerm || filters.productType !== 'all' || filters.priceRange !== 'all' || 
        filters.location !== 'all' || filters.availability !== 'all') && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Active Filters:</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  searchTerm: '',
                  productType: 'all',
                  priceRange: 'all',
                  availability: 'all',
                  location: 'all'
                })}
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.searchTerm}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  />
                </Badge>
              )}
              {filters.productType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filters.productType}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, productType: 'all' }))}
                  />
                </Badge>
              )}
              {filters.priceRange !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: {filters.priceRange}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, priceRange: 'all' }))}
                  />
                </Badge>
              )}
              {filters.location !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, location: 'all' }))}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredProducts.length} of {products.length} results
        </span>
        <span className="flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          Updated {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

// Helper function to get current season
function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
} 