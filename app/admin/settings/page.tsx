'use client'
import { useState } from 'react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { Toast } from '@/components/ui/states'

export default function AdminSettingsPage() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)

  function handleSave(section: string) {
    setSaving(true)
    setTimeout(() => { setSaving(false); setToast({ msg: `${section} saved`, type: 'success' }) }, 600)
  }

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/settings" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Settings</h1>
            <p className="mt-2 text-sm text-blue-500">Store configuration and admin preferences</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950 mb-5">Store information</h2>
              <div className="space-y-4">
                {[['Store name', 'Agrawal Enterprise'], ['Store email', 'admin@agrawal.in'], ['Phone', '+91 98765 43210'], ['Currency', 'INR (₹)']].map(([label, val]) => (
                  <div key={label}>
                    <label className="mb-1 block text-sm font-bold text-blue-900">{label}</label>
                    <input defaultValue={val} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                  </div>
                ))}
              </div>
              <button onClick={() => handleSave('Store info')} disabled={saving} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">Save changes</button>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950 mb-5">Admin profile</h2>
              <div className="mb-5 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-500 text-2xl font-black text-white">AE</div>
                <div><p className="font-black text-blue-950">Admin User</p><p className="text-sm text-blue-400">Administrator</p></div>
              </div>
              <div className="space-y-4">
                {[['Name', 'Admin User'], ['Email', 'admin@agrawal.in']].map(([label, val]) => (
                  <div key={label}>
                    <label className="mb-1 block text-sm font-bold text-blue-900">{label}</label>
                    <input defaultValue={val} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-sm font-bold text-blue-900">New password</label>
                  <input type="password" placeholder="Leave blank to keep current" className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none placeholder:text-blue-300 focus:border-orange-400" />
                </div>
              </div>
              <button onClick={() => handleSave('Profile')} disabled={saving} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">Update profile</button>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950 mb-5">Delivery settings</h2>
              <div className="space-y-4">
                {[['Free delivery threshold (₹)', '999'], ['Standard delivery charge (₹)', '99'], ['Return window (days)', '7']].map(([label, val]) => (
                  <div key={label}>
                    <label className="mb-1 block text-sm font-bold text-blue-900">{label}</label>
                    <input defaultValue={val} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                  </div>
                ))}
              </div>
              <button onClick={() => handleSave('Delivery settings')} disabled={saving} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">Save</button>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950 mb-1">Supabase connection</h2>
              <p className="mb-5 text-sm text-blue-400">Environment variables set via <code className="rounded bg-blue-50 px-1 py-0.5 text-xs">.env.local</code></p>
              <div className="space-y-3 text-sm">
                {[['NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'], ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon/public key']].map(([key, label]) => (
                  <div key={key} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="font-mono text-xs text-orange-600">{key}</p>
                    <p className="mt-1 text-xs text-blue-400">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-green-600">
                      {process.env[key] ? '✓ Set' : '✗ Not set — add to .env.local'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
