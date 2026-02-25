'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type AuthUser = {
  user_id: string
  email: string
  name: string
  role: 'CLIENT' | 'DRIVER'
}

type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user?: AuthUser; error?: { message: string } }>
  signUp: (email: string, password: string, name: string, role: 'CLIENT' | 'DRIVER') => Promise<{ user?: AuthUser; error?: { message: string } }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = 'takura_user'

function setSessionCookie(userId: string) {
  document.cookie = `takura_user=${userId}; path=/; max-age=86400; SameSite=Lax`
}

function clearSessionCookie() {
  document.cookie = 'takura_user=; path=/; max-age=0'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser
        setUser(parsed)
        // Re-set the cookie on every page load so server-side API routes stay authenticated
        setSessionCookie(parsed.user_id)
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    if (!supabase) return { error: { message: 'Database not available' } }

    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, name, role')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle()

    if (error) return { error: { message: error.message } }
    if (!data) return { error: { message: 'Invalid email or password' } }

    const authUser = data as AuthUser
    setUser(authUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser))
    setSessionCookie(authUser.user_id)
    return { user: authUser }
  }

  const signUp = async (email: string, password: string, name: string, role: 'CLIENT' | 'DRIVER') => {
    const supabase = createClient()
    if (!supabase) return { error: { message: 'Database not available' } }

    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle()

    if (existing) return { error: { message: 'An account with this email already exists' } }

    const user_id = crypto.randomUUID()
    const { error } = await supabase.from('users').insert({
      user_id,
      email,
      password,
      name,
      role,
      account_status: 'Active',
    })

    if (error) return { error: { message: error.message } }

    const authUser: AuthUser = { user_id, email, name, role }
    setUser(authUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser))
    setSessionCookie(user_id)
    return { user: authUser }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
    clearSessionCookie()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
