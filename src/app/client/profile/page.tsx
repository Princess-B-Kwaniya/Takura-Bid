'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface ProfileData {
  user_id: string
  email: string
  name: string
  role: string
  company_name: string | null
  phone: string | null
  city: string | null
  address: string | null
  total_spent_usd: number
  payment_method_type: string | null
  payment_verified: boolean
  created_at: string
}

export default function ClientProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/users/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          const u: ProfileData = d.user
          setProfile(u)
          setName(u.name ?? '')
          setCompanyName(u.company_name ?? '')
          setPhone(u.phone ?? '')
          setCity(u.city ?? '')
          setAddress(u.address ?? '')
        }
        setLoadingProfile(false)
      })
      .catch(() => setLoadingProfile(false))
  }, [])

  const email = profile?.email ?? ''
  const totalSpent = profile?.total_spent_usd ?? 0
  const paymentVerified = profile?.payment_verified ?? false
  const paymentMethod = profile?.payment_method_type ?? ''
  const createdAt = profile?.created_at ? new Date(profile.created_at) : null
  const memberSince = createdAt
    ? createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  const initials = companyName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, company_name: companyName, phone, city, address }),
    })

    setSaving(false)

    if (res.ok) {
      setSaved(true)
      setShowPreview(true)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed to save profile.')
    }
  }

  if (loadingProfile) {
    return (
      <DashboardLayout userType="client">
        <div className="content-area flex items-center justify-center py-24">
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="client">
      <div className="content-area">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Manage your company information and preferences</p>
            </div>
            <button
              form="profile-form"
              type="submit"
              disabled={saving}
              className="btn-primary mt-4 lg:mt-0 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {saved && (
          <div className="mb-6 flex items-center space-x-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Profile saved successfully!</span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form id="profile-form" onSubmit={handleSave}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column: avatar card + preview */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card">
                <div className="card-content p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {initials}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{companyName || 'Your Company'}</h3>
                    <p className="text-sm text-gray-600 mb-2">Transport Company</p>
                    {paymentVerified && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Payment Verified
                      </span>
                    )}
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Member since:</span>
                        <span className="font-medium">{memberSince}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total spent:</span>
                        <span className="font-medium">${totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-medium text-blue-600">{paymentMethod || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Preview — shown after save */}
              {showPreview && (
                <div className="card border-[#3f2a52]/30">
                  <div className="card-header bg-[#3f2a52]/5">
                    <h2 className="card-title text-[#3f2a52]">Profile Preview</h2>
                    <p className="text-xs text-gray-500 mt-0.5">How drivers see your profile</p>
                  </div>
                  <div className="card-content p-5">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-[#3f2a52] rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{companyName || 'Your Company'}</p>
                        <p className="text-xs text-gray-500">{city || 'Location not set'}</p>
                      </div>
                    </div>
                    {paymentVerified && (
                      <div className="flex items-center space-x-1.5 mb-3">
                        <div className="w-4 h-4 bg-[#3f2a52] rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">Payment Verified</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
                        <p className="text-gray-500">Total Spent</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="font-bold text-gray-900">{memberSince}</p>
                        <p className="text-gray-500">Member Since</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                      {name && <p><span className="font-medium text-gray-700">Contact:</span> {name}</p>}
                      {phone && <p><span className="font-medium text-gray-700">Phone:</span> {phone}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Company Information</h2>
                </div>
                <div className="card-content p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="input-field"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Harare"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <select className="input-field">
                        <option>Manufacturing</option>
                        <option>Retail</option>
                        <option>Agriculture</option>
                        <option>Construction</option>
                        <option>Mining</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                      <textarea
                        rows={3}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="input-field"
                        placeholder="Street address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Contact Information</h2>
                </div>
                <div className="card-content p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input-field"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="input-field"
                        placeholder="+263 ..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={email}
                        disabled
                        className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Billing Information</h2>
                </div>
                <div className="card-content p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <select className="input-field" defaultValue={paymentMethod}>
                        <option>Bank Transfer</option>
                        <option>Credit Card</option>
                        <option>Mobile Money</option>
                        <option>Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                      <select className="input-field">
                        <option>USD - US Dollar</option>
                        <option>ZWL - Zimbabwean Dollar</option>
                        <option>ZAR - South African Rand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                      <select className="input-field">
                        <option>Net 30 days</option>
                        <option>Net 15 days</option>
                        <option>Net 7 days</option>
                        <option>Payment on delivery</option>
                        <option>Advance payment</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Preferences & Settings</h2>
                </div>
                <div className="card-content p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Load Types You Usually Ship</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['General Cargo', 'Electronics', 'Furniture', 'Food Products', 'Construction Materials', 'Raw Materials', 'Vehicles', 'Machinery', 'Chemicals'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Email Notifications', desc: 'Receive updates about bids and driver applications', on: true },
                        { label: 'SMS Alerts', desc: 'Get SMS notifications for urgent updates', on: false },
                        { label: 'Auto-assign Preferred Drivers', desc: 'Automatically assign loads to preferred drivers', on: true },
                      ].map(pref => (
                        <div key={pref.label} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{pref.label}</h4>
                            <p className="text-sm text-gray-600">{pref.desc}</p>
                          </div>
                          <button
                            type="button"
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pref.on ? 'bg-blue-600' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pref.on ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
