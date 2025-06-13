import { RezdyProduct } from "@/lib/types/rezdy";
import {
  DynamicRegion,
  DynamicExperience,
} from "@/hooks/use-custom-tour-products";

export interface PricingBreakdown {
  basePrice: number;
  experiencePrices: { [experienceId: string]: number };
  totalBeforeParticipants: number;
  participants: number;
  totalPrice: number;
  discounts?: { [key: string]: number };
  taxes?: { [key: string]: number };
}

export interface PricingOptions {
  participants: number;
  date?: string;
  groupDiscount?: boolean;
  seasonalPricing?: boolean;
}

export class PricingCalculatorService {
  static calculateTourPrice(
    region: DynamicRegion,
    experiences: DynamicExperience[],
    options: PricingOptions
  ): PricingBreakdown {
    const { participants } = options;

    // Base price from region (transport included)
    const basePrice = region.basePrice;

    // Calculate experience prices
    const experiencePrices: { [experienceId: string]: number } = {};
    let experienceTotal = 0;

    experiences.forEach((experience) => {
      if (experience.id !== "hop-on-hop-off") {
        // Transport is included in base
        const experiencePrice = this.calculateExperiencePrice(
          experience,
          options
        );
        experiencePrices[experience.id] = experiencePrice;
        experienceTotal += experiencePrice;
      } else {
        experiencePrices[experience.id] = 0; // Included
      }
    });

    const totalBeforeParticipants = basePrice + experienceTotal;

    // Apply group discounts
    let discountedPrice = totalBeforeParticipants;
    const discounts: { [key: string]: number } = {};

    if (options.groupDiscount && participants >= 8) {
      const groupDiscount = totalBeforeParticipants * 0.1; // 10% group discount
      discounts.group = groupDiscount;
      discountedPrice -= groupDiscount;
    }

    // Apply seasonal pricing
    if (options.seasonalPricing && options.date) {
      const seasonalAdjustment = this.getSeasonalPricing(options.date);
      if (seasonalAdjustment !== 1) {
        const adjustment = discountedPrice * (seasonalAdjustment - 1);
        if (adjustment > 0) {
          discounts.seasonal = -adjustment; // Negative for price increase
        } else {
          discounts.seasonal = Math.abs(adjustment); // Positive for discount
        }
        discountedPrice *= seasonalAdjustment;
      }
    }

    const totalPrice = Math.round(discountedPrice * participants);

    return {
      basePrice,
      experiencePrices,
      totalBeforeParticipants,
      participants,
      totalPrice,
      discounts: Object.keys(discounts).length > 0 ? discounts : undefined,
    };
  }

  static calculateExperiencePrice(
    experience: DynamicExperience,
    options: PricingOptions
  ): number {
    let basePrice = experience.price;

    // Apply participant-based pricing adjustments
    if (options.participants >= experience.maxParticipants * 0.8) {
      // Near capacity - small premium
      basePrice *= 1.05;
    }

    // Apply date-based pricing
    if (options.date) {
      const dayOfWeek = new Date(options.date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend
        basePrice *= 1.1;
      }
    }

    return Math.round(basePrice);
  }

  static getSeasonalPricing(date: string): number {
    const tourDate = new Date(date);
    const month = tourDate.getMonth() + 1; // 1-12

    // Peak season (December - February): +20%
    if (month >= 12 || month <= 2) {
      return 1.2;
    }

    // High season (June - August): +10%
    if (month >= 6 && month <= 8) {
      return 1.1;
    }

    // Shoulder season (March-May, September-November): Standard pricing
    return 1.0;
  }

  static calculateProductPrice(
    product: RezdyProduct,
    participants: number,
    date?: string
  ): number {
    let basePrice = product.advertisedPrice || 0;

    // Apply date-based pricing
    if (date) {
      const seasonalMultiplier = this.getSeasonalPricing(date);
      basePrice *= seasonalMultiplier;
    }

    return Math.round(basePrice * participants);
  }

  static getEstimatedDuration(experiences: DynamicExperience[]): string {
    let totalMinutes = 0;

    experiences.forEach((experience) => {
      const duration = experience.duration;

      // Parse duration string (e.g., "4-5 hours", "All day", "2-3 hours")
      if (duration.toLowerCase().includes("all day")) {
        totalMinutes += 480; // 8 hours
      } else {
        const hourMatch = duration.match(/(\d+)(?:-\d+)?\s*hours?/i);
        if (hourMatch) {
          totalMinutes += parseInt(hourMatch[1]) * 60;
        }
      }
    });

    if (totalMinutes >= 480) {
      return "Full day (8+ hours)";
    } else if (totalMinutes >= 360) {
      return "Most of day (6-8 hours)";
    } else if (totalMinutes >= 240) {
      return "Half day (4-6 hours)";
    } else {
      return `${Math.round(totalMinutes / 60)} hours`;
    }
  }

  static validatePricing(breakdown: PricingBreakdown): boolean {
    return (
      breakdown.totalPrice > 0 &&
      breakdown.participants > 0 &&
      breakdown.basePrice >= 0 &&
      Object.values(breakdown.experiencePrices).every((price) => price >= 0)
    );
  }

  static formatPrice(price: number): string {
    return `$${price.toLocaleString()}`;
  }

  static formatPriceBreakdown(breakdown: PricingBreakdown): string {
    const lines = [
      `Base transport (${breakdown.participants} people): ${this.formatPrice(
        breakdown.basePrice * breakdown.participants
      )}`,
    ];

    Object.entries(breakdown.experiencePrices).forEach(
      ([experienceId, price]) => {
        if (experienceId !== "hop-on-hop-off" && price > 0) {
          lines.push(
            `${experienceId} (${
              breakdown.participants
            } people): ${this.formatPrice(price * breakdown.participants)}`
          );
        }
      }
    );

    if (breakdown.discounts) {
      Object.entries(breakdown.discounts).forEach(([type, amount]) => {
        const sign = amount > 0 ? "-" : "+";
        lines.push(
          `${type} discount: ${sign}${this.formatPrice(Math.abs(amount))}`
        );
      });
    }

    lines.push(`Total: ${this.formatPrice(breakdown.totalPrice)}`);

    return lines.join("\n");
  }

  static getRecommendedExperiences(
    region: DynamicRegion,
    budget: number,
    participants: number
  ): DynamicExperience[] {
    const availableBudget = budget - region.basePrice * participants;
    const recommendations: DynamicExperience[] = [];

    // Always include transport
    const transport = region.availableProducts.find(
      (p) =>
        p.name?.toLowerCase().includes("hop on hop off") ||
        p.productType === "CUSTOM"
    );

    if (transport) {
      recommendations.push({
        id: "hop-on-hop-off",
        name: "Unlimited Transport",
        description: "All-day hop-on hop-off access to all destinations",
        category: "transport",
        price: 0,
        duration: "All day",
        image: "",
        highlights: [],
        included: [],
        minParticipants: 1,
        maxParticipants: 50,
        rezdyProducts: [transport],
      });
    }

    // Sort experiences by value (price vs duration)
    const sortedExperiences = region.availableProducts
      .filter(
        (p) =>
          p.advertisedPrice &&
          p.advertisedPrice <= availableBudget / participants
      )
      .sort((a, b) => (a.advertisedPrice || 0) - (b.advertisedPrice || 0));

    // Add experiences within budget
    let remainingBudget = availableBudget;
    sortedExperiences.forEach((product) => {
      const productCost = (product.advertisedPrice || 0) * participants;
      if (productCost <= remainingBudget) {
        // Convert product to experience format
        // This would need proper mapping based on product category
        remainingBudget -= productCost;
      }
    });

    return recommendations;
  }
}
