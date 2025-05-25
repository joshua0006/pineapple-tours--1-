"use client"

interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  totalResults: number
  resultsPerPage: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  className = "",
}: PaginationInfoProps) {
  if (totalResults === 0) {
    return null
  }

  const startResult = (currentPage - 1) * resultsPerPage + 1
  const endResult = Math.min(currentPage * resultsPerPage, totalResults)

  return (
    <div className={`text-sm text-muted-foreground ${className}`}>
      Showing {startResult}-{endResult} of {totalResults} results
      {totalPages > 1 && (
        <span className="ml-2">• Page {currentPage} of {totalPages}</span>
      )}
    </div>
  )
} 