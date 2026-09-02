'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usersService } from '@/services/users'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront-ui'
import { PageLoader, Toast } from '@/components/ui/states'

export default function AccountSettingsPage() {
  const { user, profile, loading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ''); setPhone(profile.phone || '') }
  }, [profile])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); if (!user) return
    setSaving(true)
    try {
      await usersService.updateProfile(user.id, { full_name: fullName, phone: phone || null })
      setToast({ msg: 'Profile updated!', type: 'success' })
    } catch { setToast({ msg: 'Failed to update profile', type: 'error' }) }
    finally { setSaving(false) }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); if (!newPw) return
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      setToast({ msg: 'Password updated!', type: 'success' })
      setCurrentPw(''); setNewPw('')
    } catch (err: any) { setToast({ msg: err.message || 'Failed to update password', type: 'error' }) }
    finally { setSaving(false) }
  }

  if (loading) return <><Navbar /><PageLoader /></>

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="section-shell py-12">
        <Link href="/account" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> My Account</Link>
        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Account</p>
        <h1 className="mt-2 text-4xl font-black text-blue-950">Settings</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-black text-blue-950 mb-5">Profile information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">Full name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">Email</label>
                <input value={user?.email || ''} disabled className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-400 cursor-not-allowed" />
                <p className="mt-1 text-xs text-blue-400">Email cannot be changed here</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>

          <form onSubmit={changePassword} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-black text-blue-950 mb-5">Change password</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">New password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" className="w-full rounded-xl border border-blue-200 px-4 py-3 pr-12 text-sm outline-none placeholder:text-blue-300 focus:border-orange-400" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={saving || !newPw} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>

          <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="font-black text-blue-950 mb-5">Notifications</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[['Order updates', true], ['Offers & promotions', false], ['New arrivals', true], ['Account activity', true]].map(([label, def]) => (
                <label key={label as string} className="flex cursor-pointer items-center justify-between rounded-xl border border-blue-100 p-4">
                  <span className="text-sm font-semibold text-blue-900">{label as string}</span>
                  <div className={`relative h-6 w-11 rounded-full transition ${def ? 'bg-orange-500' : 'bg-blue-200'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${def ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
