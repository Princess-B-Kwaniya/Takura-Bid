'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'

/* ─── Sample data from SRS ─── */
const KPI = {
  earnings: 27000,
  rating: 4.8,
  distance: 45200,
  ranking: 'Top 5%',
}

const WEEKLY_EARNINGS = [
  { week: 'W1', amount: 5500 },
  { week: 'W2', amount: 6200 },
  { week: 'W3', amount: 7800 },
  { week: 'W4', amount: 7500 },
]

const PROFILE_VIEWS = [
  { month: 'Oct', views: 420, clicks: 120 },
  { month: 'Nov', views: 580, clicks: 165 },
  { month: 'Dec', views: 650, clicks: 210 },
  { month: 'Jan', views: 720, clicks: 230 },
  { month: 'Feb', views: 477, clicks: 167 },
]

const ACCEPTANCE = { accepted: 70, declined: 30 }

const TIME_SPLIT = [
  { label: 'Week 1', driving: 38, idle: 10 },
  { label: 'Week 2', driving: 40, idle: 8 },
  { label: 'Week 3', driving: 42, idle: 6 },
  { label: 'Week 4', driving: 36, idle: 8 },
]

const MILES_PAY = [
  { km: 200, pay: 2.3 },
  { km: 350, pay: 2.1 },
  { km: 439, pay: 1.95 },
  { km: 500, pay: 1.8 },
  { km: 650, pay: 1.75 },
  { km: 879, pay: 1.6 },
]

export default function DriverAnalytics() {
  const maxEarnings = Math.max(...WEEKLY_EARNINGS.map(w => w.amount))
  const maxViews = Math.max(...PROFILE_VIEWS.map(p => p.views))
  const totalTime = TIME_SPLIT.reduce((s, t) => s + t.driving + t.idle, 0)
  const totalDriving = TIME_SPLIT.reduce((s, t) => s + t.driving, 0)

  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Track your performance, earnings, and career growth</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `$${KPI.earnings.toLocaleString()}`, icon: '', sub: 'This quarter' },
            { label: 'Average Rating', value: KPI.rating.toFixed(1), icon: '', sub: 'Out of 5.0' },
            { label: 'Distance Covered', value: `${(KPI.distance / 1000).toFixed(1)}k km`, icon: '', sub: 'This quarter' },
            { label: 'Driver Ranking', value: KPI.ranking, icon: '', sub: 'Among all drivers' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-2xl font-bold text-gray-900 mt-2 mb-1">{k.value}</p>
              <p className="text-sm text-gray-600">{k.label}</p>
              <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Profile Views & Clicks — Dual Line Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Profile Views & Clicks</h3>
            <p className="text-sm text-gray-500 mb-4">Total: 2,847 views &bull; 892 clicks</p>
            <svg viewBox="0 0 400 200" className="w-full h-52">
              {/* Grid */}
              {[40, 80, 120, 160].map(y => (
                <line key={y} x1="30" y1={y} x2="390" y2={y} stroke="#f3f4f6" strokeWidth="1" />
              ))}
              {/* Views line */}
              <polyline
                fill="none" stroke="#3f2a52" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                points={PROFILE_VIEWS.map((p, i) => {
                  const x = 50 + (i / (PROFILE_VIEWS.length - 1)) * 330
                  const y = 190 - (p.views / maxViews) * 160
                  return `${x},${y}`
                }).join(' ')}
              />
              {/* Clicks line */}
              <polyline
                fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                points={PROFILE_VIEWS.map((p, i) => {
                  const x = 50 + (i / (PROFILE_VIEWS.length - 1)) * 330
                  const y = 190 - (p.clicks / maxViews) * 160
                  return `${x},${y}`
                }).join(' ')}
              />
              {/* Dots */}
              {PROFILE_VIEWS.map((p, i) => {
                const x = 50 + (i / (PROFILE_VIEWS.length - 1)) * 330
                return (
                  <g key={i}>
                    <circle cx={x} cy={190 - (p.views / maxViews) * 160} r="4" fill="#3f2a52" />
                    <circle cx={x} cy={190 - (p.clicks / maxViews) * 160} r="4" fill="#f59e0b" />
                  </g>
                )
              })}
            </svg>
            <div className="flex justify-between mt-2 text-xs text-gray-500 px-4">
              {PROFILE_VIEWS.map(p => <span key={p.month}>{p.month}</span>)}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#3f2a52]" />
                <span className="text-xs text-gray-600">Views</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="text-xs text-gray-600">Clicks</span>
              </div>
            </div>
          </div>

          {/* Weekly Earnings — Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Weekly Earnings</h3>
            <p className="text-sm text-gray-500 mb-4">Total: $27,000 this quarter</p>
            <div className="flex items-end justify-between h-52 px-4">
              {WEEKLY_EARNINGS.map(w => (
                <div key={w.week} className="flex flex-col items-center flex-1 mx-2">
                  <span className="text-xs font-semibold text-gray-700 mb-1">${(w.amount / 1000).toFixed(1)}k</span>
                  <div className="w-full max-w-14 relative" style={{ height: `${(w.amount / maxEarnings) * 170}px` }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg"
                      style={{ height: '100%', background: 'linear-gradient(to top, #3f2a52, #8b6fb0)' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{w.week}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance Rate — Donut Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Load Acceptance Rate</h3>
            <p className="text-sm text-gray-500 mb-4">Accepted vs Declined</p>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 42 42" className="w-full h-full">
                  <circle cx="21" cy="21" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle
                    cx="21" cy="21" r="15.915"
                    fill="none"
                    stroke="#3f2a52"
                    strokeWidth="4"
                    strokeDasharray={`${ACCEPTANCE.accepted} ${100 - ACCEPTANCE.accepted}`}
                    strokeDashoffset="25"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{ACCEPTANCE.accepted}%</span>
                  <span className="text-sm text-gray-500">Accepted</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-8 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#3f2a52]" />
                <span className="text-sm text-gray-600">Accepted ({ACCEPTANCE.accepted}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <span className="text-sm text-gray-600">Declined ({ACCEPTANCE.declined}%)</span>
              </div>
            </div>
          </div>

          {/* Pay Per Mile — Scatter Plot */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Pay Per Mile Analysis</h3>
            <p className="text-sm text-gray-500 mb-4">$/mile vs distance traveled</p>
            <svg viewBox="0 0 400 250" className="w-full h-52">
              {[60, 110, 160].map(y => (
                <line key={y} x1="40" y1={y} x2="390" y2={y} stroke="#f3f4f6" strokeWidth="1" />
              ))}
              {/* Trend line */}
              <line x1="50" y1="50" x2="380" y2="180" stroke="#3f2a52" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.3" />
              {/* Y-axis */}
              <text x="5" y="65" fontSize="9" fill="#9ca3af">$2.3</text>
              <text x="5" y="120" fontSize="9" fill="#9ca3af">$1.9</text>
              <text x="5" y="175" fontSize="9" fill="#9ca3af">$1.6</text>
              {/* X-axis */}
              <text x="50" y="230" fontSize="9" fill="#9ca3af">200km</text>
              <text x="200" y="230" fontSize="9" fill="#9ca3af">500km</text>
              <text x="350" y="230" fontSize="9" fill="#9ca3af">900km</text>
              {/* Points */}
              {MILES_PAY.map((p, i) => {
                const x = 40 + ((p.km - 150) / 750) * 350
                const y = 210 - ((p.pay - 1.4) / 1.0) * 170
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="7" fill="#3f2a52" opacity="0.7" />
                    <circle cx={x} cy={y} r="3" fill="white" />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Driving vs Idle Time — Stacked Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Driving vs Idle Time</h3>
              <p className="text-sm text-gray-500">Efficiency: {Math.round((totalDriving / totalTime) * 100)}% &bull; {totalDriving}h driving / {totalTime - totalDriving}h idle</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">{Math.round((totalDriving / totalTime) * 100)}%</span>
              <p className="text-xs text-gray-500">Utilization</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-44 px-4">
            {TIME_SPLIT.map(t => (
              <div key={t.label} className="flex flex-col items-center flex-1 mx-2">
                <span className="text-xs font-medium text-gray-600 mb-1">{t.driving + t.idle}h</span>
                <div className="w-full max-w-16 flex flex-col" style={{ height: `${((t.driving + t.idle) / 50) * 120}px` }}>
                  <div
                    className="rounded-t-lg"
                    style={{
                      height: `${(t.idle / (t.driving + t.idle)) * 100}%`,
                      backgroundColor: '#e5e7eb',
                    }}
                  />
                  <div
                    className="rounded-b-lg"
                    style={{
                      height: `${(t.driving / (t.driving + t.idle)) * 100}%`,
                      background: 'linear-gradient(to top, #3f2a52, #6b4f8a)',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2">{t.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#3f2a52]" />
              <span className="text-xs text-gray-600">Driving Time</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gray-200" />
              <span className="text-xs text-gray-600">Idle Time</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}