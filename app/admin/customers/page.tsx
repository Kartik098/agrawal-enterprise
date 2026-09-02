'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { usersService } from '@/services/users'
import { formatCurrency } from '@/components/storefront-ui'
import { TableRowSkeleton, EmptyState } from '@/components/ui/states'
import type { User } from '@/types/database'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { usersService.getAllCustomers().then(setCustomers).finally(() => setLoading(false)) }, [])

  const filtered = customers.filter(c =>
    !search || (c.full_name || '').toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/customers" />
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Customers</h1>
            <p className="mt-2 text-sm text-blue-500">{customers.length} registered customers</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[['Total customers', customers.length], ['Active', customers.filter(c => c.is_active).length]].map(([label, val]) => (
              <div key={label as string} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-2xl font-black text-blue-950">{val}</p>
                <p className="mt-1 text-sm text-blue-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 max-w-sm">
            <Search size={17} className="text-blue-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full bg-transparent text-sm outline-none placeholder:text-blue-300" />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />) :
                    filtered.map(c => (
                      <tr key={c.id} className="border-t hover:bg-blue-50/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-sm font-black text-orange-600">
                              {(c.full_name || c.email).slice(0, 2).toUpperCase()}
                            </div>
                            <p className="font-bold text-blue-950">{c.full_name || '—'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-blue-600">{c.email}</td>
                        <td className="px-5 py-4 text-blue-500">{c.phone || '—'}</td>
                        <td className="px-5 py-4 text-blue-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/admin/customers/${c.id}`} className="text-sm font-bold text-orange-500 hover:text-orange-600">View →</Link>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            {!loading && !filtered.length && (
              <EmptyState icon="👥" title="No customers yet" description="Customers who register on the storefront will appear here." />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
