import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getCurrentUser } from '@/lib/queries/auth'

export const dynamic = 'force-dynamic'

export default async function DriverProfile() {
  const driver = await getCurrentUser()

  const name = driver?.name ?? ''
  const nameParts = name.split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') ?? ''
  const initials = nameParts.map(n => n[0]).join('').toUpperCase()
  const email = driver?.email ?? ''
  const phone = driver?.phone ?? ''
  const address = driver?.address ? `${driver.address}, ${driver.city ?? ''}, Zimbabwe` : ''
  const avgRating = driver?.average_rating ?? 0
  const bio = driver?.bio ?? ''
  const createdAt = driver?.created_at ? new Date(driver.created_at) : null
  const memberSince = createdAt ? createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'
  const specialization = driver?.specialization ?? ''
  const skillTags = driver?.skill_tags ? driver.skill_tags.split(',').map(s => s.trim()) : []

  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Manage your personal information and preferences</p>
            </div>
            <button className="btn-primary mt-4 lg:mt-0">
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-content p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {initials}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{specialization}</p>
                  <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-4">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{avgRating}</span>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Member since:</span>
                      <span className="font-medium">{memberSince}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total km:</span>
                      <span className="font-medium">{(driver?.total_kilometres ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Acceptance rate:</span>
                      <span className="font-medium text-green-600">{driver?.acceptance_rate_pct ?? 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Personal Information</h2>
              </div>
              <div className="card-content p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={firstName} 
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={lastName} 
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input 
                      type="email" 
                      defaultValue={email} 
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      defaultValue={phone} 
                      className="input-field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea 
                      rows={3}
                      defaultValue={address} 
                      className="input-field"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input 
                      type="text" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="Enter license number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry
                    </label>
                    <input 
                      type="date" 
                      defaultValue="" 
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Vehicle Information</h2>
              </div>
              <div className="card-content p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <select className="input-field">
                      <option>Truck (7 tonnes)</option>
                      <option>Van (3 tonnes)</option>
                      <option>Pickup (1 tonne)</option>
                      <option>Heavy Truck (15+ tonnes)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make & Model
                    </label>
                    <input 
                      type="text" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="e.g. Isuzu NPR 400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input 
                      type="text" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="e.g. 2019"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Plate
                    </label>
                    <input 
                      type="text" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="e.g. ABC-1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity (tonnes)
                    </label>
                    <input 
                      type="number" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="e.g. 7"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Expiry
                    </label>
                    <input 
                      type="date" 
                      defaultValue="" 
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Professional Details</h2>
              </div>
              <div className="card-content p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea 
                    rows={4}
                    defaultValue={bio}
                    className="input-field"
                    placeholder="Tell potential clients about your experience..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input 
                      type="number" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate per KM (USD)
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      defaultValue="" 
                      className="input-field"
                      placeholder="e.g. 1.85"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'General Freight',
                      'Refrigerated',
                      'Fragile Items',
                      'Bulk Cargo',
                      'Construction Materials',
                      'Agricultural Products'
                    ].map((specialization) => (
                      <label key={specialization} className="flex items-center">
                        <input 
                          type="checkbox" 
                          defaultChecked={skillTags.includes(specialization)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{specialization}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Account Settings</h2>
              </div>
              <div className="card-content p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications for new load opportunities</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-purple-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Alerts</h4>
                    <p className="text-sm text-gray-600">Get SMS notifications for urgent loads</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                    <p className="text-sm text-gray-600">Show my profile in search results</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-purple-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}