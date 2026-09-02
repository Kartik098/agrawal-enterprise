'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { categoriesService, subcategoriesService } from '@/services/categories'
import { SingleImageUploader } from '@/components/ui/image-uploader'
import { Toast, EmptyState, TableRowSkeleton } from '@/components/ui/states'
import type { Subcategory, Category } from '@/types/database'

const BLANK = { name: '', slug: '', description: '', category_id: 0, is_active: true, image: null as string | null }

export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([subcategoriesService.getAll(), categoriesService.getAll()]).then(([subs, cats]) => {
      setSubcategories(subs); setCategories(cats)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function nameToSlug(n: string) { return n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

  function startEdit(sub: Subcategory) {
    setForm({ name: sub.name, slug: sub.slug, description: sub.description || '', category_id: sub.category_id, is_active: sub.is_active, image: sub.image })
    setImageFile(null)
    setEditing(sub.id); setAdding(false)
  }

  async function save() {
    if (!form.name || !form.category_id) { setToast({ msg: 'Name and category required', type: 'error' }); return }
    setSaving(true)
    try {
      const payload = { ...form, slug: form.slug || nameToSlug(form.name), description: form.description || null }
      if (editing) { await subcategoriesService.update(editing, payload, imageFile || undefined); setToast({ msg: 'Updated', type: 'success' }) }
      else { await subcategoriesService.create(payload, imageFile || undefined); setToast({ msg: 'Created', type: 'success' }) }
      setEditing(null); setAdding(false); load()
    } catch (err: any) { setToast({ msg: err.message || 'Failed', type: 'error' }) }
    finally { setSaving(false) }
  }

  async function del(sub: Subcategory) {
    if (!confirm(`Delete "${sub.name}"?`)) return
    try { await subcategoriesService.delete(sub.id); setToast({ msg: 'Deleted', type: 'success' }); load() }
    catch { setToast({ msg: 'Cannot delete — has products', type: 'error' }) }
  }

  const FormRow = () => (
    <tr className="border-t bg-orange-50">
      <td className="px-5 py-3">
        <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: editing ? f.slug : nameToSlug(e.target.value) })) }} placeholder="Subcategory name" className="w-full rounded-xl border border-orange-300 px-3 py-2 text-sm outline-none focus:border-orange-500" />
      </td>
      <td className="px-5 py-3">
        <select value={form.category_id || ''} onChange={e => setForm(f => ({ ...f, category_id: Number(e.target.value) }))} className="w-full rounded-xl border border-orange-300 px-3 py-2 text-sm outline-none focus:border-orange-500">
          <option value="">Select category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </td>
      <td className="px-5 py-3">
        <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-slug" className="w-full rounded-xl border border-orange-300 px-3 py-2 text-sm font-mono outline-none focus:border-orange-500" />
      </td>
      <td className="px-5 py-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-orange-500" />
          <span className="text-sm">Active</span>
        </label>
      </td>
      <td className="px-5 py-3">
        <SingleImageUploader
          label="Image"
          currentUrl={form.image}
          onChange={(file) => {
            setImageFile(file)
            if (!file) setForm(f => ({ ...f, image: null }))
          }}
        />
      </td>
      <td className="px-5 py-3">
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="rounded-lg bg-orange-500 p-2 text-white"><Check size={15} /></button>
          <button onClick={() => { setEditing(null); setAdding(false) }} className="rounded-lg border p-2 text-blue-400"><X size={15} /></button>
        </div>
      </td>
    </tr>
  )

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/subcategories" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
              <h1 className="mt-2 text-3xl font-black text-blue-950">Subcategories</h1>
            </div>
            <button onClick={() => { setForm({ ...BLANK }); setAdding(true); setEditing(null) }} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600">
              <Plus size={17} /> Add subcategory
            </button>
          </div>

              <div className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Image</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adding && <FormRow />}
                  {loading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />) :
                    subcategories.map(sub => (
                      editing === sub.id ? <FormRow key={sub.id} /> : (
                        <tr key={sub.id} className="border-t hover:bg-blue-50/60">
                          <td className="px-5 py-4 font-bold text-blue-950">{sub.name}</td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{sub.category?.name}</span>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-blue-400">{sub.slug}</td>
                          <td className="px-5 py-4">{sub.image ? <img src={sub.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="text-blue-300">-</span>}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {sub.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(sub)} className="rounded-lg p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-700"><Pencil size={15} /></button>
                              <button onClick={() => del(sub)} className="rounded-lg p-2 text-blue-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))
                  }
                </tbody>
              </table>
            </div>
            {!loading && !subcategories.length && !adding && (
              <EmptyState icon="📁" title="No subcategories yet" description="Subcategories help customers browse within a category." action={<button onClick={() => { setForm({ ...BLANK }); setAdding(true) }} className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Add subcategory</button>} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
