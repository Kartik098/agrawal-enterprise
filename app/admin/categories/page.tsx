'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { categoriesService, type CategoryWithCounts } from '@/services/categories'
import { EmptyState, ErrorMessage, TableRowSkeleton, Toast } from '@/components/ui/states'

const PAGE_SIZE = 10

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCounts[]>([])
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mutatingId, setMutatingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await categoriesService.getCategories({ search, page, pageSize: PAGE_SIZE })
        if (!cancelled) {
          setCategories(result.data)
          setCount(result.count)
        }
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [search, page])

  async function refresh() {
    const result = await categoriesService.getCategories({ search, page, pageSize: PAGE_SIZE })
    setCategories(result.data)
    setCount(result.count)
  }

  async function toggleActive(category: CategoryWithCounts) {
    setMutatingId(category.id)
    try {
      await categoriesService.toggleCategoryStatus(category.id, !category.is_active)
      setToast({ msg: `${category.name} ${category.is_active ? 'deactivated' : 'activated'}`, type: 'success' })
      await refresh()
    } catch (toggleError) {
      setToast({ msg: getErrorMessage(toggleError), type: 'error' })
    } finally {
      setMutatingId(null)
    }
  }

  async function deleteCategory(category: CategoryWithCounts) {
    if (category.product_count > 0 || category.subcategory_count > 0) {
      setToast({ msg: 'Deactivate categories that already have products or subcategories.', type: 'error' })
      return
    }

    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return

    setMutatingId(category.id)
    try {
      await categoriesService.deleteCategory(category.id)
      setToast({ msg: 'Category deleted', type: 'success' })
      if (categories.length === 1 && page > 1) setPage(current => current - 1)
      else await refresh()
    } catch (deleteError) {
      setToast({ msg: getErrorMessage(deleteError), type: 'error' })
    } finally {
      setMutatingId(null)
    }
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/categories" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
              <h1 className="mt-2 text-3xl font-black text-blue-950">Categories</h1>
              <p className="mt-2 text-sm text-blue-500">{count} categories in your catalog</p>
            </div>
            <Link href="/admin/categories/new" className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600">
              <Plus size={17} /> Create Category
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm sm:max-w-md">
            <Search size={17} className="text-blue-400" />
            <input
              value={search}
              onChange={event => handleSearch(event.target.value)}
              placeholder="Search categories..."
              className="w-full bg-transparent text-sm font-semibold text-blue-900 outline-none placeholder:text-blue-300"
            />
          </div>

          {error && <div className="mt-6"><ErrorMessage message={error} /></div>}

          <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Subcategories</th>
                    <th className="px-5 py-3">Products</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 6 }).map((_, index) => <TableRowSkeleton key={index} cols={8} />) :
                    categories.length > 0 ? categories.map(category => (
                      <tr key={category.id} className="border-t hover:bg-blue-50/60">
                        <td className="px-5 py-4 font-bold text-blue-950">{category.name}</td>
                        <td className="px-5 py-4 font-mono text-xs text-blue-500">{category.slug}</td>
                        <td className="max-w-[240px] truncate px-5 py-4 text-blue-500">{category.description || '-'}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-blue-700">{category.subcategory_count}</td>
                        <td className="px-5 py-4 font-semibold text-blue-700">{category.product_count}</td>
                        <td className="px-5 py-4 text-blue-500">{new Date(category.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <Link href={`/admin/categories/${category.id}/edit`} className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-700" title="Edit category">
                              <Pencil size={15} />
                            </Link>
                            <button
                              onClick={() => toggleActive(category)}
                              disabled={mutatingId === category.id}
                              className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 disabled:opacity-50"
                              title={category.is_active ? 'Deactivate category' : 'Activate category'}
                            >
                              {category.is_active ? <ToggleRight size={15} className="text-green-500" /> : <ToggleLeft size={15} />}
                            </button>
                            <button
                              onClick={() => deleteCategory(category)}
                              disabled={mutatingId === category.id}
                              className="rounded-lg p-2 text-blue-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                              title="Delete category"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={8}>
                          <EmptyState
                            title={search ? 'No matching categories' : 'No categories yet'}
                            description={search ? 'Try a different search term.' : 'Create your first category to organize products.'}
                            action={!search && <Link href="/admin/categories/new" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Create Category</Link>}
                          />
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>

            {!loading && count > PAGE_SIZE && (
              <div className="flex items-center justify-between border-t px-5 py-4 text-sm">
                <p className="font-semibold text-blue-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(current => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-blue-200 px-4 py-2 font-bold text-blue-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-blue-200 px-4 py-2 font-bold text-blue-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
