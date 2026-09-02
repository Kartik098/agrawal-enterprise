'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { categoriesService, subcategoriesService } from '@/services/categories'
import { productsService } from '@/services/products'
import { Navbar } from '@/components/storefront/navbar'
import { ProductCard, Footer, SubcategoryCards } from '@/components/storefront-ui'
import { PageLoader, EmptyState, ProductCardSkeleton } from '@/components/ui/states'
import type { Category, Subcategory, Product } from '@/types/database'

export default function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sub?: string }> }) {
  const { slug } = use(params)
  const { sub } = use(searchParams)
  const [category, setCategory] = useState<Category | null | undefined>(undefined)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesService.getBySlug(slug).then(cat => {
      setCategory(cat)
      if (cat) subcategoriesService.getByCategory(cat.id).then(setSubcategories)
    })
  }, [slug])

  useEffect(() => {
    if (!category) return
    setLoading(true)
    const selectedSub = subcategories.find(s => s.slug === sub)
    productsService.getAll({
      categoryId: category.id,
      subcategoryId: selectedSub?.id,
      isActive: true, pageSize: 40,
    }).then(({ data }) => setProducts(data)).finally(() => setLoading(false))
  }, [category, sub, subcategories])

  if (category === undefined) return <><Navbar /><PageLoader /></>
  if (!category) return <><Navbar /><EmptyState icon="😕" title="Category not found" action={<Link href="/products" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">All products</Link>} /></>
  const activeSubcategory = subcategories.find(subcategory => subcategory.slug === sub)

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-14">
        <nav className="flex items-center gap-2 text-sm text-blue-400 mb-6">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <span className="font-semibold text-blue-700">{category.name}</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Category</p>
            <h1 className="mt-2 text-4xl font-black text-blue-950">{category.name}</h1>
            {category.description && <p className="mt-3 max-w-xl text-blue-600">{category.description}</p>}
          </div>
          <p className="text-sm font-semibold text-blue-400">{products.length} products</p>
        </div>

        {subcategories.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-blue-950">Shop by subcategory</h2>
              <Link href={`/categories/${slug}`} className={`rounded-full border px-3 py-1.5 text-sm font-bold ${!sub ? 'border-orange-500 bg-orange-500 text-white' : 'border-blue-200 text-blue-500 hover:border-orange-400 hover:text-orange-500'}`}>All products</Link>
            </div>
            <SubcategoryCards subcategories={subcategories} activeSlug={sub} />
          </div>
        )}

        <div className="mt-12 border-t border-blue-100 pt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Active category</p>
          <h2 className="mt-2 text-2xl font-black text-blue-950">
            {category.name}{activeSubcategory ? ` / ${activeSubcategory.name}` : ''}
          </h2>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <EmptyState icon="🛍️" title="No products here yet" description="Check back soon or browse all products." action={<Link href="/products" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">All products</Link>} />
        )}
      </div>
      <Footer />
    </main>
  )
}
