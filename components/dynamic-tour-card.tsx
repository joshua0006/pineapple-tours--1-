import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HtmlContent } from "@/components/ui/html-content"
import { RezdyProduct } from "@/lib/types/rezdy"
import { getPrimaryImageUrl, getLocationString, generateProductSlug, getValidImages } from "@/lib/utils/product-utils"
import { ResponsiveImage } from "@/components/ui/responsive-image"

interface DynamicTourCardProps {
  product: RezdyProduct
  loading?: boolean
}

export function DynamicTourCard({ product, loading = false }: DynamicTourCardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <div className="relative h-48 w-full bg-gray-200" />
        <CardContent className="p-4">
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="flex gap-3 mb-4">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-16" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="h-10 bg-gray-200 rounded w-full" />
        </CardFooter>
      </Card>
    )
  }

  const primaryImageUrl = getPrimaryImageUrl(product)
  const location = getLocationString(product.locationAddress)
  const slug = generateProductSlug(product)

  // Check if description contains HTML
  const hasHtmlDescription = product.shortDescription && /<[^>]*>/g.test(product.shortDescription)

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="relative h-48 w-full overflow-hidden">
          <ResponsiveImage
            images={getValidImages(product)}
            alt={`${product.name} tour`}
            aspectRatio="landscape"
            className="transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.status === 'ACTIVE' && (
            <Badge className="absolute right-2 top-2 bg-yellow-500 text-black hover:bg-yellow-600 z-10">
              Available
            </Badge>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center text-white">
            <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
            <span className="text-sm font-medium">4.8 (Reviews)</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold line-clamp-2 min-h-[3.5rem] leading-7">{product.name}</h3>
        <div className="mt-2 flex items-center text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" aria-hidden="true" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>
        {product.shortDescription && (
          <div className="mt-2">
            {hasHtmlDescription ? (
              <HtmlContent 
                content={product.shortDescription}
                maxLength={120}
                className="text-sm prose-sm line-clamp-2 min-h-[2.5rem]"
              />
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                {product.shortDescription}
              </p>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center text-sm">
            <Calendar className="mr-1 h-4 w-4 text-yellow-500" aria-hidden="true" />
            <span>Multiple dates</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="mr-1 h-4 w-4 text-yellow-500" aria-hidden="true" />
            <span>
              {product.quantityRequiredMin && product.quantityRequiredMax
                ? `${product.quantityRequiredMin}-${product.quantityRequiredMax} people`
                : 'Group size varies'}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-muted-foreground">Starting from</div>
          <div className="text-2xl font-bold">
            {product.advertisedPrice 
              ? `$${product.advertisedPrice.toFixed(0)}`
              : 'Price on request'
            }
          </div>
          <div className="text-sm text-muted-foreground">per person</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/tours/${slug}`} className="w-full">
          <Button 
            className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
            aria-label={`View details and book ${product.name} tour`}
          >
            View Details & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 