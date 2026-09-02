'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { categoriesService, type CategoryInput } from '@/services/categories'
import { SingleImageUploader } from '@/components/ui/image-uploader'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  initialCategory?: Category
  saving: boolean
  submitLabel: string
  savingLabel: string
  onSubmit: (payload: CategoryInput, imageFile?: File) => Promise<void>
  onError: (message: string) => void
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

export function CategoryForm({
  initialCategory,
  saving,
  submitLabel,
  savingLabel,
  onSubmit,
  onError,
}: CategoryFormProps) {
  const [name, setName] = useState(initialCategory?.name || '')
  const [slug, setSlug] = useState(initialCategory?.slug || '')
  const [description, setDescription] = useState(initialCategory?.description || '')
  const [image, setImage] = useState<string | null>(initialCategory?.image || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isActive, setIsActive] = useState(initialCategory?.is_active ?? true)
  const [slugEdited, setSlugEdited] = useState(Boolean(initialCategory))
  const [checkingSlug, setCheckingSlug] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true)
    setSlug(slugify(value))
  }
  
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const cleanName = name.trim()
  const cleanSlug = slugify(slug || cleanName)

  if (!cleanName) {
    onError('Category name is required')
    return
  }

  if (!cleanSlug || !SLUG_PATTERN.test(cleanSlug)) {
    onError('Slug must use lowercase letters, numbers, and single hyphens')
    return
  }

  try {
    await onSubmit({
      name: cleanName,
      slug: cleanSlug,
      description: description.trim() || null,
      image,
      is_active: isActive,
    }, imageFile || undefined)
  } catch (error) {
    onError(getErrorMessage(error))
  }
}

  const disabled = saving || checkingSlug

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-black text-blue-950">Category details</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-blue-900">Category name *</label>
            <input
              value={name}
              onChange={event => handleNameChange(event.target.value)}
              placeholder="e.g. Shirts"
              className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-blue-900">Slug *</label>
            <input
              value={slug}
              onChange={event => handleSlugChange(event.target.value)}
              placeholder="category-slug"
              className="w-full rounded-xl border border-blue-200 px-4 py-3 font-mono text-sm outline-none focus:border-orange-400"
            />
            <p className="mt-1 text-xs text-blue-400">URL: /categories/{slug || 'category-slug'}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-blue-900">Description</label>
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              rows={4}
              placeholder="Short category description..."
              className="w-full resize-none rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <SingleImageUploader
            label="Category image"
            currentUrl={image}
            onChange={(file) => {
              setImageFile(file)
              if (!file) setImage(null)
            }}
          />

          <label className="flex cursor-pointer items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(current => !current)}
              className={`relative h-6 w-11 rounded-full transition ${isActive ? 'bg-orange-500' : 'bg-blue-200'}`}
              aria-pressed={isActive}
              aria-label={isActive ? 'Deactivate category' : 'Activate category'}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-6' : 'left-1'}`} />
            </button>
            <span className="text-sm font-bold text-blue-900">Active (visible on storefront)</span>
          </label>
        </div>
      </section>

      <div className="flex gap-3">
        <Link href="/admin/categories" className="flex-1 rounded-xl border border-blue-200 py-3 text-center text-sm font-bold text-blue-700 hover:border-orange-400">
          Cancel
        </Link>
        <button type="submit" disabled={disabled} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70">
          {disabled ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
