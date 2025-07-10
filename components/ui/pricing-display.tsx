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
          <CardTitle className="text-lg">Pricing Summary</CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Guest breakdown */}
        {breakdown.adults > 0 && (
          <div className="flex justify-between">
            <span>
              {breakdown.adults} Adult{breakdown.adults > 1 ? "s" : ""} ×{" "}
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

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(breakdown.total)}</span>
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
