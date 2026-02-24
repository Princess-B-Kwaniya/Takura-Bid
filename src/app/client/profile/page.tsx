import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getCurrentUser } from '@/lib/queries/auth'

export const dynamic = 'force-dynamic'

export default async function ClientProfile() {
  const client = await getCurrentUser()

  const name = client?.name ?? ''
  const companyName = client?.company_name ?? ''
  const initials = companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const email = client?.email ?? ''
  const phone = client?.phone ?? ''
  const address = client?.address ? `${client.address}, ${client.city ?? ''}, Zimbabwe` : ''
  const totalSpent = client?.total_spent_usd ?? 0
  const paymentMethod = client?.payment_method_type ?? ''
  const paymentVerified = client?.payment_verified ?? false
  const createdAt = client?.created_at ? new Date(client.created_at) : null
  const memberSince = createdAt ? createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'

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
            <button className="btn-primary mt-4 lg:mt-0">
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Company Logo and Basic Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-content p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {initials}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{companyName}</h3>
                  <p className="text-sm text-gray-600 mb-2">Transport Company</p>
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    {paymentVerified && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Payment Verified</span>
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Member since:</span>
                      <span className="font-medium">{memberSince}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total spent:</span>
                      <span className="font-medium">${totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Payment method:</span>
                      <span className="font-medium text-blue-600">{paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Company Information</h2>
              </div>
              <div className="card-content p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={companyName} 
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input 
                      type="text" 
                      defaultValue="" 
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VAT Number
                    </label>
                    <input 
                      type="text" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="Enter VAT number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select className="input-field">
                      <option>Manufacturing</option>
                      <option>Retail</option>
                      <option>Agriculture</option>
                      <option>Construction</option>
                      <option>Mining</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select className="input-field">
                      <option>1-10 employees</option>
                      <option>11-50 employees</option>
                      <option>51-200 employees</option>
                      <option>201-500 employees</option>
                      <option>500+ employees</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Address
                    </label>
                    <textarea 
                      rows={3}
                      defaultValue={address} 
                      className="input-field"
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea 
                      rows={4}
                      defaultValue=""
                      className="input-field"
                      placeholder="Describe your company and services..."
                    ></textarea>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Contact Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={name} 
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input 
                      type="text" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="Enter job title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternative Phone
                    </label>
                    <input 
                      type="tel" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="Enter alternative phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input 
                      type="url" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="https://example.com"
                    />
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Address
                    </label>
                    <textarea 
                      rows={3}
                      defaultValue="" 
                      className="input-field"
                      placeholder="Same as company address"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select className="input-field">
                      <option>Bank Transfer</option>
                      <option>Credit Card</option>
                      <option>Mobile Money</option>
                      <option>Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Limit (USD)
                    </label>
                    <input 
                      type="number" 
                      defaultValue="" 
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Currency
                    </label>
                    <select className="input-field">
                      <option>USD - US Dollar</option>
                      <option>ZWL - Zimbabwean Dollar</option>
                      <option>ZAR - South African Rand</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
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

            {/* Preferences & Settings */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Preferences & Settings</h2>
              </div>
              <div className="card-content p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Load Types You Usually Ship
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'General Cargo',
                      'Electronics',
                      'Furniture',
                      'Food Products',
                      'Construction Materials',
                      'Raw Materials',
                      'Vehicles',
                      'Machinery',
                      'Chemicals'
                    ].map((type) => (
                      <label key={type} className="flex items-center">
                        <input 
                          type="checkbox" 
                          defaultChecked={false}
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about bids and driver applications</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">SMS Alerts</h4>
                        <p className="text-sm text-gray-600">Get SMS notifications for urgent updates</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Auto-assign Preferred Drivers</h4>
                        <p className="text-sm text-gray-600">Automatically assign loads to your preferred drivers when available</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}