// ============================================================
// Database types matching the Supabase `users` table
// ============================================================

export type UserRole = 'CLIENT' | 'DRIVER'
export type AccountStatus = 'Active' | 'Suspended' | 'Pending Verification' | 'Deactivated'
export type PaymentMethod = 'Bank Transfer' | 'Mobile Money' | 'Credit Card' | 'EcoCash' | 'PayPal'
export type AvailabilityStatus = 'Available' | 'Unavailable'

export interface DbUser {
  // Auth & Identity
  user_id: string
  role: UserRole
  email: string
  password: string
  name: string
  phone: string | null
  city: string | null
  address: string | null

  // Profile Media
  profile_picture_url: string | null
  company_logo_url: string | null

  // Account Status
  account_status: AccountStatus
  created_at: string
  updated_at: string
  last_login: string | null

  // Client-Specific (NULL for drivers)
  company_name: string | null
  payment_verified: boolean | null
  payment_method_type: PaymentMethod | null
  total_spent_usd: number | null

  // Driver-Specific (NULL for clients)
  title: string | null
  specialization: string | null
  bio: string | null
  skill_tags: string | null
  total_earnings_usd: number | null
  average_rating: number | null
  total_kilometres: number | null
  driver_ranking: string | null
  availability: AvailabilityStatus | null
  acceptance_rate_pct: number | null
  profile_views: number | null
  profile_clicks: number | null
}

/** Fields safe to expose client-side (excludes password) */
export type SafeUser = Omit<DbUser, 'password'>

/** Convenience type for driver rows */
export type Driver = SafeUser & { role: 'DRIVER' }

/** Convenience type for client rows */
export type Client = SafeUser & { role: 'CLIENT' }

// Columns to select (excluding sensitive auth fields)
export const SAFE_USER_COLUMNS = `
  user_id, role, email, name, phone, city, address,
  profile_picture_url, company_logo_url,
  account_status, created_at, updated_at, last_login,
  company_name, payment_verified, payment_method_type, total_spent_usd,
  title, specialization, bio, skill_tags,
  total_earnings_usd, average_rating, total_kilometres, driver_ranking,
  availability, acceptance_rate_pct, profile_views, profile_clicks
` as const
