"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  Minus,
  ShoppingBag,
  Info,
  Eye,
  X,
  Star,
  Clock,
  Tag,
} from "lucide-react";
import { RezdyExtra } from "@/lib/types/rezdy";
import { SelectedExtra } from "@/lib/utils/pricing-utils";
import { formatCurrency } from "@/lib/utils/pricing-utils";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ExtrasSelectorProps {
  extras: RezdyExtra[];
  selectedExtras: SelectedExtra[];
  onExtrasChange: (extras: SelectedExtra[]) => void;
  guestCount: number;
  className?: string;
}

interface ExtraDetailModalProps {
  extra: RezdyExtra;
  guestCount: number;
  selectedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  calculatePrice: (extra: RezdyExtra, quantity: number) => number;
  getPriceDisplayText: (extra: RezdyExtra) => string;
}

function ExtraDetailModal({
  extra,
  guestCount,
  selectedQuantity,
  onQuantityChange,
  calculatePrice,
  getPriceDisplayText,
}: ExtraDetailModalProps) {
  const [localQuantity, setLocalQuantity] = useState(selectedQuantity);
  const maxQuantity = extra.maxQuantity || 10;
  const minQuantity = extra.minQuantity || 0;
  const totalPrice = calculatePrice(extra, localQuantity);

  // Reset local quantity when modal opens with different selectedQuantity
  useEffect(() => {
    setLocalQuantity(selectedQuantity);
  }, [selectedQuantity]);

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          {extra.name}
          {extra.isRequired && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Image */}
        {extra.image && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={
                extra.image.largeSizeUrl ||
                extra.image.itemUrl ||
                "/placeholder.svg"
              }
              alt={extra.image.caption || extra.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Category and Tags */}
        <div className="flex items-center gap-2">
          {extra.category && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {extra.category}
            </Badge>
          )}
          {extra.isRequired && <Badge variant="destructive">Required</Badge>}
        </div>

        {/* Full Description */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Description
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {extra.description || "No detailed description available."}
          </p>
        </div>

        {/* Pricing Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4" />
            Pricing Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Base Price:</span>
              <div className="font-medium">{getPriceDisplayText(extra)}</div>
            </div>
            <div>
              <span className="text-gray-600">Price Type:</span>
              <div className="font-medium capitalize">
                {extra.priceType?.replace("_", " ").toLowerCase() ||
                  "Per booking"}
              </div>
            </div>
            {extra.priceType === "PER_PERSON" && (
              <div className="col-span-2">
                <span className="text-gray-600">
                  Total for {guestCount} guests:
                </span>
                <div className="font-medium text-brand-accent">
                  {formatCurrency(extra.price * guestCount)} per quantity
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quantity and Limits */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quantity & Availability
          </h4>
          <div className="space-y-2">
            {(extra.maxQuantity || extra.minQuantity) && (
              <div className="text-sm text-gray-600">
                {extra.minQuantity && extra.maxQuantity
                  ? `Allowed quantity: ${extra.minQuantity} - ${extra.maxQuantity}`
                  : extra.maxQuantity
                  ? `Maximum quantity: ${extra.maxQuantity}`
                  : `Minimum quantity: ${extra.minQuantity}`}
              </div>
            )}

            {/* Quantity Controls */}
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setLocalQuantity(Math.max(minQuantity, localQuantity - 1))
                  }
                  disabled={localQuantity <= minQuantity}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="text-center">
                  <div className="font-medium text-lg">{localQuantity}</div>
                  <div className="text-xs text-gray-500">selected</div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setLocalQuantity(Math.min(maxQuantity, localQuantity + 1))
                  }
                  disabled={localQuantity >= maxQuantity}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {localQuantity > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Cost:</div>
                  <div className="font-bold text-lg text-brand-accent">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {extra.isAvailable === false && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <Info className="h-4 w-4" />
              <span className="font-medium">Currently Unavailable</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              This extra is temporarily unavailable for booking.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
        {localQuantity > 0 && (
          <DialogClose asChild>
            <Button
              className="bg-brand-accent hover:bg-brand-accent/90"
              onClick={() => onQuantityChange(localQuantity)}
            >
              Add to Booking • {formatCurrency(totalPrice)}
            </Button>
          </DialogClose>
        )}
      </div>
    </DialogContent>
  );
}

export function ExtrasSelector({
  extras,
  selectedExtras,
  onExtrasChange,
  guestCount,
  className = "",
}: ExtrasSelectorProps) {
  const [localSelectedExtras, setLocalSelectedExtras] =
    useState<SelectedExtra[]>(selectedExtras);

  // Generate a safe ID for an extra (handles missing or duplicate "undefined" ids)
  const getSafeExtraId = useCallback((extra: RezdyExtra): string => {
    if (extra.id && extra.id !== "undefined") {
      return extra.id;
    }
    // Fallback – build a pseudo-unique id from stable fields
    return `${extra.name}-${extra.price}-${extra.category ?? "uncategorised"}`;
  }, []);

  useEffect(() => {
    setLocalSelectedExtras(selectedExtras);
  }, [selectedExtras]);

  // Sync changes back to parent component only when localSelectedExtras changes
  useEffect(() => {
    // Only call onExtrasChange if the arrays are actually different
    const areEqual =
      selectedExtras.length === localSelectedExtras.length &&
      localSelectedExtras.every((local) => {
        const selected = selectedExtras.find(
          (s) => getSafeExtraId(s.extra) === getSafeExtraId(local.extra)
        );
        return selected && selected.quantity === local.quantity;
      });

    if (!areEqual) {
      onExtrasChange(localSelectedExtras);
    }
  }, [localSelectedExtras, onExtrasChange, selectedExtras, getSafeExtraId]);

  const handleQuantityChange = useCallback(
    (extra: RezdyExtra, newQuantity: number) => {
      const maxQuantity = extra.maxQuantity || 10;
      const minQuantity = extra.minQuantity || 0;

      const extraKey = getSafeExtraId(extra);

      // Ensure quantity is within bounds
      const quantity = Math.max(
        minQuantity,
        Math.min(maxQuantity, newQuantity)
      );

      setLocalSelectedExtras((prevExtras) => {
        const updatedExtras = [...prevExtras];
        const existingIndex = updatedExtras.findIndex(
          (item) => getSafeExtraId(item.extra) === extraKey
        );

        if (quantity === 0) {
          // Remove the extra if quantity is 0
          if (existingIndex !== -1) {
            updatedExtras.splice(existingIndex, 1);
          }
        } else {
          // Add or update the extra
          if (existingIndex !== -1) {
            updatedExtras[existingIndex] = { extra, quantity };
          } else {
            updatedExtras.push({ extra, quantity });
          }
        }

        return updatedExtras;
      });
    },
    [onExtrasChange, getSafeExtraId]
  );

  const getSelectedQuantity = useCallback(
    (extra: RezdyExtra): number => {
      const extraKey = getSafeExtraId(extra);
      const selected = localSelectedExtras.find(
        (item) => getSafeExtraId(item.extra) === extraKey
      );
      return selected ? selected.quantity : 0;
    },
    [localSelectedExtras, getSafeExtraId]
  );

  const calculateExtraPrice = (extra: RezdyExtra, quantity: number): number => {
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
  };

  const getPriceDisplayText = (extra: RezdyExtra): string => {
    switch (extra.priceType) {
      case "PER_PERSON":
        return `${formatCurrency(extra.price)} per person`;
      case "PER_BOOKING":
        return `${formatCurrency(extra.price)} per booking`;
      case "PER_DAY":
        return `${formatCurrency(extra.price)} per day`;
      default:
        return formatCurrency(extra.price);
    }
  };

  if (!extras || extras.length === 0) {
    return null;
  }

  const availableExtras = extras.filter((extra) => extra.isAvailable !== false);

  if (availableExtras.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Optional Extras
          <Badge variant="secondary" className="text-xs">
            {localSelectedExtras.length} selected
          </Badge>
          
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enhance your experience with these optional add-ons. Click the info button for detailed information.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Fragment>
          {availableExtras.map((extra, index) => {
            const selectedQuantity = getSelectedQuantity(extra);
            const totalPrice = calculateExtraPrice(extra, selectedQuantity);
            const maxQuantity = extra.maxQuantity || 10;
            const minQuantity = extra.minQuantity || 0;

            return (
              <div key={`extra-card-${extra.id && extra.id !== "undefined" ? extra.id : "noid"}-${index}`}>
                <Card
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    selectedQuantity > 0
                      ? "ring-2 ring-brand-accent bg-brand-accent/5 border-brand-accent/20"
                      : "hover:bg-gray-50 border-gray-200"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Optional Extra Image */}
                      {extra.image ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={
                              extra.image.thumbnailUrl ||
                              extra.image.itemUrl ||
                              "/placeholder.svg"
                            }
                            alt={extra.image.caption || extra.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                      )}

                      {/* Extra Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate flex items-center gap-1">
                              {extra.name}
                              {extra.isRequired && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  Required
                                </Badge>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-brand-accent">
                                {getPriceDisplayText(extra)}
                              </span>
                              {selectedQuantity > 0 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {selectedQuantity}x
                                </Badge>
                              )}
                            </div>
                          </div>
                        
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleQuantityChange(extra, selectedQuantity - 1);
                          }}
                          disabled={selectedQuantity <= minQuantity}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {selectedQuantity}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleQuantityChange(extra, selectedQuantity + 1);
                          }}
                          disabled={selectedQuantity >= maxQuantity}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-brand-accent hover:text-brand-accent/80 hover:bg-brand-accent/10 px-2 py-1"
                          >
                          
                            Click for more details
                          </Button>
                        </DialogTrigger>
                        <ExtraDetailModal
                          extra={extra}
                          guestCount={guestCount}
                          selectedQuantity={selectedQuantity}
                          onQuantityChange={(quantity) =>
                            handleQuantityChange(extra, quantity)
                          }
                          calculatePrice={calculateExtraPrice}
                          getPriceDisplayText={getPriceDisplayText}
                        />
                      </Dialog>
                    </div>
                                      </CardContent>
                  </Card>
                </div>
              );
            })}
          </Fragment>
      </CardContent>
    </Card>
  );
}
