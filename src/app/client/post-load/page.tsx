'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CITIES, CARGO_TYPES, SPECIAL_REQUIREMENTS, getDistance } from '@/lib/routes'

export default function PostLoadPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    cargoType: '',
    weight: '',
    origin: '',
    destination: '',
    pickupDate: '',
    deliveryDate: '',
    budget: '',
    tripType: 'One Way',
    urgency: 'Standard',
    description: '',
    requirements: [] as string[],
  })

  const distance = formData.origin && formData.destination
    ? getDistance(formData.origin, formData.destination)
    : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleRequirement = (req: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(req)
        ? prev.requirements.filter(r => r !== req)
        : [...prev.requirements, req],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.cargoType || !formData.weight || !formData.origin || !formData.destination || !formData.pickupDate || !formData.deliveryDate || !formData.budget) {
      setError('Please fill in all required fields.')
      return
    }
    if (formData.origin === formData.destination) {
      setError('Origin and destination must be different.')
      return
    }
    if (new Date(formData.deliveryDate) < new Date(formData.pickupDate)) {
      setError('Delivery date must be on or after pickup date.')
      return
    }
    if (parseFloat(formData.weight) <= 0) {
      setError('Weight must be greater than 0.')
      return
    }
    if (parseFloat(formData.budget) <= 0) {
      setError('Budget must be greater than 0.')
      return
    }

    setSubmitting(true)
    try {
      const title = `${formData.cargoType} Transport`
      const res = await fetch('/api/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          cargo_type: formData.cargoType,
          weight_tons: parseFloat(formData.weight),
          origin_city: formData.origin,
          destination_city: formData.destination,
          distance_km: distance ?? 300,
          budget_usd: parseFloat(formData.budget),
          pickup_date: formData.pickupDate,
          delivery_date: formData.deliveryDate,
          trip_type: formData.tripType,
          urgency: formData.urgency,
          description: formData.description || null,
          requirements: formData.requirements.length > 0 ? formData.requirements : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to post load. Please try again.')
        setSubmitting(false)
        return
      }
      router.push('/client/loads')
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout userType="client">
      <div className="content-area">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Post A Load</h1>
              <p className="page-subtitle">Create a new load posting and connect with verified drivers</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="card">
            <div className="card-content">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Load Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v2h2V6H5zm2 2v2H5v-2h2zm-2 2v2h2v-2H5zm2 2v2H5v-2h2zm2-8v2h2V6H9zm2 2v2H9v-2h2zm-2 2v2h2v-2H9zm2 2v2H9v-2h2zm2-8v2h2V6h-2zm2 2v2h-2v-2h2zm-2 2v2h2v-2h-2zm2 2v2h-2v-2h2z" />
                      </svg>
                    </div>
                    Load Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="cargoType" className="block text-sm font-semibold text-gray-800">
                        Cargo Type *
                      </label>
                      <select
                        id="cargoType"
                        name="cargoType"
                        required
                        value={formData.cargoType}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select cargo type</option>
                        {CARGO_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="weight" className="block text-sm font-semibold text-gray-800">
                        Weight (tons) *
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        required
                        min="0.1"
                        step="0.1"
                        value={formData.weight}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g. 5.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="budget" className="block text-sm font-semibold text-gray-800">
                        Budget (USD) *
                      </label>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        required
                        min="1"
                        step="0.01"
                        value={formData.budget}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g. 850"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Schedule */}
                <div className="bg-gray-50 p-4 lg:p-6 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                    </div>
                    Location &amp; Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                        Origin City *
                      </label>
                      <select
                        id="origin"
                        name="origin"
                        required
                        value={formData.origin}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select origin city</option>
                        {CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                        Destination City *
                      </label>
                      <select
                        id="destination"
                        name="destination"
                        required
                        value={formData.destination}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select destination city</option>
                        {CITIES.filter(c => c !== formData.origin).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Auto-calculated distance */}
                    {distance !== null && (
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-blue-800 font-medium">
                            Estimated distance: <strong>{distance} km</strong> ({formData.origin} → {formData.destination})
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Date *
                      </label>
                      <input
                        type="date"
                        id="pickupDate"
                        name="pickupDate"
                        required
                        value={formData.pickupDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        id="deliveryDate"
                        name="deliveryDate"
                        required
                        value={formData.deliveryDate}
                        onChange={handleChange}
                        min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="bg-gray-50 p-4 lg:p-6 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Trip Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
                      <div className="flex space-x-4">
                        {['One Way', 'Round Trip'].map(type => (
                          <label key={type} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="tripType"
                              value={type}
                              checked={formData.tripType === type}
                              onChange={handleChange}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                      <div className="flex space-x-4">
                        {['Standard', 'Urgent'].map(level => (
                          <label key={level} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="urgency"
                              value={level}
                              checked={formData.urgency === level}
                              onChange={handleChange}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <span className={`ml-2 text-sm ${level === 'Urgent' ? 'text-red-600 font-medium' : 'text-gray-700'}`}>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Special Requirements</label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIAL_REQUIREMENTS.map(req => (
                        <button
                          key={req}
                          type="button"
                          onClick={() => toggleRequirement(req)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${formData.requirements.includes(req)
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                            }`}
                        >
                          {formData.requirements.includes(req) && (
                            <svg className="w-3.5 h-3.5 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {req}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Load Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Provide additional details about the load, handling instructions, or any other relevant information..."
                  />
                </div>

                {/* Submit */}
                <div className="pt-4 lg:pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full sm:w-auto px-6 lg:px-8 order-1 sm:order-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Posting...
                        </span>
                      ) : 'Post Load'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}