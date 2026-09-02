'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Star, X } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { productsService } from '@/services/products'
import { categoriesService, subcategoriesService } from '@/services/categories'
import { brandsService } from '@/services/brands'
import { sizesService, colorsService } from '@/services/sizes-colors'
import { ImageUploader } from '@/components/ui/image-uploader'
import { PageLoader, Toast } from '@/components/ui/states'
import type { Product, Category, Subcategory, Brand, Size, Color, ProductImage } from '@/types/database'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [modelNo, setModelNo] = useState('')
  const [description, setDescription] = useState('')
  const [gender, setGender] = useState<'Men' | 'Women' | 'Kids' | 'Unisex'>('Unisex')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('')
  const [brandId, setBrandId] = useState<number | ''>('')
  const [isActive, setIsActive] = useState(true)
  const [sizeEntries, setSizeEntries] = useState<{ id?: number; sizeId: number; price: string; mrp: string; sku: string }[]>([])
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [newImages, setNewImages] = useState<{ url: string; file: File; isPrimary: boolean; sortOrder: number }[]>([])

  useEffect(() => {
    Promise.all([
      productsService.getById(Number(id)),
      categoriesService.getAll(), brandsService.getAll(), sizesService.getAll(), colorsService.getAll(),
    ]).then(([p, cats, brs, szs, cls]) => {
      setProduct(p); setCategories(cats); setBrands(brs); setSizes(szs); setColors(cls)
      if (p) {
        setName(p.name); setSlug(p.slug); setSku(p.sku || ''); setModelNo(p.model_no || '')
        setDescription(p.description || ''); setGender(p.gender as any)
        setCategoryId(p.category_id); setSubcategoryId(p.subcategory_id || '')
        setBrandId(p.brand_id || ''); setIsActive(p.is_active)
        setSizeEntries((p.product_sizes || []).map(ps => ({
          id: ps.id, sizeId: ps.size_id, price: String(ps.price), mrp: String(ps.mrp), sku: ps.sku || '',
        })))
        setSelectedColorIds((p.product_colors || []).map(pc => pc.color_id))
        setExistingImages([...(p.product_images || [])].sort((a, b) => a.sort_order - b.sort_order))
        if (p.category_id) subcategoriesService.getByCategory(p.category_id).then(setSubcategories)
      }
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (categoryId) subcategoriesService.getByCategory(Number(categoryId)).then(setSubcategories)
  }, [categoryId])

  async function handleSave() {
    if (!product || !name || !categoryId) { setToast({ msg: 'Name and category are required', type: 'error' }); return }
    setSaving(true)
    try {
      await productsService.update(product.id, {
        name, slug, sku: sku || null, model_no: modelNo || null, description: description || null,
        gender, category_id: Number(categoryId), subcategory_id: subcategoryId ? Number(subcategoryId) : null,
        brand_id: brandId ? Number(brandId) : null, is_active: isActive,
      })

      const validSizes = sizeEntries.filter(s => s.sizeId && s.price)
      if (validSizes.length) {
        await productsService.upsertSizes(product.id, validSizes.map(s => ({
          product_id: product.id, size_id: Number(s.sizeId),
          price: parseFloat(s.price), mrp: parseFloat(s.mrp || s.price),
          sku: s.sku || null, is_active: true,
        })))
      }

      await productsService.upsertColors(product.id, selectedColorIds)

      for (const img of newImages) {
        await productsService.uploadImage(product.id, img.file, { isPrimary: img.isPrimary, sortOrder: existingImages.length + img.sortOrder })
      }

      setToast({ msg: 'Product updated!', type: 'success' })
      setTimeout(() => router.push('/admin/products'), 1200)
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to save', type: 'error' })
    } finally { setSaving(false) }
  }

  async function deleteImage(img: ProductImage) {
    if (!confirm('Delete this image?')) return
    try {
      await productsService.deleteImage(img)
      setExistingImages(imgs => imgs.filter(i => i.id !== img.id))
      setToast({ msg: 'Image deleted', type: 'success' })
    } catch { setToast({ msg: 'Failed to delete image', type: 'error' }) }
  }

  async function setPrimaryImage(img: ProductImage) {
    if (!product) return
    await productsService.setPrimaryImage(product.id, img.id)
    setExistingImages(imgs => imgs.map(i => ({ ...i, is_primary: i.id === img.id })))
  }

  if (loading) return <><AdminNav /><div className="lg:pl-72"><AdminTopbar onMenuClick={() => {}} /><PageLoader /></div></>
  if (!product) return <div className="section-shell py-20 text-center text-blue-400">Product not found.</div>

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/products" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <Link href="/admin/products" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> All products</Link>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-blue-950">Edit Product</h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              {/* Basic info */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Basic information</h2>
                <div className="space-y-4">
                  <div><label className="mb-1.5 block text-sm font-bold text-blue-900">Name *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="mb-1.5 block text-sm font-bold text-blue-900">Slug</label><input value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm font-mono outline-none focus:border-orange-400" /></div>
                    <div><label className="mb-1.5 block text-sm font-bold text-blue-900">SKU</label><input value={sku} onChange={e => setSku(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" /></div>
                    <div><label className="mb-1.5 block text-sm font-bold text-blue-900">Model no.</label><input value={modelNo} onChange={e => setModelNo(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" /></div>
                    <div><label className="mb-1.5 block text-sm font-bold text-blue-900">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400">
                        {['Men', 'Women', 'Kids', 'Unisex'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="mb-1.5 block text-sm font-bold text-blue-900">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" /></div>
                </div>
              </section>

              {/* Sizes */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Sizes & Pricing</h2>
                <div className="space-y-3">
                  {sizeEntries.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">SIZE</label>}
                        <select value={row.sizeId || ''} onChange={e => setSizeEntries(s => s.map((r, idx) => idx === i ? { ...r, sizeId: Number(e.target.value) } : r))} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                          <option value="">Select</option>{sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">PRICE (₹)</label>}
                        <input value={row.price} onChange={e => setSizeEntries(s => s.map((r, idx) => idx === i ? { ...r, price: e.target.value } : r))} placeholder="0.00" className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400" />
                      </div>
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">MRP (₹)</label>}
                        <input value={row.mrp} onChange={e => setSizeEntries(s => s.map((r, idx) => idx === i ? { ...r, mrp: e.target.value } : r))} placeholder="0.00" className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400" />
                      </div>
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">SKU</label>}
                        <input value={row.sku} onChange={e => setSizeEntries(s => s.map((r, idx) => idx === i ? { ...r, sku: e.target.value } : r))} placeholder="Optional" className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400" />
                      </div>
                      <button onClick={() => setSizeEntries(s => s.filter((_, idx) => idx !== i))} className="rounded-lg p-2.5 text-blue-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  ))}
                  <button onClick={() => setSizeEntries(s => [...s, { sizeId: 0, price: '', mrp: '', sku: '' }])} className="flex items-center gap-2 rounded-xl border border-dashed border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-500 hover:border-orange-400 hover:text-orange-500">
                    <Plus size={15} /> Add size
                  </button>
                </div>
              </section>

              {/* Colors */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Colors</h2>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button key={color.id} onClick={() => setSelectedColorIds(ids => ids.includes(color.id) ? ids.filter(i => i !== color.id) : [...ids, color.id])} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${selectedColorIds.includes(color.id) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-blue-200 text-blue-700 hover:border-orange-300'}`}>
                      {color.hex_code && <span className="h-4 w-4 rounded-full border" style={{ background: color.hex_code }} />}
                      {color.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Existing images */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Images</h2>
                {existingImages.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-3 text-sm font-bold text-blue-700">Existing images</p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {existingImages.map(img => (
                        <div key={img.id} className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${img.is_primary ? 'border-orange-500' : 'border-blue-200'}`}>
                          <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                          {img.is_primary && <div className="absolute left-1 top-1 flex items-center gap-1 rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white"><Star size={8} fill="currentColor" /> Primary</div>}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition group-hover:opacity-100">
                            {!img.is_primary && <button onClick={() => setPrimaryImage(img)} className="rounded-lg bg-orange-500 px-2 py-1 text-[10px] font-bold text-white">Set primary</button>}
                            <button onClick={() => deleteImage(img)} className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <ImageUploader
                  label="Upload additional images"
                  images={newImages.map(img => ({ url: img.url, file: img.file, isPrimary: img.isPrimary, sortOrder: img.sortOrder }))}
                  onChange={imgs => setNewImages(imgs.map((img, i) => ({ url: img.url, file: img.file!, isPrimary: img.isPrimary, sortOrder: i })))}
                />
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-black text-blue-950 mb-4">Status</h3>
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm font-bold text-blue-900">Active on storefront</span>
                  <div onClick={() => setIsActive(!isActive)} className={`relative h-6 w-11 rounded-full transition ${isActive ? 'bg-orange-500' : 'bg-blue-200'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              </section>

              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-black text-blue-950 mb-4">Organisation</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">Category *</label>
                    <select value={categoryId} onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : ''); setSubcategoryId('') }} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                      <option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {subcategories.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">Subcategory</label>
                      <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                        <option value="">None</option>{subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">Brand</label>
                    <select value={brandId} onChange={e => setBrandId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                      <option value="">No brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex gap-3">
                <Link href="/admin/products" className="flex-1 rounded-xl border border-blue-200 py-3 text-center text-sm font-bold text-blue-700 hover:border-orange-400">Cancel</Link>
                <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
