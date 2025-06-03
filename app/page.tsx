"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, MapPin, Calendar, Package, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TourCard } from "@/components/tour-card"
import { DynamicTourCard } from "@/components/dynamic-tour-card"
import { TourGridSkeleton } from "@/components/tour-grid-skeleton"
import { ErrorState } from "@/components/error-state"
import { TestimonialCard } from "@/components/testimonial-card"
import { SearchForm } from "@/components/search-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CategoriesSection } from "@/components/categories-section"
import { useRezdyProducts } from "@/hooks/use-rezdy"
import { useState, useMemo } from "react"
import { BudgetAnalysisCard } from "@/components/budget-analysis-card"

export default function Home() {
  const [selectedBudget, setSelectedBudget] = useState("all")
  const { data: products, loading, error } = useRezdyProducts(24, 0)

  // Helper function to categorize products by budget
  const categorizeByBudget = (product: any) => {
    const price = product.advertisedPrice || 0
    if (price === 0) return 'unknown'
    if (price < 100) return 'budget'
    if (price >= 100 && price < 300) return 'mid-range'
    if (price >= 300) return 'luxury'
    return 'unknown'
  }

  // Get budget statistics for display
  const budgetStats = useMemo(() => {
    if (!products) return { budget: 0, 'mid-range': 0, luxury: 0, unknown: 0 }
    
    const stats = { budget: 0, 'mid-range': 0, luxury: 0, unknown: 0 }
    products.forEach(product => {
      if (product.productType !== "GIFT_CARD") {
        const budgetCategory = categorizeByBudget(product)
        stats[budgetCategory as keyof typeof stats]++
      }
    })
    return stats
  }, [products])

  // Filter products based on selected budget
  const filteredProducts = products?.filter(product => {
    // Exclude GIFT_CARD products from Featured Tour Packages
    if (product.productType === "GIFT_CARD") return false
    
    // Budget filter
    if (selectedBudget !== "all") {
      const productBudgetCategory = categorizeByBudget(product)
      if (productBudgetCategory !== selectedBudget) return false
    }
    
    return true
  }) || []

  const handleRetry = () => {
    window.location.reload()
  }

  const handleBudgetCategorySelect = (category: string) => {
    setSelectedBudget(category === selectedBudget ? "all" : category)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col">
          <div className="absolute inset-0 z-0">
            <div className="relative h-full w-full overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/KoabrcWfI_I?autoplay=1&mute=1&loop=1&playlist=KoabrcWfI_I&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&hd=1&vq=hd1080&disablekb=1&fs=0&cc_load_policy=0&start=0&end=0"
                title="Tourism Background Video"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 brightness-[0.6] pointer-events-none
                          sm:min-w-full sm:min-h-full sm:w-auto sm:h-auto
                          max-sm:w-[150%] max-sm:h-[150%] max-sm:min-w-[150%] max-sm:min-h-[150%]"
                style={{
                  aspectRatio: '16/9',
                }}
                allow="autoplay; encrypted-media"
                allowFullScreen={false}
                frameBorder="0"
                tabIndex={-1}
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          </div>
          <div className="container relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-8xl w-full space-y-8 text-center">
              {/* Hero Content */}
              <div className="space-y-4 sm:space-y-6">
                <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 text-xs sm:text-sm">Best Tropical Getaways</Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
                  Discover Paradise with Pineapple Tours
                </h1>
                <p className="text-lg sm:text-xl text-white/95 max-w-3xl mx-auto drop-shadow-md">
                  Experience the vacation of a lifetime with our handpicked tropical tours and exclusive tour
                  packages.
                </p>
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 pt-2 justify-center">
                  <Link href="/tours">
                    <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 w-full sm:w-auto shadow-lg">
                      Explore Tours
                    </Button>
                  </Link>
                  <Link href="/tours">
                    <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/20 hover:text-white w-full sm:w-auto shadow-lg">
                      View Special Offers
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Search Form */}
              <div className="max-w-6xl mx-auto pt-8">
                <Card className="overflow-hidden border-none shadow-lg bg-white/95 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <SearchForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Tour Packages */}
        <section className="bg-muted py-8 sm:py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row mb-6 sm:mb-8">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Tour Packages</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Discover our handpicked selection of amazing tropical tours
                </p>
              </div>
              <Link href="/tours" className="flex items-center text-sm font-medium text-primary">
                View all packages
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Budget Range Filter Tabs */}
            <Tabs value={selectedBudget} onValueChange={setSelectedBudget} className="mb-6 sm:mb-8">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 h-auto">
                <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                  <span>All Budgets</span>
                  {products && <Badge variant="secondary" className="text-xs">{products.filter(p => p.productType !== "GIFT_CARD").length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                  <span className="text-center">Budget<br className="sm:hidden" />(Under $100)</span>
                  <Badge variant="secondary" className="text-xs">{budgetStats.budget}</Badge>
                </TabsTrigger>
                <TabsTrigger value="mid-range" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                  <span className="text-center">Mid-Range<br className="sm:hidden" />($100-$299)</span>
                  <Badge variant="secondary" className="text-xs">{budgetStats['mid-range']}</Badge>
                </TabsTrigger>
                <TabsTrigger value="luxury" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                  <span className="text-center">Luxury<br className="sm:hidden" />($300+)</span>
                  <Badge variant="secondary" className="text-xs">{budgetStats.luxury}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Loading State */}
            {loading && <TourGridSkeleton count={12} />}

            {/* Error State */}
            {error && (
              <ErrorState
                title="Unable to load tours"
                message="We're having trouble loading our tour packages. Please try again."
                onRetry={handleRetry}
              />
            )}

            {/* Tours Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="space-y-4 sm:space-y-6">
                {/* Results Summary */}
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Showing {filteredProducts.length} tour{filteredProducts.length !== 1 ? 's' : ''}
                    {selectedBudget !== "all" && ` • ${selectedBudget === "mid-range" ? "Mid-Range" : selectedBudget.charAt(0).toUpperCase() + selectedBudget.slice(1)} budget`}
                  </p>
                </div>
                
                {/* Products Grid */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.slice(0, 12).map((product) => (
                    <DynamicTourCard
                      key={product.productCode}
                      product={product}
                    />
                  ))}
                </div>
                
                {/* Show More Button */}
                {filteredProducts.length > 12 && (
                  <div className="text-center pt-4 sm:pt-6">
                    <Link href="/tours">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        View All {filteredProducts.length} Tours
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No tours found</h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                  No tours match your selected filters. Try adjusting your budget selection.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedBudget("all")}
                    className="w-full sm:w-auto"
                  >
                    Show All Budgets
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="container py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why Choose Pineapple Tours</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground text-sm sm:text-base">
              We're dedicated to creating unforgettable tropical experiences with exceptional service
            </p>
          </div>
          <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Real-Time Availability</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Live booking system with instant confirmation and real-time availability updates.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>
              </div>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Best Price Guarantee</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                We promise the best rates with no hidden fees or unexpected charges.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Local Expertise</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Our guides are locals with deep knowledge of each tour's culture and hidden gems.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">24/7 Support</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Our dedicated team is available around the clock to assist with any needs during your trip.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gradient-to-b from-white to-yellow-50 py-8 sm:py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">What Our Travelers Say</h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground text-sm sm:text-base">
                Read about the experiences of our satisfied customers
              </p>
            </div>
            <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <TestimonialCard
                name="Sarah Johnson"
                location="New York, USA"
                image="/placeholder.svg?height=100&width=100"
                rating={5}
                testimonial="Our Hawaiian vacation with Pineapple Tours exceeded all expectations. The accommodations were luxurious, the activities were perfectly planned, and our guide was incredibly knowledgeable. Can't wait to book our next trip!"
              />
              <TestimonialCard
                name="Michael Chen"
                location="Toronto, Canada"
                image="/placeholder.svg?height=100&width=100"
                rating={5}
                testimonial="The Caribbean cruise package was amazing! Everything was taken care of from the moment we arrived. The island excursions were the highlight of our trip - especially the snorkeling adventure in Turks and Caicos."
              />
              <TestimonialCard
                name="Emma and James Wilson"
                location="London, UK"
                image="/placeholder.svg?height=100&width=100"
                rating={5}
                testimonial="Our honeymoon in Fiji was absolute perfection. The private island resort recommended by Pineapple Tours was paradise on earth. The attention to detail and personalized service made our special trip truly unforgettable."
              />
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="container py-16">
          <div className="rounded-xl bg-yellow-500 p-8 md:p-12">
            <div className="grid gap-6 md:grid-cols-2 md:gap-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-black">Subscribe to Our Newsletter</h2>
                <p className="mt-4 text-black/80">
                  Stay updated with our latest offers, travel tips, and exclusive deals. Subscribe now and get 10% off
                  your first booking!
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    className="border-black/10 bg-white text-black placeholder:text-black/50"
                  />
                  <Button className="bg-black text-white hover:bg-black/80">Subscribe</Button>
                </div>
                <p className="mt-2 text-xs text-black/70">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
