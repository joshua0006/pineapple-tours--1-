"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, MapPin, Star, Check, Info, Calendar, Users, Sparkles, Camera, Heart, Shield, Globe, Clock } from "lucide-react"
import { useState, useEffect, use } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience"
import { ErrorState } from "@/components/error-state"
import { DescriptionDisplay } from "@/components/ui/description-display"
import { TourInfoTable, createTourInfoItems } from "@/components/ui/tour-info-table"
import { GoogleMaps } from "@/components/ui/google-maps"
import { ImageGallery } from "@/components/ui/responsive-image"
import { useRezdyProducts, useRezdyAvailability } from "@/hooks/use-rezdy"
import { extractProductCodeFromSlug, getPrimaryImageUrl, getLocationString, formatPrice, getValidImages } from "@/lib/utils/product-utils"
import { RezdyProduct } from "@/lib/types/rezdy"

export default function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [selectedProduct, setSelectedProduct] = useState<RezdyProduct | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [dateRange, setDateRange] = useState(30) // days to look ahead
  const [groupSize, setGroupSize] = useState(2) // number of adults
  
  // Unwrap params Promise using React.use()
  const resolvedParams = use(params)
  
  // Extract product code from slug
  const productCode = extractProductCodeFromSlug(resolvedParams.slug)
  
  // Fetch all products to find the one matching our slug
  const { data: products, loading: productsLoading, error: productsError } = useRezdyProducts(100, 0)
  
  // Set up availability checking based on user preferences
  const startDate = new Date().toISOString().split('T')[0]
  const endDate = new Date(Date.now() + dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const { data: availability, loading: availabilityLoading, error: availabilityError } = useRezdyAvailability(
    productCode,
    startDate,
    endDate,
    `ADULT:${groupSize}`
  )

  // Find the specific product when products are loaded
  useEffect(() => {
    if (products && productCode) {
      const product = products.find(p => p.productCode === productCode)
      if (product) {
        // Add sample extras data for demonstration
        // In a real implementation, this would come from the Rezdy API
        const productWithExtras = {
          ...product,
          extras: [
            {
              id: 'extra-1',
              name: 'Professional Photography Package',
              description: 'Get professional photos of your tour experience taken by our expert photographer. Includes 20+ high-resolution digital photos delivered within 24 hours.',
              price: 45,
              priceType: 'PER_BOOKING' as const,
              maxQuantity: 1,
              isAvailable: true,
              category: 'Photography',
              image: {
                id: 1001,
                itemUrl: '/placeholder.svg?height=400&width=600',
                thumbnailUrl: '/placeholder.svg?height=100&width=100',
                mediumSizeUrl: '/placeholder.svg?height=200&width=200',
                largeSizeUrl: '/placeholder.svg?height=400&width=600',
                caption: 'Professional Photography'
              }
            },
            {
              id: 'extra-2',
              name: 'Premium Lunch Upgrade',
              description: 'Upgrade to our premium lunch featuring locally sourced ingredients and gourmet options.',
              price: 25,
              priceType: 'PER_PERSON' as const,
              maxQuantity: 5,
              isAvailable: true,
              category: 'Food & Beverage'
            },
            {
              id: 'extra-3',
              name: 'Equipment Rental',
              description: 'High-quality equipment rental including waterproof gear and safety equipment.',
              price: 15,
              priceType: 'PER_PERSON' as const,
              maxQuantity: 10,
              isAvailable: true,
              category: 'Equipment'
            },
            {
              id: 'extra-4',
              name: 'Transportation Upgrade',
              description: 'Upgrade to premium transportation with air conditioning and comfortable seating.',
              price: 35,
              priceType: 'PER_BOOKING' as const,
              maxQuantity: 1,
              isAvailable: true,
              category: 'Transportation'
            },
            {
              id: 'extra-5',
              name: 'Souvenir Package',
              description: 'Take home a curated selection of local souvenirs and memorabilia.',
              price: 20,
              priceType: 'PER_PERSON' as const,
              maxQuantity: 3,
              isAvailable: true,
              category: 'Souvenirs'
            }
          ]
        }
        setSelectedProduct(productWithExtras)
      } else {
        setSelectedProduct(null)
      }
    }
  }, [products, productCode])

  if (productsLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-8 sm:py-12">
            <div className="animate-pulse space-y-6 sm:space-y-8">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-2/3 sm:w-1/3" />
              <div className="h-48 sm:h-64 bg-gray-200 rounded" />
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-4 sm:h-6 bg-gray-200 rounded" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="space-y-4 order-first lg:order-last">
                  <div className="h-24 sm:h-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (productsError || !selectedProduct) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-8 sm:py-12">
            <ErrorState
              title="Tour not found"
              message={productsError || "The tour you're looking for doesn't exist or has been removed."}
              showRetry={!!productsError}
              onRetry={() => window.location.reload()}
            />
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const primaryImageUrl = getPrimaryImageUrl(selectedProduct)
  const location = getLocationString(selectedProduct.locationAddress)
  const price = formatPrice(selectedProduct.advertisedPrice)

  // Utility function to strip HTML tags and clean text
  const stripHtmlTags = (html: string): string => {
    if (!html || typeof html !== 'string') return ''
    
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&hellip;/g, '...')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^\s*[-•*]\s*/gm, '') // Remove bullet points
      .trim()
  }

  // Generate highlights from description or use default ones
  const rawHighlights = selectedProduct.description 
    ? stripHtmlTags(selectedProduct.description)
        .split(/[.!?]+/) // Split by sentence endings
        .filter(sentence => sentence.trim().length > 20) // Filter out short fragments
        .slice(0, 6) // Take first 6 sentences
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0) // Remove empty strings
    : [
        "Expert local guide with extensive knowledge of the area",
        "All necessary equipment and safety gear provided", 
        "Small group experience for personalized attention",
        "Incredible photo opportunities at scenic viewpoints",
        "Rich cultural insights and authentic local stories",
        "Flexible schedule adapted to weather and group preferences"
      ]

  // Add icons to highlights for better visual appeal
  const getHighlightIcon = (index: number, text: string) => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('guide') || lowerText.includes('expert')) return Users
    if (lowerText.includes('photo') || lowerText.includes('camera') || lowerText.includes('scenic')) return Camera
    if (lowerText.includes('equipment') || lowerText.includes('safety') || lowerText.includes('gear')) return Shield
    if (lowerText.includes('group') || lowerText.includes('personal') || lowerText.includes('small')) return Heart
    if (lowerText.includes('cultural') || lowerText.includes('local') || lowerText.includes('insight')) return Globe
    if (lowerText.includes('flexible') || lowerText.includes('time') || lowerText.includes('schedule')) return Clock
    
    // Default icons based on index
    const defaultIcons = [Sparkles, Star, Check, Info, MapPin, Calendar]
    return defaultIcons[index % defaultIcons.length]
  }

  const highlights = rawHighlights.map((text, index) => ({
    text,
    icon: getHighlightIcon(index, text)
  }))

  const availableSessions = availability?.[0]?.sessions || []
  const tourInfoItems = createTourInfoItems(selectedProduct)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="container py-4" aria-label="Breadcrumb">
          <ol className="flex items-center justify-center text-xs sm:text-sm text-muted-foreground overflow-x-auto">
            <li className="flex-shrink-0">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li className="flex-shrink-0">
              <ChevronRight className="mx-1 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </li>
            <li className="flex-shrink-0">
              <Link href="/tours" className="hover:text-foreground transition-colors">
                Tours
              </Link>
            </li>
            <li className="flex-shrink-0">
              <ChevronRight className="mx-1 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </li>
            <li className="min-w-0">
              <span className="text-foreground truncate block" aria-current="page">{selectedProduct.name}</span>
            </li>
          </ol>
        </nav>

        {/* Tour Header */}
        <section className="container py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-center text-center md:text-left">
            <div className="flex-1 max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{selectedProduct.name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4 text-yellow-500" aria-hidden="true" />
                  <span className="text-sm sm:text-base">{location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                  <span className="text-sm sm:text-base">4.8 (Reviews)</span>
                </div>
                {selectedProduct.status === 'ACTIVE' && (
                  <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 text-xs sm:text-sm">Available</Badge>
                )}
              </div>
            </div>
            <div className="text-center md:text-right flex-shrink-0">
              <div className="text-sm text-muted-foreground">Starting from</div>
              <div className="text-2xl sm:text-3xl font-bold">{price}</div>
              <div className="text-sm text-muted-foreground">per person</div>
            </div>
          </div>
        </section>

        {/* Tour Images */}
        <section className="container py-6" aria-label="Tour gallery">
          <div className="max-w-6xl mx-auto">
            <ImageGallery
              images={getValidImages(selectedProduct)}
              alt={selectedProduct.name}
              layout="grid"
              maxImages={4}
              enableModal={true}
              tourName={selectedProduct.name}
            />
          </div>
        </section>

        {/* Tour Content */}
        <section className="container py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-4 sm:gap-6 lg:gap-8 xl:grid-cols-4">
              {/* Mobile Booking Bar - Only visible on mobile */}
              <div className="xl:hidden order-first">
                <div className="max-w-2xl mx-auto px-2 sm:px-0">
                  <Card className="sticky top-16 z-10 shadow-lg border-2 border-yellow-500/20">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">Starting from</div>
                          <div className="text-base sm:text-lg lg:text-xl font-bold truncate">{price}</div>
                          <div className="text-xs text-muted-foreground">per person</div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 sm:px-3 py-2 whitespace-nowrap"
                            onClick={() => {
                              const availabilityTab = document.querySelector('[value="availability"]');
                              if (availabilityTab) {
                                (availabilityTab as HTMLElement).click();
                                availabilityTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                          >
                            Dates
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-yellow-500 text-black hover:bg-yellow-600 text-xs px-3 sm:px-4 py-2 whitespace-nowrap"
                            onClick={() => setShowBooking(true)}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content */}
              <div className="xl:col-span-3 min-w-0">
                <div className="max-w-4xl mx-auto xl:mx-0">
                  <Tabs defaultValue="overview" className="w-full">
                    <div className="flex justify-center xl:justify-start overflow-hidden">
                      <TabsList className="w-full max-w-full justify-start overflow-x-auto scrollbar-hide" role="tablist">
                        <TabsTrigger value="overview" role="tab" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 lg:px-4 flex-shrink-0">Overview</TabsTrigger>
                        <TabsTrigger value="availability" role="tab" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 lg:px-4 flex-shrink-0">Availability</TabsTrigger>
                        <TabsTrigger value="location" role="tab" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 lg:px-4 flex-shrink-0">Location</TabsTrigger>
                        <TabsTrigger value="details" role="tab" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 lg:px-4 flex-shrink-0">Details</TabsTrigger>
                        <TabsTrigger value="reviews" role="tab" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 lg:px-4 flex-shrink-0">Reviews</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="overview" className="mt-4 sm:mt-6" role="tabpanel">
                      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Enhanced Description Display */}
                        <DescriptionDisplay
                          title="Tour Overview"
                          description={selectedProduct.description}
                          shortDescription={selectedProduct.shortDescription}
                          maxLength={600}
                          allowExpansion={true}
                        />
                        
                        <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-100 overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold flex items-center text-gray-800 min-w-0">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-sm flex-shrink-0">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" aria-hidden="true" />
                              </div>
                              <span className="truncate">Tour Highlights</span>
                            </h3>
                            <Badge variant="secondary" className="text-xs self-start sm:self-auto flex-shrink-0">
                              {highlights.length} key features
                            </Badge>
                          </div>
                          <div className="grid gap-2 sm:gap-3 lg:gap-4">
                            {highlights.map((highlight, index) => {
                              const IconComponent = highlight.icon
                              return (
                                <Card 
                                  key={index} 
                                  className="p-2 sm:p-3 lg:p-4 border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white hover:shadow-lg transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 overflow-hidden"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                                    <div className="flex-shrink-0">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-sm">
                                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" aria-hidden="true" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900 leading-relaxed break-words">
                                        {highlight.text}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="availability" className="mt-4 sm:mt-6" role="tabpanel">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold min-w-0 break-words">Available Dates</h2>
                          <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:gap-4 overflow-hidden">
                            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                              <label htmlFor="group-size" className="text-muted-foreground whitespace-nowrap flex-shrink-0">Group:</label>
                              <select 
                                id="group-size"
                                value={groupSize} 
                                onChange={(e) => setGroupSize(Number(e.target.value))}
                                className="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 md:flex-initial max-w-full"
                              >
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(size => (
                                  <option key={size} value={size}>{size} adult{size > 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                              <label htmlFor="date-range" className="text-muted-foreground whitespace-nowrap flex-shrink-0">Period:</label>
                              <select 
                                id="date-range"
                                value={dateRange} 
                                onChange={(e) => setDateRange(Number(e.target.value))}
                                className="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 md:flex-initial max-w-full"
                              >
                                <option value={7}>7 days</option>
                                <option value={14}>2 weeks</option>
                                <option value={30}>30 days</option>
                                <option value={60}>2 months</option>
                                <option value={90}>3 months</option>
                              </select>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                              {availableSessions.length} sessions
                            </div>
                          </div>
                        </div>
                        
                        {availabilityLoading ? (
                          <div className="space-y-4" aria-label="Loading availability">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <div key={index} className="animate-pulse">
                                <div className="h-20 bg-gray-200 rounded" />
                              </div>
                            ))}
                          </div>
                        ) : availabilityError ? (
                          <Card className="p-4 sm:p-8 text-center border-red-200 bg-red-50">
                            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
                            <h3 className="text-base sm:text-lg font-medium mb-2 text-red-800 break-words">Error loading availability</h3>
                            <p className="text-sm sm:text-base text-red-600 mb-4 break-words">
                              {availabilityError}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                              <Button 
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-red-300 text-red-700 hover:bg-red-100 text-xs sm:text-sm"
                              >
                                Try Again
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setShowBooking(true)}
                                className="text-xs sm:text-sm"
                              >
                                Contact Support
                              </Button>
                            </div>
                          </Card>
                        ) : availableSessions.length > 0 ? (
                          <div className="space-y-3 sm:space-y-4">
                            {availableSessions.slice(0, 15).map((session) => {
                              const sessionDate = new Date(session.startTimeLocal)
                              const isToday = sessionDate.toDateString() === new Date().toDateString()
                              const isTomorrow = sessionDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
                              const isLowAvailability = session.seatsAvailable <= 3
                              
                              return (
                                <Card key={session.id} className={`p-3 sm:p-4 transition-all hover:shadow-md overflow-hidden ${isLowAvailability ? 'border-orange-200 bg-orange-50' : ''}`}>
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 min-w-0">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                        <div className="font-medium text-sm sm:text-base min-w-0">
                                          <span className="sm:hidden block truncate">
                                            {sessionDate.toLocaleDateString('en-US', {
                                              weekday: 'short',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </span>
                                          <span className="hidden sm:block break-words">
                                            {sessionDate.toLocaleDateString('en-US', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </span>
                                        </div>
                                        {isToday && (
                                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 flex-shrink-0">
                                            Today
                                          </Badge>
                                        )}
                                        {isTomorrow && (
                                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 flex-shrink-0">
                                            Tomorrow
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <Clock className="h-3 w-3 flex-shrink-0" />
                                          <span className="whitespace-nowrap text-xs">
                                            {sessionDate.toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })} - {new Date(session.endTimeLocal).toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <Users className="h-3 w-3 flex-shrink-0" />
                                          <span className={`whitespace-nowrap text-xs ${isLowAvailability ? 'text-orange-600 font-medium' : ''}`}>
                                            {session.seatsAvailable} seats
                                          </span>
                                          {isLowAvailability && (
                                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 flex-shrink-0">
                                              Limited
                                            </Badge>
                                          )}
                                        </div>
                                        {session.pickupLocations && session.pickupLocations.length > 0 && (
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                            <span className="whitespace-nowrap text-xs">{session.pickupLocations.length} pickup{session.pickupLocations.length > 1 ? 's' : ''}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:text-right sm:ml-4 gap-3 sm:gap-2 flex-shrink-0">
                                      <div className="min-w-0">
                                        <div className="font-bold text-sm sm:text-base lg:text-lg xl:text-xl truncate">
                                          {session.totalPrice ? `$${session.totalPrice}` : price}
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                                          per person
                                        </div>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        className="bg-yellow-500 text-black hover:bg-yellow-600 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0"
                                        onClick={() => setShowBooking(true)}
                                        disabled={session.seatsAvailable === 0}
                                        aria-label={`Book tour for ${sessionDate.toLocaleDateString()}`}
                                      >
                                        {session.seatsAvailable === 0 ? 'Sold Out' : 'Book'}
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              )
                            })}
                            
                            {availableSessions.length > 15 && (
                              <Card className="p-4 text-center bg-gray-50">
                                <p className="text-muted-foreground mb-2 text-sm break-words">
                                  Showing first 15 of {availableSessions.length} available sessions
                                </p>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setShowBooking(true)}
                                  className="text-xs sm:text-sm"
                                >
                                  View All Dates
                                </Button>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <Card className="p-4 sm:p-8 text-center">
                            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                            <h3 className="text-base sm:text-lg font-medium mb-2 break-words">No availability found</h3>
                            <p className="text-sm text-muted-foreground mb-4 break-words">
                              There are currently no available dates for this tour in the next 30 days.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                              <Button 
                                variant="outline"
                                onClick={() => setShowBooking(true)}
                                className="text-xs sm:text-sm"
                              >
                                Contact us for availability
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="text-xs sm:text-sm"
                              >
                                Refresh availability
                              </Button>
                            </div>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="location" className="mt-4 sm:mt-6" role="tabpanel">
                      <div className="space-y-6 overflow-hidden">
                        <GoogleMaps
                          address={selectedProduct.locationAddress}
                          pickupLocations={availableSessions.length > 0 ? availableSessions[0]?.pickupLocations || [] : []}
                          tourName={selectedProduct.name}
                        />
                        
                        {/* Additional Location Information */}
                        {selectedProduct.locationAddress && (
                          <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                            <h3 className="font-medium mb-2 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                              <span className="truncate">Location Details</span>
                            </h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {typeof selectedProduct.locationAddress === 'string' ? (
                                <p className="break-words">{selectedProduct.locationAddress}</p>
                              ) : (
                                <div className="space-y-1">
                                  {selectedProduct.locationAddress.addressLine && (
                                    <p className="break-words">{selectedProduct.locationAddress.addressLine}</p>
                                  )}
                                  <p className="break-words">
                                    {[
                                      selectedProduct.locationAddress.city,
                                      selectedProduct.locationAddress.state,
                                      selectedProduct.locationAddress.postCode
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                  {selectedProduct.locationAddress.countryCode && (
                                    <p className="break-words">{selectedProduct.locationAddress.countryCode}</p>
                                  )}
                                  {selectedProduct.locationAddress.latitude && selectedProduct.locationAddress.longitude && (
                                    <p className="text-xs break-all">
                                      Coordinates: {selectedProduct.locationAddress.latitude.toFixed(6)}, {selectedProduct.locationAddress.longitude.toFixed(6)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pickup Information */}
                        {availableSessions.length > 0 && availableSessions[0]?.pickupLocations && availableSessions[0].pickupLocations.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4 overflow-hidden">
                            <h3 className="font-medium mb-3 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                              <span className="truncate">Pickup Information</span>
                            </h3>
                            <div className="text-sm text-muted-foreground space-y-2">
                              <p className="break-words">This tour offers pickup from multiple locations. Select your preferred pickup point during booking.</p>
                              <div className="grid gap-2">
                                {availableSessions[0].pickupLocations.slice(0, 3).map((pickup, index) => (
                                  <div key={pickup.id || index} className="flex items-center gap-2 min-w-0">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    <span className="font-medium truncate flex-1">{pickup.name}</span>
                                    {pickup.pickupTime && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex-shrink-0">
                                        {pickup.pickupTime}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {availableSessions[0].pickupLocations.length > 3 && (
                                  <div className="text-xs text-blue-600 break-words">
                                    +{availableSessions[0].pickupLocations.length - 3} more pickup locations available
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Transportation Notes */}
                        <div className="bg-yellow-50 rounded-lg p-4 overflow-hidden">
                          <h3 className="font-medium mb-2 flex items-center">
                            <Info className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                            <span className="truncate">Transportation Notes</span>
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="break-words">• Meeting point and pickup details will be confirmed in your booking confirmation</p>
                            <p className="break-words">• Please arrive 15 minutes before the scheduled departure time</p>
                            <p className="break-words">• Contact us if you need assistance with transportation arrangements</p>
                            {availableSessions.length > 0 && availableSessions[0]?.pickupLocations && availableSessions[0].pickupLocations.length === 0 && (
                              <p className="break-words">• This tour uses a central meeting point - no hotel pickup available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-4 sm:mt-6" role="tabpanel">
                      <div className="space-y-8 overflow-hidden">
                        {/* Enhanced Tour Information Table */}
                        <TourInfoTable
                          title="Tour Details"
                          items={[
                            {
                              label: 'Group Size',
                              value: `${selectedProduct.quantityRequiredMin || 1} - ${selectedProduct.quantityRequiredMax || 20} people`,
                              icon: <Users className="h-4 w-4" />,
                              type: 'text'
                            },
                            {
                              label: 'Location',
                              value: location,
                              icon: <MapPin className="h-4 w-4" />,
                              type: 'text'
                            },
                            {
                              label: 'Product Code',
                              value: selectedProduct.productCode,
                              icon: <Info className="h-4 w-4" />,
                              type: 'text'
                            },
                            {
                              label: 'Status',
                              value: selectedProduct.status || 'Available',
                              icon: <Check className="h-4 w-4" />,
                              type: 'status'
                            }
                          ]}
                          columns={2}
                          showCard={true}
                        />
                        
                        <div className="overflow-hidden">
                          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
                            <Check className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">What's Included</span>
                          </h3>
                          <ul className="space-y-3" role="list">
                            <li className="flex items-start">
                              <Check className="mr-2 h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                              <span className="break-words">Professional local guide</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="mr-2 h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                              <span className="break-words">All necessary equipment</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="mr-2 h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                              <span className="break-words">Safety briefing and instructions</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="mr-2 h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                              <span className="break-words">Small group experience</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-4 sm:mt-6" role="tabpanel">
                      <div className="space-y-6 overflow-hidden">
                        <h2 className="text-xl sm:text-2xl font-bold break-words">Customer Reviews</h2>
                        <div className="space-y-4">
                          <Card className="p-4 sm:p-6 overflow-hidden">
                            <div className="flex items-center mb-4">
                              <div className="flex flex-shrink-0" role="img" aria-label="5 star rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                                ))}
                              </div>
                              <span className="ml-2 font-medium truncate">Amazing experience!</span>
                            </div>
                            <p className="text-muted-foreground mb-4 break-words">
                              "This tour exceeded all our expectations. The guide was knowledgeable and friendly, 
                              and we saw some incredible sights. Highly recommended!"
                            </p>
                            <div className="text-sm text-muted-foreground break-words">
                              - Sarah M. • 2 weeks ago
                            </div>
                          </Card>
                          
                          <Card className="p-4 sm:p-6 overflow-hidden">
                            <div className="flex items-center mb-4">
                              <div className="flex flex-shrink-0" role="img" aria-label="5 star rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                                ))}
                              </div>
                              <span className="ml-2 font-medium truncate">Perfect for families</span>
                            </div>
                            <p className="text-muted-foreground mb-4 break-words">
                              "Great tour for the whole family. The kids loved it and learned so much. 
                              Well organized and great value for money."
                            </p>
                            <div className="text-sm text-muted-foreground break-words">
                              - Mike & Lisa T. • 1 month ago
                            </div>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              {/* Desktop Booking Sidebar - Only visible on desktop */}
              <div className="hidden xl:block xl:col-span-1">
                <div className="max-w-sm mx-auto">
                  <Card className="sticky top-20 overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl text-center break-words">Book This Tour</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Starting from</div>
                        <div className="text-2xl sm:text-3xl font-bold break-words">{price}</div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>
                      
                      <Button 
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 text-base py-3"
                        onClick={() => setShowBooking(true)}
                        aria-label={`Book ${selectedProduct.name} tour`}
                      >
                        Book Now
                      </Button>
                      
                      <div className="text-center text-sm text-muted-foreground break-words">
                        Free cancellation up to 24 hours before
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2 text-center">Location</h4>
                        <div className="flex items-start gap-2 mb-3 justify-center">
                          <MapPin className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground break-words text-center">{location}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mb-4"
                          onClick={() => {
                            // Create Google Maps URL for directions
                            let destination = '';
                            
                            if (typeof selectedProduct.locationAddress === 'string') {
                              destination = encodeURIComponent(selectedProduct.locationAddress);
                            } else if (selectedProduct.locationAddress && typeof selectedProduct.locationAddress === 'object') {
                              // If we have coordinates, use them for more precise directions
                              if (selectedProduct.locationAddress.latitude && selectedProduct.locationAddress.longitude) {
                                destination = `${selectedProduct.locationAddress.latitude},${selectedProduct.locationAddress.longitude}`;
                              } else {
                                // Build address string from object
                                const addressParts = [
                                  selectedProduct.locationAddress.addressLine,
                                  selectedProduct.locationAddress.city,
                                  selectedProduct.locationAddress.state,
                                  selectedProduct.locationAddress.postCode,
                                  selectedProduct.locationAddress.countryCode
                                ].filter(Boolean);
                                destination = encodeURIComponent(addressParts.join(', '));
                              }
                            } else {
                              // Fallback to tour name if no location available
                              destination = encodeURIComponent(selectedProduct.name);
                            }
                            
                            // Open Google Maps in new tab with directions
                            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View on Map
                        </Button>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2 text-center">Need help?</h4>
                        <p className="text-sm text-muted-foreground mb-2 text-center break-words">
                          Contact our travel experts for personalized assistance.
                        </p>
                        <Button variant="outline" className="w-full">
                          Contact Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      
      {/* Booking Modal */}
      {showBooking && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-none mx-auto my-4 sm:my-8 shadow-xl">
              <EnhancedBookingExperience 
                product={selectedProduct}
                onClose={() => setShowBooking(false)}
                onBookingComplete={(bookingData) => {
                  console.log('Booking completed:', bookingData)
                  // Here you could redirect to a confirmation page or show a success message
                  setShowBooking(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
