'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Review {
    review_id: string
    rating: number
    comment: string | null
    created_at: string
    reviewer_name: string
    job_id: string
}

interface DriverData {
    user_id: string
    name: string
    title: string | null
    specialization: string | null
    bio: string | null
    city: string | null
    skill_tags: string | null
    total_earnings_usd: number | null
    average_rating: number | null
    total_kilometres: number | null
    driver_ranking: string | null
    availability: string | null
    acceptance_rate_pct: number | null
    created_at: string
}

interface LoadOption {
    load_id: string
    title: string
    origin_city: string
    destination_city: string
    budget_usd: number
    cargo_type: string
}

interface Props {
    driver: DriverData
    reviews: Review[]
    clientLoads: LoadOption[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    const empty = 5 - full - (half ? 1 : 0)
    const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

    return (
        <div className="flex items-center">
            {Array.from({ length: full }).map((_, i) => (
                <svg key={`f${i}`} className={`${cls} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ))}
            {half && (
                <svg className={`${cls} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="halfGrad">
                            <stop offset="50%" stopColor="currentColor" />
                            <stop offset="50%" stopColor="#D1D5DB" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )}
            {Array.from({ length: empty }).map((_, i) => (
                <svg key={`e${i}`} className={`${cls} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ))}
        </div>
    )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DriverProfileClient({ driver, reviews, clientLoads }: Props) {
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [showMessageModal, setShowMessageModal] = useState(false)

    // Job offer state
    const [selectedLoad, setSelectedLoad] = useState('')
    const [offerRate, setOfferRate] = useState('')
    const [offerMessage, setOfferMessage] = useState('')
    const [offerSending, setOfferSending] = useState(false)
    const [offerSuccess, setOfferSuccess] = useState('')
    const [offerError, setOfferError] = useState('')

    // Direct message state
    const [dmContent, setDmContent] = useState('')
    const [dmSending, setDmSending] = useState(false)
    const [dmSuccess, setDmSuccess] = useState('')
    const [dmError, setDmError] = useState('')

    const initials = driver.name.split(' ').map(n => n[0]).join('').toUpperCase()
    const skills = driver.skill_tags ? driver.skill_tags.split(',').map(s => s.trim()) : []
    const rating = driver.average_rating ?? 0
    const earnings = driver.total_earnings_usd ?? 0
    const earnedLabel = earnings >= 1000 ? `$${Math.round(earnings / 1000)}K+` : `$${earnings}`
    const km = driver.total_kilometres ?? 0
    const kmLabel = km >= 1000 ? `${Math.round(km / 1000)}K km` : `${km} km`
    const isTopRated = (driver.driver_ranking ?? '').toLowerCase().includes('top')
    const memberSince = driver.created_at
        ? new Date(driver.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '—'

    // ─── Handlers ──────────────────────────────────────────────────────────

    async function handleSendOffer() {
        setOfferError('')
        setOfferSuccess('')
        if (!selectedLoad) { setOfferError('Please select a load'); return }
        if (!offerRate || parseFloat(offerRate) <= 0) { setOfferError('Please enter a valid rate'); return }

        setOfferSending(true)
        try {
            const res = await fetch('/api/job-offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverId: driver.user_id,
                    loadId: selectedLoad,
                    rateUsd: parseFloat(offerRate),
                    message: offerMessage.trim() || undefined,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setOfferError(data.error ?? 'Failed to send offer')
            } else {
                setOfferSuccess(`Job offer sent successfully! (${data.jobId})`)
                setSelectedLoad('')
                setOfferRate('')
                setOfferMessage('')
            }
        } catch {
            setOfferError('Network error. Please try again.')
        }
        setOfferSending(false)
    }

    async function handleSendDM() {
        setDmError('')
        setDmSuccess('')
        if (!dmContent.trim()) { setDmError('Please enter a message'); return }

        setDmSending(true)
        try {
            const res = await fetch('/api/direct-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: driver.user_id,
                    content: dmContent.trim(),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setDmError(data.error ?? 'Failed to send message')
            } else {
                setDmSuccess('Message sent successfully!')
                setDmContent('')
            }
        } catch {
            setDmError('Network error. Please try again.')
        }
        setDmSending(false)
    }

    // Auto-fill rate from selected load budget
    function handleLoadSelect(loadId: string) {
        setSelectedLoad(loadId)
        const load = clientLoads.find(l => l.load_id === loadId)
        if (load && !offerRate) {
            setOfferRate(String(load.budget_usd))
        }
    }

    return (
        <>
            {/* Back link */}
            <div className="mb-6">
                <Link
                    href="/client"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-[#3f2a52] transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Drivers
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ─── LEFT SIDEBAR ─── */}
                <aside className="lg:col-span-1 space-y-5">
                    {/* Avatar + basic info card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-28 h-28 bg-gradient-to-br from-[#3f2a52] to-[#6b46a0] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {initials}
                            </div>
                            {driver.availability === 'Available' && (
                                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></span>
                            )}
                        </div>

                        <h1 className="text-xl font-bold text-gray-900">{driver.name}</h1>
                        {isTopRated && (
                            <div className="mt-2 inline-flex items-center bg-[#3f2a52] text-white text-xs font-bold px-3 py-1 rounded-full">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                {driver.driver_ranking}
                            </div>
                        )}

                        <div className={`mt-3 text-sm font-medium ${driver.availability === 'Available' ? 'text-green-600' : 'text-gray-400'}`}>
                            {driver.availability === 'Available' ? '● Available Now' : '○ Currently Unavailable'}
                        </div>

                        <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {driver.city ?? 'Zimbabwe'}
                        </div>

                        <div className="mt-4 flex items-center justify-center space-x-2">
                            <StarRating rating={rating} size="lg" />
                            <span className="text-lg font-bold text-gray-900">{rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>

                        {/* Send Job Offer button */}
                        <button
                            onClick={() => { setShowOfferModal(true); setOfferSuccess(''); setOfferError('') }}
                            className={`mt-5 w-full py-3 rounded-xl text-sm font-bold transition-colors ${driver.availability === 'Available'
                                    ? 'bg-[#3f2a52] text-white hover:bg-[#3f2a52]/90'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            disabled={driver.availability !== 'Available'}
                        >
                            {driver.availability === 'Available' ? 'Send Job Offer' : 'Currently Unavailable'}
                        </button>

                        {/* Send Message button */}
                        <button
                            onClick={() => { setShowMessageModal(true); setDmSuccess(''); setDmError('') }}
                            className="mt-2 w-full py-3 rounded-xl text-sm font-medium border border-[#3f2a52] text-[#3f2a52] hover:bg-[#3f2a52]/5 transition-colors"
                        >
                            Send Message
                        </button>
                    </div>

                    {/* Stats card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Earned</span>
                                <span className="font-bold text-gray-900">{earnedLabel}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Distance</span>
                                <span className="font-bold text-gray-900">{kmLabel}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Acceptance Rate</span>
                                <span className="font-bold text-gray-900">{driver.acceptance_rate_pct ?? 0}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Job Success</span>
                                <span className="font-bold text-green-600">
                                    {driver.acceptance_rate_pct ? `${Math.min(100, Math.round(driver.acceptance_rate_pct * 1.1))}%` : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Member Since</span>
                                <span className="font-bold text-gray-900">{memberSince}</span>
                            </div>
                        </div>
                    </div>

                    {/* Skills card */}
                    {skills.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-sm text-[#3f2a52] border border-[#3f2a52]/20 rounded-full font-medium"
                                        style={{ backgroundColor: 'rgba(63,42,82,0.08)' }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* ─── MAIN CONTENT ─── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-900">{driver.title ?? 'Professional Driver'}</h2>
                        {driver.specialization && (
                            <p className="text-base text-[#3f2a52] font-medium mt-1">{driver.specialization}</p>
                        )}

                        <div className="mt-6 grid grid-cols-3 gap-4 py-5 border-t border-b border-gray-100">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">Rating</p>
                            </div>
                            <div className="text-center border-l border-r border-gray-100">
                                <p className="text-2xl font-bold text-gray-900">{earnedLabel}</p>
                                <p className="text-xs text-gray-500 mt-1">Earned</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{kmLabel}</p>
                                <p className="text-xs text-gray-500 mt-1">Driven</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-base font-bold text-gray-900 mb-3">Overview</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {driver.bio ?? 'No overview provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Work History & Reviews */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold text-gray-900">Work History & Feedback</h3>
                            <div className="flex items-center space-x-2">
                                <StarRating rating={rating} />
                                <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
                                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                            </div>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">No reviews yet.</p>
                                <p className="text-gray-400 text-xs mt-1">Be the first to work with this driver!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {reviews.map((review) => {
                                    const date = new Date(review.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric',
                                    })
                                    const reviewerInitials = review.reviewer_name
                                        .split(' ')
                                        .map(w => w[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)

                                    return (
                                        <div key={review.review_id} className="py-6 first:pt-0 last:pb-0">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {reviewerInitials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{review.reviewer_name}</p>
                                                            <div className="flex items-center space-x-2 mt-0.5">
                                                                <StarRating rating={review.rating} />
                                                                <span className="text-xs text-gray-400">{date}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                            Job #{review.job_id}
                                                        </span>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── JOB OFFER MODAL ─── */}
            {showOfferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowOfferModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Send Job Offer</h2>
                                <p className="text-sm text-gray-500 mt-1">Send a job offer to {driver.name}</p>
                            </div>
                            <button onClick={() => setShowOfferModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {offerSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mb-2">Offer Sent!</p>
                                <p className="text-sm text-gray-500 mb-6">{offerSuccess}</p>
                                <button onClick={() => setShowOfferModal(false)} className="btn-primary px-6">Done</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Select Load */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Select Load *</label>
                                    {clientLoads.length === 0 ? (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                                            You have no loads available for bidding. <Link href="/client/post-load" className="underline font-medium">Post a load first</Link>.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedLoad}
                                            onChange={(e) => handleLoadSelect(e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="">Choose a load...</option>
                                            {clientLoads.map(load => (
                                                <option key={load.load_id} value={load.load_id}>
                                                    {load.title} — {load.origin_city} → {load.destination_city} (Budget: ${load.budget_usd})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Rate */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Offer Rate (USD) *</label>
                                    <input
                                        type="number"
                                        value={offerRate}
                                        onChange={(e) => setOfferRate(e.target.value)}
                                        className="input-field"
                                        placeholder="e.g. 850"
                                        min="1"
                                        step="0.01"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Message (Optional)</label>
                                    <textarea
                                        value={offerMessage}
                                        onChange={(e) => setOfferMessage(e.target.value)}
                                        className="input-field"
                                        rows={3}
                                        placeholder="Add details about the job, pickup instructions, etc."
                                    />
                                </div>

                                {offerError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        {offerError}
                                    </div>
                                )}

                                <div className="flex items-center space-x-3 pt-2">
                                    <button onClick={() => setShowOfferModal(false)} className="btn-secondary flex-1">Cancel</button>
                                    <button
                                        onClick={handleSendOffer}
                                        disabled={offerSending || !selectedLoad || !offerRate}
                                        className="btn-primary flex-1 disabled:opacity-50"
                                    >
                                        {offerSending ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : 'Send Offer'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── SEND MESSAGE MODAL ─── */}
            {showMessageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMessageModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Send Message</h2>
                                <p className="text-sm text-gray-500 mt-1">Send a direct message to {driver.name}</p>
                            </div>
                            <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {dmSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</p>
                                <p className="text-sm text-gray-500 mb-6">{dmSuccess}</p>
                                <div className="flex items-center justify-center space-x-3">
                                    <button onClick={() => setShowMessageModal(false)} className="btn-secondary px-6">Close</button>
                                    <Link href="/client/chat" className="btn-primary px-6">Go to Chat</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Driver info */}
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#3f2a52] to-[#6b46a0] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{driver.name}</p>
                                        <p className="text-xs text-gray-500">{driver.title ?? 'Driver'} • {driver.city ?? 'Zimbabwe'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Your Message *</label>
                                    <textarea
                                        value={dmContent}
                                        onChange={(e) => setDmContent(e.target.value)}
                                        className="input-field"
                                        rows={4}
                                        placeholder="Introduce yourself, ask about availability, discuss a potential job..."
                                        autoFocus
                                    />
                                </div>

                                {dmError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        {dmError}
                                    </div>
                                )}

                                <div className="flex items-center space-x-3 pt-2">
                                    <button onClick={() => setShowMessageModal(false)} className="btn-secondary flex-1">Cancel</button>
                                    <button
                                        onClick={handleSendDM}
                                        disabled={dmSending || !dmContent.trim()}
                                        className="btn-primary flex-1 disabled:opacity-50"
                                    >
                                        {dmSending ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : 'Send Message'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
