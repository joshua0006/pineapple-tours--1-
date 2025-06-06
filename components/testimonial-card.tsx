import Image from "next/image"
import { Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface TestimonialCardProps {
  name: string
  location: string
  image: string
  rating: number
  testimonial: string
}

export function TestimonialCard({ name, location, image, rating, testimonial }: TestimonialCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>
        <div className="mt-4 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating ? "fill-accent text-accent" : "fill-muted text-muted-foreground"}`}
            />
          ))}
        </div>
        <blockquote className="mt-4 text-muted-foreground">"{testimonial}"</blockquote>
      </CardContent>
    </Card>
  )
}
