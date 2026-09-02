'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { CategoryForm } from '@/components/admin/category-form'
import { Toast } from '@/components/ui/states'
import { categoriesService, type CategoryInput } from '@/services/categories'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to create category'
}

export default function NewCategoryPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  async function handleCreate(payload: CategoryInput, imageFile?: File) {
    setSaving(true)
    try {
      await categoriesService.createCategory(payload, imageFile)

      setToast({ msg: 'Category created', type: 'success' })
      setTimeout(() => router.push('/admin/categories'), 700)
    } catch (error) {
      setToast({ msg: getErrorMessage(error), type: 'error' })
    } finally {
      setSaving(false)
    }
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
          <h1 className="mt-2 text-3xl font-black text-blue-950">Create Category</h1>

          <CategoryForm
            saving={saving}
            submitLabel="Create category"
            savingLabel="Creating..."
            onSubmit={handleCreate}
            onError={message => setToast({ msg: message, type: 'error' })}
          />
        </div>
      </div>
    </main>
  )
}
