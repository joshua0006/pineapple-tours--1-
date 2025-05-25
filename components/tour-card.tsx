import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TourCardProps {
  title: string
  location: string
  image: string
  price: number
  duration: number
  rating: number
  slug: string
}

export function TourCard({ title, location, image, price, duration, rating, slug }: TourCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <Badge className="absolute right-2 top-2 bg-yellow-500 text-black hover:bg-yellow-600">Best Seller</Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center text-white">
            <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">{rating} (24 reviews)</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="mt-2 flex items-center text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center text-sm">
            <Calendar className="mr-1 h-4 w-4 text-yellow-500" />
            <span>{duration} days</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="mr-1 h-4 w-4 text-yellow-500" />
            <span>Max 12 people</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-muted-foreground">Starting from</div>
          <div className="text-2xl font-bold">${price}</div>
          <div className="text-sm text-muted-foreground">per person</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/tours/${slug}`} className="w-full">
          <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-600">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
