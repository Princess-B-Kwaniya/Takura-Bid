import { NextRequest, NextResponse } from 'next/server'

/**
 * Pricing Estimate Endpoint
 * Calls the Python ML API to get price predictions
 * 
 * Request body:
 * {
 *   distance_km: number (required)
 *   pickup_datetime: string ISO format (required) 
 *   temperature?: number (optional, defaults to 25°C)
 *   precipitation?: number (optional, defaults to 0mm)
 * }
 */

const ML_API_BASE = process.env.ML_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { distance_km, pickup_datetime, temperature, precipitation } = body

    // Validate required fields
    if (!distance_km || !pickup_datetime) {
      return NextResponse.json(
        { error: 'distance_km and pickup_datetime are required' },
        { status: 400 }
      )
    }

    // Extract hour and day of week from ISO datetime
    const pickupDate = new Date(pickup_datetime)
    const hour = pickupDate.getHours()
    const day_of_week = pickupDate.getDay() === 0 ? 6 : pickupDate.getDay() - 1 // Convert JS day (0=Sun) to ours (0=Mon)

    // Call Python ML API
    const mlResponse = await fetch(`${ML_API_BASE}/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distance: distance_km,
        hour,
        day_of_week,
        temperature: temperature || 25.0,
        precipitation: precipitation || 0.0,
      }),
    })

    if (!mlResponse.ok) {
      const error = await mlResponse.text()
      console.error('ML API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate price estimate' },
        { status: 500 }
      )
    }

    const prediction = await mlResponse.json()

    // Return prediction to frontend in a clean format
    return NextResponse.json({
      success: true,
      estimate_usd: prediction.estimate_usd,
      confidence: prediction.confidence,
      breakdown: prediction.breakdown,
      range: prediction.range,
      model_version: prediction.model_version,
      suggested_bid: Math.round(prediction.estimate_usd * 100) / 100, // For easier use
    })
  } catch (error) {
    console.error('Pricing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
