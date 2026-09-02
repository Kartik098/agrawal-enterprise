'use client'
import { useState, useEffect } from 'react'
import { Search, Save, AlertTriangle } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { inventoryService } from '@/services/inventory'
import { Toast, TableRowSkeleton, EmptyState } from '@/components/ui/states'
import type { Inventory } from '@/types/database'

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [edits, setEdits] = useState<Record<number, { quantity: string; reorder_level: string }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => { setLoading(true); inventoryService.getAll().then(setInventory).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const filtered = inventory.filter(inv =>
    !search || (inv.product?.name || '').toLowerCase().includes(search.toLowerCase()) || (inv.product?.sku || '').toLowerCase().includes(search.toLowerCase())
  )

  function getEdit(inv: Inventory) {
    return edits[inv.id] || { quantity: String(inv.quantity), reorder_level: String(inv.reorder_level) }
  }

  function setEdit(id: number, key: 'quantity' | 'reorder_level', value: string) {
    setEdits(e => ({ ...e, [id]: { ...getEdit({ id } as any), [key]: value } }))
  }

  async function saveRow(inv: Inventory) {
    const edit = getEdit(inv)
    setSaving(inv.id)
    try {
      await inventoryService.update(inv.id, {
        quantity: Math.max(0, parseInt(edit.quantity) || 0),
        reorder_level: Math.max(0, parseInt(edit.reorder_level) || 0),
      })
      setToast({ msg: 'Stock updated', type: 'success' })
      setEdits(e => { const next = { ...e }; delete next[inv.id]; return next })
      load()
    } catch { setToast({ msg: 'Failed to update', type: 'error' }) }
    finally { setSaving(null) }
  }

  const lowStockCount = inventory.filter(inv => inv.quantity <= inv.reorder_level).length
  const outOfStockCount = inventory.filter(inv => inv.quantity === 0).length

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/inventory" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Inventory</h1>
            <p className="mt-2 text-sm text-blue-500">Manage stock levels across all product variants</p>
          </div>

          {/* Alert strip */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {outOfStockCount > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700">
                  <AlertTriangle size={16} /> {outOfStockCount} variant{outOfStockCount !== 1 ? 's' : ''} out of stock
                </div>
              )}
              {lowStockCount > outOfStockCount && (
                <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700">
                  <AlertTriangle size={16} /> {lowStockCount - outOfStockCount} variant{lowStockCount - outOfStockCount !== 1 ? 's' : ''} low stock
                </div>
              )}
            </div>
          )}

          {/* Summary cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['Total units', inventory.reduce((s, i) => s + i.quantity, 0)],
              ['Reserved units', inventory.reduce((s, i) => s + i.reserved_quantity, 0)],
              ['Available units', inventory.reduce((s, i) => s + Math.max(0, i.quantity - i.reserved_quantity), 0)],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-blue-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-blue-950">{value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 max-w-sm">
            <Search size={17} className="text-blue-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or SKU..." className="w-full bg-transparent text-sm outline-none placeholder:text-blue-300" />
          </div>

          {/* Table */}
          <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                  <tr>
                    <th className="px-5 py-3">Product / SKU</th>
                    <th className="px-5 py-3">Size</th>
                    <th className="px-5 py-3">Color</th>
                    <th className="px-5 py-3">Qty in stock</th>
                    <th className="px-5 py-3">Reserved</th>
                    <th className="px-5 py-3">Reorder at</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Save</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />) :
                    filtered.length > 0 ? filtered.map(inv => {
                      const edit = getEdit(inv)
                      const qty = parseInt(edit.quantity) || 0
                      const reorder = parseInt(edit.reorder_level) || 0
                      const isDirty = edit.quantity !== String(inv.quantity) || edit.reorder_level !== String(inv.reorder_level)
                      const status = qty === 0 ? 'Out of stock' : qty <= reorder ? 'Low stock' : 'Healthy'
                      return (
                        <tr key={inv.id} className={`border-t ${qty === 0 ? 'bg-red-50/40' : qty <= reorder ? 'bg-orange-50/40' : ''}`}>
                          <td className="px-5 py-4">
                            <p className="font-bold text-blue-950">{inv.product?.name}</p>
                            {inv.product?.sku && <p className="font-mono text-xs text-blue-400">{inv.product.sku}</p>}
                          </td>
                          <td className="px-5 py-4 text-blue-700">{inv.product_size?.size?.name || '—'}</td>
                          <td className="px-5 py-4 text-blue-600">{inv.product_color?.color?.name || '—'}</td>
                          <td className="px-5 py-4">
                            <input type="number" value={edit.quantity} min="0" onChange={e => setEdit(inv.id, 'quantity', e.target.value)} className="w-24 rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold outline-none focus:border-orange-400" />
                          </td>
                          <td className="px-5 py-4 text-blue-400">{inv.reserved_quantity}</td>
                          <td className="px-5 py-4">
                            <input type="number" value={edit.reorder_level} min="0" onChange={e => setEdit(inv.id, 'reorder_level', e.target.value)} className="w-24 rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none focus:border-orange-400" />
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === 'Healthy' ? 'bg-green-100 text-green-700' : status === 'Low stock' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600'}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {isDirty && (
                              <button onClick={() => saveRow(inv)} disabled={saving === inv.id} className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-60">
                                <Save size={13} /> {saving === inv.id ? '...' : 'Save'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={8} className="px-5 py-20 text-center text-sm text-blue-300">No inventory records. Add products with sizes to see inventory here.</td></tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
