'use client'

import Link from "next/link"
import { ChevronRight, Loader2, AlertCircle } from "lucide-react"

import { CategoryCard } from "@/components/category-card"
import { useCategories } from "@/hooks/use-categories"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CategoriesSection() {
  const { categories, loading, error } = useCategories()

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
        {categories.map((category) => (
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