"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, MapPin, Mountain, Camera, Utensils, Heart, Users, Sparkles, Waves, Car, Plane, Calendar, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubCategory {
  id: string
  name: string
  href: string
  description?: string
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  href: string
  subcategories: SubCategory[]
  featured?: boolean
}

const tourCategories: Category[] = [
  {
    id: "adventure",
    name: "Adventure Tours",
    icon: <Mountain className="w-4 h-4" />,
    href: "/search?category=adventure",
    featured: true,
    subcategories: [
      { id: "hiking", name: "Hiking & Trekking", href: "/search?category=adventure&type=hiking", description: "Mountain trails and nature walks" },
      { id: "climbing", name: "Rock Climbing", href: "/search?category=adventure&type=climbing", description: "Guided climbing experiences" },
      { id: "cycling", name: "Cycling Tours", href: "/search?category=adventure&type=cycling", description: "Bike tours and mountain biking" },
      { id: "extreme", name: "Extreme Sports", href: "/search?category=adventure&type=extreme", description: "Bungee, skydiving, and more" },
      { id: "safari", name: "Wildlife Safari", href: "/search?category=adventure&type=safari", description: "Animal watching expeditions" }
    ]
  },
  {
    id: "cultural",
    name: "Cultural Tours",
    icon: <GraduationCap className="w-4 h-4" />,
    href: "/search?category=cultural",
    featured: true,
    subcategories: [
      { id: "historical", name: "Historical Sites", href: "/search?category=cultural&type=historical", description: "Ancient ruins and monuments" },
      { id: "museums", name: "Museums & Galleries", href: "/search?category=cultural&type=museums", description: "Art and cultural exhibitions" },
      { id: "local-life", name: "Local Life", href: "/search?category=cultural&type=local-life", description: "Authentic local experiences" },
      { id: "festivals", name: "Festivals & Events", href: "/search?category=cultural&type=festivals", description: "Cultural celebrations" },
      { id: "architecture", name: "Architecture Tours", href: "/search?category=cultural&type=architecture", description: "Iconic buildings and design" }
    ]
  },
  {
    id: "food-wine",
    name: "Food & Wine",
    icon: <Utensils className="w-4 h-4" />,
    href: "/search?category=food-wine",
    subcategories: [
      { id: "culinary", name: "Culinary Tours", href: "/search?category=food-wine&type=culinary", description: "Local cuisine experiences" },
      { id: "wine-tasting", name: "Wine Tasting", href: "/search?category=food-wine&type=wine-tasting", description: "Vineyard visits and tastings" },
      { id: "cooking-classes", name: "Cooking Classes", href: "/search?category=food-wine&type=cooking-classes", description: "Learn to cook local dishes" },
      { id: "food-markets", name: "Food Markets", href: "/search?category=food-wine&type=food-markets", description: "Local market explorations" },
      { id: "brewery", name: "Brewery Tours", href: "/search?category=food-wine&type=brewery", description: "Craft beer experiences" }
    ]
  },
  {
    id: "nature",
    name: "Nature Tours",
    icon: <MapPin className="w-4 h-4" />,
    href: "/search?category=nature",
    featured: true,
    subcategories: [
      { id: "national-parks", name: "National Parks", href: "/search?category=nature&type=national-parks", description: "Protected natural areas" },
      { id: "wildlife", name: "Wildlife Watching", href: "/search?category=nature&type=wildlife", description: "Animal observation tours" },
      { id: "botanical", name: "Botanical Gardens", href: "/search?category=nature&type=botanical", description: "Plant and garden tours" },
      { id: "eco-tours", name: "Eco Tours", href: "/search?category=nature&type=eco-tours", description: "Sustainable nature experiences" },
      { id: "bird-watching", name: "Bird Watching", href: "/search?category=nature&type=bird-watching", description: "Birding expeditions" }
    ]
  },
  {
    id: "water-activities",
    name: "Water Activities",
    icon: <Waves className="w-4 h-4" />,
    href: "/search?category=water-activities",
    subcategories: [
      { id: "snorkeling", name: "Snorkeling", href: "/search?category=water-activities&type=snorkeling", description: "Underwater exploration" },
      { id: "diving", name: "Scuba Diving", href: "/search?category=water-activities&type=diving", description: "Deep sea adventures" },
      { id: "boat-tours", name: "Boat Tours", href: "/search?category=water-activities&type=boat-tours", description: "Sailing and cruising" },
      { id: "fishing", name: "Fishing Tours", href: "/search?category=water-activities&type=fishing", description: "Sport and deep sea fishing" },
      { id: "water-sports", name: "Water Sports", href: "/search?category=water-activities&type=water-sports", description: "Surfing, kayaking, and more" }
    ]
  },
  {
    id: "family",
    name: "Family Tours",
    icon: <Users className="w-4 h-4" />,
    href: "/search?category=family",
    subcategories: [
      { id: "kid-friendly", name: "Kid-Friendly", href: "/search?category=family&type=kid-friendly", description: "Perfect for children" },
      { id: "educational", name: "Educational Tours", href: "/search?category=family&type=educational", description: "Learning experiences for all ages" },
      { id: "theme-parks", name: "Theme Parks", href: "/search?category=family&type=theme-parks", description: "Amusement and entertainment" },
      { id: "interactive", name: "Interactive Experiences", href: "/search?category=family&type=interactive", description: "Hands-on activities" },
      { id: "multi-generation", name: "Multi-Generation", href: "/search?category=family&type=multi-generation", description: "Fun for all ages" }
    ]
  },
  {
    id: "romantic",
    name: "Romantic Tours",
    icon: <Heart className="w-4 h-4" />,
    href: "/search?category=romantic",
    subcategories: [
      { id: "honeymoon", name: "Honeymoon Packages", href: "/search?category=honeymoon", description: "Perfect for newlyweds" },
      { id: "sunset", name: "Sunset Tours", href: "/search?category=romantic&type=sunset", description: "Romantic evening experiences" },
      { id: "couples", name: "Couples Activities", href: "/search?category=romantic&type=couples", description: "Intimate shared experiences" },
      { id: "spa", name: "Spa & Wellness", href: "/search?category=romantic&type=spa", description: "Relaxation and rejuvenation" },
      { id: "private", name: "Private Tours", href: "/search?category=romantic&type=private", description: "Exclusive romantic experiences" }
    ]
  },
  {
    id: "luxury",
    name: "Luxury Tours",
    icon: <Sparkles className="w-4 h-4" />,
    href: "/search?category=luxury",
    subcategories: [
      { id: "vip", name: "VIP Experiences", href: "/search?category=luxury&type=vip", description: "Exclusive access and service" },
      { id: "helicopter", name: "Helicopter Tours", href: "/search?category=luxury&type=helicopter", description: "Aerial sightseeing" },
      { id: "yacht", name: "Yacht Charters", href: "/search?category=luxury&type=yacht", description: "Private boat experiences" },
      { id: "fine-dining", name: "Fine Dining", href: "/search?category=luxury&type=fine-dining", description: "Michelin-starred restaurants" },
      { id: "concierge", name: "Concierge Services", href: "/search?category=luxury&type=concierge", description: "Personalized assistance" }
    ]
  },
  {
    id: "photography",
    name: "Photography Tours",
    icon: <Camera className="w-4 h-4" />,
    href: "/search?category=photography",
    subcategories: [
      { id: "landscape", name: "Landscape Photography", href: "/search?category=photography&type=landscape", description: "Scenic photo opportunities" },
      { id: "wildlife-photo", name: "Wildlife Photography", href: "/search?category=photography&type=wildlife-photo", description: "Animal photography tours" },
      { id: "street", name: "Street Photography", href: "/search?category=photography&type=street", description: "Urban photo walks" },
      { id: "workshops", name: "Photo Workshops", href: "/search?category=photography&type=workshops", description: "Learn photography skills" },
      { id: "golden-hour", name: "Golden Hour Tours", href: "/search?category=photography&type=golden-hour", description: "Perfect lighting conditions" }
    ]
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: <Car className="w-4 h-4" />,
    href: "/search?category=transportation",
    subcategories: [
      { id: "transfers", name: "Airport Transfers", href: "/search?category=transportation&type=transfers", description: "Convenient airport transport" },
      { id: "day-trips", name: "Day Trips", href: "/search?category=transportation&type=day-trips", description: "Full-day excursions" },
      { id: "multi-day", name: "Multi-day Tours", href: "/search?category=transportation&type=multi-day", description: "Extended travel packages" },
      { id: "private-transport", name: "Private Transport", href: "/search?category=transportation&type=private-transport", description: "Dedicated vehicles" },
      { id: "group-transport", name: "Group Transport", href: "/search?category=transportation&type=group-transport", description: "Shared transportation" }
    ]
  }
]

interface TourCategoriesDropdownProps {
  className?: string
  isMobile?: boolean
}

export function TourCategoriesDropdown({ className, isMobile = false }: TourCategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveCategory(null)
        setHoveredCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setActiveCategory(null)
        setHoveredCategory(null)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setHoveredCategory(categoryId)
    setActiveCategory(categoryId)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
      setActiveCategory(null)
    }, 150)
  }

  const handleCategoryClick = (category: Category) => {
    if (isMobile) {
      if (activeCategory === category.id) {
        setActiveCategory(null)
      } else {
        setActiveCategory(category.id)
      }
    } else {
      router.push(category.href)
      setIsOpen(false)
    }
  }

  const handleSubcategoryClick = () => {
    setIsOpen(false)
    setActiveCategory(null)
    setHoveredCategory(null)
  }

  if (isMobile) {
    return (
      <div className={cn("w-full", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-left text-base font-medium rounded-xl transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-yellow-500" />
            <span>Categories</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
        
        {isOpen && (
          <div className="mt-2 space-y-1">
            {tourCategories.map((category) => (
              <div key={category.id} className="border-l-2 border-yellow-500/20 ml-4">
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="flex items-center justify-between w-full px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  aria-expanded={activeCategory === category.id}
                >
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span>{category.name}</span>
                    {category.featured && (
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded">
                        Popular
                      </span>
                    )}
                  </div>
                  <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", activeCategory === category.id && "rotate-90")} />
                </button>
                
                {activeCategory === category.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Link
                      href={category.href}
                      onClick={handleSubcategoryClick}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    >
                      View All {category.name}
                    </Link>
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={subcategory.href}
                        onClick={handleSubcategoryClick}
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Categories
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-screen max-w-4xl bg-popover border rounded-lg shadow-lg z-50"
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0">
            {/* Categories List */}
            <div className="col-span-1 md:col-span-1 border-r border-border">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Browse Categories</h3>
                <div className="space-y-1">
                  {tourCategories.map((category) => (
                    <div
                      key={category.id}
                      onMouseEnter={() => handleMouseEnter(category.id)}
                      className="relative"
                    >
                      <Link
                        href={category.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors group",
                          "hover:bg-accent hover:text-accent-foreground",
                          hoveredCategory === category.id && "bg-accent text-accent-foreground"
                        )}
                      >
                        <span className="text-yellow-500">{category.icon}</span>
                        <span className="flex-1">{category.name}</span>
                        {category.featured && (
                          <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded">
                            Popular
                          </span>
                        )}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subcategories */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              {activeCategory && (
                <div className="p-4">
                  {(() => {
                    const category = tourCategories.find(c => c.id === activeCategory)
                    if (!category) return null

                    return (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-yellow-500">{category.icon}</span>
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Link
                            href={category.href}
                            onClick={() => setIsOpen(false)}
                            className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors group"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-yellow-500">{category.icon}</span>
                              <span className="font-medium text-sm">View All {category.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Browse our complete collection of {category.name.toLowerCase()}
                            </p>
                          </Link>
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              href={subcategory.href}
                              onClick={handleSubcategoryClick}
                              className="p-3 rounded-lg border hover:bg-accent transition-colors group"
                            >
                              <div className="font-medium text-sm mb-1 group-hover:text-yellow-600 transition-colors">
                                {subcategory.name}
                              </div>
                              {subcategory.description && (
                                <p className="text-xs text-muted-foreground">
                                  {subcategory.description}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
              
              {!activeCategory && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Explore Categories</h3>
                  <p className="text-sm text-muted-foreground">
                    Hover over a category to see available subcategories and tour types
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 