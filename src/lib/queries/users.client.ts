'use client'

import { createClient } from '@/lib/supabase/client'
import { SAFE_USER_COLUMNS, type Driver } from '@/lib/types/database'

/**
 * Client-side: Fetch all drivers with optional search filter.
 */
export async function fetchDrivers(search?: string): Promise<Driver[]> {
  const supabase = createClient()
  if (!supabase) return []

  let query = supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('role', 'DRIVER')
    .order('average_rating', { ascending: false })

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,skill_tags.ilike.%${search}%,city.ilike.%${search}%,title.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching drivers:', error.message)
    return []
  }

  return (data ?? []) as Driver[]
}
