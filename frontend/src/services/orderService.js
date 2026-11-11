import { supabase } from './supabase'

/**
 * Order service for managing orders and checkout
 */

// Create order with transaction safety
export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .rpc('create_order', orderData)
  
  if (error) throw error
  return data
}

// Get user's orders
export const getUserOrders = async (userId, options = {}) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (id, name, brand, images)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options.status) {
    query = query.eq('order_status', options.status)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Get single order by ID
export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (id, name, brand, images)
      )
    `)
    .eq('id', orderId)
    .single()
  
  if (error) throw error
  return data
}

// Get order by ID for admin (with user info)
export const getOrderByIdAdmin = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (id, full_name, email),
      order_items (
        *,
        products (id, name, brand, images)
      )
    `)
    .eq('id', orderId)
    .single()
  
  if (error) throw error
  return data
}

// Update order status (admin)
export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Cancel a customer's order before it is confirmed
export const cancelOrder = async (orderId) => {
  const { data, error } = await supabase.rpc('cancel_order', {
    p_order_id: orderId
  })

  if (error) {
    if (error.code === 'PGRST202' || error.message?.includes('Could not find the function')) {
      throw new Error('Order cancellation is not enabled in Supabase yet. Run supabase/migrations/012_fix_cancel_order_rpc.sql in the Supabase SQL Editor, then try again.')
    }

    throw error
  }

  return data
}

// Get all orders (admin)
export const getAllOrders = async (filters = {}) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      profiles (id, full_name, email),
      order_items (id, quantity, unit_price)
    `)
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('order_status', filters.status)
  }
  if (filters.paymentStatus) {
    query = query.eq('payment_status', filters.paymentStatus)
  }
  if (filters.search) {
    query = query.or(`id.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%,profiles.email.ilike.%${filters.search}%`)
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

import { generateUUID } from '../utils/validation'

// Generate idempotency key
export const generateIdempotencyKey = () => {
  return generateUUID()
}