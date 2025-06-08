'use client';

import Link from 'next/link';
import { ArrowLeft, Wine, Beer, Bus, Calendar, Building, Heart, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categories = [
  {
    id: 'winery-tours',
    title: 'Winery Tours',
    description: 'Wine tasting experiences at local wineries and vineyards',
    icon: Wine,
    color: 'text-purple-600',
    href: '/rezdy/winery-tours'
  },
  {
    id: 'brewery-tours',
    title: 'Brewery Tours',
    description: 'Craft beer experiences and brewery visits',
    icon: Beer,
    color: 'text-amber-600',
    href: '/rezdy/brewery-tours'
  },
  {
    id: 'hop-on-hop-off',
    title: 'Hop-On Hop-Off',
    description: 'Flexible sightseeing with hop-on hop-off bus services',
    icon: Bus,
    color: 'text-blue-600',
    href: '/rezdy/hop-on-hop-off'
  },
  {
    id: 'bus-charter',
    title: 'Bus Charter',
    description: 'Private bus and coach charter services for groups',
    icon: Bus,
    color: 'text-green-600',
    href: '/rezdy/bus-charter'
  },
  {
    id: 'day-tours',
    title: 'Day Tours',
    description: 'Full-day guided tours and excursions',
    icon: Calendar,
    color: 'text-orange-600',
    href: '/rezdy/day-tours'
  },
  {
    id: 'corporate-tours',
    title: 'Corporate Tours',
    description: 'Business events, team building, and corporate experiences',
    icon: Building,
    color: 'text-blue-600',
    href: '/rezdy/corporate-tours'
  },
  {
    id: 'hens-party',
    title: 'Hens Party',
    description: 'Special celebrations for brides-to-be and their friends',
    icon: Heart,
    color: 'text-pink-600',
    href: '/rezdy/hens-party'
  },
  {
    id: 'barefoot-luxury',
    title: 'Barefoot Luxury',
    description: 'Premium and luxury experiences with exclusive service',
    icon: Sparkles,
    color: 'text-yellow-600',
    href: '/rezdy/barefoot-luxury'
  }
];

export default function RezdyCategoriesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rezdy Data Categories</h1>
          <p className="text-muted-foreground">
            Explore detailed Rezdy data analysis for each tour category
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link key={category.id} href={category.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`h-6 w-6 ${category.color}`} />
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      View Data
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Complete analysis
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/rezdy">
            <Button variant="outline">
              Main Rezdy Dashboard
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">
              Search Tours
            </Button>
          </Link>
          <Link href="/tours">
            <Button variant="outline">
              Browse All Tours
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 