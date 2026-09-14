'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

import { AdminNav, AdminTopbar } from '@/app/admin/page'

import { productsService } from '@/services/products'

import { inventoryService } from '@/services/inventory'

import {
  categoriesService,
  subcategoriesService,
} from '@/services/categories'

import { brandsService } from '@/services/brands'

import { sizesService, colorsService } from '@/services/sizes-colors'

import { ImageUploader } from '@/components/ui/image-uploader'

import { Toast } from '@/components/ui/states'

import type {
  Category,
  Subcategory,
  Brand,
  Size,
  Color,
} from '@/types/database'

interface SizeEntry {
  sizeId: string
  price: string
  mrp: string
  sku: string
}

interface ImageEntry {
  url: string
  file: File
  isPrimary: boolean
  sortOrder: number
  colorId?: string | null
}

export default function NewProductPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [colors, setColors] = useState<Color[]>([])

  const [saving, setSaving] = useState(false)

  const [toast, setToast] = useState<{
    msg: string
    type: 'success' | 'error'
  } | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [modelNo, setModelNo] = useState('')
  const [description, setDescription] = useState('')

  const [gender, setGender] = useState<
    'Men' | 'Women' | 'Kids' | 'Unisex'
  >('Unisex')

  // UUID IDs are strings
  const [categoryId, setCategoryId] = useState<string>('')
  const [subcategoryId, setSubcategoryId] = useState<string>('')
  const [brandId, setBrandId] = useState<string>('')

  const [isActive, setIsActive] = useState(true)

  const [sizeEntries, setSizeEntries] = useState<SizeEntry[]>([
    {
      sizeId: '',
      price: '',
      mrp: '',
      sku: '',
    },
  ])

  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])

  /*
   * General product images have colorId = null.
   *
   * Color-specific images have colorId = the selected
   * master color ID.
   */
  const [images, setImages] = useState<ImageEntry[]>([])

  useEffect(() => {
    Promise.all([
      categoriesService.getAll(),
      brandsService.getAll(),
      sizesService.getAll(),
      colorsService.getAll(),
    ]).then(([cats, brs, szs, cls]) => {
      setCategories(cats)
      setBrands(brs)
      setSizes(szs)
      setColors(cls)
    })
  }, [])

  useEffect(() => {
    if (categoryId) {
      subcategoriesService
        .getByCategory(categoryId)
        .then(setSubcategories)
    } else {
      setSubcategories([])
    }
  }, [categoryId])

  useEffect(() => {
    setSlug(
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    )
  }, [name])

  function addSizeRow() {
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

  function removeSizeRow(index: number) {
    setSizeEntries((entries) =>
      entries.filter((_, idx) => idx !== index)
    )
  }

  function updateSizeRow(
    index: number,
    key: keyof SizeEntry,
    value: string
  ) {
    setSizeEntries((entries) =>
      entries.map((row, idx) =>
        idx === index
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    )
  }

  function toggleColor(colorId: string) {
    setSelectedColorIds((ids) => {
      const isSelected = ids.includes(colorId)

      if (isSelected) {
        /*
         * Remove images assigned to this color when the color
         * itself is removed.
         */
        setImages((currentImages) =>
          currentImages.filter(
            (image) => image.colorId !== colorId
          )
        )

        return ids.filter((id) => id !== colorId)
      }

      return [...ids, colorId]
    })
  }

  function getColorImages(colorId: string) {
    return images.filter((image) => image.colorId === colorId)
  }

  function getGeneralImages() {
    return images.filter(
      (image) =>
        image.colorId === null ||
        image.colorId === undefined
    )
  }

  function updateColorImages(
    colorId: string,
    uploaderImages: Array<{
      url: string
      file?: File
      isPrimary: boolean
      sortOrder: number
      isExisting?: boolean
    }>
  ) {
    const existingImages = images.filter(
      (image) => image.colorId !== colorId
    )

    const colorImages: ImageEntry[] = uploaderImages
      .filter((image) => !!image.file)
      .map((image, index) => ({
        url: image.url,
        file: image.file!,
        isPrimary: image.isPrimary,
        sortOrder: index,
        colorId,
      }))

    setImages([
      ...existingImages,
      ...colorImages,
    ])
  }

  function updateGeneralImages(
    uploaderImages: Array<{
      url: string
      file?: File
      isPrimary: boolean
      sortOrder: number
      isExisting?: boolean
    }>
  ) {
    const colorImages = images.filter(
      (image) =>
        image.colorId !== null &&
        image.colorId !== undefined
    )

    const generalImages: ImageEntry[] = uploaderImages
      .filter((image) => !!image.file)
      .map((image, index) => ({
        url: image.url,
        file: image.file!,
        isPrimary: image.isPrimary,
        sortOrder: index,
        colorId: null,
      }))

    setImages([
      ...colorImages,
      ...generalImages,
    ])
  }

  async function handleSave() {
    // 1. Basic required fields
    if (!name.trim() || !categoryId) {
      setToast({
        msg: 'Name and category are required',
        type: 'error',
      })
      return
    }
    console.log('IMAGE COLOR IDS:', images.map((image) => ({
  colorId: image.colorId,
  url: image.url,
})))
    // 2. Subcategory is mandatory
    if (!subcategoryId) {
      setToast({
        msg: 'Subcategory is required',
        type: 'error',
      })
      return
    }

    // 3. At least one size is mandatory
    if (!sizeEntries.length) {
      setToast({
        msg: 'At least one size is required',
        type: 'error',
      })
      return
    }

    // 4. Validate every size
    const invalidSize = sizeEntries.find(
      (size) =>
        !size.sizeId ||
        !size.price.trim()
    )

    if (invalidSize) {
      setToast({
        msg: 'Please select a size and enter its price for every size',
        type: 'error',
      })
      return
    }

    // 5. Prevent duplicate sizes
    const sizeIds = sizeEntries.map(
      (size) => size.sizeId
    )

    const uniqueSizeIds = new Set(sizeIds)

    if (uniqueSizeIds.size !== sizeIds.length) {
      setToast({
        msg: 'Each size can only be selected once',
        type: 'error',
      })
      return
    }

    // 6. At least one image is mandatory
    if (!images.length) {
      setToast({
        msg: 'At least one product image is required',
        type: 'error',
      })
      return
    }

    // 7. Primary image is mandatory
    if (!images.some((image) => image.isPrimary)) {
      setToast({
        msg: 'Please select a primary product image',
        type: 'error',
      })
      return
    }

    setSaving(true)

    try {
      // ---------------------------------------------------------
      // 8. Create product
      // ---------------------------------------------------------
      const product = await productsService.create({
        name,
        slug,
        sku: sku || null,
        model_no: modelNo || null,
        description: description || null,
        gender,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        brand_id: brandId || null,
        is_active: isActive,
      })

      // ---------------------------------------------------------
      // 9. Create product sizes
      // ---------------------------------------------------------
      const validSizes = sizeEntries.filter(
        (size) =>
          size.sizeId &&
          size.price.trim()
      )

      const productSizes =
        await productsService.upsertSizes(
          product.id,
          validSizes.map((size) => ({
            product_id: product.id,
            size_id: size.sizeId,
            price: parseFloat(size.price),
            mrp: parseFloat(size.mrp || size.price),
            sku: size.sku || null,
            is_active: true,
          }))
        )

      // ---------------------------------------------------------
      // 10. Create product colors FIRST
      //
      // inventory.product_color_id points to the
      // product_colors row, NOT directly to colors.id.
      //
      // upsertColors returns ProductColor[] containing:
      // {
      //   id,
      //   product_id,
      //   color_id
      // }
      // ---------------------------------------------------------
      let productColors: Array<{
        id: string
        product_id: string
        color_id: string
      }> = []

      if (selectedColorIds.length) {
        productColors =
          await productsService.upsertColors(
            product.id,
            selectedColorIds
          )
      }

      // ---------------------------------------------------------
      // 11. Create inventory variants
      //
      // No colors:
      //   size -> inventory
      //
      // With colors:
      //   size × color -> inventory
      // ---------------------------------------------------------
      const inventoryRows: Array<{
        product_id: string
        product_size_id: string
        product_color_id: string | null
        quantity: number
        reserved_quantity: number
        reorder_level: number
        warehouse_location: string | null
      }> = []

      if (productColors.length) {
        for (const productSize of productSizes) {
          for (const productColor of productColors) {
            inventoryRows.push({
              product_id: product.id,
              product_size_id: productSize.id,
              product_color_id: productColor.id,
              quantity: 5,
              reserved_quantity: 0,
              reorder_level: 10,
              warehouse_location: null,
            })
          }
        }
      } else {
        for (const productSize of productSizes) {
          inventoryRows.push({
            product_id: product.id,
            product_size_id: productSize.id,
            product_color_id: null,
            quantity: 0,
            reserved_quantity: 0,
            reorder_level: 10,
            warehouse_location: null,
          })
        }
      }

      if (inventoryRows.length) {
        await Promise.all(
          inventoryRows.map((inventory) =>
            inventoryService.insert(inventory)
          )
        )
      }

      // ---------------------------------------------------------
      // 12. Upload images
      //
      // ImageEntry.colorId contains the master colors.id.
      //
      // Convert master colors.id -> product_colors.id
      // before storing the product image.
      // ---------------------------------------------------------
      const productColorMap = new Map<
        string,
        string
      >()

      for (const productColor of productColors) {
        productColorMap.set(
          productColor.color_id,
          productColor.id
        )
      }
console.log('IMAGE COLOR IDS:', images.map((image) => ({
  colorId: image.colorId,
  url: image.url,
})))
      for (const image of images) {
        console.log('IMAGE DEBUG', {
  imageColorId: image.colorId,
  selectedColorIds,
  productColors,
})
  await productsService.uploadImage(
    product.id,
    image.file,
    {
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
      colorId:
        image.colorId !== null &&
        image.colorId !== undefined
          ? image.colorId
          : null,
    }
  )
}

      setToast({
        msg: 'Product created!',
        type: 'success',
      })

      setTimeout(() => {
        router.push('/admin/products')
      }, 1000)
    } catch (err: any) {
      setToast({
        msg:
          err?.message ||
          'Failed to create product',
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

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
        <AdminTopbar onMenuClick={() => {}} />

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
            Add New Product
          </h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main form */}
            <div className="space-y-6">
              {/* Basic information */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-black text-blue-950">
                  Basic information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">
                      Product name *
                    </label>

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="e.g. Classic Oxford Shirt"
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
                        placeholder="AE-001"
                        className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">
                        Model number
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
                        ].map((value) => (
                          <option
                            key={value}
                            value={value}
                          >
                            {value}
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

              {/* Sizes & Pricing */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-black text-blue-950">
                  Sizes & Pricing
                </h2>

                <div className="space-y-3">
                  {sizeEntries.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-3"
                    >
                      <div>
                        {i === 0 && (
                          <label className="mb-1 block text-xs font-bold text-blue-500">
                            SIZE
                          </label>
                        )}

                        <select
                          value={row.sizeId}
                          onChange={(e) =>
                            updateSizeRow(
                              i,
                              'sizeId',
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                        >
                          <option value="">
                            Select
                          </option>

                          {sizes.map((size) => (
                            <option
                              key={size.id}
                              value={size.id}
                            >
                              {size.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        {i === 0 && (
                          <label className="mb-1 block text-xs font-bold text-blue-500">
                            PRICE (₹)
                          </label>
                        )}

                        <input
                          value={row.price}
                          onChange={(e) =>
                            updateSizeRow(
                              i,
                              'price',
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                        />
                      </div>

                      <div>
                        {i === 0 && (
                          <label className="mb-1 block text-xs font-bold text-blue-500">
                            MRP (₹)
                          </label>
                        )}

                        <input
                          value={row.mrp}
                          onChange={(e) =>
                            updateSizeRow(
                              i,
                              'mrp',
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                        />
                      </div>

                      <div>
                        {i === 0 && (
                          <label className="mb-1 block text-xs font-bold text-blue-500">
                            SKU
                          </label>
                        )}

                        <input
                          value={row.sku}
                          onChange={(e) =>
                            updateSizeRow(
                              i,
                              'sku',
                              e.target.value
                            )
                          }
                          placeholder="Optional"
                          className="w-full rounded-xl border border-blue-200 px-3 py-2.5 text-sm focus:border-orange-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeSizeRow(i)
                        }
                        className="mb-0 rounded-lg p-2.5 text-blue-300 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSizeRow}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-500 hover:border-orange-400 hover:text-orange-500"
                  >
                    <Plus size={15} />
                    Add size variant
                  </button>
                </div>
              </section>

              {/* Colors */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-2 font-black text-blue-950">
                  Colors
                </h2>

                <p className="mb-5 text-sm text-blue-400">
                  Select the colors available for this
                  product. Each selected color will create
                  inventory variants for every selected size.
                </p>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const selected =
                      selectedColorIds.includes(
                        color.id
                      )

                    return (
                      <button
                        type="button"
                        key={color.id}
                        onClick={() =>
                          toggleColor(color.id)
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                          selected
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-blue-200 text-blue-700 hover:border-orange-300'
                        }`}
                      >
                        {color.hex_code && (
                          <span
                            className="h-4 w-4 rounded-full border border-blue-200"
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

              {/* General Images */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-2 font-black text-blue-950">
                  General product images
                </h2>

                <p className="mb-4 text-sm text-blue-400">
                  These images are not tied to a specific
                  color and can be used as the main product
                  images.
                </p>

                <ImageUploader
                  images={getGeneralImages().map(
                    (image) => ({
                      url: image.url,
                      file: image.file,
                      isPrimary: image.isPrimary,
                      sortOrder: image.sortOrder,
                      isExisting: false,
                    })
                  )}
                  onChange={(uploaderImages) =>
                    updateGeneralImages(
                      uploaderImages
                    )
                  }
                />
              </section>

              {/* Color-specific Images */}
              {selectedColorIds.length > 0 && (
                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h2 className="font-black text-blue-950">
                      Images by color
                    </h2>

                    <p className="mt-1 text-sm text-blue-400">
                      Upload images specifically for each
                      color. These images will be associated
                      with that color variant.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {selectedColorIds.map((colorId) => {
                      const color = colors.find(
                        (item) => item.id === colorId
                      )

                      if (!color) return null

                      const colorImages =
                        getColorImages(colorId)

                      return (
                        <div
                          key={colorId}
                          className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5"
                        >
                          <div className="mb-4 flex items-center gap-3">
                            {color.hex_code && (
                              <span
                                className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                                style={{
                                  background:
                                    color.hex_code,
                                }}
                              />
                            )}

                            <div>
                              <h3 className="font-black text-blue-950">
                                {color.name}
                              </h3>

                              <p className="text-xs text-blue-400">
                                {colorImages.length}{' '}
                                {colorImages.length === 1
                                  ? 'image'
                                  : 'images'}{' '}
                                assigned
                              </p>
                            </div>
                          </div>

                          <ImageUploader
                            images={colorImages.map(
                              (image) => ({
                                url: image.url,
                                file: image.file,
                                isPrimary:
                                  image.isPrimary,
                                sortOrder:
                                  image.sortOrder,
                                isExisting: false,
                              })
                            )}
                            onChange={(
                              uploaderImages
                            ) =>
                              updateColorImages(
                                colorId,
                                uploaderImages
                              )
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
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
                    Active (visible on storefront)
                  </span>

                  <div
                    onClick={() =>
                      setIsActive(!isActive)
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      isActive
                        ? 'bg-orange-500'
                        : 'bg-blue-200'
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        isActive
                          ? 'left-6'
                          : 'left-1'
                      }`}
                    />
                  </div>
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

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
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
                              key={subcategory.id}
                              value={subcategory.id}
                            >
                              {subcategory.name}
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

                      {brands.map((brand) => (
                        <option
                          key={brand.id}
                          value={brand.id}
                        >
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Actions */}
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
                    : 'Create product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}