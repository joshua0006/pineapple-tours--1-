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
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    slug: 'day-tour'
  },
  {
    id: 'multiday-tour',
    title: 'Multiday Tour',
    description: 'Extended adventures spanning multiple days',
    icon: MapPin,
    productTypes: ['MULTIDAY_TOUR', 'MULTI_DAY_TOUR', 'MULTIDAYTOUR'],
    image: 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    slug: 'multiday-tour'
  },
  {
    id: 'private-tour',
    title: 'Private Tour',
    description: 'Exclusive personalized tour experiences',
    icon: Users,
    productTypes: ['PRIVATE_TOUR', 'PRIVATE'],
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2035&q=80',
    slug: 'private-tour'
  },
  {
    id: 'transfer',
    title: 'Transfer',
    description: 'Transportation and transfer services',
    icon: Car,
    productTypes: ['TRANSFER', 'TRANSPORT', 'TRANSPORTATION'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
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