'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/components/providers/AuthProvider'

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
  bids_count: number
  posted_at: string
  client_id: string
  client: {
    name: string
    company_name: string | null
    payment_verified: boolean | null
    total_spent_usd: number | null
    average_rating: number | null
    city: string | null
  } | null
}

interface ExistingBid {
  bid_id: string
  amount_usd: number
  message: string | null
  status: string
}

export default function DriverLoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [load, setLoad] = useState<LoadData | null>(null)
  const [existingBid, setExistingBid] = useState<ExistingBid | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load_data() {
      const [loadRes, bidRes] = await Promise.all([
        fetch(`/api/loads/${id}`),
        user ? fetch(`/api/bids/my?loadId=${id}`) : Promise.resolve(null),
      ])
      if (loadRes.ok) {
        const d = await loadRes.json()
        setLoad(d.load)
        setAmount(String(d.load?.budget_usd ?? ''))
      }
      if (bidRes?.ok) {
        const d = await bidRes.json()
        setExistingBid(d.bid ?? null)
      }
      setLoading(false)
    }
    load_data()
  }, [id, user])

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loadId: id, amount: parseFloat(amount), message }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setError(data.error ?? 'Failed to submit application')
    } else {
      setSuccess(true)
      setExistingBid(data.bid)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="driver">
        <div className="content-area flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#3f2a52] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!load) {
    return (
      <DashboardLayout userType="driver">
        <div className="content-area text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Load not found</h2>
          <Link href="/driver/loads" className="text-[#3f2a52] hover:underline">Back to Load Board</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="driver">
      <div className="content-area max-w-4xl">
        {/* Back */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Load Board
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Load header */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {load.urgency === 'Urgent' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">URGENT</span>
                    )}
                    <span className="text-sm text-gray-500">{load.trip_type}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{load.title}</h1>
                  <p className="text-gray-600">
                    {load.origin_city} → {load.destination_city}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-gray-900">${load.budget_usd.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Budget</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{load.distance_km} km</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{load.weight_tons}t</p>
                  <p className="text-xs text-gray-500">Weight</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{new Date(load.pickup_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-xs text-gray-500">Pickup</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{new Date(load.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-xs text-gray-500">Delivery</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Load Description</h2>
              <p className="text-gray-700 leading-relaxed">{load.description ?? 'No description provided.'}</p>

              {load.requirements?.length ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {load.requirements.map((req, i) => (
                      <span key={i} className="px-3 py-1 bg-[#3f2a52]/10 text-[#3f2a52] rounded-full text-sm font-medium">{req}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Bid form */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {existingBid ? 'Your Application' : 'Submit Application'}
              </h2>

              {existingBid ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    existingBid.status === 'Accepted' ? 'bg-green-50 border-green-200' :
                    existingBid.status === 'Rejected' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Your bid: ${existingBid.amount_usd.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        existingBid.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                        existingBid.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{existingBid.status}</span>
                    </div>
                    {existingBid.message && <p className="text-sm text-gray-700">{existingBid.message}</p>}
                  </div>
                  {existingBid.status === 'Accepted' && (
                    <div className="text-center">
                      <p className="text-green-700 font-medium mb-3">🎉 Your application was accepted!</p>
                      <Link href="/driver/jobs" className="btn-primary inline-flex">
                        View in My Jobs →
                      </Link>
                    </div>
                  )}
                </div>
              ) : success ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Application Submitted!</h3>
                  <p className="text-gray-500 text-sm mb-4">The client will review your bid and get back to you.</p>
                  <Link href="/driver/loads" className="text-[#3f2a52] hover:underline text-sm">Browse more loads</Link>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Rate (USD)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                      min={1}
                      step="0.01"
                      className="input-field"
                      placeholder="Enter your rate"
                    />
                    <p className="text-xs text-gray-500 mt-1">Client budget: ${load.budget_usd.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Message</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={4}
                      className="input-field"
                      placeholder="Introduce yourself and explain why you're the best fit for this load..."
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar: client info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Client</h2>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#3f2a52] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {(load.client?.company_name ?? load.client?.name ?? 'C')[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{load.client?.company_name ?? load.client?.name}</p>
                  <p className="text-sm text-gray-500">{load.client?.city}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {load.client?.payment_verified && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Payment Verified</span>
                  </div>
                )}
                {load.client?.total_spent_usd != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Spent</span>
                    <span className="font-medium">${load.client.total_spent_usd.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Proposals</span>
                  <span className="font-medium">{load.bids_count}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Load ID</h2>
              <p className="font-mono text-sm text-gray-700">{load.load_id}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
