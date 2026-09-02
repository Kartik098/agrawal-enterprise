'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { brandsService } from '@/services/brands'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront-ui'
import { PageLoader } from '@/components/ui/states'
import type { Brand } from '@/types/database'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { brandsService.getActive().then(setBrands).finally(() => setLoading(false)) }, [])

  if (loading) return <><Navbar /><PageLoader /></>

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="section-shell py-14">
        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Our brands</p>
        <h1 className="mt-2 text-5xl font-black text-blue-950">Good names, good things.</h1>
        <p className="mt-4 max-w-xl leading-7 text-blue-600">Explore the collections that make up Agrawal Enterprise.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand, i) => (
            <Link href={`/brands/${brand.slug}`} key={brand.id} className={`rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-xl ${i % 2 === 0 ? 'bg-orange-100' : 'bg-blue-100'}`}>
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="mb-4 h-12 object-contain" />
              ) : (
                <span className="block text-3xl font-black text-blue-800">{brand.name}</span>
              )}
              {brand.logo && <span className="block text-2xl font-black text-blue-800">{brand.name}</span>}
              <p className="mt-4 text-sm leading-6 text-blue-700">{brand.description}</p>
              <p className="mt-8 text-sm font-bold text-orange-600">Explore collection →</p>
            </Link>
          ))}
          {brands.length === 0 && (
            <div className="col-span-4 py-20 text-center">
              <p className="text-4xl">🏷️</p>
              <h3 className="mt-4 font-black text-blue-950">No brands yet</h3>
              <p className="mt-2 text-sm text-blue-400">Add brands in the admin panel.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
