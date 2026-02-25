import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ bid: null })
  }

  const loadId = req.nextUrl.searchParams.get('loadId')
  if (!loadId) return NextResponse.json({ bid: null })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ bid: null })

  const { data } = await supabase
    .from('bids')
    .select('*')
    .eq('driver_id', user.user_id)
    .eq('load_id', loadId)
    .maybeSingle()

  return NextResponse.json({ bid: data ?? null })
}
