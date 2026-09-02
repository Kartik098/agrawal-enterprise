'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, SlidersHorizontal, X, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { productsService } from '@/services/products'
import { categoriesService, subcategoriesService } from '@/services/categories'
import { brandsService } from '@/services/brands'
import { formatCurrency } from '@/components/storefront-ui'
import { PageLoader, TableRowSkeleton, EmptyState, Toast } from '@/components/ui/states'
import type { Product, Category, Subcategory, Brand } from '@/types/database'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>()
  const [brandId, setBrandId] = useState<number | undefined>()
  const [gender, setGender] = useState<string | undefined>()
  const [isActive, setIsActive] = useState<boolean | undefined>()
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  useEffect(() => {
    Promise.all([categoriesService.getAll(), brandsService.getAll()]).then(([cats, brs]) => {
      setCategories(cats); setBrands(brs)
    })
  }, [])

  useEffect(() => {
    if (categoryId) subcategoriesService.getByCategory(categoryId).then(setSubcategories)
    else setSubcategories([])
  }, [categoryId])

  const load = useCallback(() => {
    setLoading(true)
    productsService.getAll({ search: search || undefined, categoryId, subcategoryId, brandId, gender, isActive, page, pageSize: PAGE_SIZE })
      .then(({ data, count }) => { setProducts(data); setTotal(count) })
      .finally(() => setLoading(false))
  }, [search, categoryId, subcategoryId, brandId, gender, isActive, page])

  useEffect(() => { load() }, [load])

  async function toggleActive(product: Product) {
    try {
      await productsService.update(product.id, { is_active: !product.is_active })
      setToast({ msg: `${product.name} ${!product.is_active ? 'activated' : 'deactivated'}`, type: 'success' })
      load()
    } catch { setToast({ msg: 'Failed to update', type: 'error' }) }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await productsService.delete(product.id)
      setToast({ msg: 'Product deleted', type: 'success' })
      load()
    } catch { setToast({ msg: 'Failed to delete', type: 'error' }) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/products" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
              <h1 className="mt-2 text-3xl font-black text-blue-950">All Products</h1>
              <p className="mt-2 text-sm text-blue-500">{total} products in your catalog</p>
            </div>
            <Link href="/admin/products/new" className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600">
              <Plus size={17} /> Add product
            </Link>
          </div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border bg-white px-4 py-2.5">
              <Search size={17} className="text-blue-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search name, SKU, model no..." className="w-full bg-transparent text-sm outline-none placeholder:text-blue-300" />
              {search && <button onClick={() => setSearch('')}><X size={14} className="text-blue-300" /></button>}
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${filtersOpen ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-blue-200 bg-white text-blue-700'}`}>
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-3 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-500">Category</label>
                  <select value={categoryId || ''} onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 focus:border-orange-400">
                    <option value="">All</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {subcategories.length > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-500">Subcategory</label>
                    <select value={subcategoryId || ''} onChange={e => { setSubcategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 focus:border-orange-400">
                      <option value="">All</option>{subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-500">Brand</label>
                  <select value={brandId || ''} onChange={e => { setBrandId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 focus:border-orange-400">
                    <option value="">All</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-500">Gender</label>
                  <select value={gender || ''} onChange={e => { setGender(e.target.value || undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 focus:border-orange-400">
                    <option value="">All</option>{['Men', 'Women', 'Kids', 'Unisex'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-500">Status</label>
                  <select value={isActive === undefined ? '' : String(isActive)} onChange={e => { setIsActive(e.target.value === '' ? undefined : e.target.value === 'true'); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 focus:border-orange-400">
                    <option value="">All</option><option value="true">Active</option><option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">SKU / Model</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Brand</th>
                    <th className="px-5 py-3">Gender</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />) :
                    products.length > 0 ? products.map(product => {
                      const img = productsService.getPrimaryImage(product)
                      const price = productsService.getMinPrice(product)
                      return (
                        <tr key={product.id} className="border-t hover:bg-blue-50/60">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-blue-100">
                                {img ? <img src={img.image_url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg font-black text-blue-300">AG</div>}
                              </div>
                              <div>
                                <p className="font-bold text-blue-950 max-w-[200px] truncate">{product.name}</p>
                                <p className="text-xs text-blue-400">{new Date(product.created_at).toLocaleDateString('en-IN')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-blue-500">
                            {product.sku && <p className="font-mono text-xs">{product.sku}</p>}
                            {product.model_no && <p className="font-mono text-xs text-blue-400">{product.model_no}</p>}
                          </td>
                          <td className="px-5 py-4 text-blue-700">{product.category?.name}{product.subcategory ? ` / ${product.subcategory.name}` : ''}</td>
                          <td className="px-5 py-4 text-blue-600">{product.brand?.name || '—'}</td>
                          <td className="px-5 py-4 text-blue-500">{product.gender}</td>
                          <td className="px-5 py-4 font-bold">{price > 0 ? formatCurrency(price) : '—'}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <Link href={`/products/${product.slug}`} target="_blank" className="rounded-lg p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-700" title="View on storefront"><Eye size={15} /></Link>
                              <Link href={`/admin/products/${product.id}/edit`} className="rounded-lg p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-700" title="Edit"><Pencil size={15} /></Link>
                              <button onClick={() => toggleActive(product)} className="rounded-lg p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-700" title={product.is_active ? 'Deactivate' : 'Activate'}>
                                {product.is_active ? <ToggleRight size={15} className="text-green-500" /> : <ToggleLeft size={15} />}
                              </button>
                              <button onClick={() => deleteProduct(product)} className="rounded-lg p-2 text-blue-400 hover:bg-red-50 hover:text-red-500" title="Delete"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={8} className="px-5 py-20 text-center text-sm text-blue-300">No products found. <Link href="/admin/products/new" className="font-bold text-orange-500">Add your first product.</Link></td></tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-40">← Prev</button>
              <span className="flex items-center px-4 text-sm font-semibold text-blue-500">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
