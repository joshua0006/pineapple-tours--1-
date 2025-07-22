"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Info, TrendingDown, Calculator } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type PricingBreakdown,
  formatCurrency,
  getTaxBreakdown,
  getFeeBreakdown,
  getDiscountInfo,
} from "@/lib/utils/pricing-utils";
import { RezdyProduct } from "@/lib/types/rezdy";

interface PricingDisplayProps {
  breakdown: PricingBreakdown;
  product?: RezdyProduct;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

// Helper to shorten long price option labels for display
function shortenPriceLabel(label: string, maxLength: number = 20): string {
  // Priority patterns that should always be applied for UI consistency
  const priorityPatterns = [
    { regex: /^Group\s+from\s+(\d+)\s+to\s+(\d+)$/i, replacement: 'Group ($1-$2)' },
    { regex: /^(\d+)\s+Group\s+from\s+(\d+)\s+to\s+(\d+)$/i, replacement: '$1 Group ($2-$3)' },
    { regex: /^Private\s+tour\s+pricing\s+for\s+your\s+group.*$/i, replacement: 'Private Group' },
  ];
  
  // Apply priority patterns first (regardless of length)
  for (const pattern of priorityPatterns) {
    if (pattern.regex.test(label)) {
      return label.replace(pattern.regex, pattern.replacement);
    }
  }
  
  // If already short enough, return as-is
  if (label.length <= maxLength) return label;
  
  // Handle other patterns only if too long
  const otherPatterns = [
    { regex: /^(Adult|Child|Infant)\s*\([^)]+\)/i, replacement: '$1' },
    { regex: /^(\w+)\s+\([^)]+\)/i, replacement: '$1' },
  ];
  
  for (const pattern of otherPatterns) {
    if (pattern.regex.test(label)) {
      const shortened = label.replace(pattern.regex, pattern.replacement);
      if (shortened.length <= maxLength) return shortened;
    }
  }
  
  // Fallback: truncate with ellipsis
  return label.substring(0, maxLength - 3) + '...';
}

// Helper to detect pricing pattern
function detectPricingPattern(product?: RezdyProduct): {
  type: 'standard' | 'quantity' | 'private' | 'multi-tier';
  title: string;
  description: string;
} {
  if (!product?.priceOptions || product.priceOptions.length === 0) {
    return { 
      type: 'standard', 
      title: 'Pricing Summary', 
      description: 'Price breakdown for your booking' 
    };
  }

  const labels = product.priceOptions.map(opt => opt.label.toLowerCase());
  
  // Check for private/group tours
  if (labels.some(label => label.includes('private') || label.includes('group'))) {
    return { 
      type: 'private', 
      title: 'Group Pricing', 
      description: 'Private tour pricing for your group' 
    };
  }
  
  // Check for quantity-only pricing
  if (labels.length === 1 && labels[0].includes('quantity')) {
    return { 
      type: 'quantity', 
      title: 'Per Person Pricing', 
      description: 'Individual pricing per participant' 
    };
  }
  
  // Check for multi-tier pricing (multiple non-standard options)
  const hasStandardOptions = labels.some(label => 
    label.includes('adult') || label.includes('child') || label.includes('infant')
  );
  
  if (!hasStandardOptions && product.priceOptions.length > 1) {
    return { 
      type: 'multi-tier', 
      title: 'Pricing Options', 
      description: 'Select your preferred pricing tier' 
    };
  }
  
  // Default to standard
  return { 
    type: 'standard', 
    title: 'Pricing Summary', 
    description: 'Price breakdown by guest type' 
  };
}

export function PricingDisplay({
  breakdown,
  product,
  showDetails = false,
  compact = false,
  className = "",
}: PricingDisplayProps) {
  const discountInfo = getDiscountInfo(breakdown);
  const taxBreakdown = getTaxBreakdown(breakdown.subtotal, product);
  const feeBreakdown = getFeeBreakdown(breakdown.subtotal);
  const pricingPattern = detectPricingPattern(product);

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-bold">
            {formatCurrency(breakdown.total)}
          </span>
        </div>
        {discountInfo.hasDiscounts && (
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">
              {discountInfo.discountText}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{pricingPattern.title}</CardTitle>
          {showDetails && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tax Breakdown</h4>
                    <div className="space-y-1">
                      {taxBreakdown.map((tax, idx) => (
                        <div
                          key={`${tax.name}-${idx}`}
                          className="flex justify-between text-sm"
                        >
                          <span>{tax.name}</span>
                          <span>{formatCurrency(tax.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Fee Breakdown</h4>
                    <div className="space-y-1">
                      {feeBreakdown.map((fee, idx) => (
                        <div
                          key={`${fee.name}-${idx}`}
                          className="flex justify-between text-sm"
                        >
                          <span>{fee.name}</span>
                          <span>{formatCurrency(fee.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{pricingPattern.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dynamic guest breakdown based on actual price options */}
        {breakdown.dynamicGuestCounts && product?.priceOptions ? (
          // Show dynamic price option breakdown
          Object.entries(breakdown.dynamicGuestCounts).map(([label, count]) => {
            if (count === 0) return null;
            
            // Enhanced label matching - try exact match first, then case-insensitive, then partial match
            let priceOption = product.priceOptions?.find(opt => opt.label === label);
            
            if (!priceOption) {
              // Try case-insensitive match
              priceOption = product.priceOptions?.find(opt => 
                opt.label.toLowerCase() === label.toLowerCase()
              );
            }
            
            if (!priceOption) {
              // Try partial match (for cases like "Adult" matching "Adult (18+)")
              priceOption = product.priceOptions?.find(opt => 
                opt.label.toLowerCase().includes(label.toLowerCase()) ||
                label.toLowerCase().includes(opt.label.toLowerCase())
              );
            }
            
            // If still no match, log warning and use fallback
            if (!priceOption) {
              console.warn(`No price option found for label: "${label}". Available options:`, 
                product.priceOptions?.map(opt => opt.label));
              
              // Use breakdown selected price options as fallback
              if (breakdown.selectedPriceOptions) {
                const fallbackOption = Object.values(breakdown.selectedPriceOptions).find(opt => 
                  opt && (opt.label === label || opt.label.toLowerCase() === label.toLowerCase())
                );
                if (fallbackOption) {
                  priceOption = fallbackOption;
                }
              }
            }
            
            // If we still don't have a price option, skip this entry
            if (!priceOption) {
              console.error(`Unable to find price for guest type: ${label}`);
              return null;
            }
            
            // Transform label for display - replace "Quantity" with "Guest"
            const displayLabel = label.toLowerCase() === 'quantity' ? 'Guest' : label;
            
            const shortLabel = shortenPriceLabel(displayLabel);
            const needsTooltip = shortLabel !== displayLabel;
            
            return (
              <div key={label} className="flex justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate">
                        {count} {shortLabel}{count > 1 ? "s" : ""} ×{" "}
                        {formatCurrency(priceOption.price)}
                      </span>
                    </TooltipTrigger>
                    {needsTooltip && (
                      <TooltipContent>
                        <p>{count} {displayLabel}{count > 1 ? "s" : ""} × {formatCurrency(priceOption.price)}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">
                  {formatCurrency(count * priceOption.price)}
                </span>
              </div>
            );
          }).filter(Boolean) // Remove null entries
        ) : (
          // Fallback to standard guest type breakdown
          <>
            {breakdown.adults > 0 && (
              <div className="flex justify-between">
                <span>
                  {breakdown.adults} Adult{breakdown.adults > 1 ? "s" : ""} 
                  {formatCurrency(breakdown.adultPrice)}
                </span>
                <span>
                  {formatCurrency(breakdown.adults * breakdown.adultPrice)}
                </span>
              </div>
            )}
            {breakdown.children > 0 && (
              <div className="flex justify-between">
                <span>
                  {breakdown.children} Child{breakdown.children > 1 ? "ren" : ""} ×{" "}
                  {formatCurrency(breakdown.childPrice)}
                </span>
                <span>
                  {formatCurrency(breakdown.children * breakdown.childPrice)}
                </span>
              </div>
            )}
            {breakdown.infants > 0 && (
              <div className="flex justify-between">
                <span>
                  {breakdown.infants} Infant{breakdown.infants > 1 ? "s" : ""} ×{" "}
                  {formatCurrency(breakdown.infantPrice)}
                </span>
                <span>
                  {formatCurrency(breakdown.infants * breakdown.infantPrice)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Extras breakdown */}
        {breakdown.selectedExtras && breakdown.selectedExtras.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Optional Extras
              </h4>
              {breakdown.selectedExtras.map(({ extra, quantity }, idx) => {
                const totalPrice = (() => {
                  const guestCount =
                    breakdown.adults + breakdown.children + breakdown.infants;
                  switch (extra.priceType) {
                    case "PER_PERSON":
                      return extra.price * guestCount * quantity;
                    case "PER_BOOKING":
                      return extra.price * quantity;
                    case "PER_DAY":
                      return extra.price * quantity;
                    default:
                      return extra.price * quantity;
                  }
                })();

                return (
                  <div
                    key={`${extra.id}-${idx}`}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {extra.name} × {quantity}
                    </span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

       

        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatCurrency(breakdown.subtotal)}</span>
        </div>

        {breakdown.extrasSubtotal > 0 && (
          <div className="flex justify-between font-medium text-sm">
            <span>Extras Subtotal</span>
            <span>{formatCurrency(breakdown.extrasSubtotal)}</span>
          </div>
        )}

        <div className="flex justify-between text-muted-foreground">
          <div className="flex items-center gap-1 text-sm">
            <span>Inclusive of taxes & fees</span>
         
          </div>
          <span>{formatCurrency(breakdown.taxes)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <div className="flex items-center gap-1 text-sm">
            <span>Credit Card Surcharge 1.9%</span>
          
          </div>
          <span>{formatCurrency(breakdown.serviceFees)}</span>
        </div>

        <Separator className="my-4" />

        <div className="bg-gradient-to-r from-coral-50 to-orange-50 dark:from-coral-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-coral-200 dark:border-coral-800/30">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-brand-primary dark:text-brand-secondary">Total</span>
            <span className="text-2xl font-bold text-brand-accent dark:text-coral-400">
              {formatCurrency(breakdown.total)}
            </span>
          </div>
        </div>

       
      </CardContent>
    </Card>
  );
}

interface PricingSummaryProps {
  breakdown: PricingBreakdown;
  className?: string;
}

export function PricingSummary({
  breakdown,
  className = "",
}: PricingSummaryProps) {
  const totalGuests = breakdown.adults + breakdown.children + breakdown.infants;
  const pricePerPerson =
    totalGuests > 0 ? Math.round(breakdown.total / totalGuests) : 0;

  return (
    <div className={`bg-muted rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Total for {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
        </span>
        <span className="text-2xl font-bold">
          {formatCurrency(breakdown.total)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Average per person</span>
        <span>{formatCurrency(pricePerPerson)}</span>
      </div>
      {getDiscountInfo(breakdown).hasDiscounts && (
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingDown className="h-3 w-3" />
            <span>Discounts applied</span>
          </div>
        </div>
      )}
    </div>
  );
}
