import { notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getUserById } from '@/lib/queries/users'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import DriverProfileClient from './DriverProfileClient'

export const dynamic = 'force-dynamic'

interface Review {
  review_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer_name: string
  job_id: string
}

async function getDriverReviews(driverId: string): Promise<Review[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('review_id, rating, comment, created_at, reviewer_id, job_id')
    .eq('reviewee_id', driverId)
    .order('created_at', { ascending: false })

  if (error || !reviews) return []

  const reviewerIds = Array.from(new Set(reviews.map(r => r.reviewer_id)))
  const { data: reviewers } = await supabase
    .from('users')
    .select('user_id, name, company_name')
    .in('user_id', reviewerIds)

  const reviewerMap = new Map(
    (reviewers ?? []).map(u => [u.user_id, u.company_name ?? u.name])
  )

  return reviews.map(r => ({
    review_id: r.review_id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer_name: reviewerMap.get(r.reviewer_id) ?? 'Anonymous',
    job_id: r.job_id,
  }))
}

async function getClientAvailableLoads(clientId: string) {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('loads')
    .select('load_id, title, origin_city, destination_city, budget_usd, cargo_type')
    .eq('client_id', clientId)
    .eq('status', 'In Bidding')
    .order('posted_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const driver = await getUserById(id)

  if (!driver || driver.role !== 'DRIVER') notFound()

  const [reviews, currentUser] = await Promise.all([
    getDriverReviews(id),
    getCurrentUser(),
  ])

  // Get the client's available loads for the job offer modal
  const clientLoads = currentUser?.role === 'CLIENT'
    ? await getClientAvailableLoads(currentUser.user_id)
    : []

  return (
    <DashboardLayout userType="client">
      <div className="content-area">
        <DriverProfileClient
          driver={{
            user_id: driver.user_id,
            name: driver.name,
            title: driver.title,
            specialization: driver.specialization,
            bio: driver.bio,
            city: driver.city,
            skill_tags: driver.skill_tags,
            total_earnings_usd: driver.total_earnings_usd,
            average_rating: driver.average_rating,
            total_kilometres: driver.total_kilometres,
            driver_ranking: driver.driver_ranking,
            availability: driver.availability,
            acceptance_rate_pct: driver.acceptance_rate_pct,
            created_at: driver.created_at,
          }}
          reviews={reviews}
          clientLoads={clientLoads}
        />
      </div>
    </DashboardLayout>
  )
}
