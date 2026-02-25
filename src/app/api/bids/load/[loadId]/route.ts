import { NextRequest, NextResponse } from 'next/server'
import { getLoadBids } from '@/lib/queries/loads'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ loadId: string }> }
) {
  const { loadId } = await params
  const bids = await getLoadBids(loadId)
  return NextResponse.json({ bids })
}
