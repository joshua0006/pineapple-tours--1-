import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface TourGridSkeletonProps {
  count?: number
}

export function TourGridSkeleton({ count = 6 }: TourGridSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200" />
          <CardContent className="p-4">
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
            <div className="flex gap-3 mb-4">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="h-10 bg-gray-200 rounded w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 