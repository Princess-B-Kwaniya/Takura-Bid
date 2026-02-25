'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface FloatingNavbarProps {
  userType: 'driver' | 'client'
}

interface NavItem {
  label: string
  href: string
  hasDropdown?: boolean
}

const driverNavItems: NavItem[] = [
  { label: 'Load Board', href: '/driver/loads' },
  { label: 'Analytics', href: '/driver/analytics' },
  { label: 'My Jobs', href: '/driver/jobs' },
  { label: 'Chat', href: '/driver/chat' },
]

const clientNavItems: NavItem[] = [
  { label: 'Find Drivers', href: '/client', hasDropdown: true },
  { label: 'Messages', href: '/client/chat' },
  { label: 'My Loads', href: '/client/loads' },
  { label: 'Analytics', href: '/client/analytics' },
]

export function FloatingNavbar({ userType }: FloatingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const navItems = userType === 'driver' ? driverNavItems : clientNavItems
  const profileHref = userType === 'driver' ? '/driver/profile' : '/client/profile'

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  return (
    <nav className="floating-navbar">
      <div className="navbar-content">
        {/* Brand Logo - Left */}
        <div className="flex items-center">
          <Link href="/" className="brand-logo">
            TakuraBid
          </Link>
        </div>

        {/* Navigation Links - Center */}
        <div className="nav-links">
          {navItems.map((item) => (
            <div key={item.href} className="relative">
              <Link
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                {item.label}
                {item.hasDropdown && (
                  <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* Search & Actions - Right */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Profile & Sign Out */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href={profileHref}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {user?.name ?? 'Profile'}
            </Link>
            <button
              onClick={handleSignOut}
              className="btn-primary text-sm px-5"
            >
              Sign out
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
              <span className={`w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-6 py-4 space-y-4 bg-white border-t border-gray-200">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-base font-medium transition-colors duration-200 ${
                    pathname === item.href 
                      ? 'text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Profile & Sign Out */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link
                href={profileHref}
                className="block w-full text-left text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {user?.name ?? 'Profile'}
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full btn-primary text-base py-3"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}