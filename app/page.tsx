import { categoriesService } from '@/services/categories'
import { brandsService } from '@/services/brands'
import { productsService } from '@/services/products'
import { Navbar } from '@/components/storefront/navbar'
import { HeroCarousel, CategoryQuickLinks, BrandSection, ProductCarousel, Footer } from '@/components/storefront-ui'
import { VideoSection } from '@/components/storefront/video-section'
import Link from 'next/link'
import type { Category, Brand, Product } from '@/types/database'

export const dynamic = 'force-dynamic'

async function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn() } catch { return fallback }
}

export default async function Home() {
  const [categories, brands, productsResult] = await Promise.all([
    safeGet(() => categoriesService.getActive(), [] as Category[]),
    safeGet(() => brandsService.getActive(), [] as Brand[]),
    safeGet(() => productsService.getAll({ isActive: true, pageSize: 12 }), { data: [] as Product[], count: 0 }),
  ])

  const featured = productsResult.data

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroCarousel />
      <CategoryQuickLinks categories={categories} />

      {/* Featured videos */}
      <VideoSection />

      {/* Featured products */}
      <section className="section-shell pb-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Just in</p>
            <h2 className="mt-2 text-3xl font-black text-blue-900">Your next everyday favorite</h2>
          </div>
          <Link href="/products" className="font-bold text-blue-600 hover:text-orange-500">Shop all</Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-8"><ProductCarousel products={featured} /></div>
        ) : (
          <div className="mt-12 rounded-2xl border bg-white p-12 text-center">
            <p className="text-4xl">🛍️</p>
            <h3 className="mt-4 font-black text-blue-950">Products coming soon</h3>
            <p className="mt-2 text-sm text-blue-400">
              Connect Supabase and add products in the admin panel to get started.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/admin/products/new" className="inline-flex rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white">Add first product</Link>
              <Link href="/admin" className="inline-flex rounded-full border border-blue-200 px-6 py-2.5 text-sm font-bold text-blue-700">Go to admin</Link>
            </div>
          </div>
        )}
      </section>

      {/* Sale banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-blue-600 px-8 py-16 text-center text-white">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-300">Limited time</p>
          <h2 className="mt-3 text-4xl font-black sm:text-5xl">Up to 40% off <br className="hidden sm:block" />this weekend only.</h2>
          <p className="mt-4 text-blue-200">On selected styles across all categories. While stocks last.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-lg hover:bg-orange-600">Shop the sale</Link>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500 opacity-50" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-500 opacity-50" />
        </div>
      </section>

      <BrandSection brands={brands} />

      <Footer categories={categories} />
    </main>
  )
}
