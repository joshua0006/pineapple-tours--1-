import { useState, useEffect, useMemo } from "react";
import { RezdyProduct } from "@/lib/types/rezdy";
import { useRezdyProducts } from "./use-rezdy";

import {
  getCityFromLocation,
  getPrimaryImageUrl,
} from "@/lib/utils/product-utils";

export interface DynamicRegion {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  highlights: string[];
  travelTime: string;
  bestFor: string[];
  availableProducts: RezdyProduct[];
  experienceCategories: string[];
}

export interface DynamicExperience {
  id: string;
  name: string;
  description: string;
  category:
    | "transport"
    | "winery"
    | "adventure"
    | "cultural"
    | "food"
    | "luxury";
  price: number;
  duration: string;
  image: string;
  highlights: string[];
  included: string[];
  minParticipants: number;
  maxParticipants: number;
  rezdyProducts: RezdyProduct[];
  availability?: any;
}

export interface UseCustomTourProductsReturn {
  // Core data
  allProducts: RezdyProduct[];
  customProducts: RezdyProduct[];

  // Categorized data
  regionProducts: Record<string, RezdyProduct[]>;
  experienceProducts: Record<string, RezdyProduct[]>;
  transportProducts: RezdyProduct[];

  // Dynamic configurations
  availableRegions: DynamicRegion[];
  availableExperiences: Record<string, DynamicExperience[]>;

  // State management
  loading: boolean;
  error: string | null;

  // Actions
  refreshProducts: () => Promise<void>;
  getExperiencesForRegion: (regionId: string) => DynamicExperience[];
}

export function useCustomTourProducts(): UseCustomTourProductsReturn {
  const { data: allProducts, loading, error } = useRezdyProducts(1000, 0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter products suitable for custom tours
  const customProducts = useMemo(() => {
    if (!allProducts) return [];

    console.log(
      "✅ useCustomTourProducts: Processing",
      allProducts.length,
      "products from Rezdy"
    );

    // Filter products with prices (status is undefined in this Rezdy setup)
    const filtered = allProducts.filter(
      (product) => product.advertisedPrice && product.advertisedPrice > 0
    );

    console.log(
      "✅ useCustomTourProducts: Found",
      filtered.length,
      "products with pricing"
    );

    return filtered;
  }, [allProducts]);

  // Categorize products by type (simplified)
  const categorizedProducts = useMemo(() => {
    if (!customProducts.length) {
      return {
        transport: [],
        winery: [],
        adventure: [],
        cultural: [],
        food: [],
      };
    }
    return {
      transport: customProducts.filter(
        (p) => p.productType === "CUSTOM" || p.productType === "CHARTER"
      ),
      winery: customProducts.filter(
        (p) =>
          p.name?.toLowerCase().includes("wine") ||
          p.name?.toLowerCase().includes("winery")
      ),
      adventure: customProducts.filter(
        (p) =>
          p.name?.toLowerCase().includes("tour") ||
          p.name?.toLowerCase().includes("adventure")
      ),
      cultural: customProducts.filter(
        (p) =>
          p.name?.toLowerCase().includes("cultural") ||
          p.name?.toLowerCase().includes("heritage")
      ),
      food: customProducts.filter(
        (p) =>
          p.name?.toLowerCase().includes("food") ||
          p.name?.toLowerCase().includes("dining")
      ),
    };
  }, [customProducts]);

  // Group products by region/location
  const regionProducts = useMemo(() => {
    if (!customProducts.length) return {};

    const regions: Record<string, RezdyProduct[]> = {};

    customProducts.forEach((product) => {
      const city = getCityFromLocation(product.locationAddress);
      if (city) {
        const regionKey = city.toLowerCase().replace(/\s+/g, "-");
        if (!regions[regionKey]) {
          regions[regionKey] = [];
        }
        regions[regionKey].push(product);
      }
    });

    return regions;
  }, [customProducts]);

  // Generate dynamic regions from products
  const availableRegions = useMemo(() => {
    console.log(
      "✅ useCustomTourProducts: Generating regions from",
      customProducts.length,
      "products"
    );
    const regions: DynamicRegion[] = [];

    // If we have any custom products, create regions based on actual data
    if (customProducts.length > 0) {
      // Get the lowest price for base pricing
      const basePrice = Math.min(
        ...customProducts.map((p) => p.advertisedPrice || 99)
      );

      // Create a main Queensland region with all products
      regions.push({
        id: "queensland-tours",
        name: "Queensland Custom Tours",
        description: `Explore Queensland with ${customProducts.length} custom tour options`,
        image:
          getPrimaryImageUrl(customProducts[0]) ||
          "/private-tours/tamborine-mountain.avif",
        basePrice,
        travelTime: "Various locations across Queensland",
        highlights: [
          "Custom experiences",
          "Flexible itineraries",
          "Professional guides",
          "Local insights",
        ],
        bestFor: [
          "All travelers",
          "Custom groups",
          "Special occasions",
          "Flexible schedules",
        ],
        availableProducts: customProducts,
        experienceCategories: [
          "transport",
          "winery",
          "adventure",
          "cultural",
          "food",
        ],
      });

      // If we have enough products, create location-specific regions
      if (customProducts.length >= 5) {
        // Group products by location if possible
        const locationGroups: Record<string, RezdyProduct[]> = {};

        customProducts.forEach((product) => {
          const city = getCityFromLocation(product.locationAddress);
          const locationKey = city
            ? city.toLowerCase().replace(/\s+/g, "-")
            : "other";

          if (!locationGroups[locationKey]) {
            locationGroups[locationKey] = [];
          }
          locationGroups[locationKey].push(product);
        });

        // Create regions for locations with multiple products
        Object.entries(locationGroups).forEach(([locationKey, products]) => {
          if (products.length >= 2 && locationKey !== "other") {
            const locationName =
              typeof products[0].locationAddress === "string"
                ? products[0].locationAddress.split(",")[0]
                : locationKey;

            regions.push({
              id: locationKey,
              name: `${locationName} Tours`,
              description: `Custom tours in ${locationName} with ${products.length} available options`,
              image:
                getPrimaryImageUrl(products[0]) ||
                "/private-tours/tamborine-mountain.avif",
              basePrice: Math.min(
                ...products.map((p) => p.advertisedPrice || 99)
              ),
              travelTime: `Tours in ${locationName}`,
              highlights: [
                "Local experiences",
                "Expert guides",
                "Flexible timing",
                "Custom itineraries",
              ],
              bestFor: [
                "Local exploration",
                "Small groups",
                "Personalized tours",
                "Authentic experiences",
              ],
              availableProducts: products,
              experienceCategories: [
                "transport",
                "winery",
                "adventure",
                "cultural",
                "food",
              ],
            });
          }
        });
      }
    }

    console.log(
      "✅ useCustomTourProducts: Created",
      regions.length,
      "regions with real Rezdy data"
    );
    return regions;
  }, [customProducts]);

  // Generate experiences for each region
  const availableExperiences = useMemo(() => {
    const experiences: Record<string, DynamicExperience[]> = {};

    availableRegions.forEach((region) => {
      const regionExperiences: DynamicExperience[] = [];

      // Always include transport
      regionExperiences.push({
        id: "hop-on-hop-off",
        name: "Unlimited Transport",
        description: "All-day hop-on hop-off access to all destinations",
        category: "transport",
        price: 0, // Included in base price
        duration: "All day",
        image: "/hop-on-hop-off/hop-on-hop-off-bus-1.jpg",
        highlights: [
          "Unlimited stops",
          "Flexible timing",
          "Professional driver",
          "Route guidance",
        ],
        included: [
          "Return transport",
          "All-day access",
          "Route map",
          "Driver commentary",
        ],
        minParticipants: 1,
        maxParticipants: 50,
        rezdyProducts: region.availableProducts.slice(0, 3),
      });

      // Create sample experiences from available products
      const sampleProducts = region.availableProducts.slice(0, 3);

      sampleProducts.forEach((product, index) => {
        if (
          product.productType !== "CUSTOM" &&
          product.productType !== "CHARTER"
        ) {
          regionExperiences.push({
            id: `experience-${index}`,
            name: product.name || "Custom Experience",
            description: product.shortDescription || "Unique tour experience",
            category: "adventure",
            price: product.advertisedPrice || 89,
            duration: "3-4 hours",
            image:
              getPrimaryImageUrl(product) ||
              "/hop-on-hop-off/hop-on-hop-off-views-4.jpg",
            highlights: [
              "Professional guide",
              "Local insights",
              "Memorable experience",
            ],
            included: ["Entry fees", "Professional guide", "Transportation"],
            minParticipants: 1,
            maxParticipants: 20,
            rezdyProducts: [product],
          });
        }
      });

      // Add a few more sample experiences if we have enough products
      if (region.availableProducts.length > 3) {
        regionExperiences.push({
          id: "winery-experience",
          name: "Winery Experience",
          description: "Premium wine tastings and vineyard tours",
          category: "winery",
          price: 89,
          duration: "4-5 hours",
          image: "/cea291bc40ef4c8a8ac060ed77c6fd3cLuxury_Wine_Tour_lg.avif",
          highlights: [
            "Premium venues",
            "Guided tastings",
            "Local cheese platters",
          ],
          included: ["Tasting fees", "Cheese platters", "Professional guide"],
          minParticipants: 2,
          maxParticipants: 12,
          rezdyProducts: region.availableProducts.slice(3, 6),
        });
      }

      experiences[region.id] = regionExperiences;
    });

    return experiences;
  }, [availableRegions]);

  // Transport products
  const transportProducts = useMemo(() => {
    return customProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes("hop on hop off") ||
        p.name?.toLowerCase().includes("shuttle") ||
        p.productType === "CUSTOM"
    );
  }, [customProducts]);

  // Experience products grouped by category
  const experienceProducts = useMemo(() => {
    return categorizedProducts;
  }, [categorizedProducts]);

  const getExperiencesForRegion = (regionId: string): DynamicExperience[] => {
    return availableExperiences[regionId] || [];
  };

  const refreshProducts = async () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    allProducts: allProducts || [],
    customProducts,
    regionProducts,
    experienceProducts,
    transportProducts,
    availableRegions,
    availableExperiences,
    loading,
    error,
    refreshProducts,
    getExperiencesForRegion,
  };
}
