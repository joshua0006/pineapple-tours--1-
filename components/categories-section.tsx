'use client'

import Link from "next/link"
import { ChevronRight, ChevronLeft, Loader2, AlertCircle, Wine, Beer, Bus, Calendar, Building, Sparkles, Activity, Users, Car, GraduationCap, Ticket, Package, Gift, Heart } from "lucide-react"
import { useState, useEffect, useRef } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRezdyProducts } from "@/hooks/use-rezdy"
import { TOUR_CATEGORIES, TourCategory, filterProductsByCategory } from "@/lib/constants/categories"
import { cn } from "@/lib/utils"

// Top-level categories as specified
const TOP_LEVEL_CATEGORIES = [
  {
    id: 'winery-tours',
    title: 'Winery Tours',
    description: 'Wine tasting experiences at local wineries and vineyards',
    icon: Wine,
    subcategories: ['winery-tours', 'barefoot-luxury'] as string[] // Related wine experiences
  },
  {
    id: 'brewery-tours',
    title: 'Brewery Tours',
    description: 'Craft beer experiences and brewery visits',
    icon: Beer,
    subcategories: ['brewery-tours', 'day-tours'] as string[] // Related beer experiences
  },
  {
    id: 'hop-on-hop-off',
    title: 'Hop-On Hop-Off',
    description: 'Flexible sightseeing with hop-on hop-off bus services',
    icon: Bus,
    subcategories: ['hop-on-hop-off', 'transfers', 'day-tours'] as string[] // Related transport
  },
  {
    id: 'bus-charter',
    title: 'Bus Charter',
    description: 'Private bus and coach charter services for groups',
    icon: Bus,
    subcategories: ['bus-charter', 'corporate-tours', 'private-tours'] as string[] // Related charter services
  },
  {
    id: 'day-tours',
    title: 'Day Tours',
    description: 'Full-day guided tours and excursions',
    icon: Calendar,
    subcategories: ['day-tours', 'winery-tours', 'brewery-tours', 'activities'] as string[] // Various day experiences
  },
  {
    id: 'corporate-tours',
    title: 'Corporate Tours',
    description: 'Business events, team building, and corporate experiences',
    icon: Building,
    subcategories: ['corporate-tours', 'private-tours', 'bus-charter', 'activities'] as string[] // Corporate options
  },
  {
    id: 'hens-party',
    title: 'Hens Party',
    description: 'Special celebrations for brides-to-be and their friends',
    icon: Heart,
    subcategories: ['hens-party', 'winery-tours', 'brewery-tours', 'barefoot-luxury'] as string[] // Party experiences
  },
  {
    id: 'barefoot-luxury',
    title: 'Barefoot Luxury',
    description: 'Premium and luxury experiences with exclusive service',
    icon: Sparkles,
    subcategories: ['barefoot-luxury', 'private-tours', 'winery-tours', 'corporate-tours'] as string[] // Luxury options
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

// Image mapping for categories
const CATEGORY_IMAGES = {
  'winery-tours': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'brewery-tours': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'hop-on-hop-off': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'bus-charter': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'day-tours': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'corporate-tours': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'hens-party': 'https://images.unsplash.com/photo-1529636798458-92182e662485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'barefoot-luxury': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'activities': 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'private-tours': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'multiday-tours': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'transfers': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'lessons': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'tickets': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'rentals': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'gift-cards': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  'merchandise': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
} as const

// Left navigation panel component
function CategoryNavigation({ 
  selectedCategory, 
  onCategorySelect 
}: { 
  selectedCategory: string; 
  onCategorySelect: (categoryId: string) => void 
}) {
  return (
    <div className="bg-[#1a1918] border-r border-gray-700 h-full">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white font-['Barlow']">
          Browse Categories
        </h3>
        <p className="text-sm text-gray-300 font-['Work_Sans'] mt-1">
          Select a category to explore
        </p>
      </div>
      
      <nav className="p-4 space-y-2">
        {TOP_LEVEL_CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id
          
          return (
            <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-200",
              isSelected
                ? "bg-[#FF585D] text-white shadow-md"
                : "text-white hover:text-[#FF585D] hover:bg-gray-800/50"
            )}
          >
          
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isSelected ? "text-white" : "text-[#FF585D]"
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium font-['Barlow']",
                  isSelected ? "text-white" : "text-white"
                )}>
                  {category.title}
                </div>
                <div className={cn(
                  "text-xs font-['Work_Sans'] mt-1 truncate",
                  isSelected ? "text-white/90" : "text-gray-300"
                )}>
                  {category.description}
                </div>
              </div>
              {isSelected && (
                <ChevronRight className="h-4 w-4 text-white flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// Horizontal scrolling subcategory card component
function SubcategoryCard({ 
  category, 
  tourCount 
}: { 
  category: TourCategory; 
  tourCount: number 
}) {
  const Icon = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS]
  const image = CATEGORY_IMAGES[category.id as keyof typeof CATEGORY_IMAGES]

  return (
    <Link href={`/tours?category=${category.slug}`} className="group block flex-shrink-0 w-80">
      <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-96 bg-white">
        {/* Background Image */}
        <img
          src={image}
          alt={category.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Hover overlay with description */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
          <div className="text-white text-center">
            <p className="text-lg font-['Work_Sans'] leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
        
        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white group-hover:opacity-0 transition-opacity duration-300">
          <h4 className="text-2xl font-bold mb-3 font-['Barlow'] leading-tight">
            {category.title}
          </h4>
          
          {/* Single Book Now button */}
          <div className="flex justify-center">
            <Button 
              size="sm" 
              className="bg-white text-black hover:bg-gray-100 border-none transition-all duration-300 font-['Work_Sans'] text-sm font-semibold px-8 py-2 rounded-none"
            >
              BOOK NOW
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Horizontal scrolling content area component
function CategoryContent({ 
  selectedCategory, 
  categoriesWithCounts 
}: { 
  selectedCategory: string; 
  categoriesWithCounts: TourCategory[] 
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const category = TOP_LEVEL_CATEGORIES.find(c => c.id === selectedCategory)
  if (!category) return null

  const subcategories = categoriesWithCounts.filter(cat => 
    category.subcategories.includes(cat.id as string)
  )

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
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons)
    }
  }, [subcategories])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320 // Width of one card plus gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col bg-[#141312]">
      {/* Header */}
      <div className="mb-8 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <category.icon className="h-8 w-8 text-[#FF585D]" />
          <h2 className="text-3xl font-semibold text-white font-['Barlow']">
            {category.title}
          </h2>
        </div>
        <p className="text-lg text-gray-300 font-['Work_Sans'] max-w-2xl">
          {category.description}. Explore our curated selection of experiences designed to create unforgettable memories.
        </p>
      </div>

      {/* Horizontal Scrolling Subcategories */}
      {subcategories.length > 0 ? (
        <div className="flex-1 flex flex-col">
          {/* Scroll Controls */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white font-['Barlow']">
              Available Options
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="h-10 w-10 p-0 border-[#FF585D] text-[#FF585D] hover:bg-[#FF585D] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="h-10 w-10 p-0 border-[#FF585D] text-[#FF585D] hover:bg-[#FF585D] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Horizontal Scrolling Container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {subcategories.map((subcat) => (
              <SubcategoryCard
                key={subcat.id}
                category={subcat}
                tourCount={subcat.tourCount || 0}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 flex-1 flex items-center justify-center">
          <div>
            <div className="text-gray-500 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No subcategories available</h3>
            <p className="text-gray-400">Check back soon for new experiences in this category.</p>
          </div>
        </div>
      )}

      {/* View All Button */}
      {subcategories.length > 0 && (
        <div className="mt-8 text-center flex-shrink-0">
          <Link href="/tours">
            <Button 
              size="lg" 
              className="bg-[#FF585D] hover:bg-[#FF585D]/90 text-white px-8 py-3 text-lg font-['Work_Sans'] transition-all duration-300"
            >
              View All Tours
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
    <div className="bg-[#1a1918] border-b border-gray-700 p-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {TOP_LEVEL_CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0",
                isSelected 
                  ? "bg-[#FF585D] text-white" 
                  : "bg-gray-800 text-white hover:bg-gray-700"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium font-['Work_Sans']">
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
          icon: CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS],
          image: CATEGORY_IMAGES[category.id as keyof typeof CATEGORY_IMAGES]
        }
      })
      setCategoriesWithCounts(allCategories)
    }
  }, [products])

  if (loading) {
    return (
      <section className="bg-[#141312] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-white mb-4 font-['Barlow']">
              Tour Categories
            </h2>
            <p className="text-lg text-gray-300 font-['Work_Sans']">
              Discover your perfect adventure by category
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF585D]" />
            <span className="ml-2 text-gray-300 font-['Work_Sans']">Loading categories...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-[#141312] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-white mb-4 font-['Barlow']">
              Tour Categories
            </h2>
            <p className="text-lg text-gray-300 font-['Work_Sans']">
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
    <section className="bg-[#141312] py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-white mb-4 font-['Barlow']">
            Tour Categories
          </h2>
          <p className="text-lg text-gray-300 font-['Work_Sans'] max-w-2xl mx-auto">
            Browse through our organized collection of tours and experiences to find exactly what you're looking for.
          </p>
        </div>

        {/* Mobile Category Selector */}
        <div className="lg:hidden mb-6">
          <MobileCategorySelector 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Main Layout */}
        <div className="bg-[#1a1918] rounded-2xl shadow-lg overflow-hidden min-h-[600px]">
          <div className="flex h-full">
            {/* Left Navigation Panel - Hidden on mobile */}
            <div className="hidden lg:block w-80 flex-shrink-0 border border-gray-700 rounded-l-2xl">
              <CategoryNavigation 
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>
            
            {/* Right Content Area */}
            <div className="flex-1">
              <CategoryContent 
                selectedCategory={selectedCategory}
                categoriesWithCounts={categoriesWithCounts}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 