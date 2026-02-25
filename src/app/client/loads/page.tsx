'use client'

import { useState, useEffect } from 'react'
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
  status: string
  bids_count: number
  posted_at: string
  assigned_driver_name?: string | null
}

const STATUS_STYLES: Record<string, string> = {
  'In Bidding': 'bg-blue-100 text-blue-800',
  'Assigned': 'bg-yellow-100 text-yellow-800',
  'In Transit': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-green-100 text-green-800',
}

const FILTER_OPTIONS = ['All', 'In Bidding', 'Assigned', 'In Transit', 'Completed']

function LoadListItem({ load }: { load: LoadData }) {
  const actionLabel = load.status === 'In Bidding' && load.bids_count > 0
    ? `View Bids (${load.bids_count})`
    : load.status === 'In Bidding'
      ? 'View Details'
      : load.status === 'Assigned'
        ? 'Track Assignment'
        : load.status === 'In Transit'
          ? 'Track Load'
          : 'View Receipt'

  return (
    <div className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0 mb-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">{load.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full w-fit ${STATUS_STYLES[load.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {load.status}
              </span>
              {load.urgency === 'Urgent' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">URGENT</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">{load.origin_city} → {load.destination_city} &bull; {load.cargo_type} &bull; {load.weight_tons}t</p>
          {(load.status === 'Assigned' || load.status === 'In Transit') && load.assigned_driver_name && (
            <p className="text-sm mt-1 flex items-center text-[#3f2a52]">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Driver: <span className="font-medium ml-1">{load.assigned_driver_name}</span>
            </p>
          )}
        </div>
        <div className="text-left sm:text-right flex-shrink-0 ml-4">
          <span className="text-xl md:text-2xl font-bold text-gray-900">${load.budget_usd.toLocaleString()}</span>
          <p className="text-sm text-gray-500">Budget</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distance</p>
          <p className="font-medium text-gray-900 text-sm">{load.distance_km} km</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bids</p>
          <p className="font-medium text-gray-900 text-sm">{load.bids_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pickup</p>
          <p className="font-medium text-gray-900 text-sm">{new Date(load.pickup_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery</p>
          <p className="font-medium text-gray-900 text-sm">{new Date(load.delivery_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <span className="text-sm text-gray-500">ID: {load.load_id}</span>
        <div className="flex flex-wrap items-center gap-3">
          {load.status === 'In Bidding' && load.bids_count > 0 && (
            <Link
              href={`/client/loads/${load.load_id}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              View Bids ({load.bids_count})
            </Link>
          )}
          <Link href={`/client/loads/${load.load_id}`} className="btn-primary flex-shrink-0 text-sm">
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MyLoads() {
  const [loads, setLoads] = useState<LoadData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/loads/my')
      .then(r => r.json())
      .then(d => { setLoads(d.loads ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = loads.filter(l => {
    if (statusFilter !== 'All' && l.status !== statusFilter) return false
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

  const activeLoads = loads.filter(l => l.status !== 'Completed')
  const completedLoads = loads.filter(l => l.status === 'Completed')
  const totalBids = loads.reduce((s, l) => s + l.bids_count, 0)
  const totalSpent = completedLoads.reduce((s, l) => s + l.budget_usd, 0)

  return (
    <DashboardLayout userType="client">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h1 className="page-title">My Loads</h1>
          <Link href="/client/post-load" className="btn-primary inline-flex items-center justify-center w-full sm:w-auto">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Post New Load
          </Link>
        </div>
      </div>

      <div className="content-area">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#3f2a52] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Active Loads', value: activeLoads.length, icon: '📦' },
                { label: 'Total Bids', value: totalBids, icon: '📩' },
                { label: 'Completed', value: completedLoads.length, icon: '✅' },
                { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: '💰' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">{s.icon} {s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6 p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by title, city, or cargo type..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {FILTER_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setStatusFilter(opt)}
                      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all ${statusFilter === opt
                          ? 'bg-[#3f2a52] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Load list */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {statusFilter === 'All' ? 'All Loads' : statusFilter} ({filtered.length})
                </h2>
              </div>
              {filtered.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filtered.map(load => (
                    <LoadListItem key={load.load_id} load={load} />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {search || statusFilter !== 'All' ? 'No loads match your filters' : 'No loads posted yet'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {search || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Post your first load to start receiving bids.'}
                  </p>
                  {!search && statusFilter === 'All' && (
                    <Link href="/client/post-load" className="btn-primary inline-flex items-center">
                      Post New Load
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
