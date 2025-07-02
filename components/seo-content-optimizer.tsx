import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Star } from "lucide-react";

interface RelatedTour {
  name: string;
  slug: string;
  price: number;
  category: string;
  location: string;
}

interface RelatedToursProps {
  currentTourSlug?: string;
  category?: string;
  location?: string;
  maxItems?: number;
}

export function RelatedTours({
  currentTourSlug,
  category,
  location,
  maxItems = 3,
}: RelatedToursProps) {
  // In a real implementation, this would fetch related tours from your API
  const relatedTours: RelatedTour[] = [
    {
      name: "Gold Coast Wine Tour",
      slug: "gold-coast-wine-tour",
      price: 149,
      category: "Wine Tours",
      location: "Gold Coast",
    },
    {
      name: "Brisbane Brewery Experience",
      slug: "brisbane-brewery-experience",
      price: 119,
      category: "Brewery Tours",
      location: "Brisbane",
    },
    {
      name: "Scenic Rim Day Trip",
      slug: "scenic-rim-day-trip",
      price: 179,
      category: "Day Tours",
      location: "Scenic Rim",
    },
  ]
    .filter((tour) => tour.slug !== currentTourSlug)
    .slice(0, maxItems);

  if (relatedTours.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          You Might Also Like
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {relatedTours.map((tour) => (
            <Link
              key={tour.slug}
              href={`/tours/${tour.slug}`}
              className="group block p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <div className="space-y-2">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {tour.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {tour.location}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{tour.category}</Badge>
                  <span className="font-semibold text-primary">
                    ${tour.price}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                  View Details <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface PopularDestinationsProps {
  className?: string;
}

export function PopularDestinations({ className }: PopularDestinationsProps) {
  const destinations = [
    {
      name: "Gold Coast Wine Tours",
      href: "/tours/category/winery-tours",
      count: "12+ tours",
    },
    {
      name: "Brisbane Brewery Tours",
      href: "/tours/category/brewery-tours",
      count: "8+ tours",
    },
    {
      name: "Scenic Rim Day Trips",
      href: "/tours/category/day-tours",
      count: "15+ tours",
    },

    {
      name: "Hop-On Hop-Off",
      href: "/hop-on-hop-off",
      count: "Multiple routes",
    },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Popular Destinations</h2>
      <div className="space-y-2">
        {destinations.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            className="flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <span className="font-medium group-hover:text-primary transition-colors">
              {destination.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {destination.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface BlogToToursLinkingProps {
  tourCategories?: string[];
}

export function BlogToToursLinking({
  tourCategories = [],
}: BlogToToursLinkingProps) {
  const tourLinks = [
    {
      name: "Book a Wine Tour",
      href: "/tours/category/winery-tours",
      category: "wine",
    },
    {
      name: "Explore Brewery Tours",
      href: "/tours/category/brewery-tours",
      category: "brewery",
    },
    {
      name: "View All Day Tours",
      href: "/tours/category/day-tours",
      category: "day-trip",
    },
  ];

  const relevantLinks = tourLinks.filter(
    (link) =>
      tourCategories.length === 0 ||
      tourCategories.some((cat) => link.category.includes(cat.toLowerCase()))
  );

  if (relevantLinks.length === 0) return null;

  return (
    <Card className="mt-6 bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-3 text-primary">
          Ready to Experience This?
        </h3>
        <div className="flex flex-wrap gap-2">
          {relevantLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors"
            >
              {link.name}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
