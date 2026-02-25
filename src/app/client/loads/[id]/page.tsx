'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface LoadData {
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
}

interface BidData {
  bid_id: string
  driver_id: string
  amount_usd: number
  message: string | null
  status: string
  submitted_at: string
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
    availability: string | null
    total_kilometres: number | null
  } | null
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

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ClientLoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [load, setLoad] = useState<LoadData | null>(null)
  const [bids, setBids] = useState<BidData[]>([])
  const [loading, setLoading] = useState(true)
  const [hiring, setHiring] = useState<string | null>(null)
  const [hiredBid, setHiredBid] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      const [loadRes, bidsRes] = await Promise.all([
        fetch(`/api/loads/${id}`),
        fetch(`/api/bids/load/${id}`),
      ])
      if (loadRes.ok) {
        const d = await loadRes.json()
        setLoad(d.load)
      }
      if (bidsRes.ok) {
        const d = await bidsRes.json()
        setBids(d.bids ?? [])
        // If a bid is already accepted, mark it
        const accepted = d.bids?.find((b: BidData) => b.status === 'Accepted')
        if (accepted) setHiredBid(accepted.bid_id)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  async function handleHire(bidId: string) {
    setHiring(bidId)
    setError('')
    const res = await fetch(`/api/bids/${bidId}/accept`, { method: 'POST' })
    const data = await res.json()
    setHiring(null)
    if (!res.ok) {
      setError(data.error ?? 'Failed to hire driver')
    } else {
      setHiredBid(bidId)
      // Update bids list locally
      setBids(prev => prev.map(b => ({
        ...b,
        status: b.bid_id === bidId ? 'Accepted' : 'Rejected'
      })))
      setLoad(prev => prev ? { ...prev, status: 'Assigned' } : prev)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="client">
        <div className="content-area flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#3f2a52] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!load) {
    return (
      <DashboardLayout userType="client">
        <div className="content-area text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Load not found</h2>
          <Link href="/client/loads" className="text-[#3f2a52] hover:underline">Back to My Loads</Link>
        </div>
      </DashboardLayout>
    )
  }

  const pendingBids = bids.filter(b => b.status === 'Pending')
  const canHire = load.status === 'In Bidding' && !hiredBid

  return (
    <DashboardLayout userType="client">
      <div className="content-area max-w-5xl">
        {/* Back + header */}
        <div className="mb-6">
          <Link href="/client/loads" className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Loads
          </Link>

          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    load.status === 'In Bidding' ? 'bg-blue-100 text-blue-700' :
                    load.status === 'Assigned' ? 'bg-yellow-100 text-yellow-700' :
                    load.status === 'In Transit' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>{load.status}</span>
                  {load.urgency === 'Urgent' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">URGENT</span>}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{load.title}</h1>
                <p className="text-gray-600 mt-1">{load.origin_city} → {load.destination_city} &bull; {load.distance_km} km &bull; {load.weight_tons}t</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-3xl font-bold text-gray-900">${load.budget_usd.toLocaleString()}</div>
                <p className="text-sm text-gray-500">Budget</p>
              </div>
            </div>
            {load.description && <p className="text-gray-700 text-sm leading-relaxed">{load.description}</p>}
            {load.requirements?.length ? (
              <div className="flex flex-wrap gap-2 mt-4">
                {load.requirements.map((r, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#3f2a52]/10 text-[#3f2a52] rounded-full text-xs font-medium">{r}</span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {hiredBid && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-green-800">Driver hired! The driver will receive a job offer to accept.</span>
            </div>
            <Link href="/client/chat" className="text-sm text-green-700 font-semibold hover:underline">Go to Messages →</Link>
          </div>
        )}

        {/* Bids */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Applications ({bids.length})
              {pendingBids.length > 0 && canHire && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{pendingBids.length} pending</span>
              )}
            </h2>
          </div>

          {bids.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No applications yet</h3>
              <p className="text-sm text-gray-500">Drivers will apply to this load and their bids will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bids.map(bid => (
                <div key={bid.bid_id} className={`p-6 ${bid.status === 'Accepted' ? 'bg-green-50' : bid.status === 'Rejected' ? 'bg-gray-50 opacity-60' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Driver info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-[#3f2a52] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                        {bid.driver?.name?.[0] ?? 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{bid.driver?.name}</span>
                          {bid.driver?.driver_ranking && (
                            <span className="px-2 py-0.5 bg-[#3f2a52]/10 text-[#3f2a52] text-xs font-semibold rounded-full">{bid.driver.driver_ranking}</span>
                          )}
                          {bid.status !== 'Pending' && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${bid.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {bid.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{bid.driver?.title ?? 'Driver'} &bull; {bid.driver?.city}</p>
                        <div className="flex items-center flex-wrap gap-3 mb-2">
                          {bid.driver?.average_rating != null && (
                            <div className="flex items-center space-x-1">
                              <StarRating rating={bid.driver.average_rating} />
                              <span className="text-xs text-gray-500">{bid.driver.average_rating.toFixed(1)}</span>
                            </div>
                          )}
                          {bid.driver?.acceptance_rate_pct != null && (
                            <span className="text-xs text-gray-500">{bid.driver.acceptance_rate_pct}% acceptance</span>
                          )}
                          {bid.driver?.total_kilometres != null && (
                            <span className="text-xs text-gray-500">{(bid.driver.total_kilometres / 1000).toFixed(0)}k km</span>
                          )}
                        </div>
                        {bid.message && (
                          <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200 mt-2">&ldquo;{bid.message}&rdquo;</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{timeAgo(bid.submitted_at)}</p>
                      </div>
                    </div>

                    {/* Bid amount + actions */}
                    <div className="flex flex-col items-end space-y-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${bid.amount_usd.toLocaleString()}</div>
                        <p className="text-xs text-gray-500">Bid amount</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Link
                          href={`/client/drivers/${bid.driver_id}`}
                          className="text-sm text-[#3f2a52] font-medium hover:underline"
                        >
                          View Profile →
                        </Link>
                        {canHire && bid.status === 'Pending' && (
                          <button
                            onClick={() => handleHire(bid.bid_id)}
                            disabled={hiring === bid.bid_id}
                            className="px-5 py-2 bg-[#3f2a52] text-white text-sm font-semibold rounded-lg hover:bg-[#3f2a52]/90 transition-colors disabled:opacity-50"
                          >
                            {hiring === bid.bid_id ? 'Hiring...' : 'Hire Driver'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
