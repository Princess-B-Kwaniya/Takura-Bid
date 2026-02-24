'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user, error: authError } = await signIn(email, password)

      if (authError) {
        setError(authError.message)
        return
      }

      if (user?.role === 'DRIVER') {
        router.push('/driver')
      } else {
        router.push('/client')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 selection:bg-[#3f2a52] selection:text-white">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3 mb-12">
        <div className="w-10 h-10 bg-[#3f2a52] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(63,42,82,0.3)]">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 18h16v6H8v-6zm2-4h12v3H10v-3z" fill="white"/>
            <circle cx="12" cy="26" r="2" fill="white"/>
            <circle cx="20" cy="26" r="2" fill="white"/>
            <path d="M14 12h4v2h-4v-2z" fill="white"/>
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#3f2a52]">TakuraBid</span>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3f2a52]/20 focus:border-[#3f2a52] transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3f2a52]/20 focus:border-[#3f2a52] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#3f2a52] text-white font-semibold rounded-xl hover:bg-[#3f2a52]/90 transition-all duration-200 shadow-[0_4px_15px_rgba(63,42,82,0.25)] hover:shadow-[0_6px_20px_rgba(63,42,82,0.35)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Sample login — use any sample email with password: <strong>password123</strong>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#3f2a52] font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
