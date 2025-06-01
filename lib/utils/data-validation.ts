import { z } from 'zod';
import { 
  RezdyProduct, 
  RezdyBooking, 
  RezdyCustomer,
  DataQualityMetrics,
  DataIssue,
  RezdyDataState
} from '@/lib/types/rezdy';

// Validation Schemas
export const RezdyProductSchema = z.object({
  productCode: z.string().min(1, 'Product code is required'),
  name: z.string().min(1, 'Product name is required'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  advertisedPrice: z.number().min(0, 'Price must be non-negative').optional(),
  images: z.array(z.object({
    id: z.number(),
    itemUrl: z.string().url('Invalid image URL'),
    thumbnailUrl: z.string().url('Invalid thumbnail URL'),
    mediumSizeUrl: z.string().url('Invalid medium size URL'),
    largeSizeUrl: z.string().url('Invalid large size URL'),
    caption: z.string().optional(),
    isPrimary: z.boolean().optional()
  })).optional(),
  quantityRequiredMin: z.number().min(1).optional(),
  quantityRequiredMax: z.number().min(1).optional(),
  productType: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  categories: z.array(z.string()).optional(),
  locationAddress: z.union([z.string(), z.object({
    addressLine: z.string().optional(),
    postCode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    countryCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  })]).optional()
});

export const RezdyCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional()
});

export const RezdyBookingSchema = z.object({
  orderNumber: z.string().optional(),
  customer: RezdyCustomerSchema,
  items: z.array(z.object({
    productCode: z.string().min(1, 'Product code is required'),
    startTimeLocal: z.string().datetime('Invalid date format'),
    participants: z.array(z.object({
      type: z.string(),
      number: z.number().min(1)
    })),
    amount: z.number().min(0, 'Amount must be non-negative'),
    pickupId: z.string().optional(),
    extras: z.array(z.object({
      extraId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
      totalPrice: z.number().min(0)
    })).optional()
  })).min(1, 'At least one booking item is required'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  status: z.enum(['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  createdDate: z.string().datetime().optional(),
  modifiedDate: z.string().datetime().optional()
});

// Validation Functions
export const validateProduct = (product: unknown): RezdyProduct => {
  try {
    return RezdyProductSchema.parse(product);
  } catch (error) {
    console.error('Product validation failed:', error);
    throw new Error(`Invalid product data: ${error instanceof z.ZodError ? error.message : 'Unknown error'}`);
  }
};

export const validateCustomer = (customer: unknown): RezdyCustomer => {
  try {
    return RezdyCustomerSchema.parse(customer);
  } catch (error) {
    console.error('Customer validation failed:', error);
    throw new Error(`Invalid customer data: ${error instanceof z.ZodError ? error.message : 'Unknown error'}`);
  }
};

export const validateBooking = (booking: unknown): RezdyBooking => {
  try {
    return RezdyBookingSchema.parse(booking);
  } catch (error) {
    console.error('Booking validation failed:', error);
    throw new Error(`Invalid booking data: ${error instanceof z.ZodError ? error.message : 'Unknown error'}`);
  }
};

// Data Cleaning Pipeline
export class DataCleaningPipeline {
  async cleanProductData(rawProducts: any[]): Promise<RezdyProduct[]> {
    return rawProducts
      .map(product => this.normalizeProduct(product))
      .filter(product => this.isValidProduct(product))
      .map(product => this.enrichProduct(product));
  }

  async cleanBookingData(rawBookings: any[]): Promise<RezdyBooking[]> {
    return rawBookings
      .map(booking => this.normalizeBooking(booking))
      .filter(booking => this.isValidBooking(booking))
      .map(booking => this.enrichBooking(booking));
  }

  private normalizeProduct(product: any): RezdyProduct {
    return {
      ...product,
      name: this.cleanText(product.name),
      description: this.cleanText(product.description),
      shortDescription: this.cleanText(product.shortDescription),
      advertisedPrice: this.normalizePrice(product.advertisedPrice),
      productType: this.standardizeProductType(product.productType),
      images: this.validateImages(product.images || []),
      categories: this.standardizeCategories(product.categories || [])
    };
  }

  private normalizeBooking(booking: any): RezdyBooking {
    return {
      ...booking,
      customer: {
        ...booking.customer,
        firstName: this.cleanText(booking.customer?.firstName),
        lastName: this.cleanText(booking.customer?.lastName),
        email: this.normalizeEmail(booking.customer?.email),
        phone: this.normalizePhone(booking.customer?.phone)
      },
      totalAmount: this.normalizePrice(booking.totalAmount) || 0,
      status: this.standardizeStatus(booking.status),
      createdDate: this.normalizeDate(booking.createdDate),
      modifiedDate: this.normalizeDate(booking.modifiedDate)
    };
  }

  private cleanText(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?()]/g, '');
  }

  private normalizePrice(price: any): number | undefined {
    if (typeof price === 'number' && price >= 0) return price;
    if (typeof price === 'string') {
      const parsed = parseFloat(price.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private normalizeEmail(email: string): string {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  private normalizePhone(phone: string): string | undefined {
    if (!phone) return undefined;
    return phone.replace(/[^\d+\-\s()]/g, '').trim();
  }

  private normalizeDate(date: string): string | undefined {
    if (!date) return undefined;
    try {
      return new Date(date).toISOString();
    } catch {
      return undefined;
    }
  }

  private standardizeProductType(productType: string): string {
    if (!productType) return 'UNKNOWN';
    const normalized = productType.toUpperCase().trim();
    const standardTypes = ['TOUR', 'EXPERIENCE', 'TRANSFER', 'ACCOMMODATION', 'GIFT_CARD'];
    return standardTypes.includes(normalized) ? normalized : 'OTHER';
  }

  private standardizeStatus(status: string): string {
    if (!status) return 'UNKNOWN';
    const normalized = status.toUpperCase().trim();
    const standardStatuses = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
    return standardStatuses.includes(normalized) ? normalized : 'UNKNOWN';
  }

  private standardizeCategories(categories: string[]): string[] {
    return categories
      .map(cat => cat.trim().toLowerCase())
      .filter(cat => cat.length > 0)
      .map(cat => this.mapToStandardCategory(cat));
  }

  private mapToStandardCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'adventure': 'adventure',
      'cultural': 'cultural',
      'food': 'food_wine',
      'wine': 'food_wine',
      'nature': 'nature',
      'urban': 'urban',
      'city': 'urban',
      'workshop': 'workshop',
      'class': 'class',
      'tasting': 'tasting',
      'transfer': 'transfer',
      'transport': 'transfer'
    };

    for (const [key, value] of Object.entries(categoryMap)) {
      if (category.includes(key)) {
        return value;
      }
    }
    return category;
  }

  private validateImages(images: any[]): any[] {
    return images.filter(img => {
      try {
        new URL(img.itemUrl);
        new URL(img.thumbnailUrl);
        return true;
      } catch {
        return false;
      }
    });
  }

  private isValidProduct(product: any): boolean {
    return !!(product.productCode && product.name);
  }

  private isValidBooking(booking: any): boolean {
    return !!(booking.customer?.email && booking.items?.length > 0);
  }

  private enrichProduct(product: RezdyProduct): RezdyProduct {
    return {
      ...product,
      // Add computed fields
      hasImages: !!(product.images && product.images.length > 0),
      hasDescription: !!(product.description && product.description.length > 0),
      priceCategory: this.categorizePriceRange(product.advertisedPrice)
    } as any;
  }

  private enrichBooking(booking: RezdyBooking): RezdyBooking {
    return {
      ...booking,
      // Add computed fields
      participantCount: booking.items.reduce((total, item) => 
        total + item.participants.reduce((sum, p) => sum + p.number, 0), 0
      ),
      bookingType: this.categorizeBookingType(booking)
    } as any;
  }

  private categorizePriceRange(price?: number): string {
    if (!price) return 'unknown';
    if (price < 50) return 'budget';
    if (price < 200) return 'standard';
    return 'premium';
  }

  private categorizeBookingType(booking: RezdyBooking): string {
    const now = new Date();
    const bookingDate = new Date(booking.createdDate || now);
    const daysDifference = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 30) return 'advance';
    if (daysDifference > 7) return 'standard';
    return 'last_minute';
  }
}

// Data Quality Monitoring
export class DataQualityMonitor {
  generateQualityReport(data: RezdyDataState): DataQualityMetrics {
    return {
      completeness: this.assessCompleteness(data),
      accuracy: this.assessAccuracy(data),
      consistency: this.assessConsistency(data)
    };
  }

  identifyDataIssues(data: RezdyDataState): DataIssue[] {
    const issues: DataIssue[] = [];
    
    // Check products for missing critical fields
    data.products.forEach(product => {
      if (!product.name) {
        issues.push({ 
          type: 'missing_name', 
          productCode: product.productCode,
          message: 'Product missing name',
          severity: 'high'
        });
      }
      if (!product.advertisedPrice) {
        issues.push({ 
          type: 'missing_price', 
          productCode: product.productCode,
          message: 'Product missing price',
          severity: 'medium'
        });
      }
      if (!product.images || product.images.length === 0) {
        issues.push({ 
          type: 'missing_images', 
          productCode: product.productCode,
          message: 'Product missing images',
          severity: 'low'
        });
      }
    });

    // Check bookings for data inconsistencies
    data.bookings.forEach(booking => {
      const calculatedTotal = this.calculateBookingTotal(booking);
      if (Math.abs(booking.totalAmount - calculatedTotal) > 0.01) {
        issues.push({ 
          type: 'price_mismatch', 
          orderNumber: booking.orderNumber,
          message: `Total amount mismatch: expected ${calculatedTotal}, got ${booking.totalAmount}`,
          severity: 'high'
        });
      }

      if (!this.isValidEmail(booking.customer.email)) {
        issues.push({ 
          type: 'invalid_email', 
          orderNumber: booking.orderNumber,
          message: 'Invalid customer email format',
          severity: 'medium'
        });
      }
    });

    return issues;
  }

  private assessCompleteness(data: RezdyDataState) {
    const products = data.products;
    return {
      products_with_descriptions: products.filter(p => p.description && p.description.length > 0).length,
      products_with_images: products.filter(p => p.images && p.images.length > 0).length,
      products_with_pricing: products.filter(p => p.advertisedPrice && p.advertisedPrice > 0).length
    };
  }

  private assessAccuracy(data: RezdyDataState) {
    const bookings = data.bookings;
    return {
      valid_email_addresses: bookings.filter(b => this.isValidEmail(b.customer.email)).length,
      valid_phone_numbers: bookings.filter(b => this.isValidPhone(b.customer.phone)).length,
      valid_dates: bookings.filter(b => this.isValidDate(b.createdDate)).length
    };
  }

  private assessConsistency(data: RezdyDataState) {
    const products = data.products;
    return {
      standardized_product_types: products.filter(p => this.isStandardProductType(p.productType)).length,
      consistent_pricing_format: products.filter(p => this.isConsistentPricing(p.advertisedPrice)).length,
      uniform_date_formats: data.bookings.filter(b => this.isUniformDateFormat(b.createdDate)).length
    };
  }

  private calculateBookingTotal(booking: RezdyBooking): number {
    return booking.items.reduce((total, item) => total + item.amount, 0);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone?: string): boolean {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private isValidDate(date?: string): boolean {
    if (!date) return false;
    return !isNaN(new Date(date).getTime());
  }

  private isStandardProductType(productType?: string): boolean {
    if (!productType) return false;
    const standardTypes = ['TOUR', 'EXPERIENCE', 'TRANSFER', 'ACCOMMODATION', 'GIFT_CARD', 'OTHER'];
    return standardTypes.includes(productType.toUpperCase());
  }

  private isConsistentPricing(price?: number): boolean {
    return typeof price === 'number' && price >= 0;
  }

  private isUniformDateFormat(date?: string): boolean {
    if (!date) return false;
    try {
      const parsed = new Date(date);
      return parsed.toISOString() === date;
    } catch {
      return false;
    }
  }
}

// Export instances
export const dataCleaningPipeline = new DataCleaningPipeline();
export const dataQualityMonitor = new DataQualityMonitor(); 