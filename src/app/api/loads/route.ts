import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

export async function POST(req: NextRequest) {
    const user = await getCurrentUser(req)
    if (!user || user.role !== 'CLIENT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
        title,
        cargo_type,
        weight_tons,
        origin_city,
        destination_city,
        distance_km,
        budget_usd,
        pickup_date,
        delivery_date,
        trip_type,
        urgency,
        description,
        requirements,
    } = body

    if (!title || !cargo_type || !weight_tons || !origin_city || !destination_city || !budget_usd || !pickup_date || !delivery_date) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const load_id = `LOAD${Date.now()}`

    const { data, error } = await supabase
        .from('loads')
        .insert({
            load_id,
            client_id: user.user_id,
            title,
            cargo_type,
            weight_tons,
            origin_city,
            destination_city,
            distance_km: distance_km ?? 300,
            budget_usd,
            pickup_date,
            delivery_date,
            trip_type: trip_type ?? 'One Way',
            urgency: urgency ?? 'Standard',
            description: description ?? null,
            requirements: requirements ?? null,
            status: 'In Bidding',
            bids_count: 0,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ load: data }, { status: 201 })
}
