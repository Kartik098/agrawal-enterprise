'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Shield,
} from 'lucide-react'

import { productsService } from '@/services/products'
import { cartService, wishlistService } from '@/services/cart'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/storefront/navbar'
import {
  ProductCard,
  Footer,
  formatCurrency,
} from '@/components/storefront-ui'
import { PageLoader, EmptyState } from '@/components/ui/states'

import type {
  Product,
  ProductSize,
  ProductColor,
} from '@/types/database'

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null | undefined>(
    undefined
  )

  const [related, setRelated] = useState<Product[]>([])

  const [selectedSize, setSelectedSize] =
    useState<ProductSize | null>(null)

  const [selectedColor, setSelectedColor] =
    useState<ProductColor | null>(null)

  const [selectedImageIdx, setSelectedImageIdx] = useState(0)

  const [qty, setQty] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  /*
   * ============================================================
   * GET IMAGES FOR A COLOR
   * ============================================================
   *
   * product_colors.color_id
   *          ↓
   *       colors.id
   *          ↑
   * product_images.color_id
   *
   * Rules:
   *
   * 1. If selected color has images:
   *      show ONLY those images.
   *
   * 2. If selected color has NO images:
   *      show only images where color_id IS NULL.
   *
   * 3. Never show images belonging to another color.
   */
  function getGalleryImages(
    currentProduct: Product,
    color: ProductColor | null
  ) {
    const activeImages = [...(currentProduct.product_images || [])]
      .filter((image) => image.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)

    /*
     * No selected color:
     * Only use generic images.
     */
    if (!color) {
      return activeImages.filter(
        (image) => image.color_id === null
      )
    }

    /*
     * Images specifically belonging to the selected color.
     */
    const colorImages = activeImages.filter(
      (image) => image.color_id === color.color_id
    )

    /*
     * Generic/fallback images.
     */
    const fallbackImages = activeImages.filter(
      (image) => image.color_id === null
    )

    /*
     * IMPORTANT:
     *
     * If color-specific images exist, NEVER mix them
     * with fallback images.
     *
     * Only use fallback when the selected color has
     * zero images.
     */
    return colorImages.length > 0
      ? colorImages
      : fallbackImages
  }

  /*
   * ============================================================
   * SET IMAGE INDEX
   * ============================================================
   *
   * When changing colors:
   *
   * 1. Get the images for that color.
   * 2. Find its primary image.
   * 3. If no primary image exists, use the first image.
   */
  function setInitialGalleryImage(
    currentProduct: Product,
    color: ProductColor | null
  ) {
    const galleryImages = getGalleryImages(
      currentProduct,
      color
    )

    if (galleryImages.length === 0) {
      setSelectedImageIdx(0)
      return
    }

    const primaryIndex = galleryImages.findIndex(
      (image) => image.is_primary
    )

    setSelectedImageIdx(
      primaryIndex >= 0 ? primaryIndex : 0
    )
  }

  /*
   * ============================================================
   * LOAD PRODUCT
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      const p = await productsService.getBySlug(slug)

      if (cancelled) return

      setProduct(p)

      if (!p) return

      /*
       * Select first active size.
       */
      const firstSize =
        p.product_sizes?.find(
          (size) => size.is_active
        ) ||
        p.product_sizes?.[0] ||
        null

      setSelectedSize(firstSize)

      /*
       * Select first color.
       */
      const firstColor =
        p.product_colors?.[0] || null

      setSelectedColor(firstColor)

      /*
       * Set initial gallery image.
       *
       * This also handles the fallback:
       *
       * selected color images
       *        ↓
       * if none
       *        ↓
       * color_id IS NULL
       */
      setInitialGalleryImage(
        p,
        firstColor
      )
    }

    loadProduct()

    return () => {
      cancelled = true
    }
  }, [slug])

  /*
   * ============================================================
   * LOAD RELATED PRODUCTS + WISHLIST
   * ============================================================
   */
  useEffect(() => {
    if (!product) return

    productsService
      .getByCategory(product.category_id, 5)
      .then((all) => {
        setRelated(
          all
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
        )
      })

    if (user) {
      wishlistService
        .isWishlisted(user.id, product.id)
        .then(setWishlisted)
    } else {
      setWishlisted(false)
    }
  }, [product, user])

  /*
   * ============================================================
   * CHANGE COLOR
   * ============================================================
   */
  function handleColorChange(
    color: ProductColor
  ) {
    setSelectedColor(color)

    /*
     * Reset gallery to the newly selected color.
     *
     * This prevents the previous color's image index
     * from being reused.
     */
    if (product) {
      setInitialGalleryImage(
        product,
        color
      )
    }
  }

  /*
   * ============================================================
   * ADD TO CART
   * ============================================================
   */
  async function handleAddToCart() {
    if (!user || !product || !selectedSize) return

    setCartLoading(true)

    try {
      await cartService.add(
        user.id,
        product.id,
        selectedSize.id,
        selectedColor?.id || null,
        qty
      )

      setAddedToCart(true)

      setTimeout(() => {
        setAddedToCart(false)
      }, 2000)
    } finally {
      setCartLoading(false)
    }
  }

  /*
   * ============================================================
   * TOGGLE WISHLIST
   * ============================================================
   */
  async function toggleWishlist() {
    if (!user || !product) return

    if (wishlisted) {
      await wishlistService.remove(
        user.id,
        product.id
      )

      setWishlisted(false)
    } else {
      await wishlistService.add(
        user.id,
        product.id
      )

      setWishlisted(true)
    }
  }

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */
  if (product === undefined) {
    return (
      <>
        <Navbar />
        <PageLoader label="Loading product..." />
      </>
    )
  }

  /*
   * ============================================================
   * PRODUCT NOT FOUND
   * ============================================================
   */
  if (!product) {
    return (
      <>
        <Navbar />

        <EmptyState
          icon="😕"
          title="Product not found"
          action={
            <Link
              href="/products"
              className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white"
            >
              Browse products
            </Link>
          }
        />
      </>
    )
  }

  /*
   * ============================================================
   * IMAGE GALLERY
   * ============================================================
   *
   * IMPORTANT:
   *
   * selectedColor.color_id is the ID from colors.id.
   *
   * product_images.color_id also references colors.id.
   *
   * Therefore:
   *
   * image.color_id === selectedColor.color_id
   *
   * NOT:
   *
   * image.color_id === selectedColor.id
   */
  const images = getGalleryImages(
    product,
    selectedColor
  )

  /*
   * Protect against an old image index after changing
   * colors or when images are removed.
   */
  const safeImageIdx =
    images.length > 0
      ? Math.min(
          selectedImageIdx,
          images.length - 1
        )
      : 0

  const currentImage =
    images[safeImageIdx]

  /*
   * ============================================================
   * PRICING
   * ============================================================
   */
  const price =
    selectedSize?.price ||
    productsService.getMinPrice(product)

  const mrp =
    selectedSize?.mrp ||
    productsService.getMinMrp(product)

  const discount =
    mrp > 0
      ? Math.round(
          (1 - price / mrp) * 100
        )
      : 0

  /*
   * ============================================================
   * STOCK
   * ============================================================
   */
  const stock =
    productsService.getTotalStock(product)

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />

      <div className="section-shell py-10">

        {/* =====================================================
            BREADCRUMB
            ===================================================== */}

        <nav className="flex items-center gap-2 text-sm text-blue-400">
          <Link
            href="/"
            className="hover:text-orange-500"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/products"
            className="hover:text-orange-500"
          >
            Products
          </Link>

          {product.category && (
            <>
              <span>/</span>

              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-orange-500"
              >
                {product.category.name}
              </Link>
            </>
          )}

          <span>/</span>

          <span className="line-clamp-1 font-semibold text-blue-700">
            {product.name}
          </span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">

          {/* ===================================================
              IMAGE GALLERY
              =================================================== */}

          <div className="grid gap-3 sm:grid-cols-[80px_1fr]">

            {/* THUMBNAILS */}

            {images.length > 1 && (
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-y-auto">

                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() =>
                      setSelectedImageIdx(i)
                    }
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                      i === safeImageIdx
                        ? 'border-orange-500'
                        : 'border-blue-100 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`View ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}

              </div>
            )}

            {/* MAIN IMAGE */}

            <div className="order-1 flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl bg-blue-50 sm:order-2">

              {currentImage ? (
                <img
                  src={currentImage.image_url}
                  alt={product.name}
                  className="h-full w-full max-h-[520px] object-contain"
                />
              ) : (
                <span className="text-[120px] font-black text-blue-200">
                  AG
                </span>
              )}

            </div>
          </div>

          {/* ===================================================
              PRODUCT INFO
              =================================================== */}

          <div className="self-start py-4">

            <div className="flex items-start justify-between">

              <div>

                {product.category && (
                  <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                    {product.category.name}

                    {product.subcategory
                      ? ` / ${product.subcategory.name}`
                      : ''}
                  </p>
                )}

                {product.brand && (
                  <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-600">
                    {product.brand.name}
                  </span>
                )}

              </div>

              <button
                type="button"
                onClick={toggleWishlist}
                aria-label="Wishlist"
                className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                  wishlisted
                    ? 'border-orange-400 bg-orange-50 text-orange-500'
                    : 'border-blue-200 text-blue-500 hover:border-orange-400 hover:text-orange-500'
                }`}
              >
                <Heart
                  size={18}
                  fill={
                    wishlisted
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </button>

            </div>

            {/* PRODUCT NAME */}

            <h1 className="mt-3 text-4xl font-black text-blue-950">
              {product.name}
            </h1>

            {product.model_no && (
              <p className="mt-1 text-sm text-blue-400">
                Model: {product.model_no}
              </p>
            )}

            {product.sku && (
              <p className="text-sm text-blue-400">
                SKU: {product.sku}
              </p>
            )}

            {/* RATING */}

            <div className="mt-4 flex items-center gap-2 text-orange-400">
              {[1, 2, 3, 4, 5].map(
                (i) => (
                  <Star
                    key={i}
                    size={15}
                    fill="currentColor"
                  />
                )
              )}

              <span className="ml-1 text-sm font-bold text-blue-700">
                4.8 · 126 reviews
              </span>
            </div>

            {/* PRICE */}

            <div className="mt-5 flex items-end gap-3">

              <span className="text-3xl font-black text-blue-950">
                {price > 0
                  ? formatCurrency(price)
                  : 'Price on request'}
              </span>

              {discount > 0 && (
                <>
                  <span className="text-lg text-blue-300 line-through">
                    {formatCurrency(mrp)}
                  </span>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                    {discount}% off
                  </span>
                </>
              )}

            </div>

            {/* DESCRIPTION */}

            {product.description && (
              <p className="mt-5 leading-7 text-blue-600">
                {product.description}
              </p>
            )}

            {/* =================================================
                COLORS
                ================================================= */}

            {(product.product_colors?.length || 0) > 0 && (
              <div className="mt-6 border-t border-blue-100 pt-5">

                <p className="mb-3 text-sm font-bold text-blue-900">
                  Color
                </p>

                <div className="flex flex-wrap gap-2">

                  {product.product_colors!.map(
                    (pc) => (
                      <button
                        key={pc.id}
                        type="button"
                        onClick={() =>
                          handleColorChange(pc)
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                          selectedColor?.id === pc.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-blue-200 text-blue-700 hover:border-orange-400'
                        }`}
                      >

                        {pc.color?.hex_code && (
                          <span
                            className="mr-1.5 inline-block h-3 w-3 rounded-full border border-blue-200"
                            style={{
                              background:
                                pc.color.hex_code,
                            }}
                          />
                        )}

                        {pc.color?.name}

                      </button>
                    )
                  )}

                </div>
              </div>
            )}

            {/* =================================================
                SIZES
                ================================================= */}

            {(product.product_sizes?.length || 0) > 0 && (
              <div className="mt-5">

                <p className="mb-3 text-sm font-bold text-blue-900">
                  Size
                </p>

                <div className="flex flex-wrap gap-2">

                  {product.product_sizes!
                    .filter(
                      (s) => s.is_active
                    )
                    .map((ps) => (
                      <button
                        key={ps.id}
                        type="button"
                        onClick={() =>
                          setSelectedSize(ps)
                        }
                        className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                          selectedSize?.id === ps.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-blue-200 text-blue-700 hover:border-orange-400'
                        }`}
                      >
                        {ps.size?.name}
                      </button>
                    ))}

                </div>
              </div>
            )}

            {/* =================================================
                QUANTITY
                ================================================= */}

            {stock > 0 && (
              <div className="mt-5 flex items-center gap-3">

                <div className="flex items-center rounded-xl border border-blue-200">

                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) =>
                        Math.max(1, q - 1)
                      )
                    }
                    className="px-4 py-3 text-lg font-bold text-blue-700 hover:text-orange-500"
                  >
                    −
                  </button>

                  <span className="min-w-[2rem] text-center text-sm font-bold text-blue-900">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) =>
                        Math.min(
                          stock,
                          q + 1
                        )
                      )
                    }
                    className="px-4 py-3 text-lg font-bold text-blue-700 hover:text-orange-500"
                  >
                    +
                  </button>

                </div>

                <span className="text-sm text-blue-400">
                  {stock} in stock
                </span>

              </div>
            )}

            {/* =================================================
                ADD TO CART
                ================================================= */}

            <div className="mt-5">

              {stock <= 0 &&
              product.product_sizes?.length ? (

                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-blue-200 py-4 font-bold text-blue-400"
                >
                  Out of Stock
                </button>

              ) : !user ? (

                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg hover:bg-orange-600"
                >
                  <ShoppingBag size={18} />
                  Log in to add to bag
                </Link>

              ) : (

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    cartLoading ||
                    !selectedSize
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-lg transition ${
                    addedToCart
                      ? 'bg-green-500 shadow-green-200'
                      : 'bg-orange-500 shadow-orange-200 hover:bg-orange-600'
                  } disabled:opacity-60`}
                >

                  {cartLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : addedToCart ? (
                    <>
                      <Check size={18} />
                      Added to bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Add to bag
                    </>
                  )}

                </button>

              )}

            </div>

            {/* =================================================
                DELIVERY INFO
                ================================================= */}

            <div className="mt-7 grid gap-3 rounded-2xl bg-blue-50 p-5 text-sm text-blue-700">

              <p className="flex items-center gap-3 font-bold">
                <Truck
                  size={18}
                  className="text-orange-500"
                />
                Free delivery
              </p>

              <p className="flex items-center gap-3 font-bold">
                <RotateCcw
                  size={18}
                  className="text-orange-500"
                />
                Easy 7-day returns
              </p>

              <p className="flex items-center gap-3 font-bold">
                <Shield
                  size={18}
                  className="text-orange-500"
                />
                100% authentic products
              </p>

            </div>

          </div>
        </div>

        {/* =====================================================
            RELATED PRODUCTS
            ===================================================== */}

        {related.length > 0 && (
          <section className="mt-20">

            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
              You may also like
            </p>

            <h2 className="mt-2 text-2xl font-black text-blue-900">
              More from {product.category?.name}
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">

              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                />
              ))}

            </div>

          </section>
        )}

      </div>

      <Footer />
    </main>
  )
}