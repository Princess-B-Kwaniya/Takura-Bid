import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getCurrentUser } from '@/lib/queries/auth'
import { getClientLoads } from '@/lib/queries/loads'
import type { DbLoad } from '@/lib/queries/loads'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  'In Bidding': 'bg-blue-100 text-blue-800',
  'Assigned':   'bg-yellow-100 text-yellow-800',
  'In Transit': 'bg-orange-100 text-orange-800',
  'Completed':  'bg-green-100 text-green-800',
}

function LoadListItem({ load }: { load: DbLoad }) {
  return (
    <div className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0 mb-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">{load.title}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full w-fit ${STATUS_STYLES[load.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {load.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{load.origin_city} → {load.destination_city} &bull; {load.cargo_type} &bull; {load.weight_tons}t</p>
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
            Manage
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function MyLoads() {
  const client = await getCurrentUser()
  const loads = client ? await getClientLoads(client.user_id) : []

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Loads', value: activeLoads.length },
            { label: 'Total Bids', value: totalBids },
            { label: 'Completed', value: completedLoads.length },
            { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Loads</h2>
          </div>
          {loads.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {loads.map(load => (
                <LoadListItem key={load.load_id} load={load} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No loads posted yet</h3>
              <p className="text-gray-500 text-sm mb-4">Post your first load to start receiving bids.</p>
              <Link href="/client/post-load" className="btn-primary inline-flex items-center">
                Post New Load
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
