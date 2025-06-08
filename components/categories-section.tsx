'use client'

import Link from "next/link"
import { ChevronRight, ChevronLeft, Loader2, AlertCircle, Wine, Beer, Bus, Calendar, Building, Sparkles, Activity, Users, Car, GraduationCap, Ticket, Package, Gift, Heart, MapPin, Clock, Star, Search, Plus } from "lucide-react"
import React, { useState, useEffect, useRef, useMemo } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRezdyProducts } from "@/hooks/use-rezdy"
import { TOUR_CATEGORIES, TourCategory, filterProductsByCategory } from "@/lib/constants/categories"
import { RezdyProduct } from "@/lib/types/rezdy"
import { cn } from "@/lib/utils"

// Top-level categories as specified
const TOP_LEVEL_CATEGORIES = [
  {
    id: 'winery-tours',
    title: 'Winery Tours',
    description: 'Wine tasting experiences at local wineries and vineyards',
    icon: Wine,
    subcategories: ['winery-tours', 'barefoot-luxury'] as string[]
  },
  {
    id: 'brewery-tours',
    title: 'Brewery Tours',
    description: 'Craft beer experiences and brewery visits',
    icon: Beer,
    subcategories: ['brewery-tours', 'day-tours'] as string[]
  },
  {
    id: 'hop-on-hop-off',
    title: 'Hop-On Hop-Off',
    description: 'Flexible sightseeing with hop-on hop-off bus services',
    icon: Bus,
    subcategories: ['hop-on-hop-off', 'transfers', 'day-tours'] as string[]
  },
  {
    id: 'bus-charter',
    title: 'Bus Charter',
    description: 'Private bus and coach charter services for groups',
    icon: Bus,
    subcategories: ['bus-charter', 'corporate-tours', 'private-tours'] as string[]
  },
  {
    id: 'day-tours',
    title: 'Day Tours',
    description: 'Full-day guided tours and excursions',
    icon: Calendar,
    subcategories: ['day-tours', 'winery-tours', 'brewery-tours', 'activities'] as string[]
  },
  {
    id: 'corporate-tours',
    title: 'Corporate Tours',
    description: 'Business events, team building, and corporate experiences',
    icon: Building,
    subcategories: ['corporate-tours', 'private-tours', 'bus-charter', 'activities'] as string[]
  },
  {
    id: 'hens-party',
    title: 'Hens Party',
    description: 'Special celebrations for brides-to-be and their friends',
    icon: Heart,
    subcategories: ['hens-party', 'winery-tours', 'brewery-tours', 'barefoot-luxury'] as string[]
  },
  {
    id: 'barefoot-luxury',
    title: 'Barefoot Luxury',
    description: 'Premium and luxury experiences with exclusive service',
    icon: Sparkles,
    subcategories: ['barefoot-luxury', 'private-tours', 'winery-tours', 'corporate-tours'] as string[]
  }
]

// Icon mapping for categories
const CATEGORY_ICONS = {
  'winery-tours': Wine,
  'brewery-tours': Beer,
  'hop-on-hop-off': Bus,
  'bus-charter': Bus,
  'day-tours': Calendar,
  'corporate-tours': Building,
  'hens-party': Heart,
  'barefoot-luxury': Sparkles,
  'activities': Activity,
  'private-tours': Users,
  'multiday-tours': Package,
  'transfers': Car,
  'lessons': GraduationCap,
  'tickets': Ticket,
  'rentals': Car,
  'gift-cards': Gift,
  'merchandise': Package,
} as const

// Left navigation panel component
function CategoryNavigation({ 
  selectedCategory, 
  onCategorySelect,
  categoriesWithCounts,
  allProducts
}: { 
  selectedCategory: string; 
  onCategorySelect: (categoryId: string) => void;
  categoriesWithCounts: TourCategory[];
  allProducts: RezdyProduct[];
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter categories based on search
  const filteredCategories = TOP_LEVEL_CATEGORIES.filter(category => {
    if (!searchTerm.trim()) return true
    return category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Calculate product count for each category
  const getCategoryProductCount = (category: typeof TOP_LEVEL_CATEGORIES[0]) => {
    if (!allProducts.length) return 0
    
    let filteredProducts = category.subcategories.reduce((acc: RezdyProduct[], subcategoryId) => {
      const subcategory = categoriesWithCounts.find(cat => cat.id === subcategoryId)
      if (subcategory) {
        const subProducts = filterProductsByCategory(allProducts, subcategory)
        subProducts.forEach(product => {
          if (!acc.find(p => p.productCode === product.productCode)) {
            acc.push(product)
          }
        })
      }
      return acc
    }, [])
    
    return filteredProducts.filter(product => 
      product.productType !== 'GIFT_CARD' && 
      product.productType !== 'GIFT_VOUCHER' &&
      !product.name.toLowerCase().includes('gift card') &&
      !product.name.toLowerCase().includes('gift voucher')
    ).length
  }

  return (
    <div className={cn(
      "bg-[#141312] border-r border-gray-700 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-72 xl:w-80"
    )}>
      {/* Header with collapse toggle */}
      <div className="p-3 xl:p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h3 className="text-base xl:text-lg font-semibold text-white font-['Barlow'] truncate">
                Browse Categories
              </h3>
              <p className="text-xs xl:text-sm text-gray-300 font-['Work_Sans'] mt-1 truncate">
                Select a category to explore
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1 h-8 w-8 flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Search Input - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#FF585D] focus:ring-[#FF585D] text-sm"
            />
          </div>
        )}
      </div>
      
      {/* Scrollable Navigation */}
      <nav className="flex-1">
        <div className={cn("p-2 space-y-1", isCollapsed && "px-1")}>
          {filteredCategories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            const productCount = getCategoryProductCount(category)
            
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 xl:p-3 rounded-lg text-left transition-all duration-200 group relative",
                  isSelected
                    ? "bg-[#FF585D] text-white shadow-md"
                    : "text-white hover:text-[#FF585D] hover:bg-gray-800/50",
                  isCollapsed && "justify-center p-2"
                )}
                title={isCollapsed ? `${category.title} (${productCount} tours)` : undefined}
              >
                <Icon className={cn(
                  "h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0 transition-colors duration-200",
                  isSelected ? "text-white" : "text-[#FF585D]"
                )} />
                
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium font-['Barlow'] text-sm leading-tight",
                        isSelected ? "text-white" : "text-white"
                      )}>
                        {category.title}
                      </div>
                     
                      {productCount > 0 && (
                        <div className={cn(
                          "text-xs font-['Work_Sans'] mt-1",
                          isSelected ? "text-white/80" : "text-gray-400"
                        )}>
                          {productCount} tours
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <ChevronRight className="h-4 w-4 text-white flex-shrink-0" />
                    )}
                  </>
                )}
                
                {/* Collapsed state indicator */}
                {isCollapsed && isSelected && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-full" />
                )}
              </button>
            )
          })}
          
          {/* No results message */}
          {filteredCategories.length === 0 && !isCollapsed && (
            <div className="text-center py-8 px-4">
              <div className="text-gray-500 mb-2">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-400 font-['Work_Sans']">
                No categories found
              </p>
              <p className="text-xs text-gray-500 font-['Work_Sans'] mt-1">
                Try different search terms
              </p>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

// Product card component for displaying individual products
function ProductCard({ 
  product 
}: { 
  product: RezdyProduct 
}) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
  const imageUrl = primaryImage?.itemUrl || primaryImage?.mediumSizeUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  
  const formatPrice = (price?: number) => {
    if (!price || price <= 0) return '$0'
    return `$${price.toFixed(0)}`
  }

  return (
    <Link 
      href={`/tours/${product.productCode}`} 
      className="group block flex-shrink-0 w-72 sm:w-80 md:w-72 lg:w-80 xl:w-72 2xl:w-80" 
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-96 sm:h-[420px] md:h-96 lg:h-[420px] xl:h-96 2xl:h-[420px]">
        {/* Full Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        
        {/* Hover Overlay with Description */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 sm:p-6">
          <div className="text-center text-white max-w-full">
            <div className="overflow-hidden mb-3 sm:mb-4">
              <h4 className="text-lg sm:text-xl md:text-lg lg:text-xl font-bold font-['Barlow'] leading-tight transform transition-transform duration-700 ease-out translate-y-4 group-hover:translate-y-0">
                {product.name}
              </h4>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm sm:text-base md:text-sm lg:text-base font-['Work_Sans'] leading-relaxed line-clamp-4 sm:line-clamp-5 transform transition-transform duration-700 ease-out delay-100 translate-y-4 group-hover:translate-y-0">
                {product.shortDescription || product.description || 'Experience something amazing with this tour. Discover new places and create unforgettable memories.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content - Hidden on Hover */}
        <div className="relative h-full p-4 sm:p-6 flex flex-col justify-end text-white opacity-100 group-hover:opacity-0 transition-opacity duration-300">
          {/* Title with Sliding Animation */}
          <div className="overflow-hidden mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl md:text-lg lg:text-xl font-bold font-['Barlow'] leading-tight text-white line-clamp-2 drop-shadow-lg transform transition-transform duration-500 ease-out group-hover:translate-x-2 group-hover:-translate-y-1">
              {product.name}
            </h4>
          </div>
          
          {/* Price and Book Button */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <div className="text-xs text-gray-300 font-['Work_Sans'] uppercase tracking-wide mb-1">
                STARTING FROM
              </div>
              <div className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold text-white font-['Barlow'] drop-shadow-lg">
                {formatPrice(product.advertisedPrice)}
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-[#FF585D] hover:bg-[#FF585D]/90 text-white border-none transition-all duration-300 font-['Work_Sans'] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = `/tours/${product.productCode}`
              }}
            >
              BOOK
            </Button>
          </div>
        </div>
        
        {/* Error handling for background image */}
        <img
          src={imageUrl}
          alt=""
          className="hidden"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            const card = target.closest('.group')
            if (card) {
              const bgDiv = card.querySelector('[style*="background-image"]') as HTMLElement
              if (bgDiv) {
                bgDiv.style.backgroundImage = `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')`
              }
            }
          }}
        />
      </div>
    </Link>
  )
}

// Show More card component
function ShowMoreCard({ 
  category,
  productCount
}: { 
  category: typeof TOP_LEVEL_CATEGORIES[0];
  productCount: number
}) {
  return (
    <Link 
      href={`/tours?category=${category.id}`} 
      className="group block flex-shrink-0 w-72 sm:w-80 md:w-72 lg:w-80 xl:w-72 2xl:w-80" 
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-[#FF585D]/50 transition-all duration-300 hover:border-[#FF585D] hover:bg-[#FF585D]/5 h-96 sm:h-[420px] md:h-96 lg:h-[420px] xl:h-96 2xl:h-[420px] flex items-center justify-center">
        <div className="text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[#FF585D]/10 flex items-center justify-center group-hover:bg-[#FF585D]/20 transition-colors duration-300">
            <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-[#FF585D]" />
          </div>
          
          <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-['Barlow']">
            View All {category.title}
          </h4>
          
          <p className="text-sm sm:text-base text-gray-300 font-['Work_Sans'] mb-4 sm:mb-6 line-clamp-3">
            Explore all {productCount} available tours in this category and discover amazing experiences
          </p>
          
          <Button 
            size="sm" 
            variant="outline"
            className="border-[#FF585D] text-[#FF585D] hover:bg-[#FF585D] hover:text-white transition-all duration-300 font-['Work_Sans'] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2"
          >
            SHOW MORE
            <ChevronRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </Link>
  )
}

// Individual category row component
function CategoryRow({ 
  category,
  products,
  categoriesWithCounts
}: { 
  category: typeof TOP_LEVEL_CATEGORIES[0];
  products: RezdyProduct[];
  categoriesWithCounts: TourCategory[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Get products for this category
  const categoryProducts = useMemo(() => {
    if (!products.length) return []
    
    let filteredProducts = category.subcategories.reduce((acc: RezdyProduct[], subcategoryId) => {
      const subcategory = categoriesWithCounts.find(cat => cat.id === subcategoryId)
      if (subcategory) {
        const subProducts = filterProductsByCategory(products, subcategory)
        subProducts.forEach(product => {
          if (!acc.find(p => p.productCode === product.productCode)) {
            acc.push(product)
          }
        })
      }
      return acc
    }, [])
    
    // Filter out gift vouchers/gift cards
    filteredProducts = filteredProducts.filter(product => 
      product.productType !== 'GIFT_CARD' && 
      product.productType !== 'GIFT_VOUCHER' &&
      !product.name.toLowerCase().includes('gift card') &&
      !product.name.toLowerCase().includes('gift voucher')
    )
    
    return filteredProducts.slice(0, 6) // Show 6 products max
  }, [products, category.subcategories, categoriesWithCounts])

  const totalCategoryProducts = useMemo(() => {
    if (!products.length) return 0
    
    let filteredProducts = category.subcategories.reduce((acc: RezdyProduct[], subcategoryId) => {
      const subcategory = categoriesWithCounts.find(cat => cat.id === subcategoryId)
      if (subcategory) {
        const subProducts = filterProductsByCategory(products, subcategory)
        subProducts.forEach(product => {
          if (!acc.find(p => p.productCode === product.productCode)) {
            acc.push(product)
          }
        })
      }
      return acc
    }, [])
    
    return filteredProducts.filter(product => 
      product.productType !== 'GIFT_CARD' && 
      product.productType !== 'GIFT_VOUCHER' &&
      !product.name.toLowerCase().includes('gift card') &&
      !product.name.toLowerCase().includes('gift voucher')
    ).length
  }, [products, category.subcategories, categoriesWithCounts])

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons)
      const resizeObserver = new ResizeObserver(checkScrollButtons)
      resizeObserver.observe(scrollElement)
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollButtons)
        resizeObserver.disconnect()
      }
    }
  }, [categoryProducts])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Responsive scroll amount based on card width
      const scrollAmount = window.innerWidth >= 1536 ? 320 : window.innerWidth >= 1024 ? 320 : window.innerWidth >= 640 ? 320 : 288
      const currentScroll = scrollRef.current.scrollLeft
      const newScrollLeft = direction === 'right' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount
      
      scrollRef.current.scrollTo({ 
        left: Math.max(0, newScrollLeft), 
        behavior: 'smooth' 
      })
    }
  }

  if (categoryProducts.length === 0) return null

  return (
    <div className="mb-6 lg:mb-8">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3 lg:mb-4 px-1">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
          <category.icon className="h-5 w-5 lg:h-6 lg:w-6 text-[#FF585D] flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white font-['Barlow'] truncate">
              {category.title}
            </h4>
            <p className="text-xs lg:text-sm text-gray-300 font-['Work_Sans'] truncate">
              {totalCategoryProducts} tours available
            </p>
          </div>
        </div>
        
        {/* Scroll Controls */}
        <div className="flex gap-1 lg:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-7 w-7 lg:h-8 lg:w-8 p-0 border-[#FF585D] text-[#FF585D] hover:bg-[#FF585D] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-[#141312]"
          >
            <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-7 w-7 lg:h-8 lg:w-8 p-0 border-[#FF585D] text-[#FF585D] hover:bg-[#FF585D] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-[#141312]"
          >
            <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scrolling Container */}
      <div className="relative group/scroll">
        {/* Left scroll indicator */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-4 lg:w-6 bg-gradient-to-r from-[#141312] to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Right scroll indicator */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-4 lg:w-6 bg-gradient-to-l from-[#141312] to-transparent z-10 pointer-events-none" />
        )}
        
        <div 
          ref={scrollRef}
          className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory'
          }}
        >
          {categoryProducts.map((product) => (
            <ProductCard
              key={product.productCode}
              product={product}
            />
          ))}
          
          {/* Show More Card */}
          <ShowMoreCard 
            category={category}
            productCount={totalCategoryProducts}
          />
        </div>
      </div>
    </div>
  )
}

// Right content area
function CategoryContent({ 
  selectedCategory, 
  categoriesWithCounts,
  allProducts,
  loading
}: { 
  selectedCategory: string; 
  categoriesWithCounts: TourCategory[];
  allProducts: RezdyProduct[];
  loading: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const selectedCategoryData = TOP_LEVEL_CATEGORIES.find(c => c.id === selectedCategory)
  if (!selectedCategoryData) return null

  // Get all categories to display
  const categoriesToShow = selectedCategory === 'all' 
    ? TOP_LEVEL_CATEGORIES 
    : TOP_LEVEL_CATEGORIES.filter(cat => cat.id === selectedCategory)

  // Filter categories based on search
  const filteredCategories = categoriesToShow.filter(category => {
    if (!searchTerm.trim()) return true
    return category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#141312] flex-1">
      {/* Mobile Search */}
      <div className="lg:hidden mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#FF585D] focus:ring-[#FF585D] text-sm"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 lg:py-12">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 lg:h-8 lg:w-8 animate-spin text-[#FF585D]" />
            <span className="ml-2 text-gray-300 font-['Work_Sans'] text-sm lg:text-base">Loading tours...</span>
          </div>
          <p className="text-gray-400 font-['Work_Sans'] text-sm">Please wait while we fetch the latest tour information</p>
        </div>
      )}

      {/* Category Rows */}
      {!loading && (
        <div className="space-y-6 lg:space-y-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="min-w-0">
              <CategoryRow 
                category={category}
                products={allProducts}
                categoriesWithCounts={categoriesWithCounts}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <div className="text-gray-500 mb-4">
            <Package className="h-12 w-12 lg:h-16 lg:w-16 mx-auto" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-300 mb-2">No categories found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  )
}

// Mobile category selector
function MobileCategorySelector({ 
  selectedCategory, 
  onCategorySelect 
}: { 
  selectedCategory: string; 
  onCategorySelect: (categoryId: string) => void 
}) {
  return (
    <div className="bg-[#141312] border-b border-gray-700 p-3 sm:p-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TOP_LEVEL_CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0 text-sm",
                isSelected 
                  ? "bg-[#FF585D] text-white" 
                  : "bg-gray-800 text-white hover:bg-gray-700"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium font-['Work_Sans']">
                {category.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CategoriesSection() {
  const { data: products, loading, error } = useRezdyProducts(100, 0)
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<TourCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('winery-tours')

  // Calculate tour counts for all categories
  useEffect(() => {
    if (products) {
      const allCategories = TOUR_CATEGORIES.map(category => {
        const filteredProducts = filterProductsByCategory(products, category)
        const tourCount = filteredProducts.length

        return {
          ...category,
          tourCount,
          icon: CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS]
        }
      })
      setCategoriesWithCounts(allCategories)
    }
  }, [products])

  if (error) {
    return (
      <section className="bg-[#141312] py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 font-['Barlow']">
              Tour Categories
            </h2>
            <p className="text-base lg:text-lg text-gray-300 font-['Work_Sans']">
              Discover your perfect adventure by category
            </p>
          </div>
          <Alert variant="destructive" className="max-w-md mx-auto bg-red-900/20 border-red-800 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load categories: {error}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#141312] py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 font-['Barlow']">
            Tour Categories
          </h2>
          <p className="text-base lg:text-lg text-gray-300 font-['Work_Sans']">
            Discover your perfect adventure by category
          </p>
        </div>

        {/* Mobile Category Selector */}
        <div className="lg:hidden mb-4">
          <MobileCategorySelector 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Main Layout: Left Sidebar + Right Content */}
        <div className="bg-[#141312] rounded-xl lg:rounded-2xl shadow-lg overflow-hidden border border-gray-700">
          <div className="flex min-h-[600px] lg:min-h-[700px]">
            {/* Left Navigation Panel - Hidden on mobile */}
            <div className="hidden lg:block flex-shrink-0">
              <CategoryNavigation 
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                categoriesWithCounts={categoriesWithCounts}
                allProducts={products || []}
              />
            </div>
            
            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              <CategoryContent 
                selectedCategory={selectedCategory}
                categoriesWithCounts={categoriesWithCounts}
                allProducts={products || []}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 