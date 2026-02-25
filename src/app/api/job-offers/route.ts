import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

/**
 * POST /api/job-offers
 * Client sends a job offer directly to a driver.
 * Body: { driverId, loadId, rateUsd, message? }
 */
export async function POST(req: NextRequest) {
    const user = await getCurrentUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'CLIENT') return NextResponse.json({ error: 'Only clients can send job offers' }, { status: 403 })

    const { driverId, loadId, rateUsd, message } = await req.json()

    if (!driverId || !loadId || !rateUsd) {
        return NextResponse.json({ error: 'driverId, loadId, and rateUsd are required' }, { status: 400 })
    }

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    // Verify the load belongs to this client and is still in bidding
    const { data: load, error: loadErr } = await supabase
        .from('loads')
        .select('load_id, title, status, client_id')
        .eq('load_id', loadId)
        .single()

    if (loadErr || !load) return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    if (load.client_id !== user.user_id) return NextResponse.json({ error: 'This load does not belong to you' }, { status: 403 })
    if (load.status !== 'In Bidding') return NextResponse.json({ error: 'Load is no longer available for offers' }, { status: 400 })

    // Verify driver exists
    const { data: driver, error: driverErr } = await supabase
        .from('users')
        .select('user_id, name, role')
        .eq('user_id', driverId)
        .eq('role', 'DRIVER')
        .single()

    if (driverErr || !driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })

    // Check if a job already exists for this load+driver combo
    const { data: existingJob } = await supabase
        .from('jobs')
        .select('job_id')
        .eq('load_id', loadId)
        .eq('driver_id', driverId)
        .maybeSingle()

    if (existingJob) return NextResponse.json({ error: 'A job offer already exists for this driver on this load' }, { status: 400 })

    // Generate a job ID
    const { data: maxJob } = await supabase
        .from('jobs')
        .select('job_id')
        .order('job_id', { ascending: false })
        .limit(1)
        .single()

    let nextNum = 1
    if (maxJob?.job_id) {
        const match = maxJob.job_id.match(/JOB(\d+)/)
        if (match) nextNum = parseInt(match[1], 10) + 1
    }
    const jobId = `JOB${String(nextNum).padStart(3, '0')}`

    // Create the job with status 'Pending'
    const { data: job, error: jobErr } = await supabase
        .from('jobs')
        .insert({
            job_id: jobId,
            load_id: loadId,
            driver_id: driverId,
            client_id: user.user_id,
            rate_usd: parseFloat(rateUsd),
            status: 'Pending',
            progress_pct: 0,
        })
        .select()
        .single()

    if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 })

    // Update the load status to 'Assigned' and set the assigned driver
    await supabase
        .from('loads')
        .update({ status: 'Assigned', assigned_driver_id: driverId })
        .eq('load_id', loadId)

    // If the client included a message, create it as the first job message
    if (message?.trim()) {
        await supabase.from('messages').insert({
            job_id: jobId,
            sender_id: user.user_id,
            recipient_id: driverId,
            content: message.trim(),
            read: false,
        })
    }

    // Create a notification for the driver
    await supabase.from('notifications').insert({
        user_id: driverId,
        title: 'New Job Offer',
        body: `${user.company_name ?? user.name} sent you a job offer for "${load.title}" at $${rateUsd}`,
        type: 'job',
        read: false,
        reference_id: jobId,
    })

    return NextResponse.json({ job, jobId })
}
