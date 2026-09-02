import { CartPageClient } from '@/components/cart/cart-page-client'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront-ui'

export default function CartPage() {
  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <CartPageClient />
      <Footer />
    </main>
  )
}
