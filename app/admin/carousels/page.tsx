'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Images, ExternalLink, X } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { carouselsService } from '@/services/carousels'
import { brandsService } from '@/services/brands'
import { SingleImageUploader } from '@/components/ui/image-uploader'
import { Toast, PageLoader } from '@/components/ui/states'
import type { CarouselItem, Brand } from '@/types/database'

export default function AdminCarouselsPage() {
  const [carousels, setCarousels] = useState<CarouselItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [brandId, setBrandId] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [slidesData, brandsData] = await Promise.all([
        carouselsService.getAll(),
        brandsService.getAll(),
      ])
      setCarousels(slidesData)
      setBrands(brandsData)
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to load carousel items', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    setEditingItem(null)
    setTitle('')
    setImageUrl('')
    setBrandId(null)
    setSortOrder(carousels.length)
    setIsActive(true)
    setImageFile(null)
    setModalOpen(true)
  }

  const openEditModal = (item: CarouselItem) => {
    setEditingItem(item)
    setTitle(item.title || '')
    setImageUrl(item.image_url || '')
    setBrandId(item.brand_id)
    setSortOrder(item.sort_order)
    setIsActive(item.is_active)
    setImageFile(null)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile && !imageUrl.trim()) {
      setToast({ msg: 'Please select an image file or enter an image URL', type: 'error' })
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await carouselsService.update(
          editingItem.id,
          {
            title: title.trim() || null,
            imageUrl: imageUrl.trim(),
            brandId: brandId,
            sortOrder: Number(sortOrder),
            isActive: isActive,
          },
          imageFile || undefined
        )
        setToast({ msg: 'Carousel slide updated successfully', type: 'success' })
      } else {
        await carouselsService.create(
          {
            title: title.trim() || null,
            imageUrl: imageUrl.trim(),
            brandId: brandId,
            sortOrder: Number(sortOrder),
            isActive: isActive,
          },
          imageFile || undefined
        )
        setToast({ msg: 'Carousel slide created successfully', type: 'success' })
      }
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to save carousel slide', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (item: CarouselItem) => {
    try {
      await carouselsService.update(item.id, { isActive: !item.is_active })
      setToast({
        msg: `Slide ${item.is_active ? 'deactivated' : 'activated'}`,
        type: 'success',
      })
      loadData()
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to toggle status', type: 'error' })
    }
  }

  const handleDelete = async (item: CarouselItem) => {
    if (!confirm('Are you sure you want to delete this carousel slide?')) return
    try {
      await carouselsService.delete(item.id)
      setToast({ msg: 'Carousel slide deleted', type: 'success' })
      loadData()
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to delete slide', type: 'error' })
    }
  }

  if (loading) return <PageLoader />

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/carousels" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />

        <div className="section-shell py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
              <h1 className="mt-2 text-3xl font-black text-blue-950">Home Carousel</h1>
              <p className="mt-2 text-sm text-blue-500">
                Manage hero carousel banners and link them to brand collection pages.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600 transition"
            >
              <Plus size={18} /> Add Carousel Slide
            </button>
          </div>

          {/* Carousel List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {carousels.length > 0 ? (
              carousels.map(item => (
                <div key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
                  {/* Image Preview */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-blue-50 border border-blue-100">
                    <img
                      src={item.image_url}
                      alt={item.title || 'Carousel slide'}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="absolute left-3 top-3 rounded-full bg-blue-900/80 px-2.5 py-0.5 text-xs font-bold text-white">
                      Order: {item.sort_order}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-blue-950 truncate">
                      {item.title || 'Untitled Slide'}
                    </h3>

                    {item.brand ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg w-fit">
                        <ExternalLink size={13} />
                        <span>Linked Brand: {item.brand.name} ({item.brand.slug})</span>
                      </div>
                    ) : (
                      <p className="text-xs text-blue-400">No brand linked (non-clickable banner)</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-blue-50 pt-3">
                    <button
                      onClick={() => toggleActive(item)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-blue-200 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition"
                    >
                      {item.is_active ? (
                        <ToggleRight size={16} className="text-green-500" />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                      <span>{item.is_active ? 'Active' : 'Inactive'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="rounded-xl border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 hover:text-orange-500 transition"
                      title="Edit slide"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded-xl bg-red-500 p-2 text-white hover:bg-red-600 transition"
                      title="Delete slide"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border bg-white p-12 text-center shadow-sm">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-400 mb-4">
                  <Images size={28} />
                </div>
                <h3 className="text-lg font-black text-blue-950">No custom carousel slides</h3>
                <p className="mt-1 text-sm text-blue-400">
                  The storefront is currently showing default sample slides. Click "Add Carousel Slide" above to add interactive brand banners!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-black text-blue-950">
                {editingItem ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-blue-400 hover:bg-blue-50 hover:text-blue-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Preview */}
              {(imageFile || imageUrl) && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-blue-900">Preview</label>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-blue-200 bg-blue-50">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload Image File */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">
                  Upload Image File
                </label>
                <SingleImageUploader
  currentUrl={imageUrl}
  onChange={(file, preview) => {
    setImageFile(file)
    if (preview && file) {
      setImageUrl('')
    }
  }}
  label={editingItem ? 'Replace image' : 'Choose image'}
  shape="wide"
/>
              </div>

              {/* Or Image URL */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">
                  Or Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/banner.webp"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>

              {/* Brand Selector */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-blue-900">
                  Link to Brand
                </label>
                <select
                  value={brandId || ''}
                  onChange={e => setBrandId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-950 outline-none focus:border-orange-400"
                >
                  <option value="">-- No Brand Linked --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.slug})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-blue-400">
                  Clicking this slide on the storefront will navigate to the selected brand page (/brands/[slug])
                </p>
              </div>

              {/* Title & Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">
                    Title / Alt Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer Collection"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-blue-900">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={e => setSortOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-blue-300 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm font-bold text-blue-900">Active on storefront</span>
              </label>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
