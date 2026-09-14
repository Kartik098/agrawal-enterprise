'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  ArrowLeft,
  Plus,
  Trash2,
  Star,
} from 'lucide-react'

import { AdminNav, AdminTopbar } from '@/app/admin/page'

import { productsService } from '@/services/products'
import { inventoryService } from '@/services/inventory'

import {
  categoriesService,
  subcategoriesService,
} from '@/services/categories'

import {
  brandsService,
} from '@/services/brands'

import {
  sizesService,
  colorsService,
} from '@/services/sizes-colors'

import { ImageUploader } from '@/components/ui/image-uploader'
import { PageLoader, Toast } from '@/components/ui/states'

import type {
  Product,
  Category,
  Subcategory,
  Brand,
  Size,
  Color,
  ProductImage,
} from '@/types/database'

type SizeEntry = {
  id?: string
  sizeId: string
  price: string
  mrp: string
  sku: string
}

type NewImage = {
  url: string
  file: File
  isPrimary: boolean
  sortOrder: number
  colorId: string | null
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  // UUIDs are strings.
  const productId = id

  const [product, setProduct] = useState<Product | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [colors, setColors] = useState<Color[]>([])

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [toast, setToast] = useState<{
    msg: string
    type: 'success' | 'error'
  } | null>(null)

  // ───────────────────────────────────────────────────────────────────────────
  // Form state
  // ───────────────────────────────────────────────────────────────────────────

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [modelNo, setModelNo] = useState('')
  const [description, setDescription] = useState('')

  const [gender, setGender] = useState<
    'Men' | 'Women' | 'Kids' | 'Unisex'
  >('Unisex')

  // UUIDs are strings.
  const [categoryId, setCategoryId] = useState<string>('')
  const [subcategoryId, setSubcategoryId] = useState<string>('')
  const [brandId, setBrandId] = useState<string>('')

  const [isActive, setIsActive] = useState(true)

  const [sizeEntries, setSizeEntries] = useState<SizeEntry[]>([])

  // These are master colors.id UUID values.
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])

  const [existingImages, setExistingImages] = useState<ProductImage[]>([])

  // General images + color-specific images.
  //
  // colorId:
  //   null   -> general product image
  //   UUID   -> image for that master color
  const [newImages, setNewImages] = useState<NewImage[]>([])

  // ───────────────────────────────────────────────────────────────────────────
  // Load product + lookup data
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const [
          loadedProduct,
          loadedCategories,
          loadedBrands,
          loadedSizes,
          loadedColors,
        ] = await Promise.all([
          productsService.getById(productId),
          categoriesService.getAll(),
          brandsService.getAll(),
          sizesService.getAll(),
          colorsService.getAll(),
        ])

        if (cancelled) {
          return
        }

        setProduct(loadedProduct)
        setCategories(loadedCategories)
        setBrands(loadedBrands)
        setSizes(loadedSizes)
        setColors(loadedColors)

        if (loadedProduct) {
          setName(loadedProduct.name)
          setSlug(loadedProduct.slug)
          setSku(loadedProduct.sku || '')
          setModelNo(loadedProduct.model_no || '')
          setDescription(loadedProduct.description || '')

          setGender(
            loadedProduct.gender as
              | 'Men'
              | 'Women'
              | 'Kids'
              | 'Unisex'
          )

          setCategoryId(loadedProduct.category_id)

          setSubcategoryId(
            loadedProduct.subcategory_id || ''
          )

          setBrandId(
            loadedProduct.brand_id || ''
          )

          setIsActive(loadedProduct.is_active)

          setSizeEntries(
            (loadedProduct.product_sizes || []).map(
              (productSize) => ({
                id: productSize.id,
                sizeId: productSize.size_id,
                price: String(productSize.price),
                mrp: String(productSize.mrp),
                sku: productSize.sku || '',
              })
            )
          )

          // These are master colors.id UUID values.
          setSelectedColorIds(
            (loadedProduct.product_colors || []).map(
              (productColor) => productColor.color_id
            )
          )

          setExistingImages(
            [...(loadedProduct.product_images || [])].sort(
              (a, b) => a.sort_order - b.sort_order
            )
          )
        }
      } catch (error: any) {
        if (!cancelled) {
          setToast({
            msg:
              error?.message ||
              'Failed to load product',
            type: 'error',
          })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    // UUID route params are strings.
    // We only need to check that an ID exists.
    if (productId.trim().length > 0) {
      load()
    } else {
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [productId])

  // ───────────────────────────────────────────────────────────────────────────
  // Load subcategories whenever category changes
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function loadSubcategories() {
      if (!categoryId) {
        setSubcategories([])
        return
      }

      try {
        const data =
          await subcategoriesService.getByCategory(
            categoryId
          )

        if (!cancelled) {
          setSubcategories(data)
        }
      } catch {
        if (!cancelled) {
          setSubcategories([])
        }
      }
    }

    loadSubcategories()

    return () => {
      cancelled = true
    }
  }, [categoryId])

  // ───────────────────────────────────────────────────────────────────────────
  // Selected color objects
  // ───────────────────────────────────────────────────────────────────────────

  const selectedColors = useMemo(() => {
    return colors.filter((color) =>
      selectedColorIds.includes(color.id)
    )
  }, [colors, selectedColorIds])

  // ───────────────────────────────────────────────────────────────────────────
  // Size helpers
  // ───────────────────────────────────────────────────────────────────────────

  function updateSizeEntry(
    index: number,
    changes: Partial<SizeEntry>
  ) {
    setSizeEntries((entries) =>
      entries.map((entry, entryIndex) =>
        entryIndex === index
          ? { ...entry, ...changes }
          : entry
      )
    )
  }

  function addSize() {
    setSizeEntries((entries) => [
      ...entries,
      {
        sizeId: '',
        price: '',
        mrp: '',
        sku: '',
      },
    ])
  }

  function removeSize(index: number) {
    setSizeEntries((entries) =>
      entries.filter(
        (_, entryIndex) => entryIndex !== index
      )
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Color helpers
  // ───────────────────────────────────────────────────────────────────────────

  function toggleColor(colorId: string) {
    setSelectedColorIds((ids) => {
      if (ids.includes(colorId)) {
        return ids.filter((id) => id !== colorId)
      }

      return [...ids, colorId]
    })
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Image helpers
  // ───────────────────────────────────────────────────────────────────────────

  function getNewImagesForColor(
    colorId: string | null
  ) {
    return newImages
      .filter(
        (image) => image.colorId === colorId
      )
      .sort(
        (a, b) => a.sortOrder - b.sortOrder
      )
  }

  function updateNewImagesForColor(
    colorId: string | null,
    images: {
      url: string
      file?: File
      isPrimary: boolean
      sortOrder: number
    }[]
  ) {
    const otherImages = newImages.filter(
      (image) => image.colorId !== colorId
    )

    const mappedImages: NewImage[] =
      images
        .filter(
          (
            image
          ): image is typeof image & {
            file: File
          } => Boolean(image.file)
        )
        .map((image, index) => ({
          url: image.url,
          file: image.file,
          isPrimary: image.isPrimary,
          sortOrder: index,
          colorId,
        }))

    setNewImages([
      ...otherImages,
      ...mappedImages,
    ])
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Save
  // ───────────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!product) {
      return
    }

    if (!name.trim()) {
      setToast({
        msg: 'Product name is required',
        type: 'error',
      })
      return
    }

    if (!categoryId) {
      setToast({
        msg: 'Category is required',
        type: 'error',
      })
      return
    }

    // Validate sizes.
    const validSizes = sizeEntries.filter(
      (size) =>
        size.sizeId.trim() !== '' &&
        size.price.trim() !== ''
    )

    const duplicateSizeIds =
      validSizes
        .map((size) => size.sizeId)
        .filter(
          (sizeId, index, array) =>
            array.indexOf(sizeId) !== index
        )

    if (duplicateSizeIds.length) {
      setToast({
        msg: 'Each size can only be added once',
        type: 'error',
      })
      return
    }

    // Validate numeric prices.
    for (const size of validSizes) {
      const price = Number(size.price)

      const mrp = Number(
        size.mrp || size.price
      )

      if (
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isFinite(mrp) ||
        mrp < 0
      ) {
        setToast({
          msg:
            'Please enter valid prices for every size',
          type: 'error',
        })
        return
      }
    }

    setSaving(true)

    try {
      // ─────────────────────────────────────────────────────────────────────
      // 1. Update main product
      // ─────────────────────────────────────────────────────────────────────

      await productsService.update(
        product.id,
        {
          name: name.trim(),
          slug: slug.trim(),
          sku: sku.trim() || null,
          model_no: modelNo.trim() || null,
          description:
            description.trim() || null,
          gender,

          // UUID
          category_id: categoryId,

          // UUID | null
          subcategory_id:
            subcategoryId || null,

          // UUID | null
          brand_id:
            brandId || null,

          is_active: isActive,
        }
      )

      // ─────────────────────────────────────────────────────────────────────
      // 2. Upsert sizes
      //
      // Existing product_sizes are updated.
      // New product_sizes are inserted.
      // Nothing is deleted here.
      // ─────────────────────────────────────────────────────────────────────

      const updatedProductSizes =
        await productsService.upsertSizes(
          product.id,
          validSizes.map((size) => ({
            product_id: product.id,

            // UUID
            size_id: size.sizeId,

            price: Number(size.price),

            mrp: Number(
              size.mrp || size.price
            ),

            sku: size.sku.trim() || null,
            is_active: true,
          }))
        )

      // ─────────────────────────────────────────────────────────────────────
      // 3. Upsert colors
      //
      // selectedColorIds are MASTER colors.id UUIDs.
      //
      // upsertColors returns product_colors rows.
      // We need their IDs for inventory.
      // ─────────────────────────────────────────────────────────────────────

      const updatedProductColors =
        await productsService.upsertColors(
          product.id,
          selectedColorIds
        )

      // ─────────────────────────────────────────────────────────────────────
      // 4. Synchronize inventory variants
      //
      // product_size.id -> UUID
      // product_color.id -> UUID
      // ─────────────────────────────────────────────────────────────────────

      await inventoryService.syncInventoryVariants(
        product.id,
        updatedProductSizes.map(
          (size) => size.id
        ),
        updatedProductColors.map(
          (color) => color.id
        )
      )

      // ─────────────────────────────────────────────────────────────────────
      // 5. Upload new images
      //
      // product_images.color_id references colors.id.
      //
      // Therefore image.colorId is the MASTER colors.id UUID.
      // ─────────────────────────────────────────────────────────────────────

      if (newImages.length > 0) {
        const primaryNewImageIndex =
          newImages.findIndex(
            (image) => image.isPrimary
          )

        for (
          let index = 0;
          index < newImages.length;
          index++
        ) {
          const image = newImages[index]

          const shouldBePrimary =
            primaryNewImageIndex === index

          await productsService.uploadImage(
            product.id,
            image.file,
            {
              isPrimary: shouldBePrimary,
              sortOrder:
                existingImages.length +
                index,
              colorId: image.colorId,
            }
          )
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 6. Refresh product state
      // ─────────────────────────────────────────────────────────────────────

      const refreshedProduct =
        await productsService.getById(
          product.id
        )

      if (refreshedProduct) {
        setProduct(refreshedProduct)

        setExistingImages(
          [
            ...(refreshedProduct.product_images || []),
          ].sort(
            (a, b) =>
              a.sort_order - b.sort_order
          )
        )
      }

      setNewImages([])

      setToast({
        msg: 'Product updated successfully!',
        type: 'success',
      })

      setTimeout(() => {
        router.push('/admin/products')
      }, 1200)
    } catch (error: any) {
      setToast({
        msg:
          error?.message ||
          'Failed to update product',
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Existing image deletion
  // ───────────────────────────────────────────────────────────────────────────

  async function deleteImage(
    image: ProductImage
  ) {
    if (
      !confirm(
        'Delete this image?'
      )
    ) {
      return
    }

    try {
      await productsService.deleteImage(
        image
      )

      setExistingImages((images) =>
        images.filter(
          (item) => item.id !== image.id
        )
      )

      setToast({
        msg: 'Image deleted',
        type: 'success',
      })
    } catch (error: any) {
      setToast({
        msg:
          error?.message ||
          'Failed to delete image',
        type: 'error',
      })
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Set existing image primary
  // ───────────────────────────────────────────────────────────────────────────

  async function setPrimaryImage(
    image: ProductImage
  ) {
    if (!product) {
      return
    }

    try {
      await productsService.setPrimaryImage(
        product.id,
        image.id
      )

      setExistingImages((images) =>
        images.map((item) => ({
          ...item,
          is_primary:
            item.id === image.id,
        }))
      )

      setToast({
        msg: 'Primary image updated',
        type: 'success',
      })
    } catch (error: any) {
      setToast({
        msg:
          error?.message ||
          'Failed to set primary image',
        type: 'error',
      })
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Loading
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <AdminNav />

        <div className="lg:pl-72">
          <AdminTopbar
            onMenuClick={() => {}}
          />

          <PageLoader />
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <div className="section-shell py-20 text-center text-blue-400">
        Product not found.
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/products" />

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="lg:pl-72">
        <AdminTopbar
          onMenuClick={() => {}}
        />

        <div className="section-shell py-8">
          <Link
            href="/admin/products"
            className="mb-6 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500"
          >
            <ArrowLeft size={17} />
            All products
          </Link>

          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-black text-blue-950">
            Edit Product
          </h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">

              {/* Basic information */}

              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-black text-blue-950">
                  Basic information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">
                      Name *
                    </label>

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">
                        Slug
                      </label>

                      <input
                        value={slug}
                        onChange={(e) =>
                          setSlug(e.target.value)
                        }
                        className="w-full rounded-xl border border-blue-200 px-4 py-3 font-mono text-sm outline-none focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">
                        SKU
                      </label>

                      <input
                        value={sku}
                        onChange={(e) =>
                          setSku(e.target.value)
                        }
                        className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">
                        Model no.
                      </label>

                      <input
                        value={modelNo}
                        onChange={(e) =>
                          setModelNo(e.target.value)
                        }
                        className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">
                        Gender
                      </label>

                      <select
                        value={gender}
                        onChange={(e) =>
                          setGender(
                            e.target.value as
                              | 'Men'
                              | 'Women'
                              | 'Kids'
                              | 'Unisex'
                          )
                        }
                        className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                      >
                        {[
                          'Men',
                          'Women',
                          'Kids',
                          'Unisex',
                        ].map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                      rows={4}
                      className="w-full resize-none rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
              </section>

              {/* Sizes */}

              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="font-black text-blue-950">
                    Sizes & Pricing
                  </h2>

                  <p className="mt-1 text-xs text-blue-400">
                    Changing prices updates the existing
                    size. Existing inventory quantities are
                    preserved.
                  </p>
                </div>

                <div className="space-y-3">
                  {sizeEntries.map(
                    (row, index) => (
                      <div
                        key={
                          row.id ??
                          `new-${index}`
                        }
                        className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-3"
                      >
                        <div>
                          {index === 0 && (
                            <label className="mb-1 block text-xs font-bold text-blue-500">
                              SIZE
                            </label>
                          )}

                          <select
                            value={
                              row.sizeId || ''
                            }
                            onChange={(e) =>
                              updateSizeEntry(
                                index,
                                {
                                  sizeId:
                                    e.target.value,
                                }
                              )
                            }
                            className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                          >
                            <option value="">
                              Select
                            </option>

                            {sizes.map(
                              (size) => (
                                <option
                                  key={size.id}
                                  value={size.id}
                                >
                                  {size.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          {index === 0 && (
                            <label className="mb-1 block text-xs font-bold text-blue-500">
                              PRICE (₹)
                            </label>
                          )}

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.price}
                            onChange={(e) =>
                              updateSizeEntry(
                                index,
                                {
                                  price:
                                    e.target.value,
                                }
                              )
                            }
                            placeholder="0.00"
                            className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                          />
                        </div>

                        <div>
                          {index === 0 && (
                            <label className="mb-1 block text-xs font-bold text-blue-500">
                              MRP (₹)
                            </label>
                          )}

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.mrp}
                            onChange={(e) =>
                              updateSizeEntry(
                                index,
                                {
                                  mrp:
                                    e.target.value,
                                }
                              )
                            }
                            placeholder="0.00"
                            className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                          />
                        </div>

                        <div>
                          {index === 0 && (
                            <label className="mb-1 block text-xs font-bold text-blue-500">
                              SKU
                            </label>
                          )}

                          <input
                            value={row.sku}
                            onChange={(e) =>
                              updateSizeEntry(
                                index,
                                {
                                  sku:
                                    e.target.value,
                                }
                              )
                            }
                            placeholder="Optional"
                            className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeSize(index)
                          }
                          className="rounded-lg p-2.5 text-blue-300 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={addSize}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-500 hover:border-orange-400 hover:text-orange-500"
                  >
                    <Plus size={15} />
                    Add size
                  </button>
                </div>
              </section>

              {/* Colors */}

              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="font-black text-blue-950">
                    Colors
                  </h2>

                  <p className="mt-1 text-xs text-blue-400">
                    Adding a color automatically creates
                    the missing size × color inventory
                    variants. Existing stock is preserved.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const selected =
                      selectedColorIds.includes(
                        color.id
                      )

                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() =>
                          toggleColor(
                            color.id
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                          selected
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-blue-200 text-blue-700 hover:border-orange-300'
                        }`}
                      >
                        {color.hex_code && (
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{
                              background:
                                color.hex_code,
                            }}
                          />
                        )}

                        {color.name}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Images */}

              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-black text-blue-950">
                  Images
                </h2>

                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-3 text-sm font-bold text-blue-700">
                      Existing images
                    </p>

                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {existingImages.map(
                        (image) => {
                          const imageColor =
                            image.color_id
                              ? colors.find(
                                  (color) =>
                                    color.id ===
                                    image.color_id
                                )
                              : null

                          return (
                            <div
                              key={image.id}
                              className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${
                                image.is_primary
                                  ? 'border-orange-500'
                                  : 'border-blue-200'
                              }`}
                            >
                              <img
                                src={
                                  image.image_url
                                }
                                alt={
                                  imageColor?.name ||
                                  'Product image'
                                }
                                className="h-full w-full object-cover"
                              />

                              {image.is_primary && (
                                <div className="absolute left-1 top-1 flex items-center gap-1 rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  <Star
                                    size={8}
                                    fill="currentColor"
                                  />
                                  Primary
                                </div>
                              )}

                              {imageColor && (
                                <div className="absolute bottom-1 left-1 rounded-md bg-blue-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  {imageColor.name}
                                </div>
                              )}

                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition group-hover:opacity-100">
                                {!image.is_primary && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPrimaryImage(
                                        image
                                      )
                                    }
                                    className="rounded-lg bg-orange-500 px-2 py-1 text-[10px] font-bold text-white"
                                  >
                                    Set primary
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteImage(
                                      image
                                    )
                                  }
                                  className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* General images */}

                <div className="mb-6">
                  <div className="mb-3">
                    <p className="text-sm font-bold text-blue-700">
                      General product images
                    </p>

                    <p className="text-xs text-blue-400">
                      These images are not tied to a
                      specific color.
                    </p>
                  </div>

                  <ImageUploader
                    label="Upload general images"
                    images={getNewImagesForColor(
                      null
                    ).map((image) => ({
                      url: image.url,
                      file: image.file,
                      isPrimary:
                        image.isPrimary,
                      sortOrder:
                        image.sortOrder,
                    }))}
                    onChange={(images) =>
                      updateNewImagesForColor(
                        null,
                        images
                      )
                    }
                  />
                </div>

                {/* Color-specific images */}

                {selectedColors.length > 0 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-bold text-blue-700">
                        Color-specific images
                      </p>

                      <p className="mt-1 text-xs text-blue-400">
                        Upload images for each color.
                        These are stored using the
                        master colors.id.
                      </p>
                    </div>

                    {selectedColors.map(
                      (color) => {
                        const colorImages =
                          getNewImagesForColor(
                            color.id
                          )

                        return (
                          <div
                            key={color.id}
                            className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
                          >
                            <div className="mb-3 flex items-center gap-2">
                              {color.hex_code && (
                                <span
                                  className="h-5 w-5 rounded-full border"
                                  style={{
                                    background:
                                      color.hex_code,
                                  }}
                                />
                              )}

                              <span className="text-sm font-black text-blue-950">
                                {color.name}
                              </span>
                            </div>

                            <ImageUploader
                              label={`Upload ${color.name} images`}
                              images={colorImages.map(
                                (image) => ({
                                  url: image.url,
                                  file: image.file,
                                  isPrimary:
                                    image.isPrimary,
                                  sortOrder:
                                    image.sortOrder,
                                })
                              )}
                              onChange={(images) =>
                                updateNewImagesForColor(
                                  color.id,
                                  images
                                )
                              }
                            />
                          </div>
                        )
                      }
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}

            <div className="space-y-4">

              {/* Status */}

              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-black text-blue-950">
                  Status
                </h3>

                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-sm font-bold text-blue-900">
                    Active on storefront
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setIsActive(
                        (value) => !value
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      isActive
                        ? 'bg-orange-500'
                        : 'bg-blue-200'
                    }`}
                    aria-label="Toggle active status"
                  >
                    <div
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        isActive
                          ? 'left-6'
                          : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              </section>

              {/* Organisation */}

              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-black text-blue-950">
                  Organisation
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">
                      Category *
                    </label>

                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(
                          e.target.value
                        )

                        setSubcategoryId('')
                      }}
                      className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {subcategories.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">
                        Subcategory
                      </label>

                      <select
                        value={subcategoryId}
                        onChange={(e) =>
                          setSubcategoryId(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                      >
                        <option value="">
                          None
                        </option>

                        {subcategories.map(
                          (subcategory) => (
                            <option
                              key={
                                subcategory.id
                              }
                              value={
                                subcategory.id
                              }
                            >
                              {
                                subcategory.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">
                      Brand
                    </label>

                    <select
                      value={brandId}
                      onChange={(e) =>
                        setBrandId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                    >
                      <option value="">
                        No brand
                      </option>

                      {brands.map(
                        (brand) => (
                          <option
                            key={brand.id}
                            value={brand.id}
                          >
                            {brand.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </section>

              {/* Save */}

              <div className="flex gap-3">
                <Link
                  href="/admin/products"
                  className="flex-1 rounded-xl border border-blue-200 py-3 text-center text-sm font-bold text-blue-700 hover:border-orange-400"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70"
                >
                  {saving
                    ? 'Saving...'
                    : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}