import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  const { data: job } = await supabase.from('jobs').select('*').eq('job_id', jobId).single()
  if (!job || job.driver_id !== user.user_id) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  await supabase.from('jobs').update({ status: 'Active' }).eq('job_id', jobId)

  return NextResponse.json({ success: true, jobId })
}
