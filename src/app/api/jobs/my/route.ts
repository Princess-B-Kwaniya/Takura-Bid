import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/queries/auth'
import { getDriverJobs } from '@/lib/queries/loads'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ jobs: [] })
  }

  const jobs = await getDriverJobs(user.user_id)
  return NextResponse.json({ jobs })
}
