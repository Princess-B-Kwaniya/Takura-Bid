import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface Load {
  id: string
  origin: string
  destination: string
  loadType: string
  weight: string
  rate: number
  distance: string
  pickupDate: string
  deliveryDate: string
  urgent: boolean
  client: string
  description?: string
  requirements?: string[]
  clientRating: number
  clientSpent: string
  bidsCount: number
  postedTime: string
  tripType: 'One Way' | 'Round Trip'
}

// Data will come from the database once loads table is created
const loads: Load[] = []

function LoadListItem({ load }: { load: Load }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 mb-6">
      {/* Header with time and actions */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">Posted {load.postedTime}</span>
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button className="p-1 text-gray-400 hover:text-red-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
        {load.loadType} Transport
      </h3>

      {/* Job details */}
      <div className="text-sm text-gray-600 mb-4">
        {load.tripType} • {load.urgent ? 'Urgent' : 'Standard'} • {load.distance} • Est. Budget: ${load.rate}
      </div>

      {/* Important notice */}
      {load.urgent && (
        <div className="flex items-start space-x-2 mb-4">
          <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <strong>Important upfront:</strong> {load.description} {' '}
              <button className="text-green-600 hover:text-green-700 font-medium">
                more
              </button>
            </p>
          </div>
        </div>
      )}

      {!load.urgent && (
        <p className="text-sm text-gray-700 mb-4">
          {load.description} {' '}
          <button className="text-green-600 hover:text-green-700 font-medium">
            more
          </button>
        </p>
      )}

      {/* Skills/Requirements tags */}
      <div className="flex flex-wrap gap-2 mb-4 lg:mb-6">
        {load.requirements?.map((req, index) => (
          <span key={index} className="px-2 lg:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs lg:text-sm">
            {req}
          </span>
        ))}
        <span className="px-2 lg:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs lg:text-sm">
          {load.distance}
        </span>
      </div>

      {/* Client info and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          {/* Payment verified badge */}
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Payment verified</span>
          </div>

          {/* Rating stars */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(load.clientRating) ? 'text-orange-400' : 'text-gray-300'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Client spending */}
          <span className="text-sm text-gray-600">{load.clientSpent} spent</span>

          {/* Route and weight */}
          <span className="text-sm text-gray-600">
            {load.origin} → {load.destination} – {load.weight}
          </span>
        </div>
      </div>

      {/* Proposals count */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-600">
          Proposals: {load.bidsCount < 5 ? `Less than ${load.bidsCount + 2}` : load.bidsCount}
        </span>
      </div>
    </div>
  )
}

export default function LoadBoard() {
  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="page-title">Load Board</h1>
              <p className="page-subtitle">Browse available loads and place your bids</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input 
                type="text" 
                className="input-field w-full sm:w-80" 
                placeholder="Search by origin, destination, load type..."
              />
              <button className="btn-secondary whitespace-nowrap">
                Filters
              </button>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{loads.length}</div>
            <div className="stat-label">Available Loads</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{loads.filter(load => load.urgent).length}</div>
            <div className="stat-label">Urgent Loads</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{loads.length > 0 ? `$${Math.round(loads.reduce((sum, load) => sum + load.rate, 0) / loads.length)}` : '$0'}</div>
            <div className="stat-label">Avg. Rate</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">My Bids</div>
          </div>
        </div>

        {/* Load List */}
        {loads.length > 0 ? (
          <div className="space-y-0">
            {loads.map((load) => (
              <LoadListItem key={load.id} load={load} />
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-content p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No loads available yet</h3>
              <p className="text-gray-500 text-sm">When clients post loads, they will appear here for you to bid on.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}