import { isSupabaseConfigured, supabase } from './supabase'

/**
 * Product service for fetching and managing products
 */

// Get all active products with optional filters
export const getProducts = async (filters = {}) => {
  if (!isSupabaseConfigured || !supabase) return { data: [], count: 0 }
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Category filter
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  // Brand filter
  if (filters.brand && filters.brand !== 'all') {
    query = query.eq('brand', filters.brand)
  }

  // Search query
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Price range
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  // Size filter
  if (filters.size) {
    query = query.contains('sizes', [filters.size])
  }

  // Color filter
  if (filters.color) {
    query = query.contains('colors', [filters.color])
  }

  // Sorting
  switch (filters.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'popular':
      query = query.order('created_at', { ascending: false }) // Could add popularity field later
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  // Pagination
  if (filters.page && filters.limit) {
    const from = (filters.page - 1) * filters.limit
    const to = from + filters.limit - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query
  
  if (error) throw error
  return { data: data || [], count }
}

// Get single product by ID
export const getProductById = async (id) => {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Get featured products
export const getFeaturedProducts = async (limit = 4) => {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

// Get related products (same category, different product)
export const getRelatedProducts = async (productId, category, limit = 4) => {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .neq('id', productId)
    .limit(limit)
  
  if (error) throw error
  return data || []
}

// Get all categories
export const getCategories = async () => {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true)
  
  if (error) throw error
  const categoryOrder = ['Lifestyle', 'Running', 'Formal', 'Basketball', 'Training']
  const categories = [...new Set(data.map(p => p.category))].filter(Boolean).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
  return categories
}

// Get all brands
export const getBrands = async () => {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('products')
    .select('brand')
    .eq('is_active', true)
  
  if (error) throw error
  const brands = [...new Set(data.map(p => p.brand))].filter(Boolean)
  return brands
}

// Admin: Create product
export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Admin: Update product
export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Admin: Delete product
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Admin: Toggle product active status
export const toggleProductStatus = async (id, isActive) => {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}
