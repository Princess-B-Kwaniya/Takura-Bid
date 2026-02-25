import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/queries/auth'
import { getDriverJobs, getClientJobs } from '@/lib/queries/loads'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ conversations: [] })

  const jobs = user.role === 'DRIVER'
    ? await getDriverJobs(user.user_id)
    : await getClientJobs(user.user_id)

  // Build conversation list from jobs that have messaging context
  const conversations = jobs
    .filter(j => j.status !== 'Pending')
    .map(j => {
      const other = user.role === 'DRIVER' ? j.client : j.driver
      return {
        jobId: j.job_id,
        loadTitle: j.load?.title ?? `${j.load?.origin_city} → ${j.load?.destination_city}`,
        otherPartyId: other?.user_id ?? '',
        otherPartyName: (user.role === 'DRIVER' ? j.client?.company_name ?? j.client?.name : j.driver?.name) ?? 'Unknown',
        status: j.status,
      }
    })

  return NextResponse.json({ conversations })
}
