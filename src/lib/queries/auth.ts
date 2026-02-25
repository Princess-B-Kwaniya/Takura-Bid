import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SAFE_USER_COLUMNS } from '@/lib/types/database'
import type { SafeUser } from '@/lib/types/database'

/**
 * Get the current user's profile from the `users` table using the session cookie.
 * Pass the NextRequest when calling from a Route Handler so it reads cookies
 * directly from req.cookies (same source as middleware — more reliable).
 */
export async function getCurrentUser(req?: NextRequest): Promise<SafeUser | null> {
  let userId: string | undefined

  if (req) {
    userId = req.cookies.get('takura_user')?.value
  } else {
    const cookieStore = await cookies()
    userId = cookieStore.get('takura_user')?.value
  }

  if (!userId) return null

  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('user_id', userId)
    .single()

  return (data as SafeUser) ?? null
}
