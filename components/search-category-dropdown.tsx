"use client"

import { Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSearchCategories, getCategoryDisplayName } from "@/lib/constants/categories"

interface SearchCategoryDropdownProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function SearchCategoryDropdown({ value, onValueChange, className }: SearchCategoryDropdownProps) {
  const searchCategories = getSearchCategories()

  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-10">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {searchCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 