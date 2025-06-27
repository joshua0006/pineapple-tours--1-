"use client";

import { useState, useEffect, useMemo } from "react";
import { RezdyProduct } from "@/lib/types/rezdy";
import { useRezdyProducts } from "./use-rezdy";
import {
  getUniqueCitiesFromProducts,
  filterProductsByCity,
} from "@/lib/utils/product-utils";

export interface CityProductsState {
  products: RezdyProduct[];
  cities: string[];
  selectedCity: string;
  filteredProducts: RezdyProduct[];
  loading: boolean;
  error: string | null;
}

export interface CityProductsActions {
  setSelectedCity: (city: string) => void;
  refreshData: () => void;
}

export function useCityProducts(): CityProductsState & CityProductsActions {
  const [selectedCity, setSelectedCity] = useState<string>("all");

  // Fetch products using existing hook
  const { data: products, loading, error } = useRezdyProducts(1000); // Fetch more products to get comprehensive city list

  // Extract unique cities from products
  const cities = useMemo(() => {
    if (!products || products.length === 0) return [];
    const uniqueCities = getUniqueCitiesFromProducts(products);
    console.log("Cities extracted:", uniqueCities.length, uniqueCities);
    return uniqueCities;
  }, [products]);

  // Filter products by selected city
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const filtered = filterProductsByCity(products, selectedCity);
    console.log(`Filtering products for city "${selectedCity}":`, {
      totalProducts: products.length,
      filteredProducts: filtered.length,
      selectedCity,
    });
    return filtered;
  }, [products, selectedCity]);

  // Reset selected city when products change
  useEffect(() => {
    if (products && products.length > 0 && selectedCity !== "all") {
      // Check if the selected city still exists in the new data
      const availableCities = getUniqueCitiesFromProducts(products);
      if (!availableCities.includes(selectedCity)) {
        setSelectedCity("all");
      }
    }
  }, [products, selectedCity]);

  const refreshData = () => {
    // This will trigger a re-fetch through the useRezdyProducts hook
    // For now, we'll reset the selected city to trigger a re-render
    setSelectedCity("all");
  };

  return {
    products: products || [],
    cities,
    selectedCity,
    filteredProducts,
    loading,
    error,
    setSelectedCity,
    refreshData,
  };
}
