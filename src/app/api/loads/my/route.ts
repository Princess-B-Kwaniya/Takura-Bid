import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/queries/auth'
import { getClientLoads } from '@/lib/queries/loads'

export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req)
    if (!user || user.role !== 'CLIENT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loads = await getClientLoads(user.user_id)
    return NextResponse.json({ loads })
}
