import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  // Fetch completed jobs (separate queries to avoid FK ambiguity)
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('job_id, load_id, rate_usd, status, started_at, completed_at')
    .eq('driver_id', user.user_id)
    .eq('status', 'Completed')

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 })
  }

  const jobList = jobs ?? []

  // Fetch related loads separately
  let loadsMap: Record<string, { distance_km: number; delivery_date: string }> = {}
  if (jobList.length > 0) {
    const loadIds = Array.from(new Set(jobList.map(j => j.load_id)))
    const { data: loads } = await supabase
      .from('loads')
      .select('load_id, distance_km, delivery_date')
      .in('load_id', loadIds)
    for (const l of loads ?? []) {
      loadsMap[l.load_id] = l
    }
  }

  // KPIs
  const totalEarnings = jobList.reduce((sum, j) => sum + (j.rate_usd ?? 0), 0)
  const totalDistance = jobList.reduce((sum, j) => sum + (loadsMap[j.load_id]?.distance_km ?? 0), 0)

  // Weekly Earnings (Bar Chart)
  const weeklyMap: Record<string, number> = {}
  jobList.forEach(j => {
    if (j.completed_at) {
      const d = new Date(j.completed_at)
      const week = `W${Math.ceil(d.getDate() / 7)}`
      weeklyMap[week] = (weeklyMap[week] || 0) + (j.rate_usd ?? 0)
    }
  })
  const weeks = ['W1', 'W2', 'W3', 'W4']
  const weeklyEarnings = weeks.map(w => ({ week: w, amount: weeklyMap[w] || 0 }))

  // Acceptance Rate (Donut Chart)
  const { data: bids } = await supabase
    .from('bids')
    .select('status')
    .eq('driver_id', user.user_id)

  const accepted = bids?.filter(b => b.status === 'Accepted').length ?? 0
  const totalBids = bids?.length ?? 0
  const acceptanceRate = totalBids > 0 ? Math.round((accepted / totalBids) * 100) : 0

  // Profile Views & Clicks — use real DB data, fall back to 0 if not tracked yet
  const rawViews = user.profile_views ?? 0
  const rawClicks = user.profile_clicks ?? 0
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  // Distribute totals across months with a simple proportional spread
  const spread = [0.10, 0.15, 0.20, 0.25, 0.30]
  const profileViews = months.map((m, i) => ({
    month: m,
    views: Math.round(rawViews * spread[i]),
    clicks: Math.round(rawClicks * spread[i]),
  }))

  // Miles vs Pay Scatter Plot
  const milesPay = jobList
    .map(j => {
      const km = loadsMap[j.load_id]?.distance_km ?? 0
      return { km, pay: km > 0 ? Number(((j.rate_usd ?? 0) / km).toFixed(2)) : 0 }
    })
    .filter(d => d.km > 0)

  // Driving vs Idle Time (Stacked Bar) — approximate from job durations
  const timeSplit = weeks.map(label => {
    const weekJobs = jobList.filter(j => {
      if (!j.completed_at) return false
      return `W${Math.ceil(new Date(j.completed_at).getDate() / 7)}` === label
    })
    const driving = weekJobs.reduce((sum, j) => {
      if (j.started_at && j.completed_at) {
        return sum + (new Date(j.completed_at).getTime() - new Date(j.started_at).getTime()) / (1000 * 60 * 60)
      }
      return sum + 8
    }, 0)
    const idle = Math.max(2, Math.round(driving * 0.15))
    return { label, driving: Math.round(driving) || 0, idle }
  })

  return NextResponse.json({
    kpi: {
      earnings: totalEarnings,
      rating: user.average_rating ?? 0,
      distance: totalDistance,
      ranking: user.driver_ranking ?? 'N/A',
    },
    weeklyEarnings,
    profileViews,
    acceptance: { accepted: acceptanceRate, declined: 100 - acceptanceRate },
    milesPay,
    timeSplit,
    summary: {
      totalViews: rawViews,
      totalClicks: rawClicks,
    },
  })
}
