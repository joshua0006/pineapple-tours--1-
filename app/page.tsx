"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Bus, Gift, Clock, MapPin, Star, Calendar, CreditCard, BookOpen, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { TestimonialCard } from "@/components/testimonial-card"
import { SearchForm } from "@/components/search-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CategoriesSection } from "@/components/categories-section"
import { HopOnHopOffImages } from "@/components/hop-on-hop-off-images"
import { GiftVoucherImage } from "@/components/gift-voucher-image"

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col">
          <div className="absolute inset-0 z-0">
            <div className="relative h-full w-full overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/R_QENYv8IVA?autoplay=1&mute=1&loop=1&playlist=R_QENYv8IVA&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&hd=1&vq=hd1080&disablekb=1&fs=0&cc_load_policy=0&start=0&end=0"
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
                <p className="font-secondary text-sm sm:text-base font-medium text-brand-secondary/90 tracking-widest uppercase drop-shadow-lg">
                  WELCOME TO PINEAPPLE TOURS
                </p>
                <h1 className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-brand-secondary leading-tight drop-shadow-lg">
                  Make memories with friends,<br />
                  make friends with wine!
                </h1>
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 pt-2 justify-center">
                  <Link href="/tours">
                    <Button size="lg" className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 w-full sm:w-auto shadow-lg font-text">
                      Explore Tours
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

        {/* Hop on Hop off Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                    <Bus className="h-6 w-6 text-brand-accent" />
                  </div>
                  <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
                    Hop on Hop off Tours
                  </h2>
                </div>
                <p className="font-text text-lg text-muted-foreground leading-relaxed">
                  Explore the city at your own pace with our flexible sightseeing buses. Jump on and off at any of our strategically located stops to discover attractions, landmarks, and hidden gems throughout the city.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Buses every 15-20 minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Multiple themed routes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Air-conditioned buses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Valid for 24 hours</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/hop-on-hop-off">
                    <Button size="lg" className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90">
                      <Bus className="mr-2 h-5 w-5" />
                      Explore Routes
                    </Button>
                  </Link>
                  <Link href="/hop-on-hop-off">
                    <Button variant="outline" size="lg" className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-secondary">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Images Grid */}
              <div className="relative">
                <HopOnHopOffImages />
                <div className="absolute -bottom-6 -right-6 bg-brand-accent text-brand-secondary p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">$25</div>
                    <div className="text-sm opacity-90">Starting from</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gift Vouchers Section */}
        <section className="py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <GiftVoucherImage />
                <div className="absolute -top-6 -left-6 bg-brand-accent text-brand-secondary p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-6 w-6" />
                    <span className="font-semibold">Perfect Gift</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-6 order-1 lg:order-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                    <Gift className="h-6 w-6 text-brand-accent" />
                  </div>
                  <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
                    Gift Vouchers
                  </h2>
                </div>
                <p className="font-text text-lg text-muted-foreground leading-relaxed">
                  Give the gift of unforgettable experiences with our flexible travel vouchers. Perfect for birthdays, anniversaries, holidays, or any special occasion. Recipients can choose from hundreds of tours and experiences.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Valid for 12 months</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Redeemable for any tour</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Instant digital delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Custom amounts available</span>
                  </div>
                </div>
                <div className="bg-brand-accent/5 p-6 rounded-xl border border-brand-accent/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-secondary text-lg font-semibold text-brand-text">Popular Voucher Packages</h3>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-xl font-bold text-brand-accent">$100</div>
                      <div className="text-sm text-muted-foreground">Adventure Explorer</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-brand-accent">
                      <div className="text-xl font-bold text-brand-accent">$200</div>
                      <div className="text-sm text-muted-foreground">Romantic Getaway</div>
                      <div className="text-xs text-brand-accent font-semibold mt-1">Most Popular</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-xl font-bold text-brand-accent">$150</div>
                      <div className="text-sm text-muted-foreground">Family Fun</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/gift-vouchers">
                    <Button size="lg" className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90">
                      <Gift className="mr-2 h-5 w-5" />
                      Buy Gift Voucher
                    </Button>
                  </Link>
                  <Link href="/gift-vouchers">
                    <Button variant="outline" size="lg" className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-secondary">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner CTA */}
        <section className="bg-brand-accent py-12 sm:py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center text-brand-secondary">
              <h1 className="font-primary text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
                Book a tour today!
              </h1>
              <p className="font-text mx-auto max-w-3xl text-lg sm:text-xl lg:text-2xl text-brand-secondary/90 mb-8 leading-relaxed">
                Pineapple Tours is the place to go if you're looking for a fun, intimate and adventurous good time. Browse our selection of packages and taste the flavours that our unique locations have to offer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/tours">
                  <Button size="lg" className="bg-brand-secondary text-brand-accent hover:bg-brand-secondary/90 font-semibold px-8 py-3 text-lg">
                    Browse All Tours
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-brand-accent font-semibold px-8 py-3 text-lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Blog and Contact Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Blog Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-brand-accent" />
                  </div>
                  <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
                    Travel Blog
                  </h2>
                </div>
                <p className="font-text text-lg text-muted-foreground leading-relaxed">
                  Discover insider tips, destination guides, and inspiring travel stories from our expert team. Get the most out of your adventures with our comprehensive travel resources and local insights.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Destination guides</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Expert travel tips</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Weekly updates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Local insights</span>
                  </div>
                </div>
                <div className="bg-brand-accent/5 p-6 rounded-xl border border-brand-accent/20">
                  <h3 className="font-secondary text-lg font-semibold text-brand-text mb-4">Latest Articles</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-text font-medium text-brand-text text-sm">Top 10 Hidden Gems in Wine Country</h4>
                        <p className="font-text text-xs text-muted-foreground">Discover secret vineyards and local favorites</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-text font-medium text-brand-text text-sm">Best Time to Visit Tropical Destinations</h4>
                        <p className="font-text text-xs text-muted-foreground">Seasonal guide for perfect weather</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-text font-medium text-brand-text text-sm">Packing Tips for Adventure Tours</h4>
                        <p className="font-text text-xs text-muted-foreground">Essential items for your next adventure</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/blog">
                    <Button size="lg" className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Read Our Blog
                    </Button>
                  </Link>
                  <Link href="/blog">
                    <Button variant="outline" size="lg" className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-secondary">
                      Subscribe to Updates
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Contact Us Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-brand-accent" />
                  </div>
                  <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
                    Contact Us
                  </h2>
                </div>
                <p className="font-text text-lg text-muted-foreground leading-relaxed">
                  Have questions about our tours or need help planning your perfect getaway? Our friendly team is here to assist you every step of the way. Get in touch and let's start planning your adventure.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">24/7 support available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Live chat support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Expert travel advice</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-brand-accent" />
                    <span className="font-text text-sm">Custom tour planning</span>
                  </div>
                </div>
                <div className="bg-brand-accent/5 p-6 rounded-xl border border-brand-accent/20">
                  <h3 className="font-secondary text-lg font-semibold text-brand-text mb-4">Get in Touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-brand-accent" />
                      </div>
                      <div>
                        <p className="font-text font-medium text-brand-text text-sm">Email Support</p>
                        <p className="font-text text-xs text-muted-foreground">info@pineappletours.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-brand-accent" />
                      </div>
                      <div>
                        <p className="font-text font-medium text-brand-text text-sm">Response Time</p>
                        <p className="font-text text-xs text-muted-foreground">Within 2 hours during business hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-brand-accent" />
                      </div>
                      <div>
                        <p className="font-text font-medium text-brand-text text-sm">Office Hours</p>
                        <p className="font-text text-xs text-muted-foreground">Mon-Fri 9AM-6PM, Sat-Sun 10AM-4PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact">
                    <Button size="lg" className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contact Us Now
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-secondary">
                      Live Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

// Export BookingData type for use in other components
export interface BookingData {
  product: {
    code: string
    name: string
    hasPickupServices?: boolean
    pickupServiceType?: string
  }
  session: {
    id: string
    startTime: string
    endTime: string
  }
  pickupLocation?: any
  participants: number
  pricing: {
    basePrice: number
    sessionPrice: number
    subtotal: number
    taxAndFees: number
    total: number
  }
  timestamp: string
}
