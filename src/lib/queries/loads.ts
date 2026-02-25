import { createClient } from '@/lib/supabase/server'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DbLoad {
  load_id: string
  client_id: string
  title: string
  cargo_type: string
  weight_tons: number
  origin_city: string
  destination_city: string
  distance_km: number
  budget_usd: number
  pickup_date: string
  delivery_date: string
  trip_type: string
  urgency: string
  description: string | null
  requirements: string[] | null
  status: string
  assigned_driver_id: string | null
  bids_count: number
  posted_at: string
}

export interface DbBid {
  bid_id: string
  load_id: string
  driver_id: string
  amount_usd: number
  message: string | null
  status: string
  submitted_at: string
}

export interface DbJob {
  job_id: string
  load_id: string
  driver_id: string
  client_id: string
  rate_usd: number
  status: string
  progress_pct: number
  started_at: string | null
  completed_at: string | null
}

export interface DbMessage {
  message_id: string
  job_id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  sent_at: string
}

export interface LoadWithClient extends DbLoad {
  client: {
    user_id: string
    name: string
    company_name: string | null
    payment_verified: boolean | null
    total_spent_usd: number | null
    average_rating: number | null
    email: string
    phone: string | null
    city: string | null
  } | null
}

export interface BidWithDriver extends DbBid {
  driver: {
    user_id: string
    name: string
    title: string | null
    city: string | null
    average_rating: number | null
    driver_ranking: string | null
    acceptance_rate_pct: number | null
    total_earnings_usd: number | null
    bio: string | null
    skill_tags: string | null
    availability: string | null
    total_kilometres: number | null
  } | null
}

export interface JobWithDetails extends DbJob {
  load: {
    title: string
    cargo_type: string
    origin_city: string
    destination_city: string
    distance_km: number
    pickup_date: string
    delivery_date: string
    requirements: string[] | null
  } | null
  client: {
    user_id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string
  } | null
  driver: {
    user_id: string
    name: string
    phone: string | null
  } | null
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAvailableLoads(): Promise<LoadWithClient[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: loads, error } = await supabase
    .from('loads')
    .select('*')
    .eq('status', 'In Bidding')
    .order('posted_at', { ascending: false })

  if (error || !loads?.length) return []

  const clientIds = Array.from(new Set(loads.map((l: DbLoad) => l.client_id)))
  const { data: clients } = await supabase
    .from('users')
    .select('user_id, name, company_name, payment_verified, total_spent_usd, average_rating, email, phone, city')
    .in('user_id', clientIds)

  const clientMap = new Map((clients ?? []).map((c: { user_id: string }) => [c.user_id, c]))

  return loads.map((l: DbLoad) => ({
    ...l,
    client: (clientMap.get(l.client_id) ?? null) as LoadWithClient['client'],
  }))
}

export async function getLoadById(loadId: string): Promise<LoadWithClient | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: load, error } = await supabase
    .from('loads')
    .select('*')
    .eq('load_id', loadId)
    .single()

  if (error || !load) return null

  const { data: client } = await supabase
    .from('users')
    .select('user_id, name, company_name, payment_verified, total_spent_usd, average_rating, email, phone, city')
    .eq('user_id', load.client_id)
    .single()

  return { ...load, client: client ?? null }
}

export async function getClientLoads(clientId: string): Promise<DbLoad[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('loads')
    .select('*')
    .eq('client_id', clientId)
    .order('posted_at', { ascending: false })

  if (error) {
    console.error('Error fetching client loads:', error.message)
    return []
  }

  return (data ?? []) as DbLoad[]
}

export async function getLoadBids(loadId: string): Promise<BidWithDriver[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: bids, error } = await supabase
    .from('bids')
    .select('*')
    .eq('load_id', loadId)
    .order('submitted_at', { ascending: false })

  if (error || !bids?.length) return []

  const driverIds = Array.from(new Set(bids.map((b: DbBid) => b.driver_id)))
  const { data: drivers } = await supabase
    .from('users')
    .select('user_id, name, title, city, average_rating, driver_ranking, acceptance_rate_pct, total_earnings_usd, bio, skill_tags, availability, total_kilometres')
    .in('user_id', driverIds)

  const driverMap = new Map((drivers ?? []).map((d: { user_id: string }) => [d.user_id, d]))

  return bids.map((b: DbBid) => ({
    ...b,
    driver: (driverMap.get(b.driver_id) ?? null) as BidWithDriver['driver'],
  }))
}

export async function getDriverJobs(driverId: string): Promise<JobWithDetails[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('driver_id', driverId)
    .order('job_id', { ascending: false })

  if (error || !jobs?.length) return []

  const loadIds = Array.from(new Set(jobs.map((j: DbJob) => j.load_id)))
  const clientIds = Array.from(new Set(jobs.map((j: DbJob) => j.client_id)))

  const [{ data: loads }, { data: clients }] = await Promise.all([
    supabase.from('loads').select('load_id, title, cargo_type, origin_city, destination_city, distance_km, pickup_date, delivery_date, requirements').in('load_id', loadIds),
    supabase.from('users').select('user_id, name, company_name, phone, email').in('user_id', clientIds),
  ])

  const loadMap = new Map((loads ?? []).map((l: { load_id: string }) => [l.load_id, l]))
  const clientMap = new Map((clients ?? []).map((c: { user_id: string }) => [c.user_id, c]))

  return jobs.map((j: DbJob) => ({
    ...j,
    load: (loadMap.get(j.load_id) ?? null) as JobWithDetails['load'],
    client: (clientMap.get(j.client_id) ?? null) as JobWithDetails['client'],
    driver: null,
  }))
}

export async function getClientJobs(clientId: string): Promise<JobWithDetails[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('job_id', { ascending: false })

  if (error || !jobs?.length) return []

  const loadIds = Array.from(new Set(jobs.map((j: DbJob) => j.load_id)))
  const driverIds = Array.from(new Set(jobs.map((j: DbJob) => j.driver_id)))

  const [{ data: loads }, { data: drivers }] = await Promise.all([
    supabase.from('loads').select('load_id, title, cargo_type, origin_city, destination_city, distance_km, pickup_date, delivery_date, requirements').in('load_id', loadIds),
    supabase.from('users').select('user_id, name, phone, email').in('user_id', driverIds),
  ])

  const loadMap = new Map((loads ?? []).map((l: { load_id: string }) => [l.load_id, l]))
  const driverMap = new Map((drivers ?? []).map((d: { user_id: string }) => [d.user_id, d]))

  return jobs.map((j: DbJob) => ({
    ...j,
    load: (loadMap.get(j.load_id) ?? null) as JobWithDetails['load'],
    client: null,
    driver: (driverMap.get(j.driver_id) ?? null) as JobWithDetails['driver'],
  }))
}

export async function getJobMessages(jobId: string): Promise<DbMessage[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('job_id', jobId)
    .order('sent_at', { ascending: true })

  if (error) return []
  return (data ?? []) as DbMessage[]
}

export async function getDriverBidOnLoad(driverId: string, loadId: string): Promise<DbBid | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('bids')
    .select('*')
    .eq('driver_id', driverId)
    .eq('load_id', loadId)
    .maybeSingle()

  return data as DbBid | null
}
