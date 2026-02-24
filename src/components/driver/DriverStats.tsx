'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SAFE_USER_COLUMNS } from '@/lib/types/database'
import type { Driver } from '@/lib/types/database'

export function DriverStats() {
  const [driver, setDriver] = useState<Driver | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    
    async function fetchDriver() {
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) return
      const { data } = await supabase!
        .from('users')
        .select(SAFE_USER_COLUMNS)
        .eq('user_id', user.id)
        .single()
      if (data) setDriver(data as Driver)
    }
    fetchDriver()
  }, [])

  const statsData = [
    {
      label: 'Total Earnings',
      value: driver ? `$${(driver.total_earnings_usd ?? 0).toLocaleString()}` : '—',
    },
    {
      label: 'Average Rating',
      value: driver ? String(driver.average_rating ?? 0) : '—',
    },
  ]

  return (
    <div className="stats-grid mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}