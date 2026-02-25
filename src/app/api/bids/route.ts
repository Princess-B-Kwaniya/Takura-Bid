import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { loadId, amount, message } = await req.json()
  if (!loadId || !amount) {
    return NextResponse.json({ error: 'loadId and amount are required' }, { status: 400 })
  }

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  // Check load is still open
  const { data: load } = await supabase.from('loads').select('status').eq('load_id', loadId).single()
  if (!load || load.status !== 'In Bidding') {
    return NextResponse.json({ error: 'Load is no longer accepting bids' }, { status: 409 })
  }

  // Check driver hasn't already bid
  const { data: existing } = await supabase
    .from('bids')
    .select('bid_id')
    .eq('load_id', loadId)
    .eq('driver_id', user.user_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You have already applied to this load' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('bids')
    .insert({ load_id: loadId, driver_id: user.user_id, amount_usd: amount, message, status: 'Pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bid: data })
}
