import { createClient } from '@/lib/supabase/server'
import { SAFE_USER_COLUMNS } from '@/lib/types/database'
import type { SafeUser } from '@/lib/types/database'

/**
 * Get the currently authenticated user's profile from the `users` table.
 * Returns null if not authenticated or if the record doesn't exist.
 * For use in Server Components only.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select(SAFE_USER_COLUMNS)
    .eq('user_id', user.id)
    .single()

  return (data as SafeUser) ?? null
}
