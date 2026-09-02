import { CheckoutClient } from '@/components/checkout/checkout-client'
import { Navbar } from '@/components/storefront/navbar'

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <CheckoutClient />
    </main>
  )
}
