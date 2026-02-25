import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/queries/auth'
import { getJobMessages } from '@/lib/queries/loads'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ messages: [] })

  const { jobId } = await params
  const messages = await getJobMessages(jobId)
  return NextResponse.json({ messages })
}
