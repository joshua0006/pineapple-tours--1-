import Link from "next/link"
import { Calendar, Users, Star, MapPin } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface Tour {
  id: string
  title: string
  image: string
  location: string
  duration: string
  groupSize: string
  rating: number
  reviewCount: number
  price: number
  isPopular?: boolean
}

interface TourCardProps {
  tour: Tour
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <Image src={tour.image} alt={tour.title} width={400} height={240} className="w-full h-60 object-cover" />
        {tour.isPopular && (
          <Badge className="absolute right-2 top-2 bg-coral-500 text-white hover:bg-coral-600">Best Seller</Badge>
        )}
        <div className="absolute bottom-2 left-2 flex items-center text-white text-sm bg-black/50 rounded px-2 py-1">
          <Star className="mr-1 h-4 w-4 fill-coral-500 text-coral-500" />
          <span>{tour.rating}</span>
          <span className="ml-1 text-white/70">({tour.reviewCount})</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{tour.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{tour.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4 text-coral-500" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4 text-coral-500" />
            <span>{tour.groupSize}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">${tour.price}</span>
          <span className="text-sm text-muted-foreground ml-1">per person</span>
        </div>
        <Link href={`/tours/${tour.id}`}>
          <Button className="w-full bg-coral-500 text-white hover:bg-coral-600">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
