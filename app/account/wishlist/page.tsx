'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { wishlistService } from '@/services/cart'
import { productsService } from '@/services/products'
import { Navbar } from '@/components/storefront/navbar'
import { Footer, formatCurrency } from '@/components/storefront-ui'
import { PageLoader, EmptyState, ProductCardSkeleton } from '@/components/ui/states'
import type { Wishlist } from '@/types/database'

export default function WishlistPage() {
  const { user, loading } = useAuth()
  const [wishlist, setWishlist] = useState<Wishlist[]>([])
  const [wLoading, setWLoading] = useState(true)

  useEffect(() => {
    if (user) wishlistService.get(user.id).then(w => { setWishlist(w); setWLoading(false) })
    else if (!loading) setWLoading(false)
  }, [user, loading])

  async function remove(productId: number) {
    if (!user) return
    await wishlistService.remove(user.id, productId)
    setWishlist(w => w.filter(i => i.product_id !== productId))
  }

  if (loading || wLoading) return <><Navbar /><PageLoader label="Loading wishlist..." /></>

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-12">
        <Link href="/account" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> My Account</Link>
        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Account</p>
        <h1 className="mt-2 text-4xl font-black text-blue-950">My wishlist</h1>
        <p className="mt-1 text-sm text-blue-400">{wishlist.length} saved items</p>

        {wishlist.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {wishlist.map(item => {
              const product = item.product
              if (!product) return null
              const img = productsService.getPrimaryImage(product as any)
              const price = productsService.getMinPrice(product as any)
              return (
                <div key={item.id} className="group relative block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-blue-50">
                    {img ? <img src={img.image_url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-6xl font-black text-blue-200">AG</div>}
                    <button onClick={() => remove(product.id)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-red-500 shadow-sm hover:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="mt-3 font-bold text-blue-900 hover:text-orange-500 line-clamp-1">{product.name}</h3>
                    <p className="mt-1 font-bold text-blue-700">{price > 0 ? formatCurrency(price) : 'View details'}</p>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="♡" title="Your wishlist is empty" description="Save items you love to find them easily later." action={<Link href="/products" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Explore products</Link>} />
        )}
      </div>
      <Footer />
    </main>
  )
}
