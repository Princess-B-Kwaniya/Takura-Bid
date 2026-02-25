import { NextResponse } from 'next/server'
import { getAvailableLoads } from '@/lib/queries/loads'

export async function GET() {
    const loads = await getAvailableLoads()
    return NextResponse.json({ loads })
}
