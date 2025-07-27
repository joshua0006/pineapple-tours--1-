import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface TourGridSkeletonProps {
  count?: number
}

export function TourGridSkeleton({ count = 6 }: TourGridSkeletonProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="relative h-96 w-full overflow-hidden shadow-xl rounded-2xl animate-pulse">
          {/* Background skeleton */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
          
          {/* Gradient overlay to match actual design */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          
          {/* Inner border */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          
          {/* Title skeleton at top */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="space-y-3">
              <div className="h-8 bg-white/25 rounded-lg backdrop-blur-sm" />
              <div className="h-8 bg-white/25 rounded-lg w-3/4 backdrop-blur-sm" />
            </div>
          </div>
          
          {/* Button skeletons at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex gap-3">
              <div className="h-14 bg-white/15 rounded-xl flex-1 border-2 border-white/20 backdrop-blur-md" />
              <div className="h-14 bg-white/25 rounded-xl flex-1 backdrop-blur-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 