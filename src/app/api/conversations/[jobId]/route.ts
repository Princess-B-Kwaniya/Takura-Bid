import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/queries/auth'
import { getJobMessages } from '@/lib/queries/loads'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ messages: [] })

  const { jobId } = await params
  const messages = await getJobMessages(jobId)
  return NextResponse.json({ messages })
}
