import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SAFE_USER_COLUMNS } from '@/lib/types/database'
import type { SafeUser } from '@/lib/types/database'

/**
 * Get the current user's profile from the `users` table using the session cookie.
 * For use in Server Components only.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('takura_user')?.value
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
