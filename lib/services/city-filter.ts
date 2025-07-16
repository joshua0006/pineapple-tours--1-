import { RezdyProduct, RezdyAddress } from '@/lib/types/rezdy';
import { getCityFromLocation } from '@/lib/utils/product-utils';

/**
 * City-based filtering service for Rezdy products
 * Replaces complex pickup location filtering with streamlined city filtering
 * using locationAddress.city data directly from products
 */
export class CityFilterService {
  private static readonly SUPPORTED_CITIES = [
    'Brisbane',
    'Gold Coast', 
    'Byron Bay',
    'Tamborine Mountain',
    'Mount Tamborine',
    'Springbrook'
  ];

  private static readonly CITY_ALIASES = {
    'brisbane': 'Brisbane',
    'gold coast': 'Gold Coast',
    'goldcoast': 'Gold Coast',
    'byron bay': 'Byron Bay',
    'byron': 'Byron Bay',
    'tamborine mountain': 'Tamborine Mountain',
    'tamborine': 'Tamborine Mountain',
    'mount tamborine': 'Tamborine Mountain',
    'mt tamborine': 'Tamborine Mountain',
    'springbrook': 'Springbrook',
    'springbrook national park': 'Springbrook'
  };

  /**
   * Extract unique cities from an array of products
   */
  static extractUniqueCities(products: RezdyProduct[]): Array<{
    city: string;
    productCount: number;
    isSupported: boolean;
  }> {
    if (!products || products.length === 0) return [];

    const cityStats = new Map<string, number>();

    products.forEach(product => {
      const city = this.getCityFromProduct(product);
      if (city) {
        const normalizedCity = this.normalizeCity(city);
        cityStats.set(normalizedCity, (cityStats.get(normalizedCity) || 0) + 1);
      }
    });

    return Array.from(cityStats.entries())
      .map(([city, count]) => ({
        city,
        productCount: count,
        isSupported: this.SUPPORTED_CITIES.includes(city)
      }))
      .sort((a, b) => {
        // Sort by support status first, then by product count
        if (a.isSupported && !b.isSupported) return -1;
        if (!a.isSupported && b.isSupported) return 1;
        return b.productCount - a.productCount;
      });
  }

  /**
   * Filter products by city
   */
  static filterProductsByCity(
    products: RezdyProduct[], 
    targetCity: string
  ): {
    filteredProducts: RezdyProduct[];
    filterStats: {
      totalProducts: number;
      filteredCount: number;
      targetCity: string;
      normalizedCity: string;
      accuracy: 'high' | 'medium' | 'low';
      matchMethod: 'exact' | 'normalized' | 'partial';
    };
  } {
    if (!products || products.length === 0) {
      return {
        filteredProducts: [],
        filterStats: {
          totalProducts: 0,
          filteredCount: 0,
          targetCity,
          normalizedCity: targetCity,
          accuracy: 'low',
          matchMethod: 'exact'
        }
      };
    }

    // Handle 'all' case
    if (!targetCity || targetCity === 'all') {
      return {
        filteredProducts: products,
        filterStats: {
          totalProducts: products.length,
          filteredCount: products.length,
          targetCity: 'all',
          normalizedCity: 'all',
          accuracy: 'high',
          matchMethod: 'exact'
        }
      };
    }

    const normalizedTarget = this.normalizeCity(targetCity);
    const filteredProducts: RezdyProduct[] = [];
    let exactMatches = 0;
    let normalizedMatches = 0;
    let partialMatches = 0;

    products.forEach(product => {
      const productCity = this.getCityFromProduct(product);
      if (!productCity) return;

      const normalizedProductCity = this.normalizeCity(productCity);

      // Exact match (case insensitive)
      if (productCity.toLowerCase() === targetCity.toLowerCase()) {
        filteredProducts.push(product);
        exactMatches++;
        return;
      }

      // Normalized match
      if (normalizedProductCity === normalizedTarget) {
        filteredProducts.push(product);
        normalizedMatches++;
        return;
      }

      // Partial match for compatibility
      if (normalizedProductCity.toLowerCase().includes(normalizedTarget.toLowerCase()) ||
          normalizedTarget.toLowerCase().includes(normalizedProductCity.toLowerCase())) {
        filteredProducts.push(product);
        partialMatches++;
      }
    });

    // Determine match method and accuracy
    let matchMethod: 'exact' | 'normalized' | 'partial' = 'exact';
    let accuracy: 'high' | 'medium' | 'low' = 'high';

    if (exactMatches > 0) {
      matchMethod = 'exact';
      accuracy = 'high';
    } else if (normalizedMatches > 0) {
      matchMethod = 'normalized';
      accuracy = 'high';
    } else if (partialMatches > 0) {
      matchMethod = 'partial';
      accuracy = 'medium';
    } else {
      accuracy = 'low';
    }

    return {
      filteredProducts,
      filterStats: {
        totalProducts: products.length,
        filteredCount: filteredProducts.length,
        targetCity,
        normalizedCity: normalizedTarget,
        accuracy,
        matchMethod
      }
    };
  }

  /**
   * Check if a product is available from a specific city
   */
  static hasProductFromCity(product: RezdyProduct, targetCity: string): {
    hasCity: boolean;
    confidence: 'high' | 'medium' | 'low';
    method: 'exact' | 'normalized' | 'partial';
  } {
    const productCity = this.getCityFromProduct(product);
    
    if (!productCity) {
      return { hasCity: false, confidence: 'low', method: 'exact' };
    }

    const normalizedTarget = this.normalizeCity(targetCity);
    const normalizedProductCity = this.normalizeCity(productCity);

    // Exact match
    if (productCity.toLowerCase() === targetCity.toLowerCase()) {
      return { hasCity: true, confidence: 'high', method: 'exact' };
    }

    // Normalized match
    if (normalizedProductCity === normalizedTarget) {
      return { hasCity: true, confidence: 'high', method: 'normalized' };
    }

    // Partial match
    if (normalizedProductCity.toLowerCase().includes(normalizedTarget.toLowerCase()) ||
        normalizedTarget.toLowerCase().includes(normalizedProductCity.toLowerCase())) {
      return { hasCity: true, confidence: 'medium', method: 'partial' };
    }

    return { hasCity: false, confidence: 'low', method: 'exact' };
  }

  /**
   * Get city summary statistics for products
   */
  static getCitySummary(products: RezdyProduct[]): {
    cities: Array<{
      city: string;
      productCount: number;
      isSupported: boolean;
      coverage: number; // percentage of total products
    }>;
    totalProducts: number;
    citiesWithProducts: number;
    supportedCityCoverage: number; // percentage covered by supported cities
  } {
    const totalProducts = products.length;
    if (totalProducts === 0) {
      return {
        cities: [],
        totalProducts: 0,
        citiesWithProducts: 0,
        supportedCityCoverage: 0
      };
    }

    const uniqueCities = this.extractUniqueCities(products);
    const supportedProductCount = uniqueCities
      .filter(city => city.isSupported)
      .reduce((sum, city) => sum + city.productCount, 0);

    const cities = uniqueCities.map(city => ({
      ...city,
      coverage: (city.productCount / totalProducts) * 100
    }));

    return {
      cities,
      totalProducts,
      citiesWithProducts: uniqueCities.length,
      supportedCityCoverage: (supportedProductCount / totalProducts) * 100
    };
  }

  /**
   * Get supported cities list
   */
  static getSupportedCities(): string[] {
    return [...this.SUPPORTED_CITIES];
  }

  /**
   * Normalize city name for consistent filtering
   */
  private static normalizeCity(city: string): string {
    if (!city) return '';
    
    const lowercaseCity = city.toLowerCase().trim();
    
    // Check aliases first
    if (this.CITY_ALIASES[lowercaseCity]) {
      return this.CITY_ALIASES[lowercaseCity];
    }

    // Return title case version
    return city.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Extract city from product using existing utility
   */
  private static getCityFromProduct(product: RezdyProduct): string | null {
    if (!product.locationAddress) return null;
    
    return getCityFromLocation(product.locationAddress);
  }

  /**
   * Validate city filtering configuration
   */
  static validateConfiguration(): {
    isValid: boolean;
    issues: string[];
    supportedCities: number;
    aliases: number;
  } {
    const issues: string[] = [];

    // Check for duplicate supported cities
    const uniqueSupportedCities = new Set(this.SUPPORTED_CITIES);
    if (uniqueSupportedCities.size !== this.SUPPORTED_CITIES.length) {
      issues.push('Duplicate cities found in SUPPORTED_CITIES');
    }

    // Check for circular aliases
    Object.entries(this.CITY_ALIASES).forEach(([alias, target]) => {
      if (this.CITY_ALIASES[target.toLowerCase()]) {
        issues.push(`Potential circular alias: ${alias} -> ${target}`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues,
      supportedCities: this.SUPPORTED_CITIES.length,
      aliases: Object.keys(this.CITY_ALIASES).length
    };
  }
}