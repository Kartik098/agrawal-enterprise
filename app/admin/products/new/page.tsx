'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { productsService } from '@/services/products'
import { inventoryService } from '@/services/inventory'
import { categoriesService, subcategoriesService } from '@/services/categories'
import { brandsService } from '@/services/brands'
import { sizesService, colorsService } from '@/services/sizes-colors'
import { ImageUploader } from '@/components/ui/image-uploader'
import { Toast } from '@/components/ui/states'
import type { Category, Subcategory, Brand, Size, Color } from '@/types/database'

interface SizeEntry { sizeId: number; price: string; mrp: string; sku: string }
interface ImageEntry { url: string; file: File; isPrimary: boolean; sortOrder: number; colorId?: number | null }

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Form fields
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
  const [sizeEntries, setSizeEntries] = useState<SizeEntry[]>([{ sizeId: 0, price: '', mrp: '', sku: '' }])
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([])
  const [images, setImages] = useState<ImageEntry[]>([])

  useEffect(() => {
    Promise.all([
      categoriesService.getAll(), brandsService.getAll(), sizesService.getAll(), colorsService.getAll()
    ]).then(([cats, brs, szs, cls]) => {
      setCategories(cats); setBrands(brs); setSizes(szs); setColors(cls)
    })
  }, [])

  useEffect(() => {
    if (categoryId) subcategoriesService.getByCategory(Number(categoryId)).then(setSubcategories)
  }, [categoryId])

  useEffect(() => {
    setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }, [name])

  function addSizeRow() { setSizeEntries(e => [...e, { sizeId: 0, price: '', mrp: '', sku: '' }]) }
  function removeSizeRow(i: number) { setSizeEntries(e => e.filter((_, idx) => idx !== i)) }
  function updateSizeRow(i: number, key: keyof SizeEntry, value: string | number) {
    setSizeEntries(e => e.map((row, idx) => idx === i ? { ...row, [key]: value } : row))
  }

  function toggleColor(colorId: number) {
    setSelectedColorIds(ids => ids.includes(colorId) ? ids.filter(id => id !== colorId) : [...ids, colorId])
  }

  async function handleSave() {
  // 1. Basic required fields
  if (!name || !categoryId) {
    setToast({
      msg: 'Name and category are required',
      type: 'error'
    })
    return
  }
debugger
  // 2. Subcategory is mandatory
  if (!subcategoryId) {
    setToast({
      msg: 'Subcategory is required',
      type: 'error'
    })
    return
  }

  // 3. At least one size is mandatory
  if (!sizeEntries.length) {
    setToast({
      msg: 'At least one size is required',
      type: 'error'
    })
    return
  }

  // 4. Validate every size
  const invalidSize = sizeEntries.find(
    s => !s.sizeId || !s.price
  )

  if (invalidSize) {
    setToast({
      msg: 'Please select a size and enter its price for every size',
      type: 'error'
    })
    return
  }

  // 5. At least one image is mandatory
  if (!images.length) {
    setToast({
      msg: 'At least one product image is required',
      type: 'error'
    })
    return
  }

  // 6. Optional: require a primary image
  if (!images.some(img => img.isPrimary)) {
    setToast({
      msg: 'Please select a primary product image',
      type: 'error'
    })
    return
  }

  setSaving(true)

  try {
    // 7. Create product
    const product = await productsService.create({
      name,
      slug,
      sku: sku || null,
      model_no: modelNo || null,
      description: description || null,
      gender,
      category_id: Number(categoryId),
      subcategory_id: Number(subcategoryId),
      brand_id: brandId ? Number(brandId) : null,
      is_active: isActive,
    })

    // 8. Create sizes
    const validSizes = sizeEntries.filter(
      s => s.sizeId && s.price
    )

    if (validSizes.length) {
      const productSizes = await productsService.upsertSizes(
        product.id,
        validSizes.map(s => ({
          product_id: product.id,
          size_id: Number(s.sizeId),
          price: parseFloat(s.price),
          mrp: parseFloat(s.mrp || s.price),
          sku: s.sku || null,
          is_active: true,
        }))
      )

      await Promise.all(
        productSizes.map(productSize =>
          inventoryService.insert({
            product_id: product.id,
            product_size_id: productSize.id,
            product_color_id: null,
            quantity: 0,
            reserved_quantity: 0,
            reorder_level: 10,
            warehouse_location: null,
          })
        )
      )
    }

    // 9. Create colors
    if (selectedColorIds.length) {
      await productsService.upsertColors(
        product.id,
        selectedColorIds
      )
    }

    // 10. Upload images
    for (const img of images) {
      await productsService.uploadImage(
        product.id,
        img.file,
        {
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder
        }
      )
    }

    setToast({
      msg: 'Product created!',
      type: 'success'
    })

    setTimeout(() => {
      router.push('/admin/products')
    }, 1000)

  } catch (err: any) {
    setToast({
      msg: err.message || 'Failed to create product',
      type: 'error'
    })
  } finally {
    setSaving(false)
  }
}

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/products" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <Link href="/admin/products" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> All products</Link>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-blue-950">Add New Product</h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main form */}
            <div className="space-y-6">
              {/* Basic info */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Basic information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">Product name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Classic Oxford Shirt" className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">Slug</label>
                      <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400 font-mono" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">SKU</label>
                      <input value={sku} onChange={e => setSku(e.target.value)} placeholder="AE-001" className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">Model number</label>
                      <input value={modelNo} onChange={e => setModelNo(e.target.value)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400">
                        {['Men', 'Women', 'Kids', 'Unisex'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none" />
                  </div>
                </div>
              </section>

              {/* Sizes & Pricing */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Sizes & Pricing</h2>
                <div className="space-y-3">
                  {sizeEntries.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">SIZE</label>}
                        <select value={row.sizeId || ''} onChange={e => updateSizeRow(i, 'sizeId', Number(e.target.value))} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                          <option value="">Select</option>
                          {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">PRICE (₹)</label>}
                        <input value={row.price} onChange={e => updateSizeRow(i, 'price', e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400" />
                      </div>
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">MRP (₹)</label>}
                        <input value={row.mrp} onChange={e => updateSizeRow(i, 'mrp', e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400" />
                      </div>
                      <div>
                        {i === 0 && <label className="mb-1 block text-xs font-bold text-blue-500">SKU</label>}
                        <input value={row.sku} onChange={e => updateSizeRow(i, 'sku', e.target.value)} placeholder="Optional" className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400" />
                      </div>
                      <button onClick={() => removeSizeRow(i)} className="mb-0 rounded-lg p-2.5 text-blue-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  ))}
                  <button onClick={addSizeRow} className="flex items-center gap-2 rounded-xl border border-dashed border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-500 hover:border-orange-400 hover:text-orange-500">
                    <Plus size={15} /> Add size variant
                  </button>
                </div>
              </section>

              {/* Colors */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Colors</h2>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button key={color.id} onClick={() => toggleColor(color.id)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${selectedColorIds.includes(color.id) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-blue-200 text-blue-700 hover:border-orange-300'}`}>
                      {color.hex_code && <span className="h-4 w-4 rounded-full border border-blue-200" style={{ background: color.hex_code }} />}
                      {color.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Images */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="font-black text-blue-950 mb-5">Product images</h2>
                <p className="mb-4 text-sm text-blue-400">Images are uploaded to Supabase Storage when you save the product.</p>
                <ImageUploader
                  images={images.map(img => ({ url: img.url, file: img.file, isPrimary: img.isPrimary, sortOrder: img.sortOrder, isExisting: false }))}
                  onChange={imgs => setImages(imgs.map((img, i) => ({ url: img.url, file: img.file!, isPrimary: img.isPrimary, sortOrder: i })))}
                />
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status */}
              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-black text-blue-950 mb-4">Status</h3>
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm font-bold text-blue-900">Active (visible on storefront)</span>
                  <div onClick={() => setIsActive(!isActive)} className={`relative h-6 w-11 rounded-full transition ${isActive ? 'bg-orange-500' : 'bg-blue-200'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                  </div>
                </label>
              </section>

              {/* Category & Brand */}
              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-black text-blue-950 mb-4">Organisation</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">Category *</label>
                    <select value={categoryId} onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : ''); setSubcategoryId('') }} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {subcategories.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">Subcategory</label>
                      <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                        <option value="">None</option>
                        {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">Brand</label>
                    <select value={brandId} onChange={e => setBrandId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400">
                      <option value="">No brand</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex gap-3">
                <Link href="/admin/products" className="flex-1 rounded-xl border border-blue-200 py-3 text-center text-sm font-bold text-blue-700 hover:border-orange-400">Cancel</Link>
                <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">
                  {saving ? 'Saving...' : 'Create product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
