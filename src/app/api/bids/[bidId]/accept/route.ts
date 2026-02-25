import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  const user = await getCurrentUser(req)
  if (!user || user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bidId } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  // Fetch bid
  const { data: bid } = await supabase.from('bids').select('*').eq('bid_id', bidId).single()
  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 })

  // Verify this client owns the load
  const { data: load } = await supabase.from('loads').select('client_id, status').eq('load_id', bid.load_id).single()
  if (!load || load.client_id !== user.user_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  if (load.status !== 'In Bidding') {
    return NextResponse.json({ error: 'Load is no longer available' }, { status: 409 })
  }

  // Accept this bid, reject all others
  await supabase.from('bids').update({ status: 'Accepted' }).eq('bid_id', bidId)
  await supabase.from('bids').update({ status: 'Rejected' }).eq('load_id', bid.load_id).neq('bid_id', bidId)

  // Update load to Assigned
  await supabase.from('loads').update({ status: 'Assigned', assigned_driver_id: bid.driver_id }).eq('load_id', bid.load_id)

  // Create job (Pending — driver must accept)
  const jobId = `JOB${Date.now()}`
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({ job_id: jobId, load_id: bid.load_id, driver_id: bid.driver_id, client_id: user.user_id, rate_usd: bid.amount_usd, status: 'Pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ job })
}
