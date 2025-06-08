"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, SlidersHorizontal, DollarSign, ArrowUpDown } from "lucide-react"
import { GiftVoucherFilters } from "@/lib/types/rezdy"

interface GiftVoucherFiltersProps {
  filters: GiftVoucherFilters
  onFiltersChange: (filters: GiftVoucherFilters) => void
  totalResults?: number
  isLoading?: boolean
  className?: string
}

export function GiftVoucherFiltersComponent({ 
  filters, 
  onFiltersChange, 
  totalResults = 0,
  isLoading = false,
  className = "" 
}: GiftVoucherFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GiftVoucherFilters>(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 1000
  ])

  // Debounce filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters)
    }, 300)

    return () => clearTimeout(timer)
  }, [localFilters, onFiltersChange])

  const handleSearchChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, searchTerm: value }))
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc']
    setLocalFilters(prev => ({ 
      ...prev, 
      sortBy: sortBy as 'price' | 'name' | 'popularity',
      sortOrder 
    }))
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    setLocalFilters(prev => ({ 
      ...prev, 
      priceRange: { min: values[0], max: values[1] } 
    }))
  }

  const handleVoucherTypeChange = (value: string) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      voucherType: value === 'all' ? undefined : value as 'fixed' | 'custom' | 'experience'
    }))
  }

  const handleAvailabilityChange = (value: string) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      availability: value === 'all' ? undefined : value as 'available' | 'limited' | 'sold_out'
    }))
  }

  const clearFilters = () => {
    const clearedFilters: GiftVoucherFilters = {
      searchTerm: '',
      sortBy: 'popularity',
      sortOrder: 'desc',
      limit: filters.limit,
      offset: 0
    }
    setLocalFilters(clearedFilters)
    setPriceRange([0, 1000])
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.searchTerm) count++
    if (localFilters.priceRange && ((localFilters.priceRange.min || 0) > 0 || (localFilters.priceRange.max || 1000) < 1000)) count++
    if (localFilters.voucherType) count++
    if (localFilters.availability) count++
    return count
  }

  const getSortLabel = () => {
    const sortKey = `${localFilters.sortBy || 'popularity'}-${localFilters.sortOrder || 'desc'}`
    const labels: Record<string, string> = {
      'price-asc': 'Price: Low to High',
      'price-desc': 'Price: High to Low',
      'name-asc': 'Name: A to Z',
      'name-desc': 'Name: Z to A',
      'popularity-desc': 'Most Popular',
      'popularity-asc': 'Least Popular'
    }
    return labels[sortKey] || 'Most Popular'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search gift vouchers..."
                value={localFilters.searchTerm || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <Select value={`${localFilters.sortBy || 'popularity'}-${localFilters.sortOrder || 'desc'}`} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity-desc">Most Popular</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="sm:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-barlow">Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Label>
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={1000}
                min={0}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>

            {/* Voucher Type */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Voucher Type</Label>
              <Select value={localFilters.voucherType || 'all'} onValueChange={handleVoucherTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="custom">Custom Amount</SelectItem>
                  <SelectItem value="experience">Experience Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Availability</Label>
              <Select value={localFilters.availability || 'all'} onValueChange={handleAvailabilityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="sold_out">Sold Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span>Loading gift vouchers...</span>
          ) : (
            <span>
              {totalResults} gift voucher{totalResults !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
        
        {getActiveFiltersCount() > 0 && (
          <div className="flex items-center gap-2">
            <span>Active filters:</span>
            <div className="flex gap-1">
              {localFilters.searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: {localFilters.searchTerm}
                </Badge>
              )}
              {localFilters.priceRange && ((localFilters.priceRange.min || 0) > 0 || (localFilters.priceRange.max || 1000) < 1000) && (
                <Badge variant="secondary" className="text-xs">
                  ${localFilters.priceRange.min || 0} - ${localFilters.priceRange.max || 1000}
                </Badge>
              )}
              {localFilters.voucherType && (
                <Badge variant="secondary" className="text-xs">
                  {localFilters.voucherType}
                </Badge>
              )}
              {localFilters.availability && (
                <Badge variant="secondary" className="text-xs">
                  {localFilters.availability}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 