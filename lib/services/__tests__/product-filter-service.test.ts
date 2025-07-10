// Test file for ProductFilterService
import { ProductFilterService } from '../product-filter-service';
import { RezdyProduct } from '@/lib/types/rezdy';

// Mock product data for testing
const createMockProduct = (overrides: Partial<RezdyProduct> = {}): RezdyProduct => ({
  productCode: 'TEST001',
  name: 'Test Product',
  shortDescription: 'A test product',
  description: 'Full description',
  advertisedPrice: 100,
  images: [],
  quantityRequiredMin: 1,
  quantityRequiredMax: 10,
  productType: 'ACTIVITY',
  status: 'ACTIVE',
  categories: [],
  extras: [],
  taxes: [],
  pickupLocations: [],
  departsFrom: [],
  ...overrides,
});

describe('ProductFilterService', () => {
  describe('Product Filtering', () => {
    it('should filter out products with excluded keywords in name', () => {
      const products: RezdyProduct[] = [
        createMockProduct({ name: 'Regular Tour' }),
        createMockProduct({ name: 'Cancelled Tour', productCode: 'CANCEL001' }),
        createMockProduct({ name: 'Custom Tour Package', productCode: 'CUSTOM001' }),
        createMockProduct({ name: 'Driver Tip', productCode: 'TIP001' }),
        createMockProduct({ name: 'Cleaning Fee', productCode: 'FEE001' }),
        createMockProduct({ name: 'ZZZZ - USE THIS', productCode: 'ZZZZ001' }),
        createMockProduct({ name: 'Famil Tour', productCode: 'FAMIL001' }),
        createMockProduct({ name: 'FDWT Non Drinker BNE', productCode: 'FDWT001' }),
      ];

      const filtered = ProductFilterService.filterProducts(products);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Regular Tour');
    });

    it('should filter out gift cards and vouchers', () => {
      const products: RezdyProduct[] = [
        createMockProduct({ name: 'Regular Tour' }),
        createMockProduct({ name: 'Gift Card', productCode: 'GIFT001' }),
        createMockProduct({ name: 'Gift Voucher', productCode: 'GIFT002' }),
        createMockProduct({ productType: 'GIFT_CARD', productCode: 'GIFT003' }),
      ];

      const filtered = ProductFilterService.filterProducts(products);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Regular Tour');
    });

    it('should filter out products with price on request', () => {
      const products: RezdyProduct[] = [
        createMockProduct({ advertisedPrice: 100 }),
        createMockProduct({ advertisedPrice: 0, name: 'Zero Price Tour' }),
        createMockProduct({ advertisedPrice: null, name: 'Null Price Tour' }),
        createMockProduct({ name: 'Price On Request Tour', advertisedPrice: null }),
        createMockProduct({ shortDescription: 'Call for price', advertisedPrice: null }),
      ];

      const filtered = ProductFilterService.filterProducts(products);
      
      // Should only keep the product with a valid price
      expect(filtered).toHaveLength(1);
      expect(filtered[0].advertisedPrice).toBe(100);
    });

    it('should filter out inactive products', () => {
      const products: RezdyProduct[] = [
        createMockProduct({ status: 'ACTIVE' }),
        createMockProduct({ status: 'INACTIVE', productCode: 'INACTIVE001' }),
        createMockProduct({ status: 'DISABLED', productCode: 'DISABLED001' }),
        createMockProduct({ status: 'ARCHIVED', productCode: 'ARCHIVED001' }),
      ];

      const filtered = ProductFilterService.filterProducts(products);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('ACTIVE');
    });

    it('should respect whitelist', () => {
      // Temporarily add a product to whitelist for testing
      const originalWhitelist = [...require('@/lib/constants/product-filters').PRODUCT_FILTER_CONFIG.whitelistedProductCodes];
      require('@/lib/constants/product-filters').PRODUCT_FILTER_CONFIG.whitelistedProductCodes.push('WHITELIST001');

      const products: RezdyProduct[] = [
        createMockProduct({ name: 'Regular Tour' }),
        createMockProduct({ 
          name: 'Cancelled Tour - But Whitelisted', 
          productCode: 'WHITELIST001' 
        }),
      ];

      const filtered = ProductFilterService.filterProducts(products);
      
      expect(filtered).toHaveLength(2);
      
      // Restore original whitelist
      require('@/lib/constants/product-filters').PRODUCT_FILTER_CONFIG.whitelistedProductCodes = originalWhitelist;
    });

    it('should handle the specific excluded product', () => {
      const products: RezdyProduct[] = [
        createMockProduct({ name: 'Regular Wildlife Tour' }),
        createMockProduct({ 
          name: '3hr Koala and Kangaroo Wildlife Experience - From Brisbane',
          productCode: 'WILDLIFE001'
        }),
      ];

      const filtered = ProductFilterService.filterProducts(products);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Regular Wildlife Tour');
    });

    it('should generate accurate filter statistics', () => {
      const products: RezdyProduct[] = [
        createMockProduct({ name: 'Regular Tour' }),
        createMockProduct({ name: 'Cancelled Tour', productCode: 'CANCEL001' }),
        createMockProduct({ productType: 'GIFT_CARD', productCode: 'GIFT001' }),
        createMockProduct({ advertisedPrice: 0, productCode: 'ZERO001' }),
        createMockProduct({ status: 'INACTIVE', productCode: 'INACTIVE001' }),
      ];

      const stats = ProductFilterService.getFilterStatistics(products);
      
      expect(stats.total).toBe(5);
      expect(stats.filtered).toBe(4);
      expect(stats.byReason.keywords).toBeGreaterThan(0);
      expect(stats.byReason.productType).toBeGreaterThan(0);
      expect(stats.byReason.price).toBeGreaterThan(0);
      expect(stats.byReason.status).toBeGreaterThan(0);
    });
  });
});

// Example usage for manual testing
if (require.main === module) {
  const testProducts: RezdyProduct[] = [
    createMockProduct({ name: 'Brisbane City Tour' }),
    createMockProduct({ name: 'Cancelled Tour', productCode: 'CANCEL001' }),
    createMockProduct({ name: 'Custom Private Tour', productCode: 'CUSTOM001' }),
    createMockProduct({ name: 'Driver Tip', productCode: 'TIP001' }),
    createMockProduct({ name: 'Gift Card $100', productCode: 'GIFT001' }),
    createMockProduct({ name: 'Price on Request - Special Tour', productCode: 'POA001' }),
  ];

  console.log('Testing ProductFilterService...\n');
  console.log('Original products:', testProducts.length);
  
  const filtered = ProductFilterService.filterProducts(testProducts);
  console.log('Filtered products:', filtered.length);
  
  console.log('\nFiltered out products:');
  ProductFilterService.logFilteredProducts(testProducts);
  
  console.log('\nFilter statistics:');
  console.log(ProductFilterService.getFilterStatistics(testProducts));
}