import {
  RezdyProduct,
  RezdyBooking,
  RezdyCustomer,
  FilterCriteria,
  ProductFilters,
  SegmentedProducts,
  SegmentedCustomers,
  ProductCategories,
  ProductMetrics,
  CustomerSegments,
  BookingClassification
} from '@/lib/types/rezdy';

export class DataSegmentationEngine {
  // Product Segmentation
  segmentProducts(products: RezdyProduct[], criteria?: FilterCriteria): SegmentedProducts {
    return {
      high_demand: this.filterByDemand(products, 'high'),
      seasonal: criteria ? this.filterBySeason(products, criteria.temporal.season) : [],
      location_based: criteria ? this.filterByLocation(products, criteria.geographical) : [],
      price_optimized: this.filterByPricePerformance(products)
    };
  }

  // Customer Segmentation
  segmentCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): SegmentedCustomers {
    return {
      vip: this.identifyVIPCustomers(customers, bookings),
      at_risk: this.identifyAtRiskCustomers(customers, bookings),
      growth_potential: this.identifyGrowthOpportunities(customers, bookings)
    };
  }

  // Product Categorization
  categorizeProducts(products: RezdyProduct[]): ProductCategories {
    return {
      tours: {
        adventure: this.filterProductsByCategory(products, 'adventure'),
        cultural: this.filterProductsByCategory(products, 'cultural'),
        food_wine: this.filterProductsByCategory(products, 'food_wine'),
        nature: this.filterProductsByCategory(products, 'nature'),
        urban: this.filterProductsByCategory(products, 'urban')
      },
      experiences: {
        workshops: this.filterProductsByCategory(products, 'workshop'),
        classes: this.filterProductsByCategory(products, 'class'),
        tastings: this.filterProductsByCategory(products, 'tasting')
      },
      transportation: {
        transfers: this.filterProductsByCategory(products, 'transfer'),
        day_trips: this.filterProductsByCategory(products, 'day_trip')
      }
    };
  }

  // Product Metrics Categorization
  categorizeProductsByMetrics(products: RezdyProduct[], bookings: RezdyBooking[]): ProductMetrics {
    const revenueData = this.calculateProductRevenue(products, bookings);
    const popularityData = this.calculateProductPopularity(products, bookings);
    
    return {
      revenue_tier: {
        premium: this.getTopPercentile(products, revenueData, 20),
        standard: this.getMiddlePercentile(products, revenueData, 20, 80),
        budget: this.getBottomPercentile(products, revenueData, 20)
      },
      popularity: {
        bestsellers: this.getTopPercentile(products, popularityData, 20),
        seasonal: this.identifySeasonalProducts(products, bookings),
        niche: this.identifyNicheProducts(products, bookings)
      },
      operational: {
        high_capacity: products.filter(p => (p.quantityRequiredMax || 0) > 20),
        boutique: products.filter(p => (p.quantityRequiredMax || 0) <= 10),
        private: products.filter(p => (p.quantityRequiredMax || 0) === 1)
      }
    };
  }

  // Customer Demographics Segmentation
  segmentCustomerDemographics(customers: RezdyCustomer[], bookings: RezdyBooking[]): CustomerSegments {
    return {
      demographics: {
        age_groups: {
          millennials: this.filterCustomersByAge(customers, 25, 40),
          gen_x: this.filterCustomersByAge(customers, 41, 56),
          baby_boomers: this.filterCustomersByAge(customers, 57, 75)
        },
        family_status: {
          families: this.identifyFamilyCustomers(customers, bookings),
          couples: this.identifyCoupleCustomers(customers, bookings),
          solo_travelers: this.identifySoloCustomers(customers, bookings)
        }
      },
      behavioral: {
        booking_frequency: {
          frequent: this.getFrequentCustomers(customers, bookings),
          occasional: this.getOccasionalCustomers(customers, bookings),
          first_time: this.getFirstTimeCustomers(customers, bookings)
        },
        spending_patterns: {
          high_value: this.getHighValueCustomers(customers, bookings),
          moderate: this.getModerateValueCustomers(customers, bookings),
          budget: this.getBudgetCustomers(customers, bookings)
        }
      }
    };
  }

  // Booking Classification
  classifyBookings(bookings: RezdyBooking[]): BookingClassification {
    return {
      status: {
        confirmed: bookings.filter(b => b.status === 'CONFIRMED'),
        pending: bookings.filter(b => b.status === 'PENDING'),
        cancelled: bookings.filter(b => b.status === 'CANCELLED'),
        completed: bookings.filter(b => b.status === 'COMPLETED'),
        no_show: bookings.filter(b => b.status === 'NO_SHOW')
      },
      timing: {
        advance_bookings: this.getAdvanceBookings(bookings),
        standard: this.getStandardBookings(bookings),
        last_minute: this.getLastMinuteBookings(bookings)
      },
      value: {
        high_value: this.getHighValueBookings(bookings),
        standard_value: this.getStandardValueBookings(bookings),
        promotional: this.getPromotionalBookings(bookings)
      }
    };
  }

  // Multi-dimensional Filtering
  applyMultiDimensionalFilter(products: RezdyProduct[], criteria: FilterCriteria): RezdyProduct[] {
    return products.filter(product => {
      return this.matchesTemporalCriteria(product, criteria.temporal) &&
             this.matchesCommercialCriteria(product, criteria.commercial) &&
             this.matchesGeographicalCriteria(product, criteria.geographical) &&
             this.matchesOperationalCriteria(product, criteria.operational);
    });
  }

  // Real-time Product Filtering
  filterProducts(products: RezdyProduct[], filters: ProductFilters): RezdyProduct[] {
    return products.filter(product => {
      // Text search
      const matchesSearch = !filters.searchTerm || 
        this.matchesSearchTerm(product, filters.searchTerm);

      // Category filter
      const matchesType = filters.productType === 'all' || 
        product.productType === filters.productType;

      // Price range filter
      const matchesPrice = filters.priceRange === 'all' || 
        this.isPriceInRange(product.advertisedPrice, filters.priceRange);

      // Availability filter
      const matchesAvailability = filters.availability === 'all' || 
        this.hasAvailability(product, filters.availability);

      // Location filter
      const matchesLocation = filters.location === 'all' ||
        this.matchesLocation(product, filters.location);

      // Category filter
      const matchesCategory = !filters.category || filters.category === 'all' ||
        this.matchesCategory(product, filters.category);

      return matchesSearch && matchesType && matchesPrice && 
             matchesAvailability && matchesLocation && matchesCategory;
    });
  }

  // Private helper methods
  private filterByDemand(products: RezdyProduct[], demandLevel: string): RezdyProduct[] {
    // This would typically use booking data to determine demand
    // For now, we'll use a simple heuristic based on product type and price
    return products.filter(product => {
      const isPopularType = ['TOUR', 'EXPERIENCE'].includes(product.productType || '');
      const hasGoodPrice = (product.advertisedPrice || 0) > 0;
      return isPopularType && hasGoodPrice;
    });
  }

  private filterBySeason(products: RezdyProduct[], season: string): RezdyProduct[] {
    const seasonalKeywords: Record<string, string[]> = {
      spring: ['spring', 'bloom', 'garden', 'flower'],
      summer: ['summer', 'beach', 'sun', 'water', 'swim'],
      autumn: ['autumn', 'fall', 'harvest', 'wine'],
      winter: ['winter', 'snow', 'ski', 'holiday', 'christmas']
    };

    const keywords = seasonalKeywords[season] || [];
    return products.filter(product => {
      const searchText = `${product.name} ${product.description || ''}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword));
    });
  }

  private filterByLocation(products: RezdyProduct[], geographical: any): RezdyProduct[] {
    if (!geographical.locations || geographical.locations.length === 0) {
      return products;
    }

    return products.filter(product => {
      const locationText = typeof product.locationAddress === 'string' 
        ? product.locationAddress.toLowerCase()
        : '';
      
      return geographical.locations.some((location: string) => 
        locationText.includes(location.toLowerCase())
      );
    });
  }

  private filterByPricePerformance(products: RezdyProduct[]): RezdyProduct[] {
    // Filter products with good price-to-value ratio
    return products.filter(product => {
      const hasPrice = (product.advertisedPrice || 0) > 0;
      const hasDescription = !!(product.description && product.description.length > 50);
      const hasImages = !!(product.images && product.images.length > 0);
      
      return hasPrice && hasDescription && hasImages;
    });
  }

  private filterProductsByCategory(products: RezdyProduct[], category: string): RezdyProduct[] {
    return products.filter(product => {
      const searchText = `${product.name} ${product.description || ''} ${product.categories?.join(' ') || ''}`.toLowerCase();
      const productTypeUpper = product.productType?.toUpperCase() || '';
      
      // Enhanced category filtering based on the comprehensive categories from categories-section.tsx
      const categoryKeywords: Record<string, string[]> = {
        adventure: ['adventure', 'outdoor', 'hiking', 'climbing', 'extreme', 'thrill', 'adrenaline', 'diving', 'expedition', 'active', 'sport'],
        cultural: ['cultural', 'heritage', 'history', 'museum', 'traditional', 'local', 'art', 'architecture', 'historic', 'culture'],
        'food-wine': ['food', 'wine', 'culinary', 'tasting', 'gastronomy', 'dining', 'restaurant', 'cooking', 'chef', 'cuisine', 'gourmet'],
        food_wine: ['food', 'wine', 'culinary', 'tasting', 'gastronomy', 'dining', 'restaurant', 'cooking', 'chef', 'cuisine', 'gourmet'],
        nature: ['nature', 'wildlife', 'eco', 'scenic', 'park', 'forest', 'beach', 'mountain', 'lake', 'bird', 'animal', 'environment'],
        urban: ['city', 'urban', 'walking', 'sightseeing', 'downtown', 'neighborhood', 'street', 'architecture', 'skyline', 'metro'],
        family: ['family', 'kids', 'children', 'child', 'all ages', 'family-friendly', 'suitable for children', 'parents', 'generations'],
        romantic: ['romantic', 'honeymoon', 'couples', 'romance', 'intimate', 'private', 'sunset', 'luxury', 'special occasion'],
        luxury: ['luxury', 'premium', 'exclusive', 'vip', 'high-end', 'deluxe', 'first-class', 'upscale', 'elite'],
        photography: ['photography', 'photo', 'camera', 'scenic', 'capture', 'instagram', 'photogenic', 'landscape', 'portrait'],
        'water-activities': ['water', 'marine', 'boat', 'cruise', 'sailing', 'diving', 'snorkeling', 'ocean', 'sea', 'lake', 'river', 'beach'],
        water_activities: ['water', 'marine', 'boat', 'cruise', 'sailing', 'diving', 'snorkeling', 'ocean', 'sea', 'lake', 'river', 'beach'],
        workshops: ['workshop', 'hands-on', 'craft', 'skill', 'learning', 'class', 'tutorial', 'diy', 'make', 'create'],
        workshop: ['workshop', 'hands-on', 'craft', 'skill', 'learning', 'class', 'tutorial', 'diy', 'make', 'create'],
        classes: ['class', 'lesson', 'course', 'educational', 'instruction', 'learn', 'teach', 'training', 'school', 'academy'],
        class: ['class', 'lesson', 'course', 'educational', 'instruction', 'learn', 'teach', 'training', 'school', 'academy'],
        tastings: ['tasting', 'sampling', 'degustation', 'pairing', 'flavor', 'vintage', 'sommelier', 'cellar', 'vineyard'],
        tasting: ['tasting', 'sampling', 'degustation', 'pairing', 'flavor', 'vintage', 'sommelier', 'cellar', 'vineyard'],
        transfers: ['transfer', 'transport', 'shuttle', 'airport', 'pickup', 'dropoff', 'ride', 'taxi', 'private car'],
        transfer: ['transfer', 'transport', 'shuttle', 'airport', 'pickup', 'dropoff', 'ride', 'taxi', 'private car'],
        'day-trips': ['day trip', 'excursion', 'day tour', 'full day', 'round trip', 'guided', 'all day', 'return'],
        day_trip: ['day trip', 'excursion', 'day tour', 'full day', 'round trip', 'guided', 'all day', 'return'],
        'multiday-tours': ['multiday', 'multi-day', 'package', 'extended', 'overnight', 'itinerary', 'multiple days', 'tour package'],
        multiday_tours: ['multiday', 'multi-day', 'package', 'extended', 'overnight', 'itinerary', 'multiple days', 'tour package'],
        'airport-services': ['airport', 'arrival', 'departure', 'connection', 'layover', 'terminal', 'flight', 'check-in'],
        airport_services: ['airport', 'arrival', 'departure', 'connection', 'layover', 'terminal', 'flight', 'check-in'],
        // Legacy support
        honeymoon: ['romantic', 'honeymoon', 'couples', 'romance', 'intimate', 'private', 'sunset', 'luxury']
      };

      const categoryProductTypes: Record<string, string[]> = {
        adventure: ['ADVENTURE', 'OUTDOOR', 'EXTREME', 'HIKING', 'CLIMBING', 'DIVING', 'EXPEDITION'],
        cultural: ['CULTURAL', 'HERITAGE', 'HISTORICAL', 'MUSEUM', 'TRADITIONAL', 'ART'],
        'food-wine': ['FOOD', 'WINE', 'CULINARY', 'TASTING', 'GASTRONOMY', 'DINING'],
        food_wine: ['FOOD', 'WINE', 'CULINARY', 'TASTING', 'GASTRONOMY', 'DINING'],
        nature: ['NATURE', 'WILDLIFE', 'ECO', 'SCENIC', 'NATIONAL_PARK', 'FOREST', 'BEACH'],
        urban: ['CITY', 'URBAN', 'WALKING', 'SIGHTSEEING', 'NEIGHBORHOOD', 'DOWNTOWN'],
        family: ['FAMILY', 'KIDS', 'CHILDREN', 'ALL_AGES'],
        romantic: ['ROMANTIC', 'HONEYMOON', 'COUPLES', 'INTIMATE', 'PRIVATE'],
        luxury: ['LUXURY', 'PREMIUM', 'EXCLUSIVE', 'VIP', 'HIGH_END'],
        photography: ['PHOTOGRAPHY', 'PHOTO', 'CAMERA', 'SCENIC', 'WORKSHOP'],
        'water-activities': ['WATER', 'MARINE', 'BOAT', 'CRUISE', 'SAILING', 'DIVING', 'SNORKELING'],
        water_activities: ['WATER', 'MARINE', 'BOAT', 'CRUISE', 'SAILING', 'DIVING', 'SNORKELING'],
        workshops: ['WORKSHOP', 'HANDS_ON', 'CRAFT', 'SKILL', 'LEARNING', 'DIY'],
        workshop: ['WORKSHOP', 'HANDS_ON', 'CRAFT', 'SKILL', 'LEARNING', 'DIY'],
        classes: ['CLASS', 'LESSON', 'COURSE', 'EDUCATIONAL', 'INSTRUCTION', 'TRAINING'],
        class: ['CLASS', 'LESSON', 'COURSE', 'EDUCATIONAL', 'INSTRUCTION', 'TRAINING'],
        tastings: ['TASTING', 'SAMPLING', 'DEGUSTATION', 'PAIRING', 'WINE_TASTING'],
        tasting: ['TASTING', 'SAMPLING', 'DEGUSTATION', 'PAIRING', 'WINE_TASTING'],
        transfers: ['TRANSFER', 'TRANSPORT', 'TRANSPORTATION', 'SHUTTLE', 'PICKUP'],
        transfer: ['TRANSFER', 'TRANSPORT', 'TRANSPORTATION', 'SHUTTLE', 'PICKUP'],
        'day-trips': ['DAY_TRIP', 'EXCURSION', 'DAY_TOUR', 'FULL_DAY', 'ROUND_TRIP'],
        day_trip: ['DAY_TRIP', 'EXCURSION', 'DAY_TOUR', 'FULL_DAY', 'ROUND_TRIP'],
        'multiday-tours': ['MULTIDAY_TOUR', 'MULTI_DAY_TOUR', 'MULTIDAYTOUR', 'PACKAGE', 'EXTENDED'],
        multiday_tours: ['MULTIDAY_TOUR', 'MULTI_DAY_TOUR', 'MULTIDAYTOUR', 'PACKAGE', 'EXTENDED'],
        'airport-services': ['AIRPORT', 'ARRIVAL', 'DEPARTURE', 'CONNECTION', 'LAYOVER'],
        airport_services: ['AIRPORT', 'ARRIVAL', 'DEPARTURE', 'CONNECTION', 'LAYOVER']
      };

      const keywords = categoryKeywords[category] || [category];
      const productTypes = categoryProductTypes[category] || [];
      
      // Check both keyword match and product type match
      const keywordMatch = keywords.some(keyword => searchText.includes(keyword));
      const productTypeMatch = productTypes.some(type => productTypeUpper.includes(type));
      
      return keywordMatch || productTypeMatch;
    });
  }

  private calculateProductRevenue(products: RezdyProduct[], bookings: RezdyBooking[]): Map<string, number> {
    const revenueMap = new Map<string, number>();
    
    bookings.forEach(booking => {
      booking.items.forEach(item => {
        const currentRevenue = revenueMap.get(item.productCode) || 0;
        revenueMap.set(item.productCode, currentRevenue + item.amount);
      });
    });

    return revenueMap;
  }

  private calculateProductPopularity(products: RezdyProduct[], bookings: RezdyBooking[]): Map<string, number> {
    const popularityMap = new Map<string, number>();
    
    bookings.forEach(booking => {
      booking.items.forEach(item => {
        const currentCount = popularityMap.get(item.productCode) || 0;
        popularityMap.set(item.productCode, currentCount + 1);
      });
    });

    return popularityMap;
  }

  private getTopPercentile(products: RezdyProduct[], dataMap: Map<string, number>, percentile: number): RezdyProduct[] {
    const sortedProducts = products
      .map(product => ({ product, value: dataMap.get(product.productCode) || 0 }))
      .sort((a, b) => b.value - a.value);
    
    const cutoff = Math.ceil(sortedProducts.length * (percentile / 100));
    return sortedProducts.slice(0, cutoff).map(item => item.product);
  }

  private getMiddlePercentile(products: RezdyProduct[], dataMap: Map<string, number>, startPercentile: number, endPercentile: number): RezdyProduct[] {
    const sortedProducts = products
      .map(product => ({ product, value: dataMap.get(product.productCode) || 0 }))
      .sort((a, b) => b.value - a.value);
    
    const startIndex = Math.ceil(sortedProducts.length * (startPercentile / 100));
    const endIndex = Math.ceil(sortedProducts.length * (endPercentile / 100));
    
    return sortedProducts.slice(startIndex, endIndex).map(item => item.product);
  }

  private getBottomPercentile(products: RezdyProduct[], dataMap: Map<string, number>, percentile: number): RezdyProduct[] {
    const sortedProducts = products
      .map(product => ({ product, value: dataMap.get(product.productCode) || 0 }))
      .sort((a, b) => a.value - b.value);
    
    const cutoff = Math.ceil(sortedProducts.length * (percentile / 100));
    return sortedProducts.slice(0, cutoff).map(item => item.product);
  }

  private identifySeasonalProducts(products: RezdyProduct[], bookings: RezdyBooking[]): RezdyProduct[] {
    // Identify products with seasonal booking patterns
    return products.filter(product => {
      const productBookings = bookings.filter(booking =>
        booking.items.some(item => item.productCode === product.productCode)
      );
      
      // Simple heuristic: products with seasonal keywords
      const searchText = `${product.name} ${product.description || ''}`.toLowerCase();
      const seasonalKeywords = ['seasonal', 'summer', 'winter', 'spring', 'autumn', 'holiday', 'christmas'];
      
      return seasonalKeywords.some(keyword => searchText.includes(keyword));
    });
  }

  private identifyNicheProducts(products: RezdyProduct[], bookings: RezdyBooking[]): RezdyProduct[] {
    // Identify specialized or unique products
    return products.filter(product => {
      const searchText = `${product.name} ${product.description || ''}`.toLowerCase();
      const nicheKeywords = ['exclusive', 'private', 'unique', 'special', 'premium', 'luxury', 'boutique'];
      
      return nicheKeywords.some(keyword => searchText.includes(keyword));
    });
  }

  // Customer segmentation helper methods
  private identifyVIPCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    const customerSpending = this.calculateCustomerSpending(customers, bookings);
    const threshold = this.calculateSpendingThreshold(customerSpending, 90); // Top 10%
    
    return customers.filter(customer => 
      (customerSpending.get(customer.email) || 0) >= threshold
    );
  }

  private identifyAtRiskCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    // Customers who haven't booked in a while
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return customers.filter(customer => {
      const lastBooking = this.getLastBookingDate(customer, bookings);
      return lastBooking && lastBooking < sixMonthsAgo;
    });
  }

  private identifyGrowthOpportunities(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    // Customers with moderate spending who could be upsold
    const customerSpending = this.calculateCustomerSpending(customers, bookings);
    const lowThreshold = this.calculateSpendingThreshold(customerSpending, 25);
    const highThreshold = this.calculateSpendingThreshold(customerSpending, 75);
    
    return customers.filter(customer => {
      const spending = customerSpending.get(customer.email) || 0;
      return spending >= lowThreshold && spending <= highThreshold;
    });
  }

  private calculateCustomerSpending(customers: RezdyCustomer[], bookings: RezdyBooking[]): Map<string, number> {
    const spendingMap = new Map<string, number>();
    
    bookings.forEach(booking => {
      const currentSpending = spendingMap.get(booking.customer.email) || 0;
      spendingMap.set(booking.customer.email, currentSpending + booking.totalAmount);
    });

    return spendingMap;
  }

  private calculateSpendingThreshold(spendingMap: Map<string, number>, percentile: number): number {
    const amounts = Array.from(spendingMap.values()).sort((a, b) => a - b);
    const index = Math.ceil(amounts.length * (percentile / 100)) - 1;
    return amounts[index] || 0;
  }

  private getLastBookingDate(customer: RezdyCustomer, bookings: RezdyBooking[]): Date | null {
    const customerBookings = bookings.filter(booking => 
      booking.customer.email === customer.email
    );
    
    if (customerBookings.length === 0) return null;
    
    const lastBooking = customerBookings.reduce((latest, booking) => {
      const bookingDate = new Date(booking.createdDate || '');
      const latestDate = new Date(latest.createdDate || '');
      return bookingDate > latestDate ? booking : latest;
    });
    
    return new Date(lastBooking.createdDate || '');
  }

  // Additional helper methods for filtering
  private matchesSearchTerm(product: RezdyProduct, searchTerm: string): boolean {
    const searchText = `${product.name} ${product.description || ''} ${product.shortDescription || ''}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  }

  private isPriceInRange(price: number | undefined, priceRange: string): boolean {
    if (!price || price <= 0) return priceRange === 'all';
    
    switch (priceRange) {
      case 'under-99':
        return price < 99;
      case '99-159':
        return price >= 99 && price < 159;
      case '159-299':
        return price >= 159 && price < 299;
      case 'over-299':
        return price >= 299;
      case 'all':
      default:
        return true;
    }
  }

  private hasAvailability(product: RezdyProduct, availability: string): boolean {
    // This would typically check real availability data
    // For now, we'll use a simple heuristic
    return availability === 'all' || product.status === 'ACTIVE';
  }

  private matchesLocation(product: RezdyProduct, location: string): boolean {
    if (!product.locationAddress) return false;
    const locationText = typeof product.locationAddress === 'string' 
      ? product.locationAddress.toLowerCase()
      : '';
    return locationText.includes(location.toLowerCase());
  }

  private matchesCategory(product: RezdyProduct, category: string): boolean {
    return product.categories?.some(cat => 
      cat.toLowerCase().includes(category.toLowerCase())
    ) || false;
  }

  private matchesTemporalCriteria(product: RezdyProduct, temporal: any): boolean {
    // Implementation would depend on availability data
    return true; // Placeholder
  }

  private matchesCommercialCriteria(product: RezdyProduct, commercial: any): boolean {
    const price = product.advertisedPrice || 0;
    const priceInRange = price >= commercial.price_range.min && price <= commercial.price_range.max;
    const typeMatches = commercial.product_types.length === 0 || 
      commercial.product_types.includes(product.productType || '');
    
    return priceInRange && typeMatches;
  }

  private matchesGeographicalCriteria(product: RezdyProduct, geographical: any): boolean {
    if (geographical.locations.length === 0) return true;
    
    const locationText = typeof product.locationAddress === 'string' 
      ? product.locationAddress.toLowerCase()
      : '';
    
    return geographical.locations.some((location: string) => 
      locationText.includes(location.toLowerCase())
    );
  }

  private matchesOperationalCriteria(product: RezdyProduct, operational: any): boolean {
    // Implementation would depend on real-time availability data
    return true; // Placeholder
  }

  // Booking classification helper methods
  private getAdvanceBookings(bookings: RezdyBooking[]): RezdyBooking[] {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.createdDate || '');
      const tourDate = new Date(booking.items[0]?.startTimeLocal || '');
      const daysDifference = Math.floor((tourDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDifference > 30;
    });
  }

  private getStandardBookings(bookings: RezdyBooking[]): RezdyBooking[] {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.createdDate || '');
      const tourDate = new Date(booking.items[0]?.startTimeLocal || '');
      const daysDifference = Math.floor((tourDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDifference >= 7 && daysDifference <= 30;
    });
  }

  private getLastMinuteBookings(bookings: RezdyBooking[]): RezdyBooking[] {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.createdDate || '');
      const tourDate = new Date(booking.items[0]?.startTimeLocal || '');
      const daysDifference = Math.floor((tourDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDifference < 7;
    });
  }

  private getHighValueBookings(bookings: RezdyBooking[]): RezdyBooking[] {
    const amounts = bookings.map(b => b.totalAmount).sort((a, b) => b - a);
    const threshold = amounts[Math.floor(amounts.length * 0.2)] || 0; // Top 20%
    return bookings.filter(booking => booking.totalAmount >= threshold);
  }

  private getStandardValueBookings(bookings: RezdyBooking[]): RezdyBooking[] {
    const amounts = bookings.map(b => b.totalAmount).sort((a, b) => b - a);
    const highThreshold = amounts[Math.floor(amounts.length * 0.2)] || 0;
    const lowThreshold = amounts[Math.floor(amounts.length * 0.8)] || 0;
    return bookings.filter(booking => 
      booking.totalAmount < highThreshold && booking.totalAmount >= lowThreshold
    );
  }

  private getPromotionalBookings(bookings: RezdyBooking[]): RezdyBooking[] {
    // This would typically check for discount codes or promotional pricing
    // For now, we'll identify low-value bookings as potentially promotional
    const amounts = bookings.map(b => b.totalAmount).sort((a, b) => a - b);
    const threshold = amounts[Math.floor(amounts.length * 0.2)] || 0; // Bottom 20%
    return bookings.filter(booking => booking.totalAmount <= threshold);
  }

  // Additional customer segmentation methods
  private filterCustomersByAge(customers: RezdyCustomer[], minAge: number, maxAge: number): RezdyCustomer[] {
    // This would require birth date data, which isn't available in the current schema
    // Return empty array for now
    return [];
  }

  private identifyFamilyCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    return customers.filter(customer => {
      const customerBookings = bookings.filter(b => b.customer.email === customer.email);
      return customerBookings.some(booking => 
        booking.items.some(item => 
          item.participants.some(p => p.type.toLowerCase().includes('child'))
        )
      );
    });
  }

  private identifyCoupleCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    return customers.filter(customer => {
      const customerBookings = bookings.filter(b => b.customer.email === customer.email);
      return customerBookings.some(booking => {
        const totalParticipants = booking.items.reduce((total, item) => 
          total + item.participants.reduce((sum, p) => sum + p.number, 0), 0
        );
        return totalParticipants === 2;
      });
    });
  }

  private identifySoloCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    return customers.filter(customer => {
      const customerBookings = bookings.filter(b => b.customer.email === customer.email);
      return customerBookings.some(booking => {
        const totalParticipants = booking.items.reduce((total, item) => 
          total + item.participants.reduce((sum, p) => sum + p.number, 0), 0
        );
        return totalParticipants === 1;
      });
    });
  }

  private getFrequentCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    return customers.filter(customer => {
      const customerBookings = bookings.filter(b => b.customer.email === customer.email);
      return customerBookings.length >= 3;
    });
  }

  private getOccasionalCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    return customers.filter(customer => {
      const customerBookings = bookings.filter(b => b.customer.email === customer.email);
      return customerBookings.length >= 1 && customerBookings.length < 3;
    });
  }

  private getFirstTimeCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    return customers.filter(customer => {
      const customerBookings = bookings.filter(b => b.customer.email === customer.email);
      return customerBookings.length === 1;
    });
  }

  private getHighValueCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    const customerSpending = this.calculateCustomerSpending(customers, bookings);
    const threshold = this.calculateSpendingThreshold(customerSpending, 80); // Top 20%
    
    return customers.filter(customer => 
      (customerSpending.get(customer.email) || 0) >= threshold
    );
  }

  private getModerateValueCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    const customerSpending = this.calculateCustomerSpending(customers, bookings);
    const lowThreshold = this.calculateSpendingThreshold(customerSpending, 20);
    const highThreshold = this.calculateSpendingThreshold(customerSpending, 80);
    
    return customers.filter(customer => {
      const spending = customerSpending.get(customer.email) || 0;
      return spending >= lowThreshold && spending < highThreshold;
    });
  }

  private getBudgetCustomers(customers: RezdyCustomer[], bookings: RezdyBooking[]): RezdyCustomer[] {
    const customerSpending = this.calculateCustomerSpending(customers, bookings);
    const threshold = this.calculateSpendingThreshold(customerSpending, 20); // Bottom 20%
    
    return customers.filter(customer => 
      (customerSpending.get(customer.email) || 0) < threshold
    );
  }
}

// Export instance
export const dataSegmentationEngine = new DataSegmentationEngine(); 