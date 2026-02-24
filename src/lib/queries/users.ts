import { createClient } from '@/lib/supabase/server'
import { SAFE_USER_COLUMNS, type SafeUser, type Driver, type Client } from '@/lib/types/database'

/**
 * Get all drivers, optionally filtered by availability. Sorted by rating DESC.
 */
export async function getDrivers(availableOnly = false): Promise<Driver[]> {
  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('role', 'DRIVER')
    .order('average_rating', { ascending: false })

  if (availableOnly) {
    query = query.eq('availability', 'Available')
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching drivers:', error.message)
    return []
  }

  return (data ?? []) as Driver[]
}

/**
 * Get all clients. Sorted by total_spent DESC.
 */
export async function getClients(): Promise<Client[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('role', 'CLIENT')
    .order('total_spent_usd', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error.message)
    return []
  }

  return (data ?? []) as Client[]
}

/**
 * Get a single user by user_id.
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }

  return data as SafeUser
}

/**
 * Get a user by their email address.
 */
export async function getUserByEmail(email: string): Promise<SafeUser | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('email', email)
    .single()

  if (error) {
    console.error('Error fetching user by email:', error.message)
    return null
  }

  return data as SafeUser
}

/**
 * Search drivers by skill tag (case-insensitive ILIKE).
 */
export async function searchDriversBySkill(skill: string): Promise<Driver[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('role', 'DRIVER')
    .ilike('skill_tags', `%${skill}%`)
    .order('average_rating', { ascending: false })

  if (error) {
    console.error('Error searching drivers:', error.message)
    return []
  }

  return (data ?? []) as Driver[]
}

/**
 * Get top-earning drivers.
 */
export async function getTopDrivers(limit = 5): Promise<Driver[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('role', 'DRIVER')
    .order('total_earnings_usd', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top drivers:', error.message)
    return []
  }

  return (data ?? []) as Driver[]
}
