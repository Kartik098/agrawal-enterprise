'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Footer } from '@/components/storefront-ui'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { profile } = await signIn(email, password)
      router.push(profile?.is_admin ? '/admin' : '/account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-blue-50/40 flex flex-col">
      {/* <header className="border-b bg-white">
        <div className="section-shell flex h-20 items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-blue-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-sm text-white">AG</span>
            Agrawal <span className="text-orange-500">Enterprise</span>
          </Link>
        </div>
      </header> */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Welcome back</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Log in to your account</h1>
            {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">{error}</div>}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">Email</label>
                <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-blue-200 px-4 py-3.5 text-sm outline-none placeholder:text-blue-300 focus:border-orange-400" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={password} onChange={event => setPassword(event.target.value)} placeholder="Your password" className="w-full rounded-xl border border-blue-200 px-4 py-3.5 pr-12 text-sm outline-none placeholder:text-blue-300 focus:border-orange-400" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-70">
                {loading ? 'Signing in...' : 'Log in'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-blue-500">Don't have an account?{' '}<Link href="/register" className="font-bold text-orange-500 hover:text-orange-600">Sign up</Link></p>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </main>
  )
}
