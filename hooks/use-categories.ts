'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  title: string
  description: string
  image: string
  tourCount: number
  slug: string
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/categories')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch categories')
        }
        
        if (result.success) {
          setCategories(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch categories')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
} 