"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { TourGridSkeleton } from "@/components/tour-grid-skeleton";
import { ErrorState } from "@/components/error-state";
import { RezdyProduct } from "@/lib/types/rezdy";

interface SearchResultsProps {
  products: RezdyProduct[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  hasResults: boolean;
  onRetry?: () => void;
  onClearSearch?: () => void;
  onBrowseAll?: () => void;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  showBrowseAllButton?: boolean;
  selectedDate?: string; // Date in YYYY-MM-DD format
  participants?: string; // Number of participants
}

export function SearchResults({
  products,
  loading,
  error,
  totalResults,
  hasResults,
  onRetry,
  onClearSearch,
  onBrowseAll,
  emptyStateTitle = "No tours found",
  emptyStateMessage = "We couldn't find any tours matching your search criteria. Try adjusting your filters or search terms.",
  showBrowseAllButton = true,
  selectedDate,
  participants,
}: SearchResultsProps) {
  if (loading) {
    return <TourGridSkeleton count={6} />;
  }

  if (error) {
    return (
      <ErrorState title="Search Error" message={error} onRetry={onRetry} />
    );
  }

  if (!hasResults) {
    return (
      <Card className="p-12 text-center">
        <CardContent>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{emptyStateTitle}</h3>
          <p className="text-muted-foreground mb-4">{emptyStateMessage}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {onClearSearch && (
              <Button variant="outline" onClick={onClearSearch}>
                Clear all filters
              </Button>
            )}
            {showBrowseAllButton && onBrowseAll && (
              <Button onClick={onBrowseAll}>Browse all tours</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <DynamicTourCard
          key={product.productCode}
          product={product}
          selectedDate={selectedDate}
          participants={participants}
        />
      ))}
    </div>
  );
}
