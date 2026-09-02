'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { brandsService } from '@/services/brands'
import { Toast, PageLoader, EmptyState, TableRowSkeleton } from '@/components/ui/states'
import type { Brand } from '@/types/database'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => { setLoading(true); brandsService.getAll().then(setBrands).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  async function toggleActive(brand: Brand) {
    await brandsService.update(brand.id, { is_active: !brand.is_active })
    setToast({ msg: `${brand.name} ${!brand.is_active ? 'activated' : 'deactivated'}`, type: 'success' })
    load()
  }

  async function deleteBrand(brand: Brand) {
    if (!confirm(`Delete "${brand.name}"?`)) return
    try { await brandsService.delete(brand.id); setToast({ msg: 'Brand deleted', type: 'success' }); load() }
    catch { setToast({ msg: 'Cannot delete — brand has products', type: 'error' }) }
  }

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/brands" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
              <h1 className="mt-2 text-3xl font-black text-blue-950">Brands</h1>
              <p className="mt-2 text-sm text-blue-500">{brands.length} brands in your catalog</p>
            </div>
            <Link href="/admin/brands/new" className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600">
              <Plus size={17} /> Add brand
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border bg-white p-6 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-blue-100" />
                <div className="mt-4 h-5 w-32 rounded bg-blue-100" />
                <div className="mt-2 h-3 w-full rounded bg-blue-50" />
              </div>
            )) : brands.length > 0 ? brands.map(brand => (
              <article key={brand.id} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="h-12 w-12 rounded-xl object-cover border border-blue-100" />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-xl font-black text-orange-600">
                        {brand.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-black text-blue-950">{brand.name}</p>
                      <p className="text-xs font-mono text-blue-400">{brand.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/brands/${brand.id}/edit`} className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-700"><Pencil size={15} /></Link>
                    <button onClick={() => toggleActive(brand)} className="rounded-lg p-2 text-blue-400 hover:bg-blue-50" title={brand.is_active ? 'Deactivate' : 'Activate'}>
                      {brand.is_active ? <ToggleRight size={15} className="text-green-500" /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => deleteBrand(brand)} className="rounded-lg p-2 text-blue-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
                {brand.description && <p className="mt-4 text-sm leading-6 text-blue-600 line-clamp-2">{brand.description}</p>}
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${brand.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-blue-400">{new Date(brand.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </article>
            )) : (
              <div className="col-span-3">
                <EmptyState icon="🏷️" title="No brands yet" description="Add your first brand to get started." action={<Link href="/admin/brands/new" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Add brand</Link>} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
