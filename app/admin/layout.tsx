'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/states'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading, isAdmin } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (profile && !isAdmin) router.replace('/account')
  }, [user, profile, loading, isAdmin, pathname, router])

  if (loading || !user || !profile) return <PageLoader label="Checking admin access..." />

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50 p-6">
        <div className="max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-black text-blue-950">Admin access required</h1>
          <p className="mt-2 text-sm font-semibold text-blue-500">Your account is signed in, but it does not have admin permissions.</p>
        </div>
      </main>
    )
  }

  return children
}
