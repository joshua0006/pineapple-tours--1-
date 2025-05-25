'use client'

import Link from "next/link"
import { ChevronRight, Loader2, AlertCircle, Calendar, MapPin, Users, Car } from "lucide-react"
import { useState, useEffect } from "react"

import { CategoryCard } from "@/components/category-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRezdyProducts } from "@/hooks/use-rezdy"

// Define the specific tour categories based on productType
interface TourCategory {
  id: string
  title: string
  description: string
  icon: any
  productTypes: string[]
  image: string
  slug: string
  tourCount: number
}

const TOUR_CATEGORIES: Omit<TourCategory, 'tourCount'>[] = [
  {
    id: 'day-tour',
    title: 'Day Tour',
    description: 'Perfect single-day adventures and experiences',
    icon: Calendar,
    productTypes: ['DAY_TOUR', 'TOUR', 'DAYTOUR'], // Include common variations
    image: '/placeholder.svg?height=300&width=400',
    slug: 'day-tour'
  },
  {
    id: 'multiday-tour',
    title: 'Multiday Tour',
    description: 'Extended adventures spanning multiple days',
    icon: MapPin,
    productTypes: ['MULTIDAY_TOUR', 'MULTI_DAY_TOUR', 'MULTIDAYTOUR'],
    image: '/placeholder.svg?height=300&width=400',
    slug: 'multiday-tour'
  },
  {
    id: 'private-tour',
    title: 'Private Tour',
    description: 'Exclusive personalized tour experiences',
    icon: Users,
    productTypes: ['PRIVATE_TOUR', 'PRIVATE'],
    image: '/placeholder.svg?height=300&width=400',
    slug: 'private-tour'
  },
  {
    id: 'transfer',
    title: 'Transfer',
    description: 'Transportation and transfer services',
    icon: Car,
    productTypes: ['TRANSFER', 'TRANSPORT', 'TRANSPORTATION'],
    image: '/placeholder.svg?height=300&width=400',
    slug: 'transfer'
  }
]

export function CategoriesSection() {
  const { data: products, loading, error } = useRezdyProducts(100, 0)
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<TourCategory[]>(
    TOUR_CATEGORIES.map(cat => ({ ...cat, tourCount: 0 }))
  )

  // Calculate tour counts for each category based on productType
  useEffect(() => {
    if (products) {
      const updatedCategories = TOUR_CATEGORIES.map(category => {
        const tourCount = products.filter(product => {
          if (!product.productType) return false
          return category.productTypes.some(type => 
            product.productType?.toUpperCase().includes(type.toUpperCase())
          )
        }).length

        return {
          ...category,
          tourCount
        }
      })
      setCategoriesWithCounts(updatedCategories)
    }
  }, [products])

  if (loading) {
    return (
      <section className="container py-16">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tour Categories</h2>
            <p className="text-muted-foreground">Discover your perfect adventure by category</p>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading categories...</span>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container py-16">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tour Categories</h2>
            <p className="text-muted-foreground">Discover your perfect adventure by category</p>
          </div>
        </div>
        <div className="mt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load categories: {error}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    )
  }

  return (
    <section className="container py-16">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tour Categories</h2>
          <p className="text-muted-foreground">Discover your perfect adventure by category</p>
        </div>
        <Link href="/tours" className="flex items-center text-sm font-medium text-primary">
          View all tours
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categoriesWithCounts.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            title={category.title}
            description={category.description}
            image={category.image}
            tourCount={category.tourCount}
            slug={category.slug}
          />
        ))}
      </div>
    </section>
  )
} 