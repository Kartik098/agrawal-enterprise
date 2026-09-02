'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { brandsService } from '@/services/brands'
import { SingleImageUploader } from '@/components/ui/image-uploader'
import { PageLoader, Toast } from '@/components/ui/states'
import type { Brand } from '@/types/database'

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    brandsService.getAll().then(all => {
      const b = all.find(x => x.id === Number(id)) || null
      setBrand(b)
      if (b) { setName(b.name); setSlug(b.slug); setDescription(b.description || ''); setIsActive(b.is_active) }
      setLoading(false)
    })
  }, [id])

  async function handleSave() {
    if (!brand || !name || !slug) { setToast({ msg: 'Name and slug required', type: 'error' }); return }
    setSaving(true)
    try {
      await brandsService.update(brand.id, { name, slug, description: description || null, is_active: isActive, logo: brand.logo }, logoFile || undefined)
      setToast({ msg: 'Brand updated!', type: 'success' })
      setTimeout(() => router.push('/admin/brands'), 1000)
    } catch (err: any) { setToast({ msg: err.message || 'Failed to save', type: 'error' }) }
    finally { setSaving(false) }
  }

  async function removeLogo() {
    if (!brand?.logo) return
    await brandsService.removeLogo(brand.id, brand.logo)
    setBrand(b => b ? { ...b, logo: null } : b)
    setToast({ msg: 'Logo removed', type: 'success' })
  }

  if (loading) return <><AdminNav /><div className="lg:pl-72"><AdminTopbar onMenuClick={() => {}} /><PageLoader /></div></>

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/brands" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8 max-w-2xl">
          <Link href="/admin/brands" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> All brands</Link>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-blue-950">Edit Brand</h1>

          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950 mb-5">Brand details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">Slug *</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm font-mono outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                </div>
                <SingleImageUploader
                  label="Brand logo"
                  currentUrl={brand?.logo}
                  onChange={(file) => setLogoFile(file)}
                />
                {brand?.logo && (
                  <button onClick={removeLogo} className="text-sm font-bold text-red-500 hover:text-red-600">Remove current logo</button>
                )}
                <label className="flex cursor-pointer items-center gap-3">
                  <div onClick={() => setIsActive(!isActive)} className={`relative h-6 w-11 rounded-full transition ${isActive ? 'bg-orange-500' : 'bg-blue-200'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-bold text-blue-900">Active</span>
                </label>
              </div>
            </section>
            <div className="flex gap-3">
              <Link href="/admin/brands" className="flex-1 rounded-xl border border-blue-200 py-3 text-center text-sm font-bold text-blue-700">Cancel</Link>
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
