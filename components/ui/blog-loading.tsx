import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton({
  variant = "default",
}: {
  variant?: "default" | "featured";
}) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image skeleton */}
      <div className="aspect-video relative">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <CardHeader
        className={`flex-1 flex flex-col ${
          variant === "featured" ? "" : "p-6"
        }`}
      >
        {/* Title skeleton */}
        <div className="mb-3">
          <Skeleton
            className={`h-6 w-full mb-2 ${variant === "featured" ? "" : ""}`}
          />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* Excerpt skeleton */}
        <div className="flex-1 mb-6">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Metadata skeleton */}
        <div className="space-y-4 mt-auto">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
    </Card>
  );
}

export function BlogLoadingGrid() {
  return (
    <div className="space-y-12">
      {/* Featured Posts Loading */}
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <BlogCardSkeleton variant="featured" />
          <BlogCardSkeleton variant="featured" />
        </div>
      </div>

      {/* Regular Posts Loading */}
      <div>
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogCategoriesSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-20" />
      ))}
    </div>
  );
}
