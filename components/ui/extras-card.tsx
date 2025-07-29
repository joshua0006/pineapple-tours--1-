"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtrasSelector } from "@/components/ui/extras-selector";
import { RezdyExtra } from "@/lib/types/rezdy";
import { SelectedExtra } from "@/lib/utils/pricing-utils";
import { 
  MapPin, 
  Sparkles,
  Star
} from "lucide-react";

interface ExtrasCardProps {
  addons: RezdyExtra[];
  selectedAddons: SelectedExtra[];
  onAddonsChange: (selectedAddons: SelectedExtra[]) => void;
  guestCount: number;
  region: string;
  searchTerm: string;
  loading: boolean;
  className?: string;
}

export function ExtrasCard({ 
  addons,
  selectedAddons,
  onAddonsChange,
  guestCount,
  region,
  searchTerm,
  loading,
  className = "" 
}: ExtrasCardProps) {
  if (loading) {
    return (
      <motion.div 
        className={`${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-8">
            <div className="flex items-center justify-center space-x-2">
              <motion.div 
                className="w-4 h-4 bg-brand-accent rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-gray-600">Loading add-on experiences...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!addons || addons.length === 0) {
    return null; // Don't show section if no add-ons available
  }

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-brand-accent to-purple-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                  Enhance Your Adventure
                </span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Available Now
                </Badge>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 capitalize">
                "{searchTerm}" experiences in {region === 'all' ? 'your area' : region}
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              🌟 Perfect add-ons to complete your adventure! These "{searchTerm}" experiences 
              are curated based on your booking using our marketplace search.
            </p>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add-ons Selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <ExtrasSelector
              extras={addons}
              selectedExtras={selectedAddons}
              onExtrasChange={onAddonsChange}
              guestCount={guestCount}
              className="border-none shadow-none bg-transparent"
            />
          </motion.div>

          {/* Information Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="bg-blue-50 rounded-lg p-4 border border-blue-200"
          >
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why book add-ons now?</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Exclusive experiences not available elsewhere</li>
                  <li>• Discounted rates for existing customers</li>
                  <li>• Seamless booking tied to your original reservation</li>
                  <li>• Cancel up to 24 hours before for full refund</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}