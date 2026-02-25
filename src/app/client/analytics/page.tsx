'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'

/* ─── Sample data from SRS ─── */
const KPI = {
  totalCost: 15420,
  onTime: 96,
  shipments: 42,
  costPerMile: 1.85,
}

const MONTHLY_COSTS = [
  { month: 'Oct', cost: 3200 },
  { month: 'Nov', cost: 3800 },
  { month: 'Dec', cost: 4100 },
  { month: 'Jan', cost: 4320 },
]

const ON_TIME_RATES = [
  { month: 'Oct', rate: 92 },
  { month: 'Nov', rate: 94 },
  { month: 'Dec', rate: 95 },
  { month: 'Jan', rate: 97 },
  { month: 'Feb', rate: 96 },
]

const ROUTE_VOLUMES = [
  { route: 'Harare → Bulawayo', volume: 15, color: '#3f2a52' },
  { route: 'Harare → Mutare', volume: 10, color: '#6b4f8a' },
  { route: 'Bulawayo → Vic Falls', volume: 8, color: '#8b6fb0' },
  { route: 'Harare → Masvingo', volume: 5, color: '#ab8fd6' },
  { route: 'Gweru → Chinhoyi', volume: 4, color: '#c5b0e0' },
]

const COST_PER_MILE = [
  { dist: 150, cpm: 2.1 },
  { dist: 263, cpm: 1.9 },
  { dist: 292, cpm: 1.85 },
  { dist: 439, cpm: 1.7 },
  { dist: 440, cpm: 1.75 },
  { dist: 879, cpm: 1.5 },
]

const PERFORMANCE = [
  { label: 'Cost Savings vs. Previous Quarter', value: '12%', icon: '📉', color: 'text-green-600' },
  { label: 'Average Transit Time', value: '2.3 days', icon: '⏱️', color: 'text-blue-600' },
  { label: 'Driver Satisfaction Rate', value: '98%', icon: '⭐', color: 'text-yellow-600' },
  { label: 'Loads Requiring Rebid', value: '2', icon: '🔁', color: 'text-orange-600' },
]

export default function ClientAnalytics() {
  const maxCost = Math.max(...MONTHLY_COSTS.map(c => c.cost))
  const maxVolume = Math.max(...ROUTE_VOLUMES.map(r => r.volume))

  return (
    <DashboardLayout userType="client">
      <div className="content-area">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Track your shipping performance and spending trends</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Shipping Costs', value: `$${KPI.totalCost.toLocaleString()}`, icon: '💰', change: '-12% vs last quarter', changeColor: 'text-green-600' },
            { label: 'On-Time Delivery', value: `${KPI.onTime}%`, icon: '📦', change: '+4% vs last quarter', changeColor: 'text-green-600' },
            { label: 'Total Shipments', value: KPI.shipments, icon: '🚛', change: '+8 this month', changeColor: 'text-blue-600' },
            { label: 'Avg Cost/Mile', value: `$${KPI.costPerMile}`, icon: '📊', change: '-$0.15 vs avg', changeColor: 'text-green-600' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{k.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{k.value}</p>
              <p className="text-sm text-gray-600">{k.label}</p>
              <p className={`text-xs mt-1 font-medium ${k.changeColor}`}>{k.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Shipping Costs Over Time — Line Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Shipping Costs Over Time</h3>
            <p className="text-sm text-gray-500 mb-4">Monthly spend (USD)</p>
            <div className="relative h-56">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 w-8">
                <span>$5k</span>
                <span>$3k</span>
                <span>$1k</span>
              </div>
              {/* Chart area */}
              <svg className="ml-10 w-[calc(100%-40px)] h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 50, 100, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#3f2a52"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={MONTHLY_COSTS.map((c, i) => {
                    const x = (i / (MONTHLY_COSTS.length - 1)) * 380 + 10
                    const y = 200 - (c.cost / 5000) * 200
                    return `${x},${y}`
                  }).join(' ')}
                />
                {/* Area fill */}
                <polygon
                  fill="url(#costGradient)"
                  opacity="0.15"
                  points={[
                    ...MONTHLY_COSTS.map((c, i) => {
                      const x = (i / (MONTHLY_COSTS.length - 1)) * 380 + 10
                      const y = 200 - (c.cost / 5000) * 200
                      return `${x},${y}`
                    }),
                    `390,200`,
                    `10,200`,
                  ].join(' ')}
                />
                {/* Dots */}
                {MONTHLY_COSTS.map((c, i) => {
                  const x = (i / (MONTHLY_COSTS.length - 1)) * 380 + 10
                  const y = 200 - (c.cost / 5000) * 200
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#3f2a52" />
                      <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">${(c.cost / 1000).toFixed(1)}k</text>
                    </g>
                  )
                })}
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3f2a52" />
                    <stop offset="100%" stopColor="#3f2a52" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between ml-10 mt-2 text-xs text-gray-500">
              {MONTHLY_COSTS.map(c => <span key={c.month}>{c.month}</span>)}
            </div>
          </div>

          {/* On-Time Delivery Rate — Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">On-Time Delivery Rate</h3>
            <p className="text-sm text-gray-500 mb-4">Percentage by month</p>
            <div className="flex items-end justify-between h-56 px-4">
              {ON_TIME_RATES.map(d => (
                <div key={d.month} className="flex flex-col items-center flex-1 mx-1">
                  <span className="text-xs font-semibold text-gray-700 mb-1">{d.rate}%</span>
                  <div className="w-full max-w-12 relative" style={{ height: `${(d.rate / 100) * 180}px` }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg"
                      style={{
                        height: '100%',
                        background: `linear-gradient(to top, #3f2a52, #6b4f8a)`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Volume by Route — Horizontal Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Shipment Volume by Route</h3>
            <p className="text-sm text-gray-500 mb-4">Number of shipments per route</p>
            <div className="space-y-4">
              {ROUTE_VOLUMES.map(r => (
                <div key={r.route}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{r.route}</span>
                    <span className="text-gray-900 font-semibold">{r.volume}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${(r.volume / maxVolume) * 100}%`,
                        backgroundColor: r.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Per Mile — Scatter Plot */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Cost Per Mile Analysis</h3>
            <p className="text-sm text-gray-500 mb-4">$/mile vs distance (km) — avg $1.85/mile</p>
            <svg viewBox="0 0 400 250" className="w-full h-56">
              {/* Grid */}
              {[50, 100, 150, 200].map(y => (
                <line key={y} x1="40" y1={y} x2="390" y2={y} stroke="#f3f4f6" strokeWidth="1" />
              ))}
              {/* Trend line */}
              <line x1="50" y1="60" x2="380" y2="180" stroke="#3f2a52" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.4" />
              {/* Y-axis */}
              <text x="10" y="65" fontSize="9" fill="#9ca3af">$2.2</text>
              <text x="10" y="125" fontSize="9" fill="#9ca3af">$1.8</text>
              <text x="10" y="185" fontSize="9" fill="#9ca3af">$1.5</text>
              {/* X-axis */}
              <text x="60" y="240" fontSize="9" fill="#9ca3af">150km</text>
              <text x="200" y="240" fontSize="9" fill="#9ca3af">450km</text>
              <text x="350" y="240" fontSize="9" fill="#9ca3af">900km</text>
              {/* Data points */}
              {COST_PER_MILE.map((p, i) => {
                const x = 40 + ((p.dist - 100) / 800) * 350
                const y = 220 - ((p.cpm - 1.3) / 1.0) * 170
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="6" fill="#3f2a52" opacity="0.8" />
                    <circle cx={x} cy={y} r="3" fill="white" />
                  </g>
                )
              })}
              {/* Average line */}
              <line x1="40" y1={220 - ((1.85 - 1.3) / 1.0) * 170} x2="390" y2={220 - ((1.85 - 1.3) / 1.0) * 170}
                stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" />
              <text x="395" y={220 - ((1.85 - 1.3) / 1.0) * 170 + 4} fontSize="9" fill="#ef4444" fontWeight="600">avg</text>
            </svg>
          </div>
        </div>

        {/* Monthly Performance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PERFORMANCE.map(p => (
              <div key={p.label} className="text-center">
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className={`text-2xl font-bold mb-1 ${p.color}`}>{p.value}</div>
                <p className="text-sm text-gray-600">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}