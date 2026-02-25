'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ROUTE_SUGGESTIONS } from '@/lib/routes'

interface Job {
  job_id: string
  load_id: string
  rate_usd: number
  status: string
  progress_pct: number
  started_at: string | null
  completed_at: string | null
  load: {
    title: string
    cargo_type: string
    origin_city: string
    destination_city: string
    distance_km: number
    pickup_date: string
    delivery_date: string
    requirements: string[] | null
  } | null
  client: {
    user_id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string
  } | null
}

const STATUS_STYLES: Record<string, string> = {
  'Pending': 'bg-gray-100 text-gray-800',
  'Active': 'bg-blue-100 text-blue-800',
  'In Transit': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-green-100 text-green-800',
}

function generateCalendarDays(jobs: Job[]) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const jobDates: Record<number, { status: string; count: number }> = {}
  jobs.forEach(j => {
    if (!j.load) return
    const pickup = new Date(j.load.pickup_date)
    const delivery = new Date(j.load.delivery_date)
    if (pickup.getMonth() === month && pickup.getFullYear() === year) {
      jobDates[pickup.getDate()] = { status: j.status, count: (jobDates[pickup.getDate()]?.count ?? 0) + 1 }
    }
    if (delivery.getMonth() === month && delivery.getFullYear() === year) {
      jobDates[delivery.getDate()] = { status: j.status, count: (jobDates[delivery.getDate()]?.count ?? 0) + 1 }
    }
  })

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })
  return { days, jobDates, monthName, today: now.getDate() }
}

function JobCard({ job, onAccept, accepting }: { job: Job; onAccept: (id: string) => void; accepting: string | null }) {
  const load = job.load

  return (
    <div className={`bg-white rounded-xl border p-6 ${job.status === 'Pending' ? 'border-[#3f2a52]/30 shadow-sm' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {load?.origin_city} → {load?.destination_city}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {job.status}
            </span>
            {job.status === 'Pending' && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse">Action Required</span>
            )}
          </div>
          <p className="text-sm text-gray-600">{load?.title} &bull; {load?.cargo_type}</p>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900">${job.rate_usd.toLocaleString()}</div>
          <p className="text-sm text-gray-500">Rate</p>
        </div>
      </div>

      {job.status === 'In Transit' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{job.progress_pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#3f2a52] h-2 rounded-full transition-all" style={{ width: `${job.progress_pct}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Distance</p>
          <p className="font-medium text-sm">{load?.distance_km} km</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Client</p>
          <p className="font-medium text-sm">{job.client?.company_name ?? job.client?.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Pickup</p>
          <p className="font-medium text-sm">{load?.pickup_date ? new Date(load.pickup_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Delivery</p>
          <p className="font-medium text-sm">{load?.delivery_date ? new Date(load.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">Job ID: {job.job_id}</span>
        <div className="flex items-center space-x-3">
          <Link
            href={`/driver/jobs/${job.job_id}`}
            className="text-sm text-[#3f2a52] font-medium hover:underline"
          >
            View Details
          </Link>
          {(job.status === 'Active' || job.status === 'In Transit' || job.status === 'Pending') && (
            <Link
              href="/driver/chat"
              className="text-sm text-[#3f2a52] font-medium hover:underline"
            >
              Message Client
            </Link>
          )}
          {job.status === 'Pending' && (
            <button
              onClick={() => onAccept(job.job_id)}
              disabled={accepting === job.job_id}
              className="px-5 py-2 bg-[#3f2a52] text-white text-sm font-semibold rounded-lg hover:bg-[#3f2a52]/90 transition-colors disabled:opacity-50"
            >
              {accepting === job.job_id ? 'Accepting...' : 'Accept Job'}
            </button>
          )}
          {job.status === 'Completed' && (
            <span className="text-sm text-green-600 font-medium">
              Completed {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'jobs' | 'calendar' | 'routes'>('jobs')

  useEffect(() => {
    fetch('/api/jobs/my')
      .then(r => r.json())
      .then(d => { setJobs(d.jobs ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleAccept(jobId: string) {
    setAccepting(jobId)
    setError('')
    const res = await fetch(`/api/jobs/${jobId}/accept`, { method: 'POST' })
    const data = await res.json()
    setAccepting(null)
    if (!res.ok) {
      setError(data.error ?? 'Failed to accept job')
    } else {
      setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: 'Active' } : j))
    }
  }

  const pending = jobs.filter(j => j.status === 'Pending')
  const active = jobs.filter(j => j.status === 'Active' || j.status === 'In Transit')
  const completed = jobs.filter(j => j.status === 'Completed')
  const calendar = generateCalendarDays(jobs)

  const totalEarned = completed.reduce((s, j) => s + j.rate_usd, 0)
  const activeEarnings = active.reduce((s, j) => s + j.rate_usd, 0)

  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        <div className="page-header">
          <h1 className="page-title">My Jobs</h1>
          <p className="page-subtitle">Your job offers, active jobs, and history</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#3f2a52] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{active.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Earned</p>
                <p className="text-2xl font-bold text-gray-900">${totalEarned.toLocaleString()}</p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex space-x-2 mb-6 bg-white rounded-xl border border-gray-200 p-1">
              {[
                { key: 'jobs', label: 'My Jobs', icon: '' },
                { key: 'calendar', label: 'Calendar', icon: '' },
                { key: 'routes', label: 'Route Planner', icon: '' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'jobs' | 'calendar' | 'routes')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                    ? 'bg-[#3f2a52] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <>
                {pending.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full inline-block"></span>
                      <span>Job Offers ({pending.length})</span>
                    </h2>
                    <div className="space-y-4">
                      {pending.map(j => <JobCard key={j.job_id} job={j} onAccept={handleAccept} accepting={accepting} />)}
                    </div>
                  </div>
                )}

                {active.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                      <span>Active Jobs ({active.length})</span>
                    </h2>
                    <div className="space-y-4">
                      {active.map(j => <JobCard key={j.job_id} job={j} onAccept={handleAccept} accepting={accepting} />)}
                    </div>
                  </div>
                )}

                {completed.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                      <span>Completed ({completed.length})</span>
                    </h2>
                    <div className="space-y-4">
                      {completed.map(j => <JobCard key={j.job_id} job={j} onAccept={handleAccept} accepting={accepting} />)}
                    </div>
                  </div>
                )}

                {jobs.length === 0 && (
                  <div className="card p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Apply to loads from the Load Board to receive job offers here.</p>
                    <Link href="/driver/loads" className="btn-primary inline-flex">Browse Loads</Link>
                  </div>
                )}
              </>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{calendar.monthName}</h2>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendar.days.map((day, i) => {
                    if (day === null) return <div key={`e${i}`} className="h-14" />
                    const jobInfo = calendar.jobDates[day]
                    const isToday = day === calendar.today
                    return (
                      <div
                        key={day}
                        className={`h-14 rounded-lg flex flex-col items-center justify-center relative transition-all ${isToday ? 'bg-[#3f2a52] text-white' :
                          jobInfo ? 'bg-blue-50 border border-blue-200' :
                            'hover:bg-gray-50'
                          }`}
                      >
                        <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
                        {jobInfo && (
                          <div className={`w-2 h-2 rounded-full mt-0.5 ${jobInfo.status === 'In Transit' ? 'bg-yellow-500' :
                            jobInfo.status === 'Active' ? 'bg-blue-500' :
                              jobInfo.status === 'Completed' ? 'bg-green-500' :
                                'bg-orange-400'
                            }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <span className="text-xs text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-600">Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-gray-600">In Transit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600">Completed</span>
                  </div>
                </div>
              </div>
            )}

            {/* Routes Tab */}
            {activeTab === 'routes' && (
              <div className="space-y-6">
                {/* Route Map */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Zimbabwe Route Network</h2>
                  <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 overflow-hidden" style={{ minHeight: '300px' }}>
                    <svg viewBox="0 0 500 400" className="w-full h-auto">
                      {/* Background */}
                      <rect width="500" height="400" fill="none" />

                      {/* Route lines */}
                      <line x1="220" y1="120" x2="130" y2="280" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="220" y1="120" x2="390" y2="160" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="220" y1="120" x2="230" y2="220" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="230" y1="220" x2="130" y2="280" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="230" y1="220" x2="250" y2="310" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="130" y1="280" x2="70" y2="240" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="250" y1="310" x2="130" y2="280" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="220" y1="120" x2="160" y2="90" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />
                      <line x1="160" y1="90" x2="140" y2="150" stroke="#3f2a52" strokeWidth="2" strokeDasharray="6,3" opacity="0.3" />

                      {/* Active job routes */}
                      {active.map((j, i) => {
                        const positions: Record<string, [number, number]> = {
                          Harare: [220, 120], Bulawayo: [130, 280], Gweru: [230, 220],
                          Mutare: [390, 160], Masvingo: [250, 310], 'Victoria Falls': [70, 240],
                          Chinhoyi: [160, 90], Kariba: [140, 150],
                        }
                        const from = positions[j.load?.origin_city ?? '']
                        const to = positions[j.load?.destination_city ?? '']
                        if (!from || !to) return null
                        return (
                          <line key={j.job_id} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
                            stroke={j.status === 'In Transit' ? '#f59e0b' : '#3b82f6'}
                            strokeWidth="3" opacity="0.8"
                          />
                        )
                      })}

                      {/* City dots and labels */}
                      {[
                        { name: 'Harare', x: 220, y: 120 },
                        { name: 'Bulawayo', x: 130, y: 280 },
                        { name: 'Gweru', x: 230, y: 220 },
                        { name: 'Mutare', x: 390, y: 160 },
                        { name: 'Masvingo', x: 250, y: 310 },
                        { name: 'Vic Falls', x: 70, y: 240 },
                        { name: 'Chinhoyi', x: 160, y: 90 },
                        { name: 'Kariba', x: 140, y: 150 },
                      ].map(city => (
                        <g key={city.name}>
                          <circle cx={city.x} cy={city.y} r="6" fill="#3f2a52" />
                          <circle cx={city.x} cy={city.y} r="3" fill="white" />
                          <text x={city.x + 10} y={city.y + 4} fontSize="11" fill="#1f2937" fontWeight="600">{city.name}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Optimized Routes */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Optimized Route Suggestions</h2>
                  <p className="text-sm text-gray-500 mb-4">Multi-stop routes to maximize your earnings and minimize fuel costs</p>
                  <div className="space-y-4">
                    {ROUTE_SUGGESTIONS.map((route, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-[#3f2a52]/30 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{route.label}</h3>
                            <p className="text-sm text-gray-500">{route.stops.join(' → ')}</p>
                          </div>
                          <div className="bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                            <span className="text-sm font-semibold text-green-700">~{route.fuelSavings}% fuel saved</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Total Distance</p>
                            <p className="font-semibold text-gray-900">{route.totalKm} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Est. Duration</p>
                            <p className="font-semibold text-gray-900">{route.totalHours} hrs</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Stops</p>
                            <p className="font-semibold text-gray-900">{route.stops.length - 1}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {route.legs.map((leg, li) => (
                            <div key={li} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-700">{leg.from} → {leg.to}</span>
                              <span className="text-gray-500">{leg.km} km &bull; ~{leg.hours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
