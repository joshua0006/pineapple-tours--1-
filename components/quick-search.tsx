"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface QuickSearchProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  showButton?: boolean
}

export function QuickSearch({ 
  placeholder = "Search tours, locations...", 
  className = "",
  onSearch,
  showButton = true 
}: QuickSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        // Default behavior: navigate to search page
        router.push(`/search?query=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />
      </div>
      {showButton && (
        <Button type="submit" size="sm">
          Search
        </Button>
      )}
    </form>
  )
} 