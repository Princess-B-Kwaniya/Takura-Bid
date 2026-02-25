import { NextRequest, NextResponse } from 'next/server'
import { getLoadById } from '@/lib/queries/loads'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ loadId: string }> }
) {
  const { loadId } = await params
  const load = await getLoadById(loadId)
  if (!load) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ load })
}
