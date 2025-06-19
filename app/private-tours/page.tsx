import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  Calendar,
  Users,
  Car,
  MapPin,
  Mountain,
  Heart,
  Wine,
  Compass,
  Gift,
  Clock,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TourCard } from "@/components/tour-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { ActivityCard } from "@/components/activity-card";
import { AccommodationCard } from "@/components/accommodation-card";
import { DestinationMap } from "@/components/destination-map";
import { DestinationStats } from "@/components/destination-stats";

export default function PrivateToursPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="mx-1 h-4 w-4" />
            <span className="text-foreground">Private Tours</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <Image
              src="/private-tours/gold-coast.avif"
              alt="Private tours Gold Coast and Brisbane"
              fill
              className="object-cover brightness-[0.8]"
              priority
            />
          </div>
          <div className="container relative z-10 py-24 md:py-32 lg:py-40">
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-brand-accent text-brand-secondary hover:bg-coral-600">
                  Premium Experience
                </Badge>
                <Badge variant="outline" className="border-white text-white">
                  Personalized Tours
                </Badge>
                <Badge variant="outline" className="border-white text-white">
                  Custom Itineraries
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Private & Custom Tours
              </h1>
              <p className="text-xl text-white/90 md:text-2xl">
                From intimate wine tastings on Mount Tamborine to luxury
                multi-day adventures across Queensland's most beautiful
                destinations. Each tour is personalized to meet your specific
                interests and preferences, with expert local guides and premium
                transportation.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  size="lg"
                  className="bg-brand-accent text-brand-secondary hover:bg-coral-600"
                >
                  Explore Private Tours
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  Custom Itinerary
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="container relative z-10 -mt-16 mb-16">
            <DestinationStats />
          </div>
        </section>

        {/* Tour Categories */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Private Tour Categories
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Choose from our curated private experiences, premium multi-day
                packages, custom tours, or gift vouchers for that special
                someone
              </p>
            </div>
            <Tabs defaultValue="private" className="mt-12">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="private">Private Tours</TabsTrigger>
                <TabsTrigger value="premium">Premium Experiences</TabsTrigger>
                <TabsTrigger value="custom">Custom Tours</TabsTrigger>
                <TabsTrigger value="gifts">Gift Vouchers</TabsTrigger>
              </TabsList>

              <TabsContent value="private" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ActivityCard
                    title="Champagne Sunset Winery Tour"
                    description="Experience spectacular sunsets on Mount Tamborine with guided tastings at two wineries, gourmet cheese platters, and champagne service."
                    image="/private-tours/tamborine-mountain.avif"
                    duration="Evening"
                    difficulty="Easy"
                    price={199}
                  />
                  <ActivityCard
                    title="A Tale of Two Distilleries Gin Tour"
                    description="Enjoy guided tours and tasting paddles at 2 distilleries. Available in Gold Coast, Northern NSW, and Mt Tamborine regions."
                    image="/private-tours/scenic-rim.avif"
                    duration="Half Day"
                    difficulty="Easy"
                    price={150}
                  />
                  <ActivityCard
                    title="Byron Bay Day Tour - Signature Experience"
                    description="Explore Australia's most easterly point and Byron Bay's stunning hinterland filled with gorgeous villages and tranquil scenery."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Full Day"
                    difficulty="Easy"
                    price={1295}
                  />
                </div>
              </TabsContent>

              <TabsContent value="premium" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ActivityCard
                    title="3 Day Luxury Brisbane - Gold Coast - Byron Bay"
                    description="Private 3-day tour covering Brisbane, Gold Coast, and Byron Bay with gourmet food, local produce tastings, and personalized itinerary."
                    image="/private-tours/gold-coast.avif"
                    duration="3 Days"
                    difficulty="Easy"
                    price={1995}
                  />
                  <ActivityCard
                    title="3 Day Luxury Hinterland Experience"
                    description="Private 3-day tour of Gold Coast and Scenic Rim featuring Queensland's best produce, gourmet experiences, and historical commentary."
                    image="/private-tours/scenic-rim.avif"
                    duration="3 Days"
                    difficulty="Easy"
                    price={1995}
                  />
                  <ActivityCard
                    title="A Taste of Gourmet Tasting Experience"
                    description="Personalized experience with local gourmet food producers, paired tastings, and unforgettable culinary journey."
                    image="/private-tours/tamborine-mountain.avif"
                    duration="Half Day"
                    difficulty="Easy"
                    price={900}
                  />
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ActivityCard
                    title="Hop on Hop off Bus - Tamborine Mountain"
                    description="Exclusive hop-on, hop-off bus service from Brisbane to Tamborine Mountain with flexible exploration options."
                    image="/private-tours/tamborine-mountain.avif"
                    duration="Full Day"
                    difficulty="Easy"
                    price={99}
                  />
                  <ActivityCard
                    title="Brisbane to Tamborine Mountain Shuttle"
                    description="Choose one way or return with unlimited hop-on hop-off. Includes all transport around Tamborine Mountain for one day."
                    image="/private-tours/brisbane-tours.webp"
                    duration="Flexible"
                    difficulty="Easy"
                    price={99}
                  />
                  <ActivityCard
                    title="Hot Air Balloon Experience"
                    description="Custom adventure experience with scenic aerial views, professional pilot, and all safety equipment included."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Half Day"
                    difficulty="Easy"
                    price={450}
                  />
                </div>
              </TabsContent>

              <TabsContent value="gifts" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border bg-card p-6 text-center">
                    <Gift className="mx-auto h-12 w-12 text-brand-accent" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Premium Full Day Wine Tour
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Two people including pickup
                    </p>
                    <p className="mt-4 text-2xl font-bold">$598</p>
                    <Button className="mt-4 w-full">
                      Purchase Gift Voucher
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-card p-6 text-center">
                    <Gift className="mx-auto h-12 w-12 text-brand-accent" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Premium Boutique Winery Tour
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Two people premium experience
                    </p>
                    <p className="mt-4 text-2xl font-bold">$998</p>
                    <Button className="mt-4 w-full">
                      Purchase Gift Voucher
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-card p-6 text-center">
                    <Gift className="mx-auto h-12 w-12 text-brand-accent" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Full Day Wine Tour
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Two people including pickup
                    </p>
                    <p className="mt-4 text-2xl font-bold">$458</p>
                    <Button className="mt-4 w-full">
                      Purchase Gift Voucher
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Key Destinations */}
        <section className="container py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Key Destinations
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Explore Queensland's most beautiful destinations with our private
              tours
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <Mountain className="h-8 w-8 text-brand-accent" />
              <h3 className="mt-4 text-xl font-semibold">Mount Tamborine</h3>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• Boutique wineries and distilleries</li>
                <li>• Rainforest walks and scenic lookouts</li>
                <li>• Gallery Walk shopping precinct</li>
                <li>• Glow worm caves</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <MapPin className="h-8 w-8 text-brand-accent" />
              <h3 className="mt-4 text-xl font-semibold">Gold Coast</h3>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• Stunning beaches and coastal views</li>
                <li>• Theme parks and attractions</li>
                <li>• Vibrant nightlife and dining</li>
                <li>• Hinterland access</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Heart className="h-8 w-8 text-brand-accent" />
              <h3 className="mt-4 text-xl font-semibold">Byron Bay</h3>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• Australia's most easterly point</li>
                <li>• Bohemian culture and arts</li>
                <li>• Lighthouse and coastal walks</li>
                <li>• Organic markets and cafes</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Car className="h-8 w-8 text-brand-accent" />
              <h3 className="mt-4 text-xl font-semibold">Brisbane</h3>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• Cultural precincts and museums</li>
                <li>• River city attractions</li>
                <li>• Botanical gardens</li>
                <li>• Historic sites</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Compass className="h-8 w-8 text-brand-accent" />
              <h3 className="mt-4 text-xl font-semibold">Scenic Rim</h3>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• World Heritage rainforests</li>
                <li>• Mountain peaks and valleys</li>
                <li>• Wildlife encounters</li>
                <li>• Adventure activities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Guide */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Pricing Guide
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Choose the experience that fits your budget and preferences
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-8 text-center">
                <DollarSign className="mx-auto h-12 w-12 text-green-600" />
                <h3 className="mt-4 text-xl font-semibold">Budget-Friendly</h3>
                <p className="mt-2 text-3xl font-bold">$99-$199</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Hop-on hop-off services</li>
                  <li>• Shuttle transfers</li>
                  <li>• Basic custom experiences</li>
                  <li>• Entry-level private tours</li>
                </ul>
              </div>
              <div className="rounded-lg border bg-card p-8 text-center">
                <Star className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="mt-4 text-xl font-semibold">Premium</h3>
                <p className="mt-2 text-3xl font-bold">$450-$900</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Hot air balloon rides</li>
                  <li>• Gourmet tasting experiences</li>
                  <li>• Specialized private tours</li>
                  <li>• Premium gift vouchers</li>
                </ul>
              </div>
              <div className="rounded-lg border bg-card p-8 text-center">
                <Heart className="mx-auto h-12 w-12 text-brand-accent" />
                <h3 className="mt-4 text-xl font-semibold">Luxury</h3>
                <p className="mt-2 text-3xl font-bold">$1,295-$1,995</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Multi-day experiences</li>
                  <li>• Signature private tours</li>
                  <li>• All-inclusive packages</li>
                  <li>• Premium accommodations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Accommodation Options */}
        <section className="container py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Recommended Accommodations
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Stay at our partner accommodations for the complete private tour
              experience
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <AccommodationCard
              name="Tamborine Mountain Lodge"
              location="Tamborine Mountain, QLD"
              type="Boutique Lodge"
              image="/placeholder.svg?height=300&width=400"
              rating={4.7}
              price={280}
              amenities={[
                "Mountain Views",
                "Spa Services",
                "Fine Dining",
                "Private Balconies",
              ]}
              description="Luxury mountain retreat offering stunning views and world-class amenities in the heart of Tamborine Mountain."
            />
            <AccommodationCard
              name="Gold Coast Penthouse"
              location="Surfers Paradise, QLD"
              type="Luxury Apartment"
              image="/placeholder.svg?height=300&width=400"
              rating={4.8}
              price={450}
              amenities={[
                "Ocean Views",
                "Private Pool",
                "Concierge",
                "Beach Access",
              ]}
              description="Exclusive penthouse accommodation with panoramic ocean views and premium amenities."
            />
            <AccommodationCard
              name="Scenic Rim Eco Lodge"
              location="Scenic Rim, QLD"
              type="Eco Lodge"
              image="/placeholder.svg?height=300&width=400"
              rating={4.6}
              price={320}
              amenities={[
                "Eco-Friendly",
                "Wildlife Viewing",
                "Organic Dining",
                "Nature Walks",
              ]}
              description="Sustainable luxury accommodation immersed in the natural beauty of the Scenic Rim."
            />
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              View All Accommodations
            </Button>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Explore Our Private Tour Destinations
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Discover the unique attractions and experiences each destination
                offers on our private tours
              </p>
            </div>
            <div className="mt-12">
              <DestinationMap />
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="container py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              What Our Private Tour Guests Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Read authentic reviews from travelers who have experienced our
              personalized private tours
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              name="James & Sarah Mitchell"
              location="Sydney, NSW"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              testimonial="Our private Tamborine Mountain tour was absolutely perfect! The personalized attention and flexibility to explore at our own pace made it unforgettable. Our guide's local knowledge was incredible."
            />
            <TestimonialCard
              name="David Chen"
              location="Melbourne, VIC"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              testimonial="The private Gold Coast tour exceeded all expectations. Being able to customize our itinerary and avoid crowds made it so much more enjoyable. Highly recommend Pineapple Tours!"
            />
            <TestimonialCard
              name="The Williams Family"
              location="Perth, WA"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              testimonial="Perfect family experience! The private tour allowed us to go at our own pace with the kids, and our guide was fantastic with them. The Scenic Rim was breathtaking."
            />
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">
                4.9/5 average rating from 180+ private tour guests
              </span>
            </div>
          </div>
        </section>

        {/* Featured Tours */}
        <section className="bg-gradient-to-b from-white to-yellow-50 py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Featured Private Tour Packages
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Our most popular private tour packages with real pricing and
                detailed itineraries
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <TourCard
                title="Champagne Sunset Winery Tour"
                location="Mount Tamborine, QLD"
                image="/private-tours/tamborine-mountain.avif"
                price={199}
                duration={4}
                rating={4.9}
                slug="champagne-sunset-winery-tour"
              />
              <TourCard
                title="3 Day Luxury Brisbane - Gold Coast - Byron Bay"
                location="Brisbane to Byron Bay"
                image="/private-tours/gold-coast.avif"
                price={1995}
                duration={72}
                rating={4.8}
                slug="3-day-luxury-brisbane-gold-coast-byron-bay"
              />
              <TourCard
                title="A Tale of Two Distilleries Gin Tour"
                location="Gold Coast, Northern NSW, Mt Tamborine"
                image="/private-tours/scenic-rim.avif"
                price={150}
                duration={4}
                rating={4.9}
                slug="tale-of-two-distilleries-gin-tour"
              />
            </div>
            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="bg-brand-accent text-brand-secondary hover:bg-coral-600"
              >
                View All Private Tours
              </Button>
            </div>
          </div>
        </section>

        {/* Booking Information & Call to Action */}
        <section className="container py-16">
          <div className="rounded-xl bg-gradient-to-r from-brand-accent to-coral-600 p-8 text-center md:p-12">
            <h2 className="text-3xl font-bold text-black md:text-4xl">
              Ready for Your Private Adventure?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-black/80 md:text-lg">
              Let our private tour specialists create the perfect personalized
              experience for you. From intimate couples' getaways to family
              adventures, we'll craft an unforgettable journey just for your
              group.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-brand-primary text-brand-secondary hover:bg-brand-green"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Private Tour
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black/10"
              >
                <Users className="mr-2 h-5 w-5" />
                Custom Itinerary
              </Button>
            </div>

            {/* Booking Information */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-black/10 p-4">
                <Clock className="mx-auto h-6 w-6 text-black" />
                <h4 className="mt-2 font-semibold text-black">
                  Advance Notice
                </h4>
                <p className="text-sm text-black/70">
                  Standard: 24-48 hours
                  <br />
                  Custom: 3-7 days
                </p>
              </div>
              <div className="rounded-lg bg-black/10 p-4">
                <Users className="mx-auto h-6 w-6 text-black" />
                <h4 className="mt-2 font-semibold text-black">Group Sizes</h4>
                <p className="text-sm text-black/70">
                  2-15 people
                  <br />
                  Larger groups available
                </p>
              </div>
              <div className="rounded-lg bg-black/10 p-4">
                <Heart className="mx-auto h-6 w-6 text-black" />
                <h4 className="mt-2 font-semibold text-black">Cancellation</h4>
                <p className="text-sm text-black/70">
                  Free cancellation
                  <br />
                  48 hours before tour
                </p>
              </div>
              <div className="rounded-lg bg-black/10 p-4">
                <Star className="mx-auto h-6 w-6 text-black" />
                <h4 className="mt-2 font-semibold text-black">Accessibility</h4>
                <p className="text-sm text-black/70">
                  Wheelchair accessible
                  <br />
                  Modified itineraries
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-black/70">
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Free consultation</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Flexible itineraries</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Expert local guides</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Premium vehicles</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Dietary accommodations</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Weather contingencies</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
