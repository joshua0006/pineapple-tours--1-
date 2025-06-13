import { RezdyProduct } from "@/lib/types/rezdy";
import { TOUR_CATEGORIES } from "@/lib/constants/categories";

export interface CategorizedProducts {
  transport: RezdyProduct[];
  winery: RezdyProduct[];
  adventure: RezdyProduct[];
  cultural: RezdyProduct[];
  food: RezdyProduct[];
  luxury: RezdyProduct[];
  brewery: RezdyProduct[];
  [key: string]: RezdyProduct[];
}

export class ProductCategorizationService {
  static categorizeForCustomTours(
    products: RezdyProduct[]
  ): CategorizedProducts {
    const categorized: CategorizedProducts = {
      transport: [],
      winery: [],
      adventure: [],
      cultural: [],
      food: [],
      luxury: [],
      brewery: [],
    };

    products.forEach((product) => {
      const category = this.getProductCategory(product);
      if (category && categorized[category]) {
        categorized[category].push(product);
      }
    });

    return categorized;
  }

  static getProductCategory(product: RezdyProduct): string | null {
    const name = product.name?.toLowerCase() || "";
    const description = product.shortDescription?.toLowerCase() || "";
    const fullDescription = product.description?.toLowerCase() || "";
    const productType = product.productType?.toLowerCase() || "";

    // Transport/Hop-on-hop-off
    if (
      name.includes("hop on hop off") ||
      name.includes("hop-on-hop-off") ||
      name.includes("shuttle") ||
      name.includes("transport") ||
      name.includes("bus") ||
      productType === "charter" ||
      description.includes("hop on hop off") ||
      description.includes("shuttle")
    ) {
      return "transport";
    }

    // Winery tours
    if (
      name.includes("winery") ||
      name.includes("wine") ||
      name.includes("vineyard") ||
      name.includes("cellar") ||
      name.includes("vintage") ||
      description.includes("wine") ||
      description.includes("winery") ||
      fullDescription.includes("wine tasting")
    ) {
      return "winery";
    }

    // Brewery tours
    if (
      name.includes("brewery") ||
      name.includes("beer") ||
      name.includes("craft beer") ||
      name.includes("brewing") ||
      name.includes("ale") ||
      name.includes("lager") ||
      description.includes("brewery") ||
      description.includes("beer") ||
      fullDescription.includes("beer tasting")
    ) {
      return "brewery";
    }

    // Adventure activities
    if (
      name.includes("adventure") ||
      name.includes("rainforest") ||
      name.includes("wildlife") ||
      name.includes("hiking") ||
      name.includes("nature") ||
      name.includes("outdoor") ||
      name.includes("scenic") ||
      description.includes("adventure") ||
      description.includes("rainforest") ||
      description.includes("wildlife") ||
      fullDescription.includes("nature walk")
    ) {
      return "adventure";
    }

    // Cultural experiences
    if (
      name.includes("cultural") ||
      name.includes("heritage") ||
      name.includes("aboriginal") ||
      name.includes("art") ||
      name.includes("gallery") ||
      name.includes("museum") ||
      name.includes("history") ||
      description.includes("cultural") ||
      description.includes("heritage") ||
      description.includes("aboriginal") ||
      fullDescription.includes("cultural centre")
    ) {
      return "cultural";
    }

    // Food experiences
    if (
      name.includes("food") ||
      name.includes("gourmet") ||
      name.includes("tasting") ||
      name.includes("culinary") ||
      name.includes("restaurant") ||
      name.includes("dining") ||
      name.includes("produce") ||
      description.includes("food") ||
      description.includes("gourmet") ||
      description.includes("tasting") ||
      fullDescription.includes("local produce")
    ) {
      return "food";
    }

    // Luxury experiences
    if (
      name.includes("luxury") ||
      name.includes("premium") ||
      name.includes("exclusive") ||
      name.includes("vip") ||
      name.includes("barefoot luxury") ||
      description.includes("luxury") ||
      description.includes("premium") ||
      description.includes("exclusive") ||
      (product.advertisedPrice && product.advertisedPrice > 500)
    ) {
      return "luxury";
    }

    // Default categorization based on product type
    if (productType === "custom") return "transport";
    if (productType === "daytour") return "adventure";
    if (productType === "private_tour") return "luxury";

    return null;
  }

  static filterTransportProducts(products: RezdyProduct[]): RezdyProduct[] {
    return products.filter(
      (product) => this.getProductCategory(product) === "transport"
    );
  }

  static filterWineryProducts(products: RezdyProduct[]): RezdyProduct[] {
    return products.filter(
      (product) => this.getProductCategory(product) === "winery"
    );
  }

  static filterBreweryProducts(products: RezdyProduct[]): RezdyProduct[] {
    return products.filter(
      (product) => this.getProductCategory(product) === "brewery"
    );
  }

  static filterAdventureProducts(products: RezdyProduct[]): RezdyProduct[] {
    return products.filter(
      (product) => this.getProductCategory(product) === "adventure"
    );
  }

  static filterCulturalProducts(products: RezdyProduct[]): RezdyProduct[] {
    return products.filter(
      (product) => this.getProductCategory(product) === "cultural"
    );
  }

  static filterFoodProducts(products: RezdyProduct[]): RezdyProduct[] {
    return products.filter(
      (product) => this.getProductCategory(product) === "food"
    );
  }

  static filterLuxuryProducts(products: RezdyProduct[]): RezdyProduct[] {
    return products.filter(
      (product) => this.getProductCategory(product) === "luxury"
    );
  }

  static generateRegionsFromProducts(products: RezdyProduct[]): any[] {
    // Group products by location
    const locationGroups: Record<string, RezdyProduct[]> = {};

    products.forEach((product) => {
      let location = "unknown";

      if (typeof product.locationAddress === "string") {
        location = product.locationAddress;
      } else if (
        product.locationAddress &&
        typeof product.locationAddress === "object"
      ) {
        location =
          product.locationAddress.city ||
          product.locationAddress.addressLine ||
          "unknown";
      }

      // Extract key location identifiers
      const locationKey = location.toLowerCase();
      if (locationKey.includes("tamborine")) {
        location = "tamborine-mountain";
      } else if (locationKey.includes("gold coast")) {
        location = "gold-coast";
      } else if (locationKey.includes("byron") || locationKey.includes("nsw")) {
        location = "northern-nsw";
      } else if (locationKey.includes("brisbane")) {
        location = "brisbane";
      }

      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(product);
    });

    return Object.entries(locationGroups).map(([location, products]) => ({
      id: location,
      name: this.formatLocationName(location),
      products,
      productCount: products.length,
    }));
  }

  static generateExperiencesFromProducts(
    products: RezdyProduct[],
    category: string,
    region?: string
  ): any[] {
    let filteredProducts = products;

    // Filter by category
    if (category !== "all") {
      filteredProducts = products.filter(
        (product) => this.getProductCategory(product) === category
      );
    }

    // Filter by region if specified
    if (region) {
      filteredProducts = filteredProducts.filter((product) => {
        const location =
          typeof product.locationAddress === "string"
            ? product.locationAddress.toLowerCase()
            : "";
        return location.includes(region.toLowerCase());
      });
    }

    return filteredProducts.map((product) => ({
      id: product.productCode,
      name: product.name,
      description: product.shortDescription || product.description,
      price: product.advertisedPrice || 0,
      category: this.getProductCategory(product),
      product,
    }));
  }

  private static formatLocationName(location: string): string {
    return location
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  static hasValidPricing(product: RezdyProduct): boolean {
    return !!(product.advertisedPrice && product.advertisedPrice > 0);
  }

  static hasValidLocation(product: RezdyProduct): boolean {
    return !!(
      product.locationAddress &&
      (typeof product.locationAddress === "string" ||
        (typeof product.locationAddress === "object" &&
          (product.locationAddress.city ||
            product.locationAddress.addressLine)))
    );
  }
}
