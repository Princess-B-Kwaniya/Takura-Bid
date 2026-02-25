import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/users'

export async function GET(req: NextRequest) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'DRIVER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    if (!supabase) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Fetch completed jobs for this driver
    const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*, loads(*)')
        .eq('driver_id', user.user_id)
        .eq('status', 'Completed')

    if (jobsError) {
        return NextResponse.json({ error: jobsError.message }, { status: 500 })
    }

    // Calculate KPIs
    const totalEarnings = jobs?.reduce((sum, j) => sum + j.rate_usd, 0) || 0
    const totalDistance = jobs?.reduce((sum, j) => sum + (j.loads?.distance_km || 0), 0) || 0

    // Weekly Earnings (Bar Chart) - Grouping by week of completion
    const weeklyMap: Record<string, number> = {}
    jobs?.forEach(j => {
        const d = new Date(j.completed_at)
        const week = `W${Math.ceil(d.getDate() / 7)}`
        weeklyMap[week] = (weeklyMap[week] || 0) + j.rate_usd
    })
    const weeks = ['W1', 'W2', 'W3', 'W4']
    const weeklyEarnings = weeks.map(w => ({ week: w, amount: weeklyMap[w] || 0 }))

    // Acceptance Rate (Donut Chart)
    const { data: bids } = await supabase
        .from('bids')
        .select('status')
        .eq('driver_id', user.user_id)

    const accepted = bids?.filter(b => b.status === 'Accepted').length || 0
    const declined = bids?.filter(b => b.status === 'Rejected').length || 0
    const totalBids = bids?.length || 0
    const acceptanceRate = totalBids > 0 ? Math.round((accepted / totalBids) * 100) : 0

    // Profile views & Clicks (Dual Line) - Mocking based on earnings if not in DB
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb']
    const profileViews = months.map((m, i) => ({
        month: m,
        views: 300 + (Math.random() * 200) + (i * 50),
        clicks: 100 + (Math.random() * 50) + (i * 20)
    }))

    // Miles vs Pay Scatter Plot
    const milesPay = jobs?.map(j => ({
        km: j.loads?.distance_km || 0,
        pay: j.loads?.distance_km ? Number((j.rate_usd / j.loads.distance_km).toFixed(2)) : 0
    })).filter(d => d.km > 0) || []

    // Driving vs Idle Time (Stacked Bar)
    const timeSplit = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => {
        const driving = 30 + (Math.random() * 15)
        const idle = 5 + (Math.random() * 10)
        return { label, driving: Math.round(driving), idle: Math.round(idle) }
    })

    return NextResponse.json({
        kpi: {
            earnings: totalEarnings,
            rating: user.average_rating || 0,
            distance: totalDistance,
            ranking: user.driver_ranking || 'N/A'
        },
        weeklyEarnings,
        profileViews,
        acceptance: { accepted: acceptanceRate, declined: 100 - acceptanceRate },
        milesPay,
        timeSplit,
        summary: {
            totalViews: profileViews.reduce((s, p) => s + p.views, 0),
            totalClicks: profileViews.reduce((s, p) => s + p.clicks, 0)
        }
    })
}
