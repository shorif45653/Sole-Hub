import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WishlistContext = createContext(null)
const WISHLIST_KEY = 'solehub_wishlist'

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || '[]')
      setItems(Array.isArray(saved) ? saved : [])
    } catch {
      setItems([])
    }
  }, [])

  const persist = nextItems => {
    setItems(nextItems)
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(nextItems))
  }

  const isWishlisted = productId => items.some(item => item.id === productId)

  const toggleWishlist = product => {
    const nextItems = isWishlisted(product.id)
      ? items.filter(item => item.id !== product.id)
      : [...items, product]
    persist(nextItems)
    return !isWishlisted(product.id)
  }

  const removeFromWishlist = productId => persist(items.filter(item => item.id !== productId))
  const clearWishlist = () => persist([])

  const value = useMemo(() => ({ items, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist }), [items])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}