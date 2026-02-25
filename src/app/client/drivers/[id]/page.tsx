import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getUserById } from '@/lib/queries/users'
import { createClient } from '@/lib/supabase/server'

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

  // Get reviews where this driver is the reviewee
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('review_id, rating, comment, created_at, reviewer_id, job_id')
    .eq('reviewee_id', driverId)
    .order('created_at', { ascending: false })

  if (error || !reviews) return []

  // Fetch reviewer names
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

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <div className="flex items-center">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} className={`${cls} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
      {half && (
        <svg className={`${cls} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className={`${cls} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  )
}

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const driver = await getUserById(id)

  if (!driver || driver.role !== 'DRIVER') notFound()

  const reviews = await getDriverReviews(id)

  const initials = driver.name.split(' ').map(n => n[0]).join('').toUpperCase()
  const skills = driver.skill_tags ? driver.skill_tags.split(',').map(s => s.trim()) : []
  const rating = driver.average_rating ?? 0
  const earnings = driver.total_earnings_usd ?? 0
  const earnedLabel = earnings >= 1000 ? `$${Math.round(earnings / 1000)}K+` : `$${earnings}`
  const km = driver.total_kilometres ?? 0
  const kmLabel = km >= 1000 ? `${Math.round(km / 1000)}K km` : `${km} km`
  const isTopRated = (driver.driver_ranking ?? '').toLowerCase().includes('top')
  const memberSince = driver.created_at
    ? new Date(driver.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <DashboardLayout userType="client">
      <div className="content-area">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/client"
            className="inline-flex items-center text-sm text-gray-500 hover:text-[#3f2a52] transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Drivers
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="lg:col-span-1 space-y-5">
            {/* Avatar + basic info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-28 h-28 bg-gradient-to-br from-[#3f2a52] to-[#6b46a0] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {initials}
                </div>
                {driver.availability === 'Available' && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Name + badge */}
              <h1 className="text-xl font-bold text-gray-900">{driver.name}</h1>
              {isTopRated && (
                <div className="mt-2 inline-flex items-center bg-[#3f2a52] text-white text-xs font-bold px-3 py-1 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {driver.driver_ranking}
                </div>
              )}

              {/* Availability */}
              <div className={`mt-3 text-sm font-medium ${driver.availability === 'Available' ? 'text-green-600' : 'text-gray-400'}`}>
                {driver.availability === 'Available' ? '● Available Now' : '○ Currently Unavailable'}
              </div>

              {/* Location */}
              <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {driver.city ?? 'Zimbabwe'}
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center justify-center space-x-2">
                <StarRating rating={rating} size="lg" />
                <span className="text-lg font-bold text-gray-900">{rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>

              {/* Hire button */}
              <button
                className={`mt-5 w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                  driver.availability === 'Available'
                    ? 'bg-[#3f2a52] text-white hover:bg-[#3f2a52]/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={driver.availability !== 'Available'}
              >
                {driver.availability === 'Available' ? 'Send Job Offer' : 'Currently Unavailable'}
              </button>

              <button className="mt-2 w-full py-3 rounded-xl text-sm font-medium border border-[#3f2a52] text-[#3f2a52] hover:bg-[#3f2a52]/5 transition-colors">
                Send Message
              </button>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Stats</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Earned</span>
                  <span className="font-bold text-gray-900">{earnedLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Distance</span>
                  <span className="font-bold text-gray-900">{kmLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Acceptance Rate</span>
                  <span className="font-bold text-gray-900">{driver.acceptance_rate_pct ?? 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Job Success</span>
                  <span className="font-bold text-green-600">
                    {driver.acceptance_rate_pct ? `${Math.min(100, Math.round(driver.acceptance_rate_pct * 1.1))}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-bold text-gray-900">{memberSince}</span>
                </div>
              </div>
            </div>

            {/* Skills card */}
            {skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm bg-[#3f2a52]/8 text-[#3f2a52] border border-[#3f2a52]/20 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(63,42,82,0.08)' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ─── MAIN CONTENT ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + specialization header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900">{driver.title ?? 'Professional Driver'}</h2>
              {driver.specialization && (
                <p className="text-base text-[#3f2a52] font-medium mt-1">{driver.specialization}</p>
              )}

              {/* Stats bar */}
              <div className="mt-6 grid grid-cols-3 gap-4 py-5 border-t border-b border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">Rating</p>
                </div>
                <div className="text-center border-l border-r border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">{earnedLabel}</p>
                  <p className="text-xs text-gray-500 mt-1">Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{kmLabel}</p>
                  <p className="text-xs text-gray-500 mt-1">Driven</p>
                </div>
              </div>

              {/* Overview / Bio */}
              <div className="mt-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">Overview</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {driver.bio ?? 'No overview provided.'}
                </p>
              </div>
            </div>

            {/* Work History & Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900">
                  Work History & Feedback
                </h3>
                <div className="flex items-center space-x-2">
                  <StarRating rating={rating} />
                  <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No reviews yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to work with this driver!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map((review) => {
                    const date = new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                    const reviewerInitials = review.reviewer_name
                      .split(' ')
                      .map(w => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <div key={review.review_id} className="py-6 first:pt-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          {/* Reviewer avatar */}
                          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {reviewerInitials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{review.reviewer_name}</p>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <StarRating rating={review.rating} />
                                  <span className="text-xs text-gray-400">{date}</span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                Job #{review.job_id}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
