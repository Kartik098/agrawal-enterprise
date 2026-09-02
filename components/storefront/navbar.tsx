'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { UserMenu, CartButton } from '@/components/storefront-ui'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { categoriesService } from '@/services/categories'
import type { Category } from '@/types/database'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const pathname = usePathname()

  useEffect(() => {
    categoriesService.getActive().then(cats => setCategories(cats.slice(0, 5)))
  }, [])

  const navLinks = [
    ...categories.map(c => ({ label: c.name, href: `/categories/${c.slug}` })),
    { label: 'Brands', href: '/brands' },
  ]

  return (
    <>
      <div className="bg-blue-500 px-4 py-2 text-center text-xs font-semibold tracking-wide text-white">
        Free delivery on orders over ₹999 · Easy 7-day returns
      </div>
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-blue-700 shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-xl text-white font-black">AG</span>
            <span>Agrawal <span className="text-orange-500">Enterprise</span></span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-blue-700 md:flex">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={`hover:text-orange-500 transition-colors ${pathname === link.href ? 'text-orange-500' : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/products?search=1" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full text-blue-600 hover:bg-blue-50">
              <Search size={19} />
            </Link>
            <CartButton />
            <NotificationBell />
            <UserMenu />
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-blue-600 hover:bg-blue-50 md:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b px-4 py-5">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-xl font-black text-blue-700">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-sm font-black text-white">AG</span>
              Agrawal <span className="text-orange-500">Enterprise</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-blue-600 hover:bg-blue-50">
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-6 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-base font-bold text-blue-800 hover:bg-blue-50 hover:text-orange-500">
                {link.label}
              </Link>
            ))}
            <div className="border-t my-4" />
            <Link href="/account" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-base font-bold text-blue-800 hover:bg-blue-50">My Account</Link>
            <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-base font-bold text-blue-800 hover:bg-blue-50">My Orders</Link>
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-base font-bold text-blue-800 hover:bg-blue-50">Cart</Link>
            <div className="border-t my-4" />
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-base font-bold text-orange-600 hover:bg-orange-50">Log in / Sign up</Link>
          </nav>
        </div>
      )}
    </>
  )
}
