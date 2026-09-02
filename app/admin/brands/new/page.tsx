'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { brandsService } from '@/services/brands'
import { SingleImageUploader } from '@/components/ui/image-uploader'
import { Toast } from '@/components/ui/states'

export default function NewBrandPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function onNameChange(v: string) {
    setName(v)
    setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSave() {
    if (!name || !slug) { setToast({ msg: 'Name and slug are required', type: 'error' }); return }
    setSaving(true)
    try {
      await brandsService.create({ name, slug, description: description || null, is_active: isActive }, logoFile || undefined)
      setToast({ msg: 'Brand created!', type: 'success' })
      setTimeout(() => router.push('/admin/brands'), 1000)
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to create brand', type: 'error' })
    } finally { setSaving(false) }
  }

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/brands" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8 max-w-2xl">
          <Link href="/admin/brands" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> All brands</Link>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-blue-950">Add New Brand</h1>

          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950 mb-5">Brand details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">Brand name *</label>
                  <input value={name} onChange={e => onNameChange(e.target.value)} placeholder="e.g. AG Studio" className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">Slug *</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm font-mono outline-none focus:border-orange-400" />
                  <p className="mt-1 text-xs text-blue-400">URL: /brands/{slug || 'brand-slug'}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Short brand description..." className="w-full resize-none rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                </div>
                <SingleImageUploader
                  label="Brand logo"
                  onChange={(file) => setLogoFile(file)}
                />
                <label className="flex cursor-pointer items-center gap-3">
                  <div onClick={() => setIsActive(!isActive)} className={`relative h-6 w-11 rounded-full transition ${isActive ? 'bg-orange-500' : 'bg-blue-200'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-bold text-blue-900">Active (visible on storefront)</span>
                </label>
              </div>
            </section>

            <div className="flex gap-3">
              <Link href="/admin/brands" className="flex-1 rounded-xl border border-blue-200 py-3 text-center text-sm font-bold text-blue-700">Cancel</Link>
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">
                {saving ? 'Creating...' : 'Create brand'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
