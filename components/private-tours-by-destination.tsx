import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  Calendar,
  Users,
  Thermometer,
  Plane,
  Mountain,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TourCard } from "@/components/tour-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { ActivityCard } from "@/components/activity-card";
import { AccommodationCard } from "@/components/accommodation-card";
import { DestinationMap } from "@/components/destination-map";
import { DestinationStats } from "@/components/destination-stats";

export default function HawaiiDestinationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="mx-1 h-4 w-4" />
            <Link href="/destinations" className="hover:text-foreground">
              Destinations
            </Link>
            <ChevronRight className="mx-1 h-4 w-4" />
            <span className="text-foreground">Hawaii</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <Image
              src="/placeholder.svg?height=800&width=1920"
              alt="Hawaii tropical paradise"
              fill
              className="object-cover brightness-[0.8]"
              priority
            />
          </div>
          <div className="container relative z-10 py-24 md:py-32 lg:py-40">
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-brand-accent text-brand-secondary hover:bg-coral-600">
                  Top Destination
                </Badge>
                <Badge variant="outline" className="border-white text-white">
                  Pacific Paradise
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Discover the Magic of Hawaii
              </h1>
              <p className="text-xl text-white/90 md:text-2xl">
                Experience the Aloha spirit across eight magnificent islands,
                where pristine beaches meet volcanic wonders and ancient culture
                thrives in modern paradise.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  size="lg"
                  className="bg-brand-accent text-brand-secondary hover:bg-coral-600"
                >
                  Explore Hawaii Tours
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  Watch Destination Video
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="container relative z-10 -mt-16 mb-16">
            <DestinationStats />
          </div>
        </section>

        {/* Destination Overview */}
        <section className="container py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Welcome to Paradise
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Hawaii is a tropical paradise like no other, where ancient
                  Polynesian culture meets modern luxury. From the dramatic
                  volcanic landscapes of the Big Island to the pristine beaches
                  of Maui, each island offers its own unique character and
                  unforgettable experiences.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100">
                    <Thermometer className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Perfect Climate</div>
                    <div className="text-sm text-muted-foreground">
                      75-85°F year-round
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100">
                    <Plane className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Easy Access</div>
                    <div className="text-sm text-muted-foreground">
                      Direct flights worldwide
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100">
                    <Mountain className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <div className="font-medium">8 Unique Islands</div>
                    <div className="text-sm text-muted-foreground">
                      Each with distinct character
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100">
                    <Heart className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Aloha Spirit</div>
                    <div className="text-sm text-muted-foreground">
                      Warm Hawaiian hospitality
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="bg-brand-accent text-brand-secondary hover:bg-coral-600">
                  Plan Your Trip
                </Button>
                <Button variant="outline">Download Guide</Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="relative h-48 overflow-hidden rounded-lg">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Hawaiian beach"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-32 overflow-hidden rounded-lg">
                    <Image
                      src="/placeholder.svg?height=200&width=400"
                      alt="Hawaiian culture"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 sm:mt-8">
                  <div className="relative h-32 overflow-hidden rounded-lg">
                    <Image
                      src="/placeholder.svg?height=200&width=400"
                      alt="Hawaiian volcano"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-48 overflow-hidden rounded-lg">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Hawaiian sunset"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Activities */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Unforgettable Experiences
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                From underwater adventures to volcanic hikes, Hawaii offers
                endless opportunities for adventure and relaxation
              </p>
            </div>
            <Tabs defaultValue="adventure" className="mt-12">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="adventure">Adventure</TabsTrigger>
                <TabsTrigger value="culture">Culture</TabsTrigger>
                <TabsTrigger value="relaxation">Relaxation</TabsTrigger>
                <TabsTrigger value="nature">Nature</TabsTrigger>
              </TabsList>
              <TabsContent value="adventure" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ActivityCard
                    title="Snorkeling at Molokini Crater"
                    description="Explore the crystal-clear waters of this partially submerged volcanic crater, home to over 250 species of fish."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Half Day"
                    difficulty="Easy"
                    price={89}
                  />
                  <ActivityCard
                    title="Volcano National Park Tour"
                    description="Witness the raw power of nature at Kilauea volcano and explore lava tubes and volcanic landscapes."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Full Day"
                    difficulty="Moderate"
                    price={149}
                  />
                  <ActivityCard
                    title="Helicopter Island Tour"
                    description="See Hawaii from above with breathtaking aerial views of waterfalls, valleys, and volcanic craters."
                    image="/placeholder.svg?height=300&width=400"
                    duration="2 Hours"
                    difficulty="Easy"
                    price={299}
                  />
                </div>
              </TabsContent>
              <TabsContent value="culture" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ActivityCard
                    title="Traditional Hawaiian Luau"
                    description="Experience authentic Hawaiian culture with traditional food, music, and hula dancing under the stars."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Evening"
                    difficulty="Easy"
                    price={119}
                  />
                  <ActivityCard
                    title="Pearl Harbor Historic Tour"
                    description="Learn about the pivotal moment in history that changed the world at this moving memorial."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Half Day"
                    difficulty="Easy"
                    price={79}
                  />
                  <ActivityCard
                    title="Polynesian Cultural Center"
                    description="Journey through six Pacific island cultures with authentic villages, shows, and demonstrations."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Full Day"
                    difficulty="Easy"
                    price={99}
                  />
                </div>
              </TabsContent>
              <TabsContent value="relaxation" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ActivityCard
                    title="Spa Day at Luxury Resort"
                    description="Indulge in traditional Hawaiian healing treatments using local ingredients and ancient techniques."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Half Day"
                    difficulty="Easy"
                    price={199}
                  />
                  <ActivityCard
                    title="Sunset Beach Picnic"
                    description="Enjoy a romantic beachside dinner as the sun sets over the Pacific Ocean."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Evening"
                    difficulty="Easy"
                    price={89}
                  />
                  <ActivityCard
                    title="Catamaran Sailing"
                    description="Relax on deck while sailing along the beautiful Hawaiian coastline with snorkeling stops."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Half Day"
                    difficulty="Easy"
                    price={129}
                  />
                </div>
              </TabsContent>
              <TabsContent value="nature" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ActivityCard
                    title="Haleakala Sunrise Hike"
                    description="Watch the sunrise from 10,000 feet above sea level at Maui's highest peak."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Half Day"
                    difficulty="Moderate"
                    price={69}
                  />
                  <ActivityCard
                    title="Bamboo Forest Trail"
                    description="Hike through mystical bamboo forests to discover hidden waterfalls and natural pools."
                    image="/placeholder.svg?height=300&width=400"
                    duration="Half Day"
                    difficulty="Moderate"
                    price={59}
                  />
                  <ActivityCard
                    title="Whale Watching Tour"
                    description="Witness majestic humpback whales during their annual migration (December-April)."
                    image="/placeholder.svg?height=300&width=400"
                    duration="3 Hours"
                    difficulty="Easy"
                    price={79}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Accommodation Options */}
        <section className="container py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Where to Stay</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From luxury resorts to boutique hotels, find the perfect
              accommodation for your Hawaiian getaway
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <AccommodationCard
              name="Grand Wailea Resort"
              location="Wailea, Maui"
              type="Luxury Resort"
              image="/placeholder.svg?height=300&width=400"
              rating={4.8}
              price={599}
              amenities={[
                "Spa",
                "Multiple Pools",
                "Golf Course",
                "Beach Access",
              ]}
              description="A world-class luxury resort featuring stunning ocean views, award-winning spa, and exceptional dining."
            />
            <AccommodationCard
              name="Turtle Bay Resort"
              location="North Shore, Oahu"
              type="Beach Resort"
              image="/placeholder.svg?height=300&width=400"
              rating={4.6}
              price={399}
              amenities={["Surfing", "Golf", "Spa", "Multiple Restaurants"]}
              description="Located on Oahu's famous North Shore, perfect for surf enthusiasts and beach lovers."
            />
            <AccommodationCard
              name="Volcano House"
              location="Hawaii Volcanoes National Park"
              type="Historic Hotel"
              image="/placeholder.svg?height=300&width=400"
              rating={4.4}
              price={299}
              amenities={[
                "Volcano Views",
                "Historic Charm",
                "Restaurant",
                "Gift Shop",
              ]}
              description="A unique historic hotel perched on the rim of Kilauea volcano with unparalleled views."
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
                Explore Hawaii's Islands
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Discover the unique attractions and experiences each Hawaiian
                island has to offer
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
              What Our Travelers Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Read authentic reviews from travelers who have experienced the
              magic of Hawaii with Pineapple Tours
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              name="Sarah & Mike Johnson"
              location="Denver, Colorado"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              testimonial="Our Hawaiian honeymoon was absolutely perfect! The snorkeling at Molokini was breathtaking, and the luau was an authentic cultural experience. Pineapple Tours took care of every detail."
            />
            <TestimonialCard
              name="Emily Chen"
              location="San Francisco, California"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              testimonial="The volcano tour was the highlight of our trip! Our guide was incredibly knowledgeable about Hawaiian geology and culture. The helicopter tour was also amazing - seeing the islands from above was unforgettable."
            />
            <TestimonialCard
              name="Rodriguez Family"
              location="Austin, Texas"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              testimonial="Perfect family vacation! The kids loved the snorkeling and beach time, while we adults enjoyed the cultural experiences and beautiful resorts. Hawaii truly has something for everyone."
            />
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">
                4.9/5 average rating from 247 Hawaii travelers
              </span>
            </div>
          </div>
        </section>

        {/* Featured Tours */}
        <section className="bg-gradient-to-b from-white to-yellow-50 py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Hawaii Tour Packages
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Choose from our carefully crafted Hawaii tour packages designed
                to showcase the best of the islands
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <TourCard
                title="Hawaiian Paradise Escape"
                location="Maui, Hawaii"
                image="/placeholder.svg?height=400&width=600"
                price={1299}
                duration={7}
                rating={4.8}
                slug="hawaiian-paradise-escape"
              />
              <TourCard
                title="Big Island Volcano Adventure"
                location="Big Island, Hawaii"
                image="/placeholder.svg?height=400&width=600"
                price={1399}
                duration={6}
                rating={4.7}
                slug="big-island-volcano-adventure"
              />
              <TourCard
                title="Oahu Island Explorer"
                location="Oahu, Hawaii"
                image="/placeholder.svg?height=400&width=600"
                price={1199}
                duration={5}
                rating={4.6}
                slug="oahu-island-explorer"
              />
            </div>
            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="bg-brand-accent text-brand-secondary hover:bg-coral-600"
              >
                View All Hawaii Tours
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container py-16">
          <div className="rounded-xl bg-gradient-to-r from-brand-accent to-coral-600 p-8 text-center md:p-12">
            <h2 className="text-3xl font-bold text-black md:text-4xl">
              Ready to Experience Hawaii?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-black/80 md:text-lg">
              Let our Hawaii specialists help you plan the perfect tropical
              getaway. From romantic honeymoons to family adventures, we'll
              create an unforgettable experience just for you.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-brand-primary text-brand-secondary hover:bg-brand-green"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Hawaii Trip
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black/10"
              >
                <Users className="mr-2 h-5 w-5" />
                Speak with a Specialist
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-black/70">
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Free consultation</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Custom itineraries</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>24/7 support</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>Best price guarantee</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
