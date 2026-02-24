'use client'

import { useState, useEffect } from 'react'
import { fetchDrivers } from '@/lib/queries/users.client'
import type { Driver as DbDriver } from '@/lib/types/database'

interface Driver {
  id: string
  name: string
  title: string
  country: string
  rating: number
  totalEarned: string
  available: boolean
  skills: string[]
  description: string
  image?: string
}

/** Map a Supabase driver row to our component's Driver shape */
function mapDbDriver(d: DbDriver): Driver {
  const earnings = d.total_earnings_usd ?? 0
  const earnedLabel = earnings >= 1000
    ? `$${Math.round(earnings / 1000)}K+ earned`
    : `$${earnings} earned`

  return {
    id: d.user_id,
    name: d.name,
    title: d.title ?? '',
    country: d.city ?? 'Zimbabwe',
    rating: d.average_rating ?? 0,
    totalEarned: earnedLabel,
    available: d.availability === 'Available',
    skills: d.skill_tags ? d.skill_tags.split(',').map(s => s.trim()) : [],
    description: d.bio ?? '',
    image: d.profile_picture_url ?? undefined,
  }
}

interface DriverCardProps {
  driver: Driver
  onSelect: (driver: Driver) => void
}

function DriverCard({ driver, onSelect }: DriverCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Profile Image and Basic Info */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {driver.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          {/* Mobile: Name and Title directly next to avatar on mobile */}
          <div className="sm:hidden text-center">
            <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
            <p className="text-sm font-medium text-gray-900 leading-tight mt-1">{driver.title}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="lg:flex lg:items-start lg:justify-between">
            {/* Left Side: Driver Details */}
            <div className="flex-1 lg:mr-4">
              {/* Name and Title - Hidden on mobile, shown on tablet+ */}
              <div className="hidden sm:block mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-tight">{driver.title}</p>
              </div>

              {/* Earnings and Rating */}
              <div className="flex items-center space-x-6 mb-3 text-sm text-gray-600">
                <span>{driver.totalEarned}</span>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="font-medium">{driver.rating}</span>
                </div>
                {driver.available && (
                  <span className="text-green-600 font-medium">Available now</span>
                )}
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {driver.skills.slice(0, 3).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {driver.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-md">
                    +{driver.skills.length - 3} more
                  </span>
                )}
              </div>

              {/* Description - Hidden on mobile */}
              <p className="hidden md:block text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                {driver.description}
              </p>
            </div>

            {/* Right Side: Action Buttons - Full width on mobile */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <button 
                onClick={() => onSelect(driver)}
                disabled={!driver.available}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  driver.available
                    ? 'text-white hover:opacity-90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                style={driver.available ? { backgroundColor: '#3f2a52' } : {}}
              >
                {driver.available ? 'Hire Driver' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DriversList() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      fetchDrivers(search || undefined).then((data) => {
        setDrivers(data.map(mapDbDriver))
        setLoading(false)
      })
    }, 300) // debounce search
    return () => clearTimeout(timeout)
  }, [search])

  const handleSelectDriver = (driver: Driver) => {
    console.log('Selected driver:', driver)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Find Transport Drivers</h2>
          <p className="text-gray-600 mt-1">Browse expert drivers and transport specialists for your logistics needs</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input 
            type="text" 
            placeholder="Search by skills, location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
          />
          <button className="btn-secondary whitespace-nowrap">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading drivers...</div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No drivers found.</div>
      ) : (
        <div className="space-y-4">
          {drivers.map((driver) => (
            <DriverCard 
              key={driver.id} 
              driver={driver} 
              onSelect={handleSelectDriver}
            />
          ))}
        </div>
      )}
    </div>
  )
}