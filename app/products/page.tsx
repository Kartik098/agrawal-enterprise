'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { productsService } from '@/services/products'
import { categoriesService, subcategoriesService } from '@/services/categories'
import { brandsService } from '@/services/brands'
import { Navbar } from '@/components/storefront/navbar'
import { ProductCard, Footer } from '@/components/storefront-ui'
import { PageLoader, ProductCardSkeleton, EmptyState } from '@/components/ui/states'
import type { Product, Category, Subcategory, Brand } from '@/types/database'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>()
  const [brandId, setBrandId] = useState<number | undefined>()
  const [gender, setGender] = useState<string | undefined>()
  const [sort, setSort] = useState('created_at')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  // Load filter options once
  useEffect(() => {
    Promise.all([categoriesService.getActive(), brandsService.getActive()]).then(([cats, brs]) => {
      setCategories(cats); setBrands(brs)
    })
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      subcategoriesService.getByCategory(categoryId).then(setSubcategories)
      setSubcategoryId(undefined)
    } else {
      setSubcategories([])
    }
  }, [categoryId])

  const loadProducts = useCallback(() => {
    setLoading(true)
    productsService.getAll({
      search: search || undefined, categoryId, subcategoryId, brandId,
      gender, isActive: true, sortBy: sort as any, page, pageSize: PAGE_SIZE,
    }).then(({ data, count }) => {
      setProducts(data); setTotal(count)
    }).finally(() => setLoading(false))
  }, [search, categoryId, subcategoryId, brandId, gender, sort, page])

  useEffect(() => { loadProducts() }, [loadProducts])

  const clearFilters = () => {
    setCategoryId(undefined); setSubcategoryId(undefined); setBrandId(undefined)
    setGender(undefined); setSearch(''); setPage(1)
  }
  const hasFilters = !!(categoryId || subcategoryId || brandId || gender || search)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Catalog</p>
          <h1 className="mt-2 text-4xl font-black text-blue-950">All products</h1>
        </div>

        {/* Search bar */}
        <div className="mt-7 flex gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="shrink-0 text-blue-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, SKU, or model number..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-blue-300"
            />
            {search && <button onClick={() => setSearch('')}><X size={15} className="text-blue-300" /></button>}
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${filtersOpen ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-blue-200 bg-white text-blue-700 hover:border-orange-400'}`}>
            <SlidersHorizontal size={16} /> Filters {hasFilters && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">!</span>}
          </button>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="mt-4 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-blue-500">Category</label>
                <select value={categoryId || ''} onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm text-blue-700 focus:border-orange-400">
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {subcategories.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-blue-500">Subcategory</label>
                  <select value={subcategoryId || ''} onChange={e => { setSubcategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm text-blue-700 focus:border-orange-400">
                    <option value="">All subcategories</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-blue-500">Brand</label>
                <select value={brandId || ''} onChange={e => { setBrandId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm text-blue-700 focus:border-orange-400">
                  <option value="">All brands</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-blue-500">Gender</label>
                <select value={gender || ''} onChange={e => { setGender(e.target.value || undefined); setPage(1) }} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm text-blue-700 focus:border-orange-400">
                  <option value="">All</option>
                  {['Men', 'Women', 'Kids', 'Unisex'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-blue-500">Sort by</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm text-blue-700 focus:border-orange-400">
                  <option value="created_at">Newest first</option>
                  <option value="name">Name A–Z</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600">
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="mt-6 text-sm font-semibold text-blue-400">{total} product{total !== 1 ? 's' : ''}</p>

        {/* Grid */}
        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <EmptyState icon="🔍" title="No products found" description="Try adjusting your search or filters." action={<button onClick={clearFilters} className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Clear filters</button>} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-40 hover:border-orange-400">← Prev</button>
            <span className="flex items-center px-4 text-sm font-semibold text-blue-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-40 hover:border-orange-400">Next →</button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
