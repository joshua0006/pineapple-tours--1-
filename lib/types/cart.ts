import { RezdyProduct, RezdySession, RezdyExtra } from './rezdy'

export interface CartItem {
  id: string
  product: RezdyProduct
  session: RezdySession
  participants: {
    adults: number
    children?: number
    infants?: number
  }
  selectedExtras: CartExtra[]
  totalPrice: number
  dateAdded: Date
}

export interface CartExtra {
  extra: RezdyExtra
  quantity: number
  totalPrice: number
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  currency: string
}

export interface CartContextType {
  cart: Cart
  addToCart: (item: Omit<CartItem, 'id' | 'dateAdded'>) => void
  removeFromCart: (itemId: string) => void
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  isInCart: (productCode: string, sessionId: string) => boolean
  getCartItemCount: () => number
  getCartTotal: () => number
}

export interface AddToCartData {
  product: RezdyProduct
  session: RezdySession
  participants: {
    adults: number
    children?: number
    infants?: number
  }
  selectedExtras?: CartExtra[]
} 