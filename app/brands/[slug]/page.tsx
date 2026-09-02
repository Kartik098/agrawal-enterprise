'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { brandsService } from '@/services/brands'
import { productsService } from '@/services/products'
import { Navbar } from '@/components/storefront/navbar'
import { ProductCard, Footer } from '@/components/storefront-ui'
import { PageLoader, EmptyState, ProductCardSkeleton } from '@/components/ui/states'
import type { Brand, Product } from '@/types/database'

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [brand, setBrand] = useState<Brand | null | undefined>(undefined)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    brandsService.getBySlug(slug).then(async b => {
      setBrand(b)
      if (b) {
        const { data } = await productsService.getAll({ brandId: b.id, isActive: true, pageSize: 40 })
        setProducts(data)
      }
      setLoading(false)
    })
  }, [slug])

  if (brand === undefined || loading) return <><Navbar /><PageLoader /></>
  if (!brand) return <><Navbar /><EmptyState icon="😕" title="Brand not found" action={<Link href="/brands" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">All brands</Link>} /></>

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-14">
        <nav className="flex items-center gap-2 text-sm text-blue-400 mb-8">
          <Link href="/" className="hover:text-orange-500">Home</Link><span>/</span>
          <Link href="/brands" className="hover:text-orange-500">Brands</Link><span>/</span>
          <span className="font-semibold text-blue-700">{brand.name}</span>
        </nav>
        <div className="overflow-hidden rounded-3xl bg-orange-100 p-12">
          {brand.logo && <img src={brand.logo} alt={brand.name} className="mb-6 h-16 object-contain" />}
          <h1 className="text-5xl font-black text-blue-900">{brand.name}</h1>
          {brand.description && <p className="mt-4 max-w-xl text-lg leading-7 text-blue-700">{brand.description}</p>}
          <p className="mt-6 text-sm font-bold text-blue-500">{products.length} products in collection</p>
        </div>
        {products.length > 0 ? (
          <div className="mt-14">
            <h2 className="text-2xl font-black text-blue-900">Products by {brand.name}</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ) : (
          <div className="mt-14 rounded-2xl border bg-white p-12 text-center">
            <p className="text-4xl">🛍️</p>
            <h3 className="mt-4 text-xl font-black text-blue-950">Products coming soon</h3>
            <p className="mt-2 text-blue-500">Check back shortly for new arrivals from {brand.name}.</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
