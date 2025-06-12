"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Bus,
  Route,
  Calendar,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRezdyProducts } from "@/hooks/use-rezdy";
import { RezdyProduct } from "@/lib/types/rezdy";

export default function HopOnHopOffPage() {
  const { data: allProducts, loading, error } = useRezdyProducts();
  const [hopOnHopOffProducts, setHopOnHopOffProducts] = useState<
    RezdyProduct[]
  >([]);

  // Filter products for hop-on hop-off tours
  useEffect(() => {
    if (allProducts) {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes("hop") ||
          product.name.toLowerCase().includes("bus") ||
          product.name.toLowerCase().includes("sightseeing") ||
          product.description?.toLowerCase().includes("hop on hop off") ||
          product.description?.toLowerCase().includes("city tour") ||
          product.productType === "BUS_TOUR" ||
          product.categories?.some((cat) =>
            cat.toLowerCase().includes("sightseeing")
          )
      );
      setHopOnHopOffProducts(filtered);
    }
  }, [allProducts]);

  const routes = [
    {
      id: 1,
      name: "City Explorer Route",
      duration: "2 hours",
      stops: 12,
      highlights: [
        "Downtown District",
        "Historic Quarter",
        "Waterfront",
        "Shopping District",
      ],
      price: "$25",
      image: "/api/placeholder/400/250",
    },
    {
      id: 2,
      name: "Coastal Adventure Route",
      duration: "3 hours",
      stops: 15,
      highlights: [
        "Beach Promenade",
        "Lighthouse Point",
        "Marina District",
        "Sunset Viewpoint",
      ],
      price: "$35",
      image: "/api/placeholder/400/250",
    },
    {
      id: 3,
      name: "Cultural Heritage Route",
      duration: "2.5 hours",
      stops: 10,
      highlights: [
        "Museums Quarter",
        "Art Galleries",
        "Cultural Center",
        "Heritage Sites",
      ],
      price: "$30",
      image: "/api/placeholder/400/250",
    },
  ];

  const features = [
    {
      icon: <Bus className="h-6 w-6" />,
      title: "Comfortable Buses",
      description:
        "Air-conditioned buses with panoramic windows for the best views",
    },
    {
      icon: <Route className="h-6 w-6" />,
      title: "Multiple Routes",
      description:
        "Choose from various themed routes covering all major attractions",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Flexible Schedule",
      description:
        "Buses run every 15-20 minutes, hop on and off at your own pace",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Strategic Stops",
      description:
        "Conveniently located stops near all major attractions and landmarks",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <PageHeader
        title="Hop On Hop Off Tours"
        subtitle="Explore the city at your own pace with our flexible sightseeing buses"
        primaryAction={{
          label: "Book Your Ticket",
          icon: Calendar,
          onClick: () => console.log("Book ticket clicked"),
        }}
        secondaryAction={{
          label: "View Routes",
          onClick: () => console.log("View routes clicked"),
        }}
      />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4 font-['Barlow']">
              Why Choose Our Hop On Hop Off Service?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-['Work_Sans']">
              Experience the ultimate flexibility in city exploration with our
              premium hop-on hop-off service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-['Barlow']">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-['Work_Sans']">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 font-barlow">
              Available Tours
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-work-sans">
              {loading
                ? "Loading available hop-on hop-off tours..."
                : hopOnHopOffProducts.length > 0
                ? `Discover ${hopOnHopOffProducts.length} hop-on hop-off tour${
                    hopOnHopOffProducts.length !== 1 ? "s" : ""
                  } available`
                : "Explore our sightseeing tours and city experiences"}
            </p>
          </div>

          {error && (
            <Alert className="mb-8">
              <AlertDescription className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Unable to load tours. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hopOnHopOffProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hopOnHopOffProducts.map((product) => (
                <Card
                  key={product.productCode}
                  className="overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={
                        product.images?.[0]?.itemUrl ||
                        "/api/placeholder/400/250"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.advertisedPrice && (
                      <Badge className="absolute top-4 left-4 bg-brand-accent text-brand-secondary">
                        ${product.advertisedPrice}
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-barlow text-brand-text">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {typeof product.locationAddress === "string"
                          ? product.locationAddress
                          : product.locationAddress?.city || "City Tour"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {product.quantityRequiredMin || 1}-
                        {product.quantityRequiredMax || 20} guests
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground font-work-sans line-clamp-3 min-h-[4.5rem] leading-6">
                        {product.shortDescription ||
                          product.description ||
                          "Experience the city with our hop-on hop-off tour service."}
                      </p>
                    </div>
                    <Link href={`/tours/${product.productCode}`}>
                      <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary">
                        View Details & Book
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routes.map((route) => (
                <Card
                  key={route.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={route.image}
                      alt={route.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-brand-accent text-brand-secondary">
                      {route.price}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-barlow text-brand-text">
                      {route.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {route.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {route.stops} stops
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 font-barlow text-brand-text">
                        Highlights:
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 font-work-sans">
                        {route.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-brand-accent" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary">
                      Select This Route
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4 font-['Barlow']">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-['Work_Sans']">
              Getting started with our hop-on hop-off service is simple and
              convenient
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Barlow']">
                Book Your Ticket
              </h3>
              <p className="text-gray-600 font-['Work_Sans']">
                Choose your preferred route and purchase your ticket online or
                at any stop
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Barlow']">
                Board the Bus
              </h3>
              <p className="text-gray-600 font-['Work_Sans']">
                Show your ticket and hop on at any designated stop along the
                route
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Barlow']">
                Explore & Enjoy
              </h3>
              <p className="text-gray-600 font-['Work_Sans']">
                Get off at any attraction, explore at your pace, then hop back
                on the next bus
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Barlow']">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90 font-['Work_Sans']">
            Book your hop-on hop-off ticket today and discover the city like
            never before
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-brand-primary hover:bg-gray-100"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brand-primary"
            >
              <MapPin className="mr-2 h-5 w-5" />
              View Map
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
