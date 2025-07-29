"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectedExtra } from "@/lib/utils/pricing-utils";
import { formatCurrency } from "@/lib/utils/pricing-utils";
import { 
  ShoppingBag, 
  Clock,
  ArrowRight
} from "lucide-react";

interface ExtrasBookingSummaryProps {
  selectedAddons: SelectedExtra[];
  bookingAddons: boolean;
  customerEmail: string;
  onBookAddons: () => void;
  calculateTotalAddonPrice: () => number;
  className?: string;
}

export function ExtrasBookingSummary({ 
  selectedAddons,
  bookingAddons,
  customerEmail,
  onBookAddons,
  calculateTotalAddonPrice,
  className = "" 
}: ExtrasBookingSummaryProps) {
  if (selectedAddons.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="bg-white border border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-accent" />
              <span className="font-semibold">Selected Add-ons</span>
              <Badge variant="outline" className="bg-brand-accent text-white">
                {selectedAddons.length}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Additional Cost</div>
              <div className="text-xl font-bold text-brand-accent">
                {formatCurrency(calculateTotalAddonPrice())}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {selectedAddons.map((selectedAddon, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{selectedAddon.extra.name}</span>
                <span className="font-medium">
                  {formatCurrency(selectedAddon.extra.price * selectedAddon.quantity)}
                  {selectedAddon.extra.priceType === 'PER_PERSON' && ' × 2 guests'}
                </span>
              </div>
            ))}
          </div>

          <Button 
            onClick={onBookAddons}
            disabled={bookingAddons}
            className="w-full bg-gradient-to-r from-brand-accent to-purple-500 hover:from-brand-accent/90 hover:to-purple-500/90 text-white font-semibold py-3"
          >
            {bookingAddons ? (
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Book Add-ons • {formatCurrency(calculateTotalAddonPrice())}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>

          <p className="text-xs text-gray-500 mt-2 text-center">
            <Clock className="h-3 w-3 inline mr-1" />
            Separate confirmation will be sent to {customerEmail}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}