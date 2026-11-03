import { supabase } from './supabase'

/**
 * Address service for managing user shipping/billing addresses
 */

// Get all addresses for a user (default first, then newest)
export const getAddresses = async (userId) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get a single address by id
export const getAddressById = async (id) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Internal: clear the default flag on all of a user's addresses
const clearDefaultAddress = async (userId) => {
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true)

  if (error) throw error
}

// Create a new address
export const createAddress = async (userId, addressData) => {
  const payload = {
    ...addressData,
    user_id: userId
  }

  // If this address is marked default, unset the others first
  if (payload.is_default) {
    await clearDefaultAddress(userId)
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

// Update an existing address
export const updateAddress = async (id, userId, updates) => {
  if (updates.is_default) {
    await clearDefaultAddress(userId)
  }

  const { data, error } = await supabase
    .from('addresses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete an address
export const deleteAddress = async (id, userId) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

// Mark an address as the default one
export const setDefaultAddress = async (id, userId) => {
  await clearDefaultAddress(userId)

  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
