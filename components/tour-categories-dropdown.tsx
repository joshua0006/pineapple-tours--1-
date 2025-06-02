"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, MapPin, Mountain, Camera, Utensils, Heart, Users, Sparkles, Waves, Car, Plane, Calendar, GraduationCap, Wine, Beer, Bus, Building, Activity, Ticket, Package, Gift } from "lucide-react"
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

// Updated categories based on user requirements
const tourCategories: Category[] = [
  {
    id: "winery-tours",
    name: "Winery Tours",
    icon: <Wine className="w-4 h-4" />,
    href: "/search?category=winery-tours",
    featured: true,
    subcategories: [
      { id: "wine-tasting", name: "Wine Tasting", href: "/search?category=winery-tours&type=wine-tasting", description: "Vineyard visits and tastings" },
      { id: "cellar-tours", name: "Cellar Tours", href: "/search?category=winery-tours&type=cellar-tours", description: "Behind-the-scenes winery experiences" },
      { id: "vintage-tours", name: "Vintage Tours", href: "/search?category=winery-tours&type=vintage-tours", description: "Seasonal harvest experiences" },
      { id: "private-wine", name: "Private Wine Tours", href: "/search?category=winery-tours&type=private-wine", description: "Exclusive wine experiences" },
      { id: "wine-education", name: "Wine Education", href: "/search?category=winery-tours&type=wine-education", description: "Learn about wine making" }
    ]
  },
  {
    id: "brewery-tours",
    name: "Brewery Tours",
    icon: <Beer className="w-4 h-4" />,
    href: "/search?category=brewery-tours",
    featured: true,
    subcategories: [
      { id: "craft-beer", name: "Craft Beer Tours", href: "/search?category=brewery-tours&type=craft-beer", description: "Local craft brewery experiences" },
      { id: "beer-tasting", name: "Beer Tasting", href: "/search?category=brewery-tours&type=beer-tasting", description: "Guided beer tasting sessions" },
      { id: "brewing-process", name: "Brewing Process", href: "/search?category=brewery-tours&type=brewing-process", description: "Learn how beer is made" },
      { id: "brewery-hopping", name: "Brewery Hopping", href: "/search?category=brewery-tours&type=brewery-hopping", description: "Multiple brewery visits" },
      { id: "ale-lager", name: "Ale & Lager Tours", href: "/search?category=brewery-tours&type=ale-lager", description: "Traditional beer styles" }
    ]
  },
  {
    id: "hop-on-hop-off",
    name: "Hop-On Hop-Off",
    icon: <Bus className="w-4 h-4" />,
    href: "/search?category=hop-on-hop-off",
    featured: true,
    subcategories: [
      { id: "city-tours", name: "City Tours", href: "/search?category=hop-on-hop-off&type=city-tours", description: "Flexible city sightseeing" },
      { id: "sightseeing-bus", name: "Sightseeing Bus", href: "/search?category=hop-on-hop-off&type=sightseeing-bus", description: "Tourist bus services" },
      { id: "mountain-tours", name: "Mountain Tours", href: "/search?category=hop-on-hop-off&type=mountain-tours", description: "Scenic mountain routes" },
      { id: "coastal-routes", name: "Coastal Routes", href: "/search?category=hop-on-hop-off&type=coastal-routes", description: "Beautiful coastal journeys" },
      { id: "tourist-bus", name: "Tourist Bus", href: "/search?category=hop-on-hop-off&type=tourist-bus", description: "Convenient tourist transport" }
    ]
  },
  {
    id: "bus-charter",
    name: "Bus Charter",
    icon: <Bus className="w-4 h-4" />,
    href: "/search?category=bus-charter",
    subcategories: [
      { id: "private-bus", name: "Private Bus", href: "/search?category=bus-charter&type=private-bus", description: "Dedicated bus services" },
      { id: "group-transport", name: "Group Transport", href: "/search?category=bus-charter&type=group-transport", description: "Large group transportation" },
      { id: "coach-charter", name: "Coach Charter", href: "/search?category=bus-charter&type=coach-charter", description: "Comfortable coach services" },
      { id: "charter-bus", name: "Charter Bus", href: "/search?category=bus-charter&type=charter-bus", description: "Custom bus rentals" },
      { id: "minibus", name: "Minibus Charter", href: "/search?category=bus-charter&type=minibus", description: "Smaller group transport" }
    ]
  },
  {
    id: "day-tours",
    name: "Day Tours",
    icon: <Calendar className="w-4 h-4" />,
    href: "/search?category=day-tours",
    featured: true,
    subcategories: [
      { id: "full-day", name: "Full Day Tours", href: "/search?category=day-tours&type=full-day", description: "Complete day experiences" },
      { id: "day-trips", name: "Day Trips", href: "/search?category=day-tours&type=day-trips", description: "Single day excursions" },
      { id: "guided-tours", name: "Guided Tours", href: "/search?category=day-tours&type=guided-tours", description: "Professional guide included" },
      { id: "all-day", name: "All Day Adventures", href: "/search?category=day-tours&type=all-day", description: "Dawn to dusk experiences" },
      { id: "day-excursions", name: "Day Excursions", href: "/search?category=day-tours&type=day-excursions", description: "Memorable day trips" }
    ]
  },
  {
    id: "corporate-tours",
    name: "Corporate Tours",
    icon: <Building className="w-4 h-4" />,
    href: "/search?category=corporate-tours",
    subcategories: [
      { id: "team-building", name: "Team Building", href: "/search?category=corporate-tours&type=team-building", description: "Corporate team activities" },
      { id: "business-events", name: "Business Events", href: "/search?category=corporate-tours&type=business-events", description: "Professional event experiences" },
      { id: "company-outings", name: "Company Outings", href: "/search?category=corporate-tours&type=company-outings", description: "Group corporate activities" },
      { id: "corporate-events", name: "Corporate Events", href: "/search?category=corporate-tours&type=corporate-events", description: "Business entertainment" },
      { id: "business-tours", name: "Business Tours", href: "/search?category=corporate-tours&type=business-tours", description: "Professional tour experiences" }
    ]
  },
  {
    id: "hens-party",
    name: "Hens Party",
    icon: <Heart className="w-4 h-4" />,
    href: "/search?category=hens-party",
    featured: true,
    subcategories: [
      { id: "bachelorette", name: "Bachelorette Tours", href: "/search?category=hens-party&type=bachelorette", description: "Perfect for bachelorette parties" },
      { id: "bridal-party", name: "Bridal Party", href: "/search?category=hens-party&type=bridal-party", description: "Special bridal celebrations" },
      { id: "girls-night", name: "Girls Night Out", href: "/search?category=hens-party&type=girls-night", description: "Fun girls night experiences" },
      { id: "ladies-night", name: "Ladies Night", href: "/search?category=hens-party&type=ladies-night", description: "Exclusive ladies events" },
      { id: "celebration", name: "Celebration Tours", href: "/search?category=hens-party&type=celebration", description: "Special celebration experiences" }
    ]
  },
  {
    id: "barefoot-luxury",
    name: "Barefoot Luxury",
    icon: <Sparkles className="w-4 h-4" />,
    href: "/search?category=barefoot-luxury",
    featured: true,
    subcategories: [
      { id: "luxury-tours", name: "Luxury Tours", href: "/search?category=barefoot-luxury&type=luxury-tours", description: "Premium tour experiences" },
      { id: "exclusive", name: "Exclusive Experiences", href: "/search?category=barefoot-luxury&type=exclusive", description: "VIP access and service" },
      { id: "premium", name: "Premium Services", href: "/search?category=barefoot-luxury&type=premium", description: "High-end tour options" },
      { id: "vip", name: "VIP Experiences", href: "/search?category=barefoot-luxury&type=vip", description: "Exclusive VIP treatment" },
      { id: "upscale", name: "Upscale Tours", href: "/search?category=barefoot-luxury&type=upscale", description: "Sophisticated experiences" }
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveCategory(null)
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
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

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
  }

  const handleCategoryHover = (categoryId: string) => {
    // Only set active category on hover for desktop, not mobile
    if (!isMobile) {
      setActiveCategory(categoryId)
    }
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
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Categories
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-screen max-w-4xl bg-popover border rounded-lg shadow-lg z-50">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0">
            {/* Categories List */}
            <div className="col-span-1 md:col-span-1 border-r border-border">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Browse Categories</h3>
                <div className="space-y-1">
                  {tourCategories.map((category) => (
                    <div
                      key={category.id}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      className="relative"
                    >
                      <Link
                        href={category.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors group",
                          "hover:bg-accent hover:text-accent-foreground",
                          activeCategory === category.id && "bg-accent text-accent-foreground"
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