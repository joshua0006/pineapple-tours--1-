import {
  transformBookingDataToRezdy,
  validateBookingDataForRezdy,
  createRezdyQuantities,
  transformContactToCustomer,
  BookingFormData
} from '../booking-transform'
import { RezdyBooking, RezdyQuantity, RezdyCustomer } from '@/lib/types/rezdy'
import { getCorrectPriceOptionLabel } from '@/lib/utils/rezdy-product-cache'

// Mock the rezdy-product-cache module
jest.mock('@/lib/utils/rezdy-product-cache', () => ({
  getCorrectPriceOptionLabel: jest.fn(),
  fetchAndCacheProduct: jest.fn()
}))

// Mock data builders
const createMockGuest = (overrides: Partial<BookingFormData['guests'][0]> = {}): BookingFormData['guests'][0] => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  type: 'ADULT',
  ...overrides
})

const createMockGuestCounts = (overrides: Partial<BookingFormData['guestCounts']> = {}): BookingFormData['guestCounts'] => ({
  adults: 2,
  children: 0,
  infants: 0,
  ...overrides
})

const createMockSelectedPriceOptions = (): BookingFormData['selectedPriceOptions'] => ({
  adult: { id: 1, label: 'Adult', price: 100 },
  child: { id: 2, label: 'Child', price: 50 },
  infant: { id: 3, label: 'Infant', price: 0 }
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
  guests: [],
  contact: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+61 412 345 678',
    country: 'Australia'
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
  guestCounts: createMockGuestCounts(),
  selectedPriceOptions: createMockSelectedPriceOptions(),
  ...overrides
})

describe('booking-transform', () => {
  const mockGetCorrectPriceOptionLabel = getCorrectPriceOptionLabel as jest.MockedFunction<typeof getCorrectPriceOptionLabel>

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the function to return proper labels based on type
    mockGetCorrectPriceOptionLabel.mockImplementation((productCode: string, type: string) => {
      if (type === 'adult') return 'Adult'
      if (type === 'child') return 'Child'
      if (type === 'infant') return 'Infant'
      return null
    })
  })

  describe('createRezdyQuantities', () => {
    it('should create quantities from individual guest details', () => {
      const guests = [
        createMockGuest({ type: 'ADULT' }),
        createMockGuest({ type: 'ADULT' }),
        createMockGuest({ type: 'CHILD', age: 8 })
      ]
      const selectedPriceOptions = createMockSelectedPriceOptions()

      const quantities = createRezdyQuantities(guests, selectedPriceOptions, undefined, 'TOUR001')

      expect(quantities).toHaveLength(2)
      expect(quantities[0]).toEqual({
        optionLabel: 'Adult',
        value: 2
      })
      expect(quantities[1]).toEqual({
        optionLabel: 'Child',
        value: 1
      })
    })

    it('should create quantities from guest counts when no individual guests', () => {
      const guestCounts = createMockGuestCounts({ adults: 3, children: 2 })
      const selectedPriceOptions = createMockSelectedPriceOptions()

      const quantities = createRezdyQuantities([], selectedPriceOptions, guestCounts, 'TOUR001')

      expect(quantities).toHaveLength(2)
      expect(quantities[0]).toEqual({
        optionLabel: 'Adult',
        value: 3
      })
      expect(quantities[1]).toEqual({
        optionLabel: 'Child',
        value: 2
      })
    })

    it('should handle infants correctly', () => {
      const guestCounts = createMockGuestCounts({ adults: 2, infants: 1 })
      const selectedPriceOptions = createMockSelectedPriceOptions()

      const quantities = createRezdyQuantities([], selectedPriceOptions, guestCounts, 'TOUR001')

      expect(quantities).toHaveLength(2)
      expect(quantities).toContainEqual({
        optionLabel: 'Adult',
        value: 2
      })
      expect(quantities).toContainEqual({
        optionLabel: 'Infant',
        value: 1
      })
    })

    it('should handle missing price options gracefully', () => {
      const guests = [
        createMockGuest({ type: 'ADULT' })
      ]
      // No selected price options
      const quantities = createRezdyQuantities(guests, undefined, undefined, 'TOUR001')

      expect(quantities).toHaveLength(1)
      expect(quantities[0]).toEqual({
        optionLabel: 'Adult',
        value: 1
      })
    })

    it('should return empty array when no guests', () => {
      const quantities = createRezdyQuantities([], undefined, createMockGuestCounts({ adults: 0, children: 0 }), 'TOUR001')
      expect(quantities).toHaveLength(0)
    })
  })

  describe('transformContactToCustomer', () => {
    it('should transform contact details to Rezdy customer', () => {
      const contact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+61 412 345 678',
        country: 'Australia',
        emergencyContact: 'Emergency Contact',
        emergencyPhone: '+61 400 000 000'
      }

      const customer = transformContactToCustomer(contact)

      expect(customer).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+61 412 345 678'
      })
    })

    it('should handle missing optional fields', () => {
      const contact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+61 412 345 678'
      }

      const customer = transformContactToCustomer(contact)

      expect(customer).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+61 412 345 678'
      })
    })
  })

  describe('validateBookingDataForRezdy', () => {
    it('should validate valid booking data with guests', () => {
      const bookingData = createMockBookingFormData({
        guests: [createMockGuest()]
      })

      const result = validateBookingDataForRezdy(bookingData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate valid booking data with guest counts', () => {
      const bookingData = createMockBookingFormData({
        guests: [],
        guestCounts: createMockGuestCounts({ adults: 2, children: 1 })
      })

      const result = validateBookingDataForRezdy(bookingData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when no guests', () => {
      const bookingData = createMockBookingFormData({
        guests: [],
        guestCounts: createMockGuestCounts({ adults: 0, children: 0 })
      })

      const result = validateBookingDataForRezdy(bookingData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one guest or guest counts are required')
    })

    it('should fail when missing contact details', () => {
      const bookingData = createMockBookingFormData({
        contact: {
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        }
      })

      const result = validateBookingDataForRezdy(bookingData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Contact first name is required')
      expect(result.errors).toContain('Contact last name is required')
      expect(result.errors).toContain('Contact email is required')
      // Phone is not required in the validation function
    })

    it('should fail when missing product details', () => {
      const bookingData = createMockBookingFormData({
        product: {
          code: '',
          name: ''
        }
      })

      const result = validateBookingDataForRezdy(bookingData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Product code is required')
    })

    it('should fail when missing session details', () => {
      const bookingData = createMockBookingFormData({
        session: {
          id: '',
          startTime: '',
          endTime: ''
        }
      })

      const result = validateBookingDataForRezdy(bookingData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Session ID is required')
      expect(result.errors).toContain('Session start time is required')
    })

    it('should not fail when payment is missing (optional)', () => {
      const bookingData = createMockBookingFormData({
        payment: undefined,
        guests: [createMockGuest()]
      })

      const result = validateBookingDataForRezdy(bookingData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('transformBookingDataToRezdy', () => {
    it('should transform complete booking data to Rezdy format', () => {
      const bookingData = createMockBookingFormData({
        guests: [
          createMockGuest({ id: '1', type: 'ADULT' }),
          createMockGuest({ id: '2', type: 'CHILD', age: 8 })
        ],
        guestCounts: undefined, // Let it calculate from guests
        session: {
          id: 'session123',
          startTime: '2024-12-25T09:00:00Z',
          endTime: '2024-12-25T12:00:00Z'
        }
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      expect(rezdyBooking.status).toBe('CONFIRMED')
      expect(rezdyBooking.customer.firstName).toBe('Jane')
      expect(rezdyBooking.customer.lastName).toBe('Smith')
      expect(rezdyBooking.customer.email).toBe('jane@example.com')
      expect(rezdyBooking.customer.phone).toBe('+61 412 345 678')
      
      expect(rezdyBooking.items).toHaveLength(1)
      expect(rezdyBooking.items[0].productCode).toBe('TOUR001')
      // startTime is not set, only startTimeLocal
      expect(rezdyBooking.items[0].startTimeLocal).toBe('2024-12-25T09:00:00Z')
      
      // We have 1 adult and 1 child guest
      expect(rezdyBooking.items[0].quantities).toHaveLength(2)
      expect(rezdyBooking.items[0].quantities).toContainEqual({
        optionLabel: 'Adult',
        value: 1
      })
      expect(rezdyBooking.items[0].quantities).toContainEqual({
        optionLabel: 'Child',
        value: 1
      })
    })

    it('should handle payment information correctly', () => {
      const bookingData = createMockBookingFormData({
        payment: {
          method: 'credit_card',
          type: 'CREDITCARD'
        },
        guests: [createMockGuest()]
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      expect(rezdyBooking.payments).toHaveLength(1)
      expect(rezdyBooking.payments![0]).toEqual({
        amount: 220, // Total amount from pricing
        type: 'CREDITCARD',
        recipient: 'SUPPLIER',
        label: 'Paid by Credit Card'
      })
    })

    it('should map cash payment correctly', () => {
      const bookingData = createMockBookingFormData({
        payment: {
          method: 'cash',
          type: 'CASH'
        },
        guests: [createMockGuest()]
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      expect(rezdyBooking.payments![0].type).toBe('CASH')
      expect(rezdyBooking.payments![0].label).toBe('Paid in cash')
    })

    it('should handle pickup location', () => {
      const bookingData = createMockBookingFormData({
        session: {
          id: 'session123',
          startTime: '2024-12-25T09:00:00Z',
          endTime: '2024-12-25T12:00:00Z',
          pickupLocation: {
            id: 'pickup1',
            name: 'Hotel Pickup',
            address: '123 Main St'
          }
        },
        guests: [createMockGuest()]
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      // Pickup location is now at top level
      expect((rezdyBooking as any).pickupLocation).toEqual({
        locationName: 'Hotel Pickup'
      })
    })

    it('should handle special requirements', () => {
      const bookingData = createMockBookingFormData({
        contact: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+61 412 345 678',
          country: 'Australia',
          specialRequests: 'Vegetarian meal required'
        },
        guests: [createMockGuest()]
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      // Comments now contain booking metadata
      expect(rezdyBooking.comments).toContain('Booked at:')
      expect(rezdyBooking.comments).toContain('Total Guests:')
      expect(rezdyBooking.fields).toHaveLength(2) // Special Requirements + Country
      expect(rezdyBooking.fields![0]).toEqual({
        label: 'Special Requirements',
        value: 'Vegetarian meal required'
      })
    })

    it('should handle selected extras', () => {
      const bookingData = createMockBookingFormData({
        extras: [
          {
            id: 'extra1',
            name: 'Lunch',
            price: 20,
            quantity: 2,
            totalPrice: 40
          }
        ],
        guests: [createMockGuest()]
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      // Extras are now included in the booking items
      expect(rezdyBooking.items[0].extras).toHaveLength(1)
      expect(rezdyBooking.items[0].extras![0]).toEqual({
        name: 'Lunch',
        quantity: 2
      })
    })

    it('should handle participants list correctly', () => {
      const bookingData = createMockBookingFormData({
        guests: [
          createMockGuest({ 
            firstName: 'John', 
            lastName: 'Doe',
            type: 'ADULT'
          }),
          createMockGuest({ 
            firstName: 'Jane', 
            lastName: 'Doe',
            type: 'ADULT'
          })
        ]
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      // Participants now include detailed fields
      expect(rezdyBooking.items[0].participants).toHaveLength(2)
      expect(rezdyBooking.items[0].participants![0]).toEqual({
        fields: [
          { label: 'First Name', value: 'John' },
          { label: 'Last Name', value: 'Doe' },
          { label: 'Age', value: '30' },
          { label: 'Type', value: 'ADULT' }
        ]
      })
    })

    it('should handle missing payment data gracefully', () => {
      const bookingData = createMockBookingFormData({
        payment: undefined,
        guests: [createMockGuest()]
      })

      const rezdyBooking = transformBookingDataToRezdy(bookingData)

      expect(rezdyBooking.payments).toHaveLength(1)
      expect(rezdyBooking.payments![0]).toEqual({
        amount: 220, // Uses pricing.total
        type: 'CREDITCARD', // Default
        recipient: 'SUPPLIER',
        label: 'Credit Card Payment'
      })
    })
  })
})