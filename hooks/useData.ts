'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { productsService, type ProductFilters } from '@/services/products'
import { categoriesService, subcategoriesService } from '@/services/categories'
import { brandsService } from '@/services/brands'
import { inventoryService } from '@/services/inventory'
import { cartService, wishlistService } from '@/services/cart'
import { sizesService, colorsService } from '@/services/sizes-colors'
import type { Product, Category, Subcategory, Brand, Inventory, Cart, Wishlist, Size, Color } from '@/types/database'

// ─── Generic hook ─────────────────────────────────────────────────────────────

function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  const run = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const result = await fn()
      if (mounted.current) setData(result)
    } catch (e: any) {
      if (mounted.current) setError(e.message || 'An error occurred')
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, deps)

  useEffect(() => { mounted.current = true; run(); return () => { mounted.current = false } }, [run])
  return { data, loading, error, refetch: run }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts(filters: ProductFilters = {}) {
  const key = JSON.stringify(filters)
  const [result, setResult] = useState<{ data: Product[]; count: number }>({ data: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    productsService.getAll(filters)
      .then(setResult)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [key])

  return { products: result.data, total: result.count, loading, error }
}

export function useFeaturedProducts(limit = 8) {
  return useAsync(() => productsService.getFeatured(limit), [limit])
}

export function useProduct(slug: string) {
  return useAsync(() => productsService.getBySlug(slug), [slug])
}

export function useProductById(id: number | null) {
  return useAsync(() => id ? productsService.getById(id) : Promise.resolve(null), [id])
}

export function useCategoryProducts(categoryId: number | null) {
  return useAsync(() => categoryId ? productsService.getByCategory(categoryId) : Promise.resolve([]), [categoryId])
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useAsync(() => categoriesService.getActive())
}

export function useAllCategories() {
  return useAsync(() => categoriesService.getAll())
}

export function useSubcategories(categoryId?: number) {
  return useAsync(
    () => categoryId ? subcategoriesService.getByCategory(categoryId) : subcategoriesService.getAll(),
    [categoryId]
  )
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export function useBrands() {
  return useAsync(() => brandsService.getActive())
}

export function useAllBrands() {
  return useAsync(() => brandsService.getAll())
}

// ─── Sizes & Colors ───────────────────────────────────────────────────────────

export function useSizes() {
  return useAsync(() => sizesService.getAll())
}

export function useColors() {
  return useAsync(() => colorsService.getAll())
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useInventory() {
  return useAsync(() => inventoryService.getAll())
}

export function useProductInventory(productId: number | null) {
  return useAsync(() => productId ? inventoryService.getByProduct(productId) : Promise.resolve([]), [productId])
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useCart(userId: string | null) {
  const { data, loading, error, refetch } = useAsync(
    () => userId ? cartService.get(userId) : Promise.resolve([]),
    [userId]
  )
  return { cart: data || [], loading, error, refetch }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function useWishlist(userId: string | null) {
  const { data, loading, error, refetch } = useAsync(
    () => userId ? wishlistService.get(userId) : Promise.resolve([]),
    [userId]
  )
  return { wishlist: data || [], loading, error, refetch }
}
