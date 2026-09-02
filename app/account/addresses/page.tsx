'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, Trash2, Pencil } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { addressesService } from '@/services/users'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront-ui'
import { PageLoader } from '@/components/ui/states'
import type { Address } from '@/types/database'

const BLANK: Omit<Address, 'id' | 'user_id' | 'created_at'> = {
  label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', is_default: false,
}

export default function AddressesPage() {
  const { user, loading } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) addressesService.getAll(user.id).then(setAddresses)
  }, [user])

  if (loading) return <><Navbar /><PageLoader /></>
  if (!user) return <><Navbar /><div className="section-shell py-20 text-center"><Link href="/login" className="font-bold text-orange-500">Log in</Link> to manage addresses.</div></>

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  async function save() {
    if (!user) return
    setSaving(true)
    try {
      if (editId) {
        const updated = await addressesService.update(editId, user.id, form)
        setAddresses(a => a.map(x => x.id === editId ? updated : x))
      } else {
        const created = await addressesService.create(user.id, form)
        setAddresses(a => [created, ...a])
      }
      setAdding(false); setEditId(null); setForm({ ...BLANK })
    } finally { setSaving(false) }
  }

  function startEdit(addr: Address) {
    setForm({ label: addr.label, full_name: addr.full_name, phone: addr.phone, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, is_default: addr.is_default })
    setEditId(addr.id); setAdding(true)
  }

  async function remove(id: number) {
    if (!confirm('Remove this address?')) return
    await addressesService.delete(id)
    setAddresses(a => a.filter(x => x.id !== id))
  }

  async function setDefault(id: number) {
    if (!user) return
    await addressesService.setDefault(id, user.id)
    setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })))
  }

  const formFields: { key: keyof typeof BLANK; label: string; type?: string }[] = [
    { key: 'full_name', label: 'Full name' }, { key: 'phone', label: 'Phone' },
    { key: 'line1', label: 'Address line 1' }, { key: 'line2', label: 'Address line 2 (optional)' },
    { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'pincode', label: 'Pincode' },
  ]

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-12">
        <Link href="/account" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> My Account</Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Account</p>
            <h1 className="mt-2 text-4xl font-black text-blue-950">Saved addresses</h1>
          </div>
          <button onClick={() => { setAdding(true); setEditId(null); setForm({ ...BLANK }) }} className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600">
            <Plus size={17} /> Add address
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map(addr => (
            <article key={addr.id} className={`rounded-2xl border-2 bg-white p-6 shadow-sm ${addr.is_default ? 'border-orange-400' : 'border-blue-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
                  <span className="font-black text-blue-950">{addr.label}</span>
                  {addr.is_default && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">Default</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(addr)} className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-700"><Pencil size={16} /></button>
                  <button onClick={() => remove(addr.id)} className="rounded-lg p-2 text-blue-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-600 space-y-1">
                <p className="font-bold text-blue-900">{addr.full_name}</p>
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                <p className="text-blue-400">{addr.phone}</p>
              </div>
              {!addr.is_default && (
                <button onClick={() => setDefault(addr.id)} className="mt-4 text-sm font-bold text-orange-500 hover:text-orange-600">Set as default</button>
              )}
            </article>
          ))}

          {adding && (
            <div className="rounded-2xl border-2 border-orange-300 bg-white p-6 shadow-sm sm:col-span-2">
              <h3 className="font-black text-blue-950 mb-4">{editId ? 'Edit address' : 'New address'}</h3>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-bold text-blue-900">Label</label>
                <select value={form.label} onChange={set('label')} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                  {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {formFields.map(({ key, label }) => (
                  <input key={key} placeholder={label} value={form[key] as string} onChange={set(key)} className="rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none placeholder:text-blue-300 focus:border-orange-400" />
                ))}
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
                <input type="checkbox" checked={form.is_default} onChange={set('is_default')} className="accent-orange-500" />
                Set as default address
              </label>
              <div className="mt-4 flex gap-3">
                <button onClick={() => { setAdding(false); setEditId(null) }} className="flex-1 rounded-xl border border-blue-200 py-3 text-sm font-bold text-blue-700">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white disabled:opacity-70">{saving ? 'Saving...' : 'Save address'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
