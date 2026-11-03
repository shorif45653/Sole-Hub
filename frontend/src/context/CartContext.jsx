import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const GUEST_CART_KEY = 'solehub_guest_cart'

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch cart from database (for authenticated users)
  const fetchCart = useCallback(async () => {
    if (!user) {
      try {
        const guestItems = JSON.parse(window.localStorage.getItem(GUEST_CART_KEY) || '[]')
        setItems(Array.isArray(guestItems) ? guestItems : [])
      } catch {
        setItems([])
      }
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products!inner (
            id, name, brand, price, discount_price, images, sizes, colors, stock, is_active
          )
        `)
        .eq('user_id', user.id)
      
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('Fetch cart error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Add to cart
  const addToCart = async (productId, size, color = null, quantity = 1, product = null) => {
    setError(null)
    
    if (!user) {
      const existingItem = items.find(item => item.product_id === productId && item.size === size && item.color === color)
      const guestItems = existingItem
        ? items.map(item => item.id === existingItem.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, {
            id: `guest-${productId}-${size}-${color || 'default'}`,
            product_id: productId,
            size,
            color,
            quantity,
            products: product
          }]
      window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems))
      setItems(guestItems)
      return { success: true }
    }

    try {
      // Check if item already exists in cart
      const existingItem = items.find(
        item => item.product_id === productId && item.size === size && item.color === color
      )

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
        
        if (error) throw error
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            size,
            color,
            quantity
          })
        
        if (error) throw error
      }

      await fetchCart()
      return { success: true }
    } catch (err) {
      console.error('Add to cart error:', err)
      setError(err.message)
      return { success: false, error: err }
    }
  }

  // Update quantity
  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return removeFromCart(cartItemId)
    
    setError(null)
    if (!user) {
      const guestItems = items.map(item => item.id === cartItemId ? { ...item, quantity } : item)
      window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems))
      setItems(guestItems)
      return { success: true }
    }
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
      
      if (error) throw error
      await fetchCart()
      return { success: true }
    } catch (err) {
      console.error('Update quantity error:', err)
      setError(err.message)
      return { success: false, error: err }
    }
  }

  // Remove from cart
  const removeFromCart = async (cartItemId) => {
    setError(null)
    if (!user) {
      const guestItems = items.filter(item => item.id !== cartItemId)
      window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems))
      setItems(guestItems)
      return { success: true }
    }
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
      
      if (error) throw error
      await fetchCart()
      return { success: true }
    } catch (err) {
      console.error('Remove from cart error:', err)
      setError(err.message)
      return { success: false, error: err }
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (!user) {
      window.localStorage.removeItem(GUEST_CART_KEY)
      setItems([])
      return { success: true }
    }
    
    setError(null)
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
      
      if (error) throw error
      setItems([])
      return { success: true }
    } catch (err) {
      console.error('Clear cart error:', err)
      setError(err.message)
      return { success: false, error: err }
    }
  }

  // Calculate totals
  const getCartTotals = () => {
    let subtotal = 0
    let itemCount = 0
    
    items.forEach(item => {
      if (item.products && item.products.is_active) {
        const price = item.products.discount_price || item.products.price
        subtotal += price * item.quantity
        itemCount += item.quantity
      }
    })
    
    const shipping = subtotal > 0 ? (subtotal >= 2999 ? 0 : 99) : 0
    const total = subtotal + shipping
    
    return { subtotal, shipping, total, itemCount }
  }

  // Check if cart has unavailable items
  const validateCart = () => {
    const issues = []
    items.forEach(item => {
      if (!item.products) {
        issues.push({ type: 'removed', item, message: 'Product no longer available' })
      } else if (!item.products.is_active) {
        issues.push({ type: 'inactive', item, message: 'Product is no longer available' })
      } else if (item.products.stock < item.quantity) {
        issues.push({ type: 'stock', item, message: `Only ${item.products.stock} left in stock` })
      }
    })
    return issues
  }

  const value = {
    items,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotals,
    validateCart,
    refreshCart: fetchCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}