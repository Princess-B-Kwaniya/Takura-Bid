import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobId, recipientId, content } = await req.json()
  if (!jobId || !recipientId || !content?.trim()) {
    return NextResponse.json({ error: 'jobId, recipientId and content are required' }, { status: 400 })
  }

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  const { data, error } = await supabase
    .from('messages')
    .insert({ job_id: jobId, sender_id: user.user_id, recipient_id: recipientId, content: content.trim(), read: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}
