'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CITIES, CARGO_TYPES } from '@/lib/routes'
import { useAuth } from '@/components/providers/AuthProvider'

interface LoadWithClient {
  load_id: string
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
  bids_count: number
  posted_at: string
  client: {
    name: string
    company_name: string | null
    payment_verified: boolean | null
    average_rating: number | null
    total_spent_usd: number | null
  } | null
}

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

function LoadCard({ load, bookmarked, onToggleBookmark }: { load: LoadWithClient; bookmarked: boolean; onToggleBookmark: (id: string) => void }) {
  return (
    <div className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all duration-200 mb-4 ${load.urgency === 'Urgent' ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 hover:border-[#3f2a52]/30'
      }`}>
      {load.urgency === 'Urgent' && (
        <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-red-100">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-red-700">Urgent Load — Immediate pickup required</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{timeAgo(load.posted_at)}</span>
          {load.urgency === 'Urgent' && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">URGENT</span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">{load.trip_type}</span>
          <button
            onClick={(e) => { e.preventDefault(); onToggleBookmark(load.load_id) }}
            className="text-gray-400 hover:text-orange-500 transition-colors"
            title={bookmarked ? 'Remove bookmark' : 'Bookmark load'}
          >
            <svg className={`w-5 h-5 ${bookmarked ? 'text-orange-500 fill-current' : ''}`} fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title + Budget */}
      <Link href={`/driver/loads/${load.load_id}`} className="block">
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

        {load.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{load.description}</p>
        )}

        {load.requirements?.length ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {load.requirements.map((req, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{req}</span>
            ))}
          </div>
        ) : null}

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

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Pickup: {new Date(load.pickup_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span>Deliver: {new Date(load.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
      </Link>
    </div>
  )
}

export default function LoadBoard() {
  const { loading: authLoading } = useAuth()
  const [loads, setLoads] = useState<LoadWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cargoFilter, setCargoFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('All')
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [showBookmarked, setShowBookmarked] = useState(false)

  useEffect(() => {
    if (authLoading) return
    fetch('/api/loads/available')
      .then(r => r.json())
      .then(d => { setLoads(d.loads ?? []); setLoading(false) })
      .catch(() => setLoading(false))

    // Load bookmarks from localStorage
    const saved = localStorage.getItem('driver_bookmarked_loads')
    if (saved) setBookmarks(new Set(JSON.parse(saved)))
  }, [authLoading])

  function toggleBookmark(id: string) {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('driver_bookmarked_loads', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const filtered = useMemo(() => {
    return loads.filter(l => {
      if (showBookmarked && !bookmarks.has(l.load_id)) return false
      if (cargoFilter && l.cargo_type !== cargoFilter) return false
      if (urgencyFilter === 'Urgent' && l.urgency !== 'Urgent') return false
      if (search) {
        const q = search.toLowerCase()
        return (
          l.title.toLowerCase().includes(q) ||
          l.origin_city.toLowerCase().includes(q) ||
          l.destination_city.toLowerCase().includes(q) ||
          l.cargo_type.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [loads, search, cargoFilter, urgencyFilter, showBookmarked, bookmarks])

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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#3f2a52] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid mb-6">
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

            {/* Search & Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by title, origin, destination, or cargo type..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <select
                  value={cargoFilter}
                  onChange={e => setCargoFilter(e.target.value)}
                  className="input-field w-full lg:w-48"
                >
                  <option value="">All Cargo Types</option>
                  {CARGO_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  {['All', 'Urgent'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setUrgencyFilter(opt)}
                      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all ${urgencyFilter === opt
                        ? opt === 'Urgent' ? 'bg-red-600 text-white' : 'bg-[#3f2a52] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {opt === 'Urgent' ? 'Urgent Only' : opt}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowBookmarked(!showBookmarked)}
                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all ${showBookmarked
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill={showBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved ({bookmarks.size})
                  </button>
                </div>
              </div>
            </div>

            {/* Results count */}
            {(search || cargoFilter || urgencyFilter !== 'All' || showBookmarked) && (
              <p className="text-sm text-gray-500 mb-4">
                Showing {filtered.length} of {loads.length} loads
                {search && <span> matching &quot;{search}&quot;</span>}
              </p>
            )}

            {/* Loads */}
            {filtered.length > 0 ? (
              <div>
                {filtered.map(load => (
                  <LoadCard
                    key={load.load_id}
                    load={load}
                    bookmarked={bookmarks.has(load.load_id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="card-content p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {search || cargoFilter || urgencyFilter !== 'All' || showBookmarked ? 'No loads match your filters' : 'No loads available'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {search || cargoFilter || urgencyFilter !== 'All' || showBookmarked
                      ? 'Try adjusting your search or filters.'
                      : 'When clients post loads, they will appear here.'
                    }
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
