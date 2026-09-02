'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthError, Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User as UserProfile } from '@/types/database'

interface SignUpMetadata {
  full_name?: string
  phone?: string
}

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ session: Session | null; user: User | null; profile: UserProfile | null }>
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{ session: Session | null; user: User | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function getAuthErrorMessage(error: unknown) {
  const authError = error as AuthError | undefined
  const code = authError?.code
  const message = authError?.message || ''

  if (code === 'invalid_credentials' || message.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password'
  }

  if (code === 'email_not_confirmed' || message.toLowerCase().includes('email not confirmed')) {
    return 'Please confirm your email address before logging in.'
  }

  if (message.toLowerCase().includes('jwt expired') || message.toLowerCase().includes('refresh token')) {
    return 'Your session has expired. Please log in again.'
  }

  if (message.toLowerCase().includes('permission denied') || message.toLowerCase().includes('row-level security')) {
    if (process.env.NODE_ENV !== 'production') console.error('Supabase RLS error:', error)
    return 'You do not have permission to perform this action.'
  }

  if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.'
  }

  return message || 'Authentication failed'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setProfile(null)
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Failed to load user profile:', error)
      setProfile(null)
      return null
    }

    setProfile(data)
    return data
  }, [])

  const refreshProfile = useCallback(async () => loadProfile(user), [loadProfile, user])

  useEffect(() => {
    let mounted = true

    async function initializeSession() {
      setLoading(true)
      const { data, error } = await supabase.auth.getSession()
      if (error && process.env.NODE_ENV !== 'production') console.error('Failed to restore Supabase session:', error)
      if (!mounted) return

      const initialSession = data.session
      setSession(initialSession)
      setUser(initialSession?.user || null)
      await loadProfile(initialSession?.user || null)
      if (mounted) setLoading(false)
    }

    initializeSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user || null)
      loadProfile(nextSession?.user || null).finally(() => {
        if (mounted) setLoading(false)
      })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(getAuthErrorMessage(error))

    setSession(data.session)
    setUser(data.user)
    const nextProfile = await loadProfile(data.user)
    return { session: data.session, user: data.user, profile: nextProfile }
  }, [loadProfile])

  const signUp = useCallback(async (email: string, password: string, metadata: SignUpMetadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          phone: metadata.phone,
        },
      },
    })

    if (error) throw new Error(getAuthErrorMessage(error))

    setSession(data.session)
    setUser(data.user)
    if (data.user && data.session) await loadProfile(data.user)
    return { session: data.session, user: data.user }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(getAuthErrorMessage(error))
    setSession(null)
    setUser(null)
    setProfile(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    session,
    loading,
    isAdmin: profile?.is_admin === true,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [user, profile, session, loading, signIn, signUp, signOut, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
