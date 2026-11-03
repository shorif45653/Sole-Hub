import { supabase } from './supabase'

/**
 * Admin service for dashboard and management operations
 */

// Get dashboard statistics
export const getDashboardStats = async () => {
  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: totalCustomers },
    { count: totalOrders },
    { count: pendingOrders },
    { count: successfulPayments },
    { data: ordersData }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PLACED'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'SUCCESS'),
    supabase.from('orders').select('total_amount').eq('payment_status', 'SUCCESS')
  ])

  const totalDemoRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

  return {
    totalProducts: totalProducts || 0,
    activeProducts: activeProducts || 0,
    totalCustomers: totalCustomers || 0,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    successfulPayments: successfulPayments || 0,
    totalDemoRevenue
  }
}

// Get all users (admin)
export const getAllUsers = async (filters = {}) => {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.role) {
    query = query.eq('role', filters.role)
  }
  if (filters.search) {
    query = query.ilike('full_name', `%${filters.search}%`)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: data || [], count }
}

// Update user role (admin only)
export const updateUserRole = async (userId, role) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get product for admin (includes inactive)
export const getProductByIdAdmin = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Get all products for admin
export const getAllProductsAdmin = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: data || [], count }
}
// Toggle product active status (admin)
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

// Delete product (admin)
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (!error) return { deleted: true, deactivated: false }

  // Products referenced by order_items must remain for order history.
  if (error.code === '23503') {
    const { data, error: deactivateError } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (deactivateError) throw deactivateError
    return { deleted: false, deactivated: true, product: data }
  }

  throw error
}

export const createProductAdmin = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateProductAdmin = async (id, productData) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

import { generateUUID } from '../utils/validation'

export const uploadProductImage = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase()
  const path = `${generateUUID()}.${extension}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  })

  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return { path, url: data.publicUrl }
}
