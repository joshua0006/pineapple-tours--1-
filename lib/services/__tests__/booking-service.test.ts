import { BookingService, BookingRequest, PaymentConfirmation, BookingRegistrationResult } from '../booking-service'
import { BookingFormData } from '@/lib/utils/booking-transform'
import { fetchAndCacheProduct } from '@/lib/utils/rezdy-product-cache'

// Mock the rezdy-product-cache module
jest.mock('@/lib/utils/rezdy-product-cache', () => ({
  fetchAndCacheProduct: jest.fn(),
  getCorrectPriceOptionLabel: jest.fn((productCode: string, type: string) => {
    if (type === 'adult') return 'Adult'
    if (type === 'child') return 'Child'
    if (type === 'infant') return 'Infant'
    return null
  }),
  rezdyProductCache: {
    get: jest.fn(),
    set: jest.fn()
  }
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock data builders
const createMockPaymentConfirmation = (overrides: Partial<PaymentConfirmation> = {}): PaymentConfirmation => ({
  transactionId: 'trans_123456',
  amount: 220,
  currency: 'AUD',
  status: 'success',
  paymentMethod: 'credit_card',
  timestamp: new Date().toISOString(),
  orderReference: 'order_123',
  ...overrides
})

const createMockBookingFormData = (overrides: Partial<BookingFormData> = {}): BookingFormData => ({
  product: {
    code: 'TOUR001',
    name: 'Test Tour',
    description: 'A test tour'
  },
  session: {
    id: 'session123',
    startTime: '2024-12-25T09:00:00Z',
    endTime: '2024-12-25T12:00:00Z'
  },
  guests: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      type: 'ADULT'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      age: 8,
      type: 'CHILD'
    }
  ],
  contact: {
    firstName: 'Contact',
    lastName: 'Person',
    email: 'contact@example.com',
    phone: '+61 412 345 678',
    country: 'Australia',
    specialRequests: 'Test requirements'
  },
  pricing: {
    basePrice: 200,
    sessionPrice: 200,
    subtotal: 200,
    taxAndFees: 20,
    total: 220
  },
  payment: {
    method: 'credit_card',
    type: 'CREDITCARD'
  },
  guestCounts: {
    adults: 1,
    children: 1,
    infants: 0
  },
  selectedPriceOptions: {
    adult: { id: 1, label: 'Adult', price: 100 },
    child: { id: 2, label: 'Child', price: 50 }
  },
  ...overrides
})

describe('BookingService', () => {
  let bookingService: BookingService
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  const mockFetchProduct = fetchAndCacheProduct as jest.MockedFunction<typeof fetchAndCacheProduct>

  beforeEach(() => {
    bookingService = new BookingService()
    jest.clearAllMocks()
    
    // Mock product fetch to return valid price options
    mockFetchProduct.mockResolvedValue({
      productCode: 'TOUR001',
      name: 'Test Tour',
      priceOptions: [
        { id: '1', label: 'Adult', price: 100 },
        { id: '2', label: 'Child', price: 50 },
        { id: '3', label: 'Infant', price: 0 }
      ],
      quantityRequiredMin: 1,
      quantityRequiredMax: 10
    } as any)
  })

  describe('registerBooking', () => {
    it('should successfully register a booking with valid data', async () => {
      const bookingData = createMockBookingFormData()
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      // Mock successful Rezdy API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orderNumber: 'RZ123456',
          status: 'CONFIRMED',
          customer: {
            firstName: 'Contact',
            lastName: 'Person',
            email: 'contact@example.com'
          }
        })
      } as Response)

      const result = await bookingService.registerBooking(request)

      expect(result.success).toBe(true)
      expect(result.orderNumber).toBe('RZ123456')
      expect(result.paymentConfirmation).toEqual(paymentConfirmation)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('bookings?apiKey='),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('CONFIRMED')
        })
      )
    })

    it('should fail when payment validation fails', async () => {
      const bookingData = createMockBookingFormData()
      const paymentConfirmation = createMockPaymentConfirmation({
        status: 'failed'
      })
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      const result = await bookingService.registerBooking(request)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Payment validation failed')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fail when booking data validation fails', async () => {
      const bookingData = createMockBookingFormData({
        guests: [],
        guestCounts: { adults: 0, children: 0, infants: 0 }
      })
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      const result = await bookingService.registerBooking(request)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Booking data validation failed')
      expect(result.error).toContain('At least one guest or guest counts are required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fail when amounts do not match', async () => {
      const bookingData = createMockBookingFormData({
        pricing: {
          basePrice: 200,
          sessionPrice: 200,
          subtotal: 200,
          taxAndFees: 20,
          total: 220
        }
      })
      const paymentConfirmation = createMockPaymentConfirmation({
        amount: 100 // Different from booking total
      })
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      const result = await bookingService.registerBooking(request)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Amount mismatch')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle Rezdy API error responses', async () => {
      const bookingData = createMockBookingFormData()
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      // Mock Rezdy API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => JSON.stringify({
          requestStatus: {
            error: {
              errorCode: '10',
              errorMessage: 'Missing required field: customer.phone'
            }
          }
        })
      } as Response)

      const result = await bookingService.registerBooking(request)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Booking validation failed')
      expect(result.error).toContain('Missing required field')
    })

    it('should handle payment type mapping correctly', async () => {
      const bookingData = createMockBookingFormData({
        payment: {
          method: 'cash',
          transactionId: 'cash_123',
          amount: 200,
          currency: 'AUD',
          timestamp: new Date().toISOString()
        }
      })
      const paymentConfirmation = createMockPaymentConfirmation({
        paymentMethod: 'cash'
      })
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderNumber: 'RZ123456' })
      } as Response)

      await bookingService.registerBooking(request)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"type":"CASH"')
        })
      )
    })

    it('should apply emergency fixes for missing payment data', async () => {
      const bookingData = createMockBookingFormData({
        payment: undefined // Missing payment data
      })
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderNumber: 'RZ123456' })
      } as Response)

      const result = await bookingService.registerBooking(request)

      expect(result.success).toBe(true)
      // Verify that payment was added with correct structure
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"type":"CREDITCARD"')
        })
      )
    })

    it('should handle network errors gracefully', async () => {
      const bookingData = createMockBookingFormData()
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await bookingService.registerBooking(request)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
      expect(result.paymentConfirmation).toEqual(paymentConfirmation)
    })

    it('should validate price option labels against product data', async () => {
      const bookingData = createMockBookingFormData({
        guests: [
          {
            id: '1',
            type: 'ADULT', // Using valid type
            firstName: 'John',
            lastName: 'Doe',
            age: 65
          }
        ]
      })
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderNumber: 'RZ123456' })
      } as Response)

      const result = await bookingService.registerBooking(request)

      // Should succeed with proper price option mapping
      expect(result.success).toBe(true)
    })

    it('should include participants in booking items', async () => {
      const bookingData = createMockBookingFormData() // Already has guests in default
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderNumber: 'RZ123456' })
      } as Response)

      await bookingService.registerBooking(request)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"participants"')
        })
      )
    })

    it('should simulate booking in development mode without API key', async () => {
      // Remove API key to simulate development mode
      const originalApiKey = process.env.REZDY_API_KEY
      const originalNodeEnv = process.env.NODE_ENV
      process.env.REZDY_API_KEY = ''
      process.env.NODE_ENV = 'development'
      
      // Create a new instance with the updated environment
      const devBookingService = new BookingService()
      
      const bookingData = createMockBookingFormData()
      const paymentConfirmation = createMockPaymentConfirmation()
      const request: BookingRequest = {
        bookingData,
        paymentConfirmation
      }

      const result = await devBookingService.registerBooking(request)

      expect(result.success).toBe(true)
      expect(result.orderNumber).toMatch(/^DEV-\d+-\d+$/)
      expect(mockFetch).not.toHaveBeenCalled()
      
      // Restore env
      process.env.REZDY_API_KEY = originalApiKey
      process.env.NODE_ENV = originalNodeEnv
    })
  })

  describe('createBookingRequest', () => {
    it('should create a booking request from form data and payment confirmation', () => {
      const bookingData = createMockBookingFormData()
      const paymentConfirmation = createMockPaymentConfirmation()

      const request = BookingService.createBookingRequest(bookingData, paymentConfirmation)

      expect(request).toEqual({
        bookingData,
        paymentConfirmation
      })
    })
  })

  describe('createPaymentConfirmation', () => {
    it('should create payment confirmation from payment response', () => {
      const paymentResponse = {
        transactionId: 'trans_789',
        amount: 150,
        currency: 'AUD',
        paymentMethod: 'stripe',
        orderReference: 'order_789'
      }

      const confirmation = BookingService.createPaymentConfirmation(paymentResponse)

      expect(confirmation).toMatchObject({
        transactionId: 'trans_789',
        amount: 150,
        currency: 'AUD',
        status: 'success',
        paymentMethod: 'stripe',
        orderReference: 'order_789'
      })
      expect(confirmation.timestamp).toBeDefined()
    })

    it('should use default currency if not provided', () => {
      const paymentResponse = {
        transactionId: 'trans_789',
        amount: 150,
        paymentMethod: 'stripe'
      }

      const confirmation = BookingService.createPaymentConfirmation(paymentResponse)

      expect(confirmation.currency).toBe('AUD')
    })
  })
})