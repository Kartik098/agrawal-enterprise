'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LogoutPage() {
  const router = useRouter()
  const { signOut } = useAuth()

  useEffect(() => {
    signOut().finally(() => router.push('/'))
  }, [router, signOut])

  return <div className="flex min-h-screen items-center justify-center"><p className="text-blue-500 font-semibold">Signing out...</p></div>
}
