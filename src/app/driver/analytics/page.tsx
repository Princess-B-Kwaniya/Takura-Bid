import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getCurrentUser } from '@/lib/queries/auth'

export const dynamic = 'force-dynamic'

export default async function DriverAnalytics() {
  const driver = await getCurrentUser()

  const totalEarnings = driver?.total_earnings_usd ?? 0
  const avgRating = driver?.average_rating ?? 0
  const totalKm = driver?.total_kilometres ?? 0
  const ranking = driver?.driver_ranking ?? '—'
  const profileViews = driver?.profile_views ?? 0
  const profileClicks = driver?.profile_clicks ?? 0
  const acceptanceRate = driver?.acceptance_rate_pct ?? 0

  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="page-title">Analytics</h1>
              <p className="page-subtitle">Track your performance metrics and insights.</p>
            </div>
          </div>
        </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="card">
            <div className="card-content p-4 lg:p-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">${totalEarnings.toLocaleString()}</div>
              <div className="text-xs lg:text-sm font-medium text-gray-600">Total Earnings</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content p-4 lg:p-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{avgRating}</div>
              <div className="text-xs lg:text-sm font-medium text-gray-600">Average Rating</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content p-4 lg:p-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{totalKm.toLocaleString()}</div>
              <div className="text-xs lg:text-sm font-medium text-gray-600">Total Kilometres</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content p-4 lg:p-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{ranking}</div>
              <div className="text-xs lg:text-sm font-medium text-gray-600">Top Rated Driver</div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Views & Clicks Chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Profile Views & Clicks</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Views: {profileViews.toLocaleString()}</span>
                  <span className="text-sm text-gray-600">Total Clicks: {profileClicks.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Views line (blue) */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points="20,150 60,120 100,140 140,100 180,110 220,80 260,90 300,60 340,70 380,50"
                  />
                  
                  {/* Clicks line (green) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points="20,170 60,160 100,165 140,140 180,145 220,130 260,135 300,120 340,125 380,110"
                  />
                  
                  {/* Data points for Views */}
                  <circle cx="20" cy="150" r="3" fill="#3b82f6"/>
                  <circle cx="100" cy="140" r="3" fill="#3b82f6"/>
                  <circle cx="180" cy="110" r="3" fill="#3b82f6"/>
                  <circle cx="260" cy="90" r="3" fill="#3b82f6"/>
                  <circle cx="340" cy="70" r="3" fill="#3b82f6"/>
                  
                  {/* Data points for Clicks */}
                  <circle cx="20" cy="170" r="3" fill="#10b981"/>
                  <circle cx="100" cy="165" r="3" fill="#10b981"/>
                  <circle cx="180" cy="145" r="3" fill="#10b981"/>
                  <circle cx="260" cy="135" r="3" fill="#10b981"/>
                  <circle cx="340" cy="125" r="3" fill="#10b981"/>
                </svg>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Profile Views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Profile Clicks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Over Time Chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Earnings Over Time</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">This Month: —</span>
                  <span className="text-sm text-gray-600">Weekly Avg: —</span>
                </div>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <p className="text-sm text-gray-400">Earnings data will appear as you complete jobs.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Analytics */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Load Acceptance vs Decline Rate */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Load Acceptance vs. Decline Rate</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{acceptanceRate}%</div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{100 - acceptanceRate}%</div>
                  <div className="text-sm text-gray-600">Declined</div>
                </div>
              </div>
              <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-40 h-40">
                  {/* Pie chart circle */}
                  <circle cx="100" cy="100" r="80" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="140 22" strokeDashoffset="25" transform="rotate(-90 100 100)"/>
                  <circle cx="100" cy="100" r="80" fill="transparent" stroke="#ef4444" strokeWidth="20" strokeDasharray="42 120" strokeDashoffset="-137" transform="rotate(-90 100 100)"/>
                  
                  {/* Center text */}
                  <text x="100" y="95" textAnchor="middle" fontSize="20" fill="#374151" fontWeight="bold">{acceptanceRate}%</text>
                  <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6b7280">Accepted</text>
                </svg>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Accepted ({acceptanceRate}%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Declined ({100 - acceptanceRate}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Miles Driven vs Pay Per Mile */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Miles Driven vs. Pay Per Mile</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Average: —</span>
                  <span className="text-sm text-gray-600">Best: —</span>
                </div>
              </div>
              <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <p className="text-sm text-gray-400">Data will populate as you complete trips.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Analytics */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Idle Time vs. Driving Time</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">—</div>
                <div className="text-sm text-gray-600">Driving Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">—</div>
                <div className="text-sm text-gray-600">Idle Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">—</div>
                <div className="text-sm text-gray-600">Efficiency</div>
              </div>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
              <p className="text-sm text-gray-400">Time tracking data will appear as you start working on jobs.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}