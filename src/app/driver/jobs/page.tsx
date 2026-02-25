'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

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
  'Pending':    'bg-gray-100 text-gray-800',
  'Active':     'bg-blue-100 text-blue-800',
  'In Transit': 'bg-yellow-100 text-yellow-800',
  'Completed':  'bg-green-100 text-green-800',
}

function JobCard({ job, onAccept, accepting }: { job: Job; onAccept: (id: string) => void; accepting: string | null }) {
  const load = job.load
  const client = job.client

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

      {/* Progress bar for In Transit */}
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
          <p className="font-medium text-sm">{client?.company_name ?? client?.name}</p>
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

      {load?.requirements?.length ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {load.requirements.map((r, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{r}</span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">Job ID: {job.job_id}</span>
        <div className="flex items-center space-x-3">
          {(job.status === 'Active' || job.status === 'In Transit' || job.status === 'Pending') && (
            <Link
              href={`/driver/chat`}
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
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

            {/* Pending offers */}
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

            {/* Active */}
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

            {/* Completed */}
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
      </div>
    </DashboardLayout>
  )
}
