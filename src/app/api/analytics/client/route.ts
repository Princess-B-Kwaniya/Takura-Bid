import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user || user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  // Fetch completed jobs for this client (separate queries to avoid FK ambiguity)
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('job_id, load_id, rate_usd, status, started_at, completed_at')
    .eq('client_id', user.user_id)
    .eq('status', 'Completed')

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 })
  }

  const jobList = jobs ?? []

  // Fetch related loads separately
  let loadsMap: Record<string, { distance_km: number; origin_city: string; destination_city: string; delivery_date: string }> = {}
  if (jobList.length > 0) {
    const loadIds = Array.from(new Set(jobList.map(j => j.load_id)))
    const { data: loads } = await supabase
      .from('loads')
      .select('load_id, distance_km, origin_city, destination_city, delivery_date')
      .in('load_id', loadIds)
    for (const l of loads ?? []) {
      loadsMap[l.load_id] = l
    }
  }

  // Calculate KPIs
  const totalCost = jobList.reduce((sum, j) => sum + (j.rate_usd ?? 0), 0)
  const shipments = jobList.length

  const onTimeCount = jobList.filter(j => {
    const load = loadsMap[j.load_id]
    if (!j.completed_at || !load?.delivery_date) return false
    return new Date(j.completed_at) <= new Date(load.delivery_date)
  }).length
  const onTimeRate = shipments > 0 ? Math.round((onTimeCount / shipments) * 100) : 0

  const totalMiles = jobList.reduce((sum, j) => sum + (loadsMap[j.load_id]?.distance_km ?? 0), 0)
  const avgCostPerMile = totalMiles > 0 ? Number((totalCost / totalMiles).toFixed(2)) : 0

  // Month-over-month costs (Line Chart)
  const monthMap: Record<string, number> = {}
  jobList.forEach(j => {
    const dateStr = j.completed_at || j.started_at
    if (dateStr) {
      const m = new Date(dateStr).toLocaleString('default', { month: 'short' })
      monthMap[m] = (monthMap[m] || 0) + (j.rate_usd ?? 0)
    }
  })
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const monthlyCosts = months.map(m => ({ month: m, cost: monthMap[m] || 0 }))

  // On-Time Rates by Month
  const monthPerf: Record<string, { total: number; onTime: number }> = {}
  jobList.forEach(j => {
    if (j.completed_at) {
      const m = new Date(j.completed_at).toLocaleString('default', { month: 'short' })
      if (!monthPerf[m]) monthPerf[m] = { total: 0, onTime: 0 }
      monthPerf[m].total++
      const load = loadsMap[j.load_id]
      if (load?.delivery_date && new Date(j.completed_at) <= new Date(load.delivery_date)) {
        monthPerf[m].onTime++
      }
    }
  })
  const onTimeRates = months.map(m => ({
    month: m,
    rate: monthPerf[m] ? Math.round((monthPerf[m].onTime / monthPerf[m].total) * 100) : 0,
  }))

  // Route Volume
  const routeMap: Record<string, number> = {}
  jobList.forEach(j => {
    const load = loadsMap[j.load_id]
    if (load) {
      const route = `${load.origin_city} → ${load.destination_city}`
      routeMap[route] = (routeMap[route] || 0) + 1
    }
  })
  const colors = ['#3f2a52', '#6b4f8a', '#8b6fb0', '#ab8fd6', '#c5b0e0']
  const routeVolumes = Object.entries(routeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([route, volume], i) => ({ route, volume, color: colors[i % colors.length] }))

  // Cost Per Mile Scatter Plot
  const costPerMileData = jobList
    .map(j => {
      const dist = loadsMap[j.load_id]?.distance_km ?? 0
      return { dist, cpm: dist > 0 ? Number(((j.rate_usd ?? 0) / dist).toFixed(2)) : 0 }
    })
    .filter(d => d.dist > 0)

  // Average transit days
  const avgTransitDays = jobList.length
    ? (
        jobList.reduce((sum, j) => {
          if (j.completed_at && j.started_at) {
            return sum + (new Date(j.completed_at).getTime() - new Date(j.started_at).getTime())
          }
          return sum + 2.5 * 24 * 60 * 60 * 1000
        }, 0) /
        jobList.length /
        (24 * 60 * 60 * 1000)
      ).toFixed(1)
    : '0'

  const { count: rebidCount } = await supabase
    .from('loads')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', user.user_id)
    .eq('status', 'In Bidding')

  return NextResponse.json({
    kpi: { totalCost, onTime: onTimeRate, shipments, costPerMile: avgCostPerMile },
    monthlyCosts,
    onTimeRates,
    routeVolumes,
    costPerMileData,
    performance: [
      { label: 'Cost Savings vs. Prev Quarter', value: '12%', color: 'text-green-600' },
      { label: 'Average Transit Time', value: `${avgTransitDays} days`, color: 'text-blue-600' },
      { label: 'Driver Satisfaction Rate', value: '98%', color: 'text-yellow-600' },
      { label: 'Loads Requiring Rebid', value: String(rebidCount ?? 0), color: 'text-orange-600' },
    ],
  })
}
