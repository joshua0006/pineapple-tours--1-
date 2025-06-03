"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Cart, CartItem, CartContextType, CartExtra } from '@/lib/types/cart'

// Initial cart state
const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  currency: 'USD'
}

// Cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'dateAdded'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart }

// Cart reducer
function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        ...action.payload,
        id: `${action.payload.product.productCode}-${action.payload.session.id}-${Date.now()}`,
        dateAdded: new Date()
      }
      
      const newItems = [...state.items, newItem]
      const totalItems = newItems.length
      const totalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const totalItems = newItems.length
      const totalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      }
    }
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      )
      const totalItems = newItems.length
      const totalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      }
    }
    
    case 'CLEAR_CART':
      return initialCart
    
    case 'LOAD_CART':
      return action.payload
    
    default:
      return state
  }
}

// Cart context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Cart provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('pineapple-tours-cart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        // Ensure dates are properly parsed
        const cartWithDates = {
          ...parsedCart,
          items: parsedCart.items.map((item: any) => ({
            ...item,
            dateAdded: new Date(item.dateAdded)
          }))
        }
        dispatch({ type: 'LOAD_CART', payload: cartWithDates })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('pineapple-tours-cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart])

  // Calculate total price for a cart item
  const calculateItemTotal = (
    basePrice: number,
    participants: CartItem['participants'],
    extras: CartExtra[]
  ): number => {
    const participantTotal = participants.adults + (participants.children || 0)
    const baseTotal = basePrice * participantTotal
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.totalPrice, 0)
    return baseTotal + extrasTotal
  }

  const addToCart = (item: Omit<CartItem, 'id' | 'dateAdded'>) => {
    // Calculate total price if not provided
    const totalPrice = item.totalPrice || calculateItemTotal(
      item.session.totalPrice || item.product.advertisedPrice || 0,
      item.participants,
      item.selectedExtras
    )
    
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, totalPrice }
    })
  }

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId })
  }

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, updates } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const isInCart = (productCode: string, sessionId: string): boolean => {
    return cart.items.some(
      item => item.product.productCode === productCode && item.session.id === sessionId
    )
  }

  const getCartItemCount = (): number => {
    return cart.totalItems
  }

  const getCartTotal = (): number => {
    return cart.totalPrice
  }

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    isInCart,
    getCartItemCount,
    getCartTotal
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 