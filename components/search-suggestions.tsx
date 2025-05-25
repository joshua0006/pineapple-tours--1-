"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Tag, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SearchSuggestionsProps {
  onSuggestionClick?: (suggestion: string, type: 'query' | 'category') => void
  className?: string
}

export function SearchSuggestions({ onSuggestionClick, className = "" }: SearchSuggestionsProps) {
  const router = useRouter()

  const popularSearches = [
    "Sydney Harbour",
    "Great Barrier Reef",
    "Uluru",
    "Blue Mountains",
    "Melbourne",
    "Tasmania",
    "Gold Coast",
    "Cairns",
  ]

  const popularCategories = [
    { name: "Adventure", value: "adventure" },
    { name: "Family", value: "family" },
    { name: "Honeymoon", value: "honeymoon" },
    { name: "Cultural", value: "cultural" },
    { name: "Nature", value: "nature" },
    { name: "Luxury", value: "luxury" },
  ]

  const handleSuggestionClick = (suggestion: string, type: 'query' | 'category') => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion, type)
    } else {
      // Default behavior: navigate to search page
      if (type === 'query') {
        router.push(`/search?query=${encodeURIComponent(suggestion)}`)
      } else {
        router.push(`/search?category=${encodeURIComponent(suggestion)}`)
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Popular Searches */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Popular Tours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <Button
                key={search}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(search, 'query')}
                className="h-8 text-sm"
              >
                <MapPin className="mr-1 h-3 w-3" />
                {search}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Browse by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((category) => (
              <Badge
                key={category.value}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSuggestionClick(category.value, 'category')}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/tours')}
            >
              Browse All Tours
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSuggestionClick('family', 'category')}
            >
              Family-Friendly Tours
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSuggestionClick('luxury', 'category')}
            >
              Luxury Experiences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 