import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  const { data, error } = await supabase
    .from('users')
    .select('user_id, email, name, role, company_name, phone, city, address, total_spent_usd, payment_method_type, payment_verified, created_at')
    .eq('user_id', user.user_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user: data })
}

const ALLOWED_FIELDS = [
  'name', 'phone', 'city', 'address',
  'company_name',
  'title', 'bio', 'skill_tags', 'specialization', 'availability',
]

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const updates: Record<string, string> = {}
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', user.user_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user: data })
}
