import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CategoryCardProps {
  id: string
  title: string
  description: string
  image: string
  tourCount: number
  slug: string
}

export function CategoryCard({ id, title, description, image, tourCount, slug }: CategoryCardProps) {
  return (
    <Link href={`/tours/category/${slug}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={image || "/placeholder.svg?height=300&width=400"}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge className="absolute right-3 top-3 bg-coral-500 text-white hover:bg-coral-600">
              {tourCount} Tours
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-white/90 text-sm overflow-hidden text-ellipsis whitespace-nowrap">{description}</p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Explore {title.toLowerCase()}</span>
            <ArrowRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 