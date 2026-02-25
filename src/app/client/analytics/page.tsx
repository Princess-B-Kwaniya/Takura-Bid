'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/components/providers/AuthProvider'

interface AnalyticsData {
  kpi: { totalCost: number; onTime: number; shipments: number; costPerMile: number }
  monthlyCosts: { month: string; cost: number }[]
  onTimeRates: { month: string; rate: number }[]
  routeVolumes: { route: string; volume: number; color: string }[]
  costPerMileData: { dist: number; cpm: number }[]
  performance: { label: string; value: string; color: string }[]
}

export default function ClientAnalytics() {
  const { loading: authLoading } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    fetch('/api/analytics/client')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to fetch analytics data')
        setLoading(false)
      })
  }, [authLoading])

  if (loading) {
    return (
      <DashboardLayout userType="client">
        <div className="content-area flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#3f2a52] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout userType="client">
        <div className="content-area">
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl">
            {error || 'No analytics data available yet. Start shipping to see your performance metrics.'}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { kpi, monthlyCosts, onTimeRates, routeVolumes, costPerMileData, performance } = data
  const maxCost = Math.max(...monthlyCosts.map(c => c.cost), 1000)
  const maxVolume = Math.max(...routeVolumes.map(r => r.volume), 1)

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
            { label: 'Total Shipping Costs', value: `$${kpi.totalCost.toLocaleString()}`, change: kpi.shipments > 0 ? '+8% this month' : 'No shipments yet', changeColor: 'text-blue-600' },
            { label: 'On-Time Delivery', value: `${kpi.onTime}%`, change: 'Based on completed jobs', changeColor: 'text-gray-500' },
            { label: 'Total Shipments', value: kpi.shipments, change: 'Lifetime total', changeColor: 'text-gray-500' },
            { label: 'Avg Cost/Mile', value: `$${kpi.costPerMile}`, change: 'Trip efficiency', changeColor: 'text-gray-500' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
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
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 w-8">
                <span>${(maxCost / 1000).toFixed(1)}k</span>
                <span>${(maxCost / 2000).toFixed(1)}k</span>
                <span>$0</span>
              </div>
              <svg className="ml-10 w-[calc(100%-40px)] h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                {[0, 50, 100, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                {monthlyCosts.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#3f2a52"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={monthlyCosts.map((c, i) => {
                        const x = (i / (monthlyCosts.length - 1)) * 380 + 10
                        const y = 200 - (c.cost / maxCost) * 180 - 10
                        return `${x},${y}`
                      }).join(' ')}
                    />
                    <polygon
                      fill="url(#costGradient)"
                      opacity="0.15"
                      points={[
                        ...monthlyCosts.map((c, i) => {
                          const x = (i / (monthlyCosts.length - 1)) * 380 + 10
                          const y = 200 - (c.cost / maxCost) * 180 - 10
                          return `${x},${y}`
                        }),
                        `390,200`,
                        `10,200`,
                      ].join(' ')}
                    />
                  </>
                )}
                {monthlyCosts.map((c, i) => {
                  const x = (i / (monthlyCosts.length - 1)) * 380 + 10
                  const y = 200 - (c.cost / maxCost) * 180 - 10
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#3f2a52" />
                      {c.cost > 0 && (
                        <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">${(c.cost / 1000).toFixed(1)}k</text>
                      )}
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
              {monthlyCosts.map(c => <span key={c.month}>{c.month}</span>)}
            </div>
          </div>

          {/* On-Time Delivery Rate — Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">On-Time Delivery Rate</h3>
            <p className="text-sm text-gray-500 mb-4">Percentage by month</p>
            <div className="flex items-end justify-between h-56 px-4">
              {onTimeRates.map(d => (
                <div key={d.month} className="flex flex-col items-center flex-1 mx-1">
                  <span className="text-xs font-semibold text-gray-700 mb-1">{d.rate}%</span>
                  <div className="w-full max-w-12 relative" style={{ height: `${Math.max((d.rate / 100) * 180, 2)}px` }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg"
                      style={{
                        height: '100%',
                        background: d.rate > 0 ? `linear-gradient(to top, #3f2a52, #6b4f8a)` : '#f3f4f6',
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
              {routeVolumes.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No route data available yet.</div>
              ) : routeVolumes.map(r => (
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
            <p className="text-sm text-gray-500 mb-4">$/mile vs distance (km) — avg ${kpi.costPerMile}/mile</p>
            <div className="relative h-56">
              {costPerMileData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">No trip data yet.</div>
              ) : (
                <svg viewBox="0 0 400 250" className="w-full h-full">
                  {[50, 100, 150, 200].map(y => (
                    <line key={y} x1="40" y1={y} x2="390" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  ))}
                  <line x1="50" y1="60" x2="380" y2="180" stroke="#3f2a52" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.4" />
                  <text x="10" y="65" fontSize="9" fill="#9ca3af">$2.2</text>
                  <text x="10" y="125" fontSize="9" fill="#9ca3af">$1.8</text>
                  <text x="10" y="185" fontSize="9" fill="#9ca3af">$1.5</text>
                  <text x="60" y="240" fontSize="9" fill="#9ca3af">150km</text>
                  <text x="200" y="240" fontSize="9" fill="#9ca3af">450km</text>
                  <text x="350" y="240" fontSize="9" fill="#9ca3af">900km</text>
                  {costPerMileData.map((p, i) => {
                    const x = 40 + ((p.dist - 100) / 800) * 350
                    const y = 220 - ((p.cpm - 1.3) / 1.0) * 170
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="6" fill="#3f2a52" opacity="0.8" />
                        <circle cx={x} cy={y} r="3" fill="white" />
                      </g>
                    )
                  })}
                  <line x1="40" y1={220 - ((kpi.costPerMile - 1.3) / 1.0) * 170} x2="390" y2={220 - ((kpi.costPerMile - 1.3) / 1.0) * 170}
                    stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="395" y={220 - ((kpi.costPerMile - 1.3) / 1.0) * 170 + 4} fontSize="9" fill="#ef4444" fontWeight="600">avg</text>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Performance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {performance.map(p => (
              <div key={p.label} className="text-center">
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