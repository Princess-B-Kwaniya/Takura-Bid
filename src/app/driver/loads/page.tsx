import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getAvailableLoads } from '@/lib/queries/loads'
import type { LoadWithClient } from '@/lib/queries/loads'

export const dynamic = 'force-dynamic'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-orange-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function LoadCard({ load }: { load: LoadWithClient }) {
  return (
    <Link href={`/driver/loads/${load.load_id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-[#3f2a52]/30 transition-all duration-200 mb-4 cursor-pointer">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{timeAgo(load.posted_at)}</span>
            {load.urgency === 'Urgent' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">URGENT</span>
            )}
          </div>
          <span className="text-sm text-gray-400">{load.trip_type}</span>
        </div>

        {/* Title + Budget */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-[#3f2a52] transition-colors">
              {load.title}
            </h3>
            <p className="text-sm text-gray-600">
              {load.origin_city} → {load.destination_city} &bull; {load.distance_km} km &bull; {load.weight_tons}t
            </p>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <span className="text-xl font-bold text-gray-900">${load.budget_usd.toLocaleString()}</span>
            <p className="text-xs text-gray-500">Budget</p>
          </div>
        </div>

        {/* Description */}
        {load.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{load.description}</p>
        )}

        {/* Requirements tags */}
        {load.requirements?.length ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {load.requirements.map((req, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{req}</span>
            ))}
          </div>
        ) : null}

        {/* Footer: client info + proposals */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {load.client?.payment_verified && (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-[#3f2a52] rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Verified</span>
              </div>
            )}
            {load.client?.average_rating ? (
              <StarRating rating={load.client.average_rating} />
            ) : null}
            <span className="text-xs text-gray-600">{load.client?.company_name ?? load.client?.name}</span>
          </div>
          <span className="text-xs text-gray-500">
            {load.bids_count < 5 ? `Less than ${load.bids_count + 2}` : load.bids_count} proposals
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Pickup: {new Date(load.pickup_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span>Deliver: {new Date(load.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>
    </Link>
  )
}

export default async function LoadBoard() {
  const loads = await getAvailableLoads()

  const urgentLoads = loads.filter(l => l.urgency === 'Urgent')
  const avgRate = loads.length > 0
    ? Math.round(loads.reduce((s, l) => s + l.budget_usd, 0) / loads.length)
    : 0

  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="page-title">Load Board</h1>
              <p className="page-subtitle">Browse available loads and place your bids</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{loads.length}</div>
            <div className="stat-label">Available Loads</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{urgentLoads.length}</div>
            <div className="stat-label">Urgent Loads</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${avgRate}</div>
            <div className="stat-label">Avg. Budget</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{loads.filter(l => l.bids_count === 0).length}</div>
            <div className="stat-label">No Proposals Yet</div>
          </div>
        </div>

        {/* Loads */}
        {loads.length > 0 ? (
          <div>
            {loads.map(load => (
              <LoadCard key={load.load_id} load={load} />
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-content p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No loads available</h3>
              <p className="text-gray-500 text-sm">When clients post loads, they will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
