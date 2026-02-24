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
    // TODO: Replace with authenticated user's ID once login is wired
    supabase
      .from('users')
      .select(SAFE_USER_COLUMNS)
      .eq('user_id', 'USR-005')
      .single()
      .then(({ data }) => {
        if (data) setDriver(data as Driver)
      })
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