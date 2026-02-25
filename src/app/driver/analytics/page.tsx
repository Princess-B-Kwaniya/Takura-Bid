'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/components/providers/AuthProvider'

interface DriverAnalytics {
  kpi: { earnings: number; rating: number; distance: number; ranking: string }
  weeklyEarnings: { week: string; amount: number }[]
  profileViews: { month: string; views: number; clicks: number }[]
  acceptance: { accepted: number; declined: number }
  milesPay: { km: number; pay: number }[]
  timeSplit: { label: string; driving: number; idle: number }[]
  summary: { totalViews: number; totalClicks: number }
}

export default function DriverAnalytics() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<DriverAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'DRIVER') {
      setLoading(false)
      return
    }
    fetch('/api/analytics/driver')
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
  }, [authLoading, user])

  if (loading) {
    return (
      <DashboardLayout userType="driver">
        <div className="content-area flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#3f2a52] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout userType="driver">
        <div className="content-area">
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl">
            {error || 'No analytics data available yet. Start bidding and completing jobs to see your metrics.'}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { kpi, weeklyEarnings, profileViews, acceptance, milesPay, timeSplit, summary } = data
  const maxEarnings = Math.max(...weeklyEarnings.map(w => w.amount), 1000)
  const maxViews = Math.max(...profileViews.map(p => p.views), 100)
  const totalTime = timeSplit.reduce((s, t) => s + t.driving + t.idle, 0)
  const totalDriving = timeSplit.reduce((s, t) => s + t.driving, 0)

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
            { label: 'Total Earnings', value: `$${kpi.earnings.toLocaleString()}`, sub: 'Lifetime total' },
            { label: 'Average Rating', value: kpi.rating > 0 ? kpi.rating.toFixed(1) : 'New', sub: 'Out of 5.0' },
            { label: 'Distance Covered', value: `${(kpi.distance / 1000).toFixed(1)}k km`, sub: 'All completed jobs' },
            { label: 'Driver Ranking', value: kpi.ranking, sub: 'Performance tier' },
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
            <p className="text-sm text-gray-500 mb-4">Total: {summary.totalViews.toLocaleString()} views &bull; {summary.totalClicks.toLocaleString()} clicks</p>
            <div className="relative h-52">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {[40, 80, 120, 160].map(y => (
                  <line key={y} x1="30" y1={y} x2="390" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                <polyline
                  fill="none" stroke="#3f2a52" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                  points={profileViews.map((p, i) => {
                    const x = 50 + (i / (profileViews.length - 1)) * 330
                    const y = 190 - (p.views / maxViews) * 160
                    return `${x},${y}`
                  }).join(' ')}
                />
                <polyline
                  fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                  points={profileViews.map((p, i) => {
                    const x = 50 + (i / (profileViews.length - 1)) * 330
                    const y = 190 - (p.clicks / maxViews) * 160
                    return `${x},${y}`
                  }).join(' ')}
                />
                {profileViews.map((p, i) => {
                  const x = 50 + (i / (profileViews.length - 1)) * 330
                  return (
                    <g key={i}>
                      <circle cx={x} cy={190 - (p.views / maxViews) * 160} r="4" fill="#3f2a52" />
                      <circle cx={x} cy={190 - (p.clicks / maxViews) * 160} r="4" fill="#f59e0b" />
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 px-4">
              {profileViews.map(p => <span key={p.month}>{p.month}</span>)}
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
            <p className="text-sm text-gray-500 mb-4">Total: ${kpi.earnings.toLocaleString()} lifetime</p>
            <div className="flex items-end justify-between h-52 px-4">
              {weeklyEarnings.map(w => (
                <div key={w.week} className="flex flex-col items-center flex-1 mx-2">
                  <span className="text-xs font-semibold text-gray-700 mb-1">${(w.amount / 1000).toFixed(1)}k</span>
                  <div className="w-full max-w-14 relative" style={{ height: `${Math.max((w.amount / maxEarnings) * 170, 2)}px` }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg"
                      style={{ height: '100%', background: w.amount > 0 ? 'linear-gradient(to top, #3f2a52, #8b6fb0)' : '#f3f4f6' }}
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
                  {acceptance.accepted + acceptance.declined > 0 && (
                    <circle
                      cx="21" cy="21" r="15.915"
                      fill="none"
                      stroke="#3f2a52"
                      strokeWidth="4"
                      strokeDasharray={`${acceptance.accepted} ${100 - acceptance.accepted}`}
                      strokeDashoffset="25"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{acceptance.accepted}%</span>
                  <span className="text-sm text-gray-500">Accepted</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-8 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#3f2a52]" />
                <span className="text-sm text-gray-600">Accepted ({acceptance.accepted}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <span className="text-sm text-gray-600">Declined ({acceptance.declined}%)</span>
              </div>
            </div>
          </div>

          {/* Pay Per Mile — Scatter Plot */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Pay Per Mile Analysis</h3>
            <p className="text-sm text-gray-500 mb-4">$/mile vs distance traveled</p>
            <div className="relative h-52">
              {milesPay.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">No job data yet.</div>
              ) : (
                <svg viewBox="0 0 400 250" className="w-full h-full">
                  {[60, 110, 160].map(y => (
                    <line key={y} x1="40" y1={y} x2="390" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  ))}
                  <line x1="50" y1="50" x2="380" y2="180" stroke="#3f2a52" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.3" />
                  <text x="5" y="65" fontSize="9" fill="#9ca3af">$2.3</text>
                  <text x="5" y="120" fontSize="9" fill="#9ca3af">$1.9</text>
                  <text x="5" y="175" fontSize="9" fill="#9ca3af">$1.6</text>
                  <text x="50" y="230" fontSize="9" fill="#9ca3af">200km</text>
                  <text x="200" y="230" fontSize="9" fill="#9ca3af">500km</text>
                  <text x="350" y="230" fontSize="9" fill="#9ca3af">900km</text>
                  {milesPay.map((p, i) => {
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
              )}
            </div>
          </div>
        </div>

        {/* Driving vs Idle Time — Stacked Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Driving vs Idle Time</h3>
              <p className="text-sm text-gray-500">
                Efficiency: {totalTime > 0 ? Math.round((totalDriving / totalTime) * 100) : 0}% &bull; {totalDriving}h driving / {totalTime - totalDriving}h idle
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">{totalTime > 0 ? Math.round((totalDriving / totalTime) * 100) : 0}%</span>
              <p className="text-xs text-gray-500">Utilization</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-44 px-4">
            {timeSplit.map(t => (
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