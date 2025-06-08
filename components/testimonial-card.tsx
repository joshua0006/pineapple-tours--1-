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
    <Card className="bg-amber-50 border-amber-100 shadow-sm">
      <CardContent className="p-8 text-center flex flex-col h-full">
        {/* Star Rating at the top */}
        <div className="flex justify-center mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-5 w-5 fill-amber-400 text-amber-400 mx-0.5"
            />
          ))}
        </div>
        
        {/* Testimonial Text - grows to fill space */}
        <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 font-['Work_Sans'] font-normal flex-grow">
          {testimonial}
        </blockquote>
        
        {/* Name and Platform - always at bottom */}
        <div className="space-y-1 mt-auto">
          <h3 className="font-['Barlow'] font-semibold text-gray-900 text-base">{name}</h3>
          <p className="text-red-400 text-sm font-['Open_Sans'] font-normal">{location}</p>
        </div>
      </CardContent>
    </Card>
  )
}
