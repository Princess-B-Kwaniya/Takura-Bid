'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SAFE_USER_COLUMNS } from '@/lib/types/database'
import type { SafeUser } from '@/lib/types/database'

interface SidebarProps {
  userType: 'driver' | 'client'
}

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  section?: string
}

const driverNavItems: NavItem[] = [
  {
    label: 'Load Board',
    href: '/driver/loads',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M8 11h4" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/driver/analytics',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6 6a1 1 0 01-1.414 0l-6-6A1 1 0 013 6.586V4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'My Jobs',
    href: '/driver/jobs',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'Chat',
    href: '/driver/chat',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
]

const clientNavItems: NavItem[] = [
  {
    label: 'Drivers',
    href: '/client',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6 6a1 1 0 01-1.414 0l-6-6A1 1 0 013 6.586V4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/client/chat',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'My Loads',
    href: '/client/loads',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
]

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const navItems = userType === 'driver' ? driverNavItems : clientNavItems
  const [user, setUser] = useState<SafeUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    // Get the actual authenticated user
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return
      supabase
        .from('users')
        .select(SAFE_USER_COLUMNS)
        .eq('user_id', authUser.id)
        .single()
        .then(({ data }) => {
          if (data) setUser(data as SafeUser)
        })
    })
  }, [userType])

  const displayName = user?.name ?? (userType === 'driver' ? 'Driver' : 'Client')
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#391b49"/>
              <path d="M8 18h16v6H8v-6zm2-4h12v3H10v-3z" fill="white"/>
              <circle cx="12" cy="26" r="2" fill="white"/>
              <circle cx="20" cy="26" r="2" fill="white"/>
              <path d="M14 12h4v2h-4v-2z" fill="white"/>
            </svg>
          </div>
          <span className="logo-text">TakuraBid</span>
        </div>

        {/* Navigation Menu */}
        <nav className="navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href} className="nav-item">
                <Link 
                  href={item.href} 
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link 
            href={userType === 'driver' ? '/driver/profile' : '/client/profile'}
            className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center text-white font-medium">
              {initials}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 group-hover:text-gray-700">
                {displayName}
              </p>
              <p className="text-sm text-gray-500 capitalize">{userType}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  )
}