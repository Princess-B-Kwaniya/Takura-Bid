import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getUserById } from '@/lib/queries/users'

export default async function DriverAnalytics() {
  // TODO: Replace with authenticated user's ID once login is wired
  const driver = await getUserById('USR-005')

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
                  <span className="text-sm text-gray-600">This Month: $8,500</span>
                  <span className="text-sm text-gray-600">Weekly Avg: $2,125</span>
                </div>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid2" width="40" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid2)" />
                  
                  {/* Y-axis labels */}
                  <text x="15" y="20" fontSize="10" fill="#6b7280">$4k</text>
                  <text x="15" y="70" fontSize="10" fill="#6b7280">$3k</text>
                  <text x="15" y="120" fontSize="10" fill="#6b7280">$2k</text>
                  <text x="15" y="170" fontSize="10" fill="#6b7280">$1k</text>
                  
                  {/* X-axis labels */}
                  <text x="40" y="195" fontSize="10" fill="#6b7280">Week 1</text>
                  <text x="120" y="195" fontSize="10" fill="#6b7280">Week 2</text>
                  <text x="200" y="195" fontSize="10" fill="#6b7280">Week 3</text>
                  <text x="280" y="195" fontSize="10" fill="#6b7280">Week 4</text>
                  
                  {/* Earnings bars */}
                  <rect x="35" y="80" width="30" height="100" fill="#10b981" rx="2"/>
                  <rect x="115" y="60" width="30" height="120" fill="#10b981" rx="2"/>
                  <rect x="195" y="40" width="30" height="140" fill="#10b981" rx="2"/>
                  <rect x="275" y="70" width="30" height="110" fill="#10b981" rx="2"/>
                  
                  {/* Values on bars */}
                  <text x="50" y="75" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">$1.8k</text>
                  <text x="130" y="55" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">$2.4k</text>
                  <text x="210" y="35" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">$2.8k</text>
                  <text x="290" y="65" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">$2.2k</text>
                </svg>
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
                  <span className="text-sm text-gray-600">Average: $1.85/mile</span>
                  <span className="text-sm text-gray-600">Best: $2.40/mile</span>
                </div>
              </div>
              <div className="h-48 bg-gray-50 rounded-lg p-4">
                <svg viewBox="0 0 350 150" className="w-full h-full">
                  {/* Grid */}
                  <defs>
                    <pattern id="grid3" width="35" height="15" patternUnits="userSpaceOnUse">
                      <path d="M 35 0 L 0 0 0 15" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid3)" />
                  
                  {/* Scatter plot points */}
                  <circle cx="50" cy="80" r="4" fill="#3b82f6"/>
                  <circle cx="80" cy="60" r="4" fill="#3b82f6"/>
                  <circle cx="120" cy="90" r="4" fill="#3b82f6"/>
                  <circle cx="150" cy="50" r="4" fill="#3b82f6"/>
                  <circle cx="180" cy="70" r="4" fill="#3b82f6"/>
                  <circle cx="220" cy="40" r="4" fill="#3b82f6"/>
                  <circle cx="250" cy="85" r="4" fill="#3b82f6"/>
                  <circle cx="280" cy="55" r="4" fill="#3b82f6"/>
                  <circle cx="310" cy="75" r="4" fill="#3b82f6"/>
                  
                  {/* Trend line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    points="30,100 320,30"
                  />
                  
                  {/* Axis labels */}
                  <text x="15" y="30" fontSize="8" fill="#6b7280">$2.50</text>
                  <text x="15" y="60" fontSize="8" fill="#6b7280">$2.00</text>
                  <text x="15" y="90" fontSize="8" fill="#6b7280">$1.50</text>
                  <text x="15" y="120" fontSize="8" fill="#6b7280">$1.00</text>
                  
                  <text x="50" y="140" fontSize="8" fill="#6b7280">100mi</text>
                  <text x="150" y="140" fontSize="8" fill="#6b7280">300mi</text>
                  <text x="250" y="140" fontSize="8" fill="#6b7280">500mi</text>
                </svg>
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
                <div className="text-2xl font-bold text-blue-600">156h</div>
                <div className="text-sm text-gray-600">Driving Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">32h</div>
                <div className="text-sm text-gray-600">Idle Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">83%</div>
                <div className="text-sm text-gray-600">Efficiency</div>
              </div>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              <svg viewBox="0 0 600 200" className="w-full h-full">
                {/* Grid */}
                <defs>
                  <pattern id="grid4" width="60" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid4)" />
                
                {/* Stacked bars for each day */}
                {/* Monday */}
                <rect x="40" y="40" width="50" height="120" fill="#3b82f6" rx="2"/>
                <rect x="40" y="160" width="50" height="20" fill="#f59e0b" rx="2"/>
                <text x="65" y="35" textAnchor="middle" fontSize="10" fill="#374151">Mon</text>
                
                {/* Tuesday */}
                <rect x="110" y="50" width="50" height="110" fill="#3b82f6" rx="2"/>
                <rect x="110" y="160" width="50" height="20" fill="#f59e0b" rx="2"/>
                <text x="135" y="35" textAnchor="middle" fontSize="10" fill="#374151">Tue</text>
                
                {/* Wednesday */}
                <rect x="180" y="30" width="50" height="130" fill="#3b82f6" rx="2"/>
                <rect x="180" y="160" width="50" height="20" fill="#f59e0b" rx="2"/>
                <text x="205" y="35" textAnchor="middle" fontSize="10" fill="#374151">Wed</text>
                
                {/* Thursday */}
                <rect x="250" y="60" width="50" height="100" fill="#3b82f6" rx="2"/>
                <rect x="250" y="160" width="50" height="20" fill="#f59e0b" rx="2"/>
                <text x="275" y="35" textAnchor="middle" fontSize="10" fill="#374151">Thu</text>
                
                {/* Friday */}
                <rect x="320" y="45" width="50" height="115" fill="#3b82f6" rx="2"/>
                <rect x="320" y="160" width="50" height="20" fill="#f59e0b" rx="2"/>
                <text x="345" y="35" textAnchor="middle" fontSize="10" fill="#374151">Fri</text>
                
                {/* Saturday */}
                <rect x="390" y="80" width="50" height="80" fill="#3b82f6" rx="2"/>
                <rect x="390" y="160" width="50" height="20" fill="#f59e0b" rx="2"/>
                <text x="415" y="35" textAnchor="middle" fontSize="10" fill="#374151">Sat</text>
                
                {/* Sunday */}
                <rect x="460" y="140" width="50" height="20" fill="#3b82f6" rx="2"/>
                <rect x="460" y="160" width="50" height="20" fill="#f59e0b" rx="2"/>
                <text x="485" y="35" textAnchor="middle" fontSize="10" fill="#374151">Sun</text>
                
                {/* Y-axis labels */}
                <text x="25" y="50" fontSize="9" fill="#6b7280">12h</text>
                <text x="25" y="90" fontSize="9" fill="#6b7280">8h</text>
                <text x="25" y="130" fontSize="9" fill="#6b7280">4h</text>
                <text x="25" y="170" fontSize="9" fill="#6b7280">0h</text>
              </svg>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Driving Time</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Idle Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}