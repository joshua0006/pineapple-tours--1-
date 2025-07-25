# Custom Tour Builder Refactoring Plan

## Overview

This document outlines a comprehensive refactoring plan for the `interactive-custom-tour-builder.tsx` component to integrate real Rezdy products and create a more dynamic, data-driven tour building experience.

## Current State Analysis

### Existing Implementation Issues

1. **Static Data**: Currently uses hardcoded `REGIONS` and `EXPERIENCES` arrays
2. **Limited Product Integration**: Only fetches Rezdy products for display in summary, not for building experiences
3. **Inflexible Categorization**: Fixed region-experience mapping doesn't leverage real product data
4. **Missing Real-time Pricing**: Pricing calculations don't reflect actual Rezdy product prices
5. **No Availability Integration**: No real-time availability checking
6. **Limited Customization**: Fixed experience modules don't adapt to available products

### Current Data Flow

```
Static Data → Component State → UI Rendering → Summary with Real Products
```

### Target Data Flow

```
Rezdy API → Product Categorization → Dynamic Regions/Experiences → Real-time Pricing → Availability Check → Booking
```

---

## Refactoring Strategy

### Phase 1: Data Layer Refactoring

#### 1.1 Enhanced Product Fetching

**Current:**

```typescript
const { data: rezdyProducts, loading: rezdyLoading } = useRezdyProducts(100, 0);
const customTourProducts = useMemo(() => {
  if (!rezdyProducts) return [];
  return rezdyProducts.filter(
    (product) => product.productType === "CUSTOM" && product.status === "ACTIVE"
  );
}, [rezdyProducts]);
```

**Refactored:**

```typescript
// New hook for comprehensive product management
const {
  allProducts,
  customProducts,
  regionProducts,
  experienceProducts,
  loading,
  error,
  refreshProducts,
} = useCustomTourProducts();

// Enhanced filtering and categorization
const productsByCategory = useMemo(() => {
  return categorizeProductsForCustomTours(allProducts);
}, [allProducts]);
```

#### 1.2 Dynamic Region Generation

**New Implementation:**

```typescript
interface DynamicRegion {
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

const generateRegionsFromProducts = (
  products: RezdyProduct[]
): DynamicRegion[] => {
  // Extract regions from product location data
  // Group products by geographical area
  // Calculate base pricing from transport products
  // Generate highlights from product descriptions
};
```

#### 1.3 Dynamic Experience Generation

**New Implementation:**

```typescript
interface DynamicExperience {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  image: string;
  highlights: string[];
  included: string[];
  minParticipants: number;
  maxParticipants: number;
  rezdyProducts: RezdyProduct[]; // Associated real products
  availability?: AvailabilityData;
}

const generateExperiencesFromProducts = (
  products: RezdyProduct[],
  region: string
): DynamicExperience[] => {
  // Group products by category (winery, adventure, cultural, etc.)
  // Calculate pricing from product data
  // Extract duration and participant limits
  // Generate descriptions and highlights
};
```

### Phase 2: Component Architecture Refactoring

#### 2.1 New Hook Structure

**File: `hooks/use-custom-tour-products.ts`**

```typescript
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
  checkAvailability: (
    productCode: string,
    date: string
  ) => Promise<AvailabilityData>;
}

export function useCustomTourProducts(): UseCustomTourProductsReturn {
  // Implementation details
}
```

#### 2.2 Product Categorization Service

**File: `lib/services/product-categorization.ts`**

```typescript
export class ProductCategorizationService {
  static categorizeForCustomTours(
    products: RezdyProduct[]
  ): CategorizedProducts {
    return {
      transport: this.filterTransportProducts(products),
      winery: this.filterWineryProducts(products),
      adventure: this.filterAdventureProducts(products),
      cultural: this.filterCulturalProducts(products),
      food: this.filterFoodProducts(products),
      luxury: this.filterLuxuryProducts(products),
    };
  }

  static generateRegionsFromProducts(
    products: RezdyProduct[]
  ): DynamicRegion[] {
    // Extract unique locations
    // Group products by geographical proximity
    // Calculate base pricing and features
  }

  static generateExperiencesFromProducts(
    products: RezdyProduct[],
    category: string,
    region?: string
  ): DynamicExperience[] {
    // Filter products by category and region
    // Generate experience modules
    // Calculate pricing and availability
  }
}
```

#### 2.3 Pricing Calculation Service

**File: `lib/services/pricing-calculator.ts`**

```typescript
export class PricingCalculatorService {
  static calculateTourPrice(selection: CustomTourSelection): PricingBreakdown {
    const baseTransport = this.getTransportPrice(
      selection.region,
      selection.participants
    );
    const experiencePricing = this.calculateExperiencePricing(
      selection.experiences,
      selection.participants
    );
    const discounts = this.calculateDiscounts(selection);
    const taxes = this.calculateTaxes(
      baseTransport + experiencePricing.total - discounts.total
    );

    return {
      baseTransport,
      experiences: experiencePricing,
      discounts,
      taxes,
      total: baseTransport + experiencePricing.total - discounts.total + taxes,
    };
  }

  static getTransportPrice(
    region: DynamicRegion,
    participants: number
  ): number {
    // Get actual transport product pricing
    // Apply participant-based calculations
  }

  static calculateExperiencePricing(
    experiences: DynamicExperience[],
    participants: number
  ): ExperiencePricingBreakdown {
    // Calculate individual experience pricing
    // Apply group discounts
    // Handle package deals
  }
}
```

---

## Implementation Timeline

### Week 1: Foundation

- [ ] Create new hooks (`use-custom-tour-products.ts`)
- [ ] Implement product categorization service
- [ ] Set up dynamic region generation
- [ ] Create pricing calculation service

### Week 2: Component Refactoring

- [ ] Refactor main component state management
- [ ] Implement enhanced step components
- [ ] Create product-driven UI components
- [ ] Add real-time pricing integration

### Week 3: API Integration

- [ ] Create new API endpoints
- [ ] Implement availability checking
- [ ] Add booking flow integration
- [ ] Set up error handling and validation

### Week 4: Testing & Optimization

- [ ] Unit tests for new services
- [ ] Integration testing
- [ ] Performance optimization
- [ ] User experience testing

---

## Success Metrics

### Technical Metrics

- [ ] Reduced static data dependency (0% static data)
- [ ] Improved data freshness (real-time updates)
- [ ] Enhanced performance (< 2s load time)
- [ ] Better error handling (< 1% error rate)

### User Experience Metrics

- [ ] Increased conversion rate (target: +15%)
- [ ] Reduced bounce rate (target: -20%)
- [ ] Improved user engagement (target: +25%)
- [ ] Higher customer satisfaction (target: 4.5+ stars)

### Business Metrics

- [ ] More accurate pricing (100% Rezdy sync)
- [ ] Increased booking volume (target: +30%)
- [ ] Better inventory utilization (target: +20%)
- [ ] Reduced manual intervention (target: -50%)

---

This refactoring plan provides a comprehensive roadmap for transforming the static custom tour builder into a dynamic, data-driven experience that leverages real Rezdy products while maintaining excellent user experience and performance.
