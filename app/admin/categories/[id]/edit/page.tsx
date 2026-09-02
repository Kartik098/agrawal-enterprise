'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { CategoryForm } from '@/components/admin/category-form'
import { ErrorMessage, PageLoader, Toast } from '@/components/ui/states'
import { categoriesService, type CategoryInput } from '@/services/categories'
import type { Category } from '@/types/database'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to save category'
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCategory() {
      const categoryId = Number(id)
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        setError('Invalid category ID')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const result = await categoriesService.getCategoryById(categoryId)
        if (cancelled) return
        if (!result) {
          setError('Category not found')
        } else {
          setCategory(result)
        }
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCategory()
    return () => { cancelled = true }
  }, [id])

  async function handleUpdate(payload: CategoryInput, imageFile?: File) {
    if (!category) return

    setSaving(true)
    try {
      await categoriesService.updateCategory(category.id, payload, imageFile)
      setToast({ msg: 'Category updated', type: 'success' })
      setTimeout(() => router.push('/admin/categories'), 700)
    } catch (saveError) {
      setToast({ msg: getErrorMessage(saveError), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-blue-50">
        <AdminNav active="/admin/categories" />
        <div className="lg:pl-72">
          <AdminTopbar onMenuClick={() => {}} />
          <PageLoader label="Loading category..." />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/categories" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell max-w-2xl py-8">
          <Link href="/admin/categories" className="mb-6 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500">
            <ArrowLeft size={17} /> All categories
          </Link>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-blue-950">Edit Category</h1>

          {error || !category ? (
            <div className="mt-8">
              <ErrorMessage message={error || 'Category not found'} />
            </div>
          ) : (
            <CategoryForm
              initialCategory={category}
              saving={saving}
              submitLabel="Save changes"
              savingLabel="Saving..."
              onSubmit={handleUpdate}
              onError={message => setToast({ msg: message, type: 'error' })}
            />
          )}
        </div>
      </div>
    </main>
  )
}
