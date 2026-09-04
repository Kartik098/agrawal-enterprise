'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Heart,
  ShoppingBag,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useData'
import { productsService } from '@/services/products'
import { carouselsService } from '@/services/carousels'
import type { Product, Brand, Category, Subcategory, CarouselItem } from '@/types/database'

export function formatCurrency(value: number): string {
  return `\u20B9${value.toLocaleString('en-IN')}`
}

const PLACEHOLDER_EMOJIS = ['▱', '♢', '⌁', '◫', '◒', '▤', '∪', '◡']

const PLACEHOLDER_TONES = [
  'bg-blue-100',
  'bg-orange-100',
  'bg-blue-50',
  'bg-orange-50',
]

export function getPlaceholderTone(id: number) {
  return PLACEHOLDER_TONES[id % PLACEHOLDER_TONES.length]
}

export function getPlaceholderEmoji(id: number) {
  return PLACEHOLDER_EMOJIS[id % PLACEHOLDER_EMOJIS.length]
}

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const { user, isAdmin } = useAuth()

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account"
        onClick={() => setOpen(!open)}
        className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white text-blue-700 hover:border-orange-400 hover:text-orange-500"
      >
        <UserRound size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-blue-100 bg-white p-2 shadow-xl">
          {user ? (
            <>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                href="/account"
                onClick={() => setOpen(false)}
              >
                My Account
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                href="/account/orders"
                onClick={() => setOpen(false)}
              >
                My Orders
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                href="/account/addresses"
                onClick={() => setOpen(false)}
              >
                Addresses
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                href="/account/wishlist"
                onClick={() => setOpen(false)}
              >
                Wishlist
              </Link>

              <div className="my-1 border-t" />

              {isAdmin && (
                <Link
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  href="/admin"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              )}

              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                href="/logout"
                onClick={() => setOpen(false)}
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                href="/register"
                onClick={() => setOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function CartButton() {
  const { user } = useAuth()
  const { cart } = useCart(user?.id || null)

  const count = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <Link
      aria-label="Cart"
      href="/cart"
      className="relative grid h-10 w-10 place-items-center rounded-full text-blue-600 hover:bg-blue-50"
    >
      <ShoppingBag size={19} />

      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-[10px] font-black text-white">
          {count}
        </span>
      )}
    </Link>
  )
}

/* =========================================================
   HERO CAROUSEL
   ========================================================= */

interface HeroSlide {
  id: string | number
  image_url: string
  brand_slug: string | null
  title: string
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: '1', image_url: '/Images/Bumchums-TShirt.webp', brand_slug: null, title: 'Bumchums T-Shirt' },
  { id: '2', image_url: '/Images/Bumchums-Shorts.webp', brand_slug: null, title: 'Bumchums Shorts' },
  { id: '3', image_url: '/Images/Bumchums-Crew-Neck-t-Shirt2.webp', brand_slug: null, title: 'Bumchums Crew Neck' },
  { id: '4', image_url: '/Images/Bumchums-Crew-Neck-t-Shirt.webp', brand_slug: null, title: 'Bumchums Crew Neck' },
  { id: '5', image_url: '/Images/Bumchums-Crew-Neck-t-Shirt-comfort.webp', brand_slug: null, title: 'Bumchums Comfort' },
]

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES)
  const [index, setIndex] = useState(0)
  const total = slides.length

  useEffect(() => {
    carouselsService.getActive().then(data => {
      if (data && data.length > 0) {
        setSlides(
          data.map(item => ({
            id: item.id,
            image_url: item.image_url,
            brand_slug: item.brand?.slug || null,
            title: item.title || 'Hero slide',
          }))
        )
      }
    }).catch(err => {
      console.error('Error fetching hero carousel slides:', err)
    })
  }, [])

  const next = () => {
    setIndex(i => (i + 1) % total)
  }

  const prev = () => {
    setIndex(i => (i - 1 + total) % total)
  }

  useEffect(() => {
    if (total === 0) return
    const timer = setTimeout(() => {
      setIndex(i => (i + 1) % total)
    }, 3000)
    return () => clearTimeout(timer)
  }, [index, total])

  if (total === 0) return null

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          width: `${total * 100}%`,
          transform: `translateX(-${(index * 100) / total}%)`,
        }}
      >
        {slides.map((slide, i) => {
          const content = (
            <img
              src={slide.image_url}
              alt={slide.title || `Hero slide ${i + 1}`}
              className="block h-auto w-full"
            />
          )

          return (
            <div key={slide.id} style={{ width: `${100 / total}%` }}>
              {slide.brand_slug ? (
                <Link href={`/brands/${slide.brand_slug}`} className="block w-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          )
        })}
      </div>

      {/* Previous button */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-blue-700 shadow-md backdrop-blur-sm hover:bg-white hover:text-orange-500 transition"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Next button */}
      <button
        type="button"
        aria-label="Next slide"
        onClick={next}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-blue-700 shadow-md backdrop-blur-sm hover:bg-white hover:text-orange-500 transition"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-6 bg-orange-500'
                : 'w-2 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

/* =========================================================
   CATEGORY QUICK LINKS
   ========================================================= */

export function CategoryQuickLinks({
  categories,
}: {
  categories: Category[]
}) {
  const [start, setStart] = useState(0)
  if (!categories.length) return null
  const hasCarousel = categories.length > 4
  const visibleCategories = hasCarousel
    ? Array.from({ length: 4 }, (_, index) => categories[(start + index) % categories.length])
    : categories

  function move(direction: number) {
    setStart(current => (current + direction + categories.length) % categories.length)
  }

  return (
    <section className="section-shell py-10">
      <div className="relative">
        <div className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${hasCarousel ? '' : 'sm:grid-cols-2'}`}>
        {visibleCategories.map(cat => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-blue-100"
          >
            {cat.image ? <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center px-4 text-center text-xl font-black text-blue-700">{cat.name}</div>}
            <span className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/85 px-3 py-2 text-center text-sm font-black text-blue-950 backdrop-blur-sm">{cat.name}</span>
          </Link>
        ))}
        </div>
        {hasCarousel && (
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous categories" className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-sm hover:border-orange-400 hover:text-orange-500">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Next categories" className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-sm hover:border-orange-400 hover:text-orange-500">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export function SubcategoryCards({ subcategories, activeSlug }: { subcategories: Subcategory[]; activeSlug?: string }) {
  if (!subcategories.length) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {subcategories.map(subcategory => {
        const isActive = subcategory.slug === activeSlug
        return (
        <Link key={subcategory.id} href={`/categories/${subcategory.category?.slug || ''}?sub=${subcategory.slug}`} aria-current={isActive ? 'page' : undefined} className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border-4 bg-orange-50 transition ${isActive ? 'border-orange-500 ring-4 ring-orange-100' : 'border-transparent'}`}>
          {subcategory.image ? <img src={subcategory.image} alt={subcategory.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center px-4 text-center text-lg font-black text-orange-700">{subcategory.name}</div>}
          <span className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/85 px-3 py-2 text-center text-sm font-black text-blue-950 backdrop-blur-sm">{subcategory.name}</span>
          {isActive && <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white">Active</span>}
        </Link>
        )
      })}
    </div>
  )
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

export function ProductCard({ product }: { product: Product }) {
  const primary = productsService.getPrimaryImage(product)
  const price = productsService.getMinPrice(product)
  const mrp = productsService.getMinMrp(product)

  const discount =
    mrp > 0 && price > 0
      ? Math.round((1 - price / mrp) * 100)
      : 0

  const inStock = productsService.getTotalStock(product) > 0

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div
        className={`relative grid aspect-[4/5] place-items-center overflow-hidden rounded-2xl ${getPlaceholderTone(
          product.id
        )}`}
      >
        {primary?.image_url ? (
          <img
            src={primary.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-[80px] font-black text-blue-700/30 transition-transform group-hover:scale-110">
            {getPlaceholderEmoji(product.id)}
          </span>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
            {discount}% off
          </span>
        )}

        <button
          type="button"
          aria-label="Wishlist"
          onClick={e => e.preventDefault()}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-blue-500 shadow-sm hover:text-orange-500"
        >
          <Heart size={16} />
        </button>

        {!inStock && product.product_sizes?.length ? (
          <div className="absolute inset-0 flex items-end justify-center bg-white/60 pb-4">
            <span className="rounded-full bg-blue-900/80 px-4 py-1 text-xs font-bold text-white">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-orange-500">
        {product.category?.name}
      </p>

      <h3 className="mt-1 line-clamp-1 font-bold text-blue-900 group-hover:text-orange-500">
        {product.name}
      </h3>

      <div className="mt-1 flex items-center gap-2">
        {price > 0 ? (
          <>
            <span className="font-bold text-blue-700">
              {formatCurrency(price)}
            </span>

            {discount > 0 && (
              <span className="text-xs text-blue-300 line-through">
                {formatCurrency(mrp)}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-blue-400">
            View details
          </span>
        )}
      </div>
    </Link>
  )
}

export function ProductCarousel({ products }: { products: Product[] }) {
  const [start, setStart] = useState(0)
  if (!products.length) return null
  const hasCarousel = products.length > 4
  const visibleProducts = hasCarousel
    ? Array.from({ length: 4 }, (_, index) => products[(start + index) % products.length])
    : products

  function move(direction: number) {
    setStart(current => (current + direction + products.length) % products.length)
  }

  return (
    <div>
      <div className={`grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 ${hasCarousel ? '' : 'sm:grid-cols-4'}`}>
        {visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
      {hasCarousel && (
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => move(-1)} aria-label="Previous products" className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-sm hover:border-orange-400 hover:text-orange-500">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next products" className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-sm hover:border-orange-400 hover:text-orange-500">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

/* =========================================================
   BRAND SECTION
   ========================================================= */

export function BrandSection({
  brands,
}: {
  brands: Brand[]
}) {
  if (!brands.length) return null

  return (
    <section className="section-shell py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            Brands we love
          </p>

          <h2 className="mt-2 text-3xl font-black text-blue-900">
            Find your everyday favorites
          </h2>
        </div>

        <Link
          href="/brands"
          className="hidden font-bold text-blue-600 hover:text-orange-500 sm:block"
        >
          View all
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {brands.slice(0, 4).map(brand => (
          <Link
            href={`/brands/${brand.slug}`}
            key={brand.id}
            className="group rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
          >
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="mx-auto mb-3 h-10 object-contain"
              />
            ) : (
              <span className="block text-2xl font-black text-blue-700 group-hover:text-orange-500">
                {brand.name}
              </span>
            )}

            {brand.logo && (
              <span className="block font-bold text-blue-700 group-hover:text-orange-500">
                {brand.name}
              </span>
            )}

            <span className="mt-2 block text-xs font-semibold text-blue-300">
              Explore collection
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* =========================================================
   FOOTER
   ========================================================= */

export function Footer({
  categories = [],
}: {
  categories?: Category[]
}) {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="section-shell py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <div className="flex items-center gap-2 text-lg font-black text-blue-700">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500 text-sm text-white">
                AE
              </span>

              Agrawal Enterprise
            </div>

            <p className="mt-3 text-sm leading-6 text-blue-500">
              Everyday essentials, thoughtfully made.
            </p>
          </div>

          <div>
            <p className="font-black text-blue-900">
              Shop
            </p>

            <div className="mt-4 space-y-2 text-sm text-blue-500">
              {categories.slice(0, 5).map(cat => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="block hover:text-orange-500"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-black text-blue-900">
              Account
            </p>

            <div className="mt-4 space-y-2 text-sm text-blue-500">
              {[
                ['My Account', '/account'],
                ['Orders', '/account/orders'],
                ['Addresses', '/account/addresses'],
                ['Wishlist', '/account/wishlist'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="block hover:text-orange-500"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-black text-blue-900">
              Help
            </p>

            <div className="mt-4 space-y-2 text-sm text-blue-500">
              {[
                'Contact Us',
                'Returns Policy',
                'Size Guide',
                'FAQs',
              ].map(item => (
                <p
                  key={item}
                  className="cursor-pointer hover:text-orange-500"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-blue-100 pt-6 text-center text-xs text-blue-300">
          © {new Date().getFullYear()} Agrawal Enterprise. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
