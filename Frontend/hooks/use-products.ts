"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "@/lib/api-client"
import { useCategories } from "@/hooks/use-categories"

export interface ProductVariant {
  id: string
  name: string
  price: number
  sku?: string
  storage?: string
  color?: string
  images?: string[]
  stock?: number
}

export interface PricingRule {
  quantity: number
  price: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  basePrice: number
  category: string
  brand: string
  image?: string
  inStock: boolean
  rating: number
  variants?: ProductVariant[]
  pricingRules?: PricingRule[]
}

interface ProductsState {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Omit<Product, "id">) => void
  deleteProduct: (id: string) => void
}

// Admin hook - products should be fetched from backend API
export const useProducts = create<ProductsState>()(
  persist(
    (set) => ({
      products: [], // No initial products - fetch from API instead
      addProduct: async (product, token?: string) => {
        // Try to create on backend first
        if (!token) {
          // Fallback: local-only add if no token
          set((state) => ({ products: [...state.products, { ...product, id: `product-${Date.now()}` }] }))
          try {
            localStorage.setItem('products_updated_at', String(Date.now()))
          } catch (e) {}
          return
        }
        
        try {
          const res = await apiClient.createProduct(token, product)
          if (res && res.error) {
            return res
          }
          if (!res.error && res.data) {
            const created = res.data

            // If frontend provided variants, create them on the backend now
            if (Array.isArray(product.variants) && product.variants.length > 0) {
              for (const v of product.variants) {
                try {
                  // Build a safe variant id if frontend used temporary ids
                  const variantId = (v.id && !String(v.id).startsWith('variant-')) ? String(v.id) : `${String(created.id)}-${String(v.storage || 'v')}-${String(v.color || Date.now())}`.replace(/\s+/g, '-').toLowerCase()
                  const payload: any = {
                    id: variantId,
                    product: String(created.id ?? created.pk ?? created.id),
                    storage: v.storage ?? '',
                    color: v.color ?? '',
                    price: Number(v.price ?? 0),
                    stock: Number(v.stock ?? 0),
                    images: Array.isArray(v.images) ? v.images : [],
                    sku: v.sku ?? variantId,
                  }
                  await apiClient.createVariant(token, payload)
                } catch (err) {
                  // ignore per-variant errors but continue
                  console.warn('Failed to create variant for product', err)
                }
              }
            }

            const normalized = {
              id: String(created.id ?? created.pk ?? created.sku ?? created.name),
              name: created.name ?? product.name,
              description: created.description ?? product.description,
              price: Number(created.price ?? created.basePrice ?? product.price ?? 0),
              basePrice: Number(created.price ?? created.basePrice ?? product.basePrice ?? 0),
              category: created.category ?? product.category,
              brand: created.brand ?? product.brand,
              image: created.image ?? product.image,
              inStock: typeof created.in_stock === 'boolean' ? created.in_stock : (created.total_stock ?? 0) > 0,
              rating: Number(created.rating ?? 0),
              variants: Array.isArray(created.variants)
                ? created.variants.map((v: any) => ({ id: String(v.id ?? v.sku ?? v.name), name: v.name ?? '', price: Number(v.price ?? 0), stock: Number(v.stock ?? 0), images: Array.isArray(v.images) ? v.images : [] }))
                : (product.variants ?? []),
            }
            set((state) => ({ products: [...state.products, normalized] }))
            // notify other tabs/pages that products changed
            try {
              localStorage.setItem('products_updated_at', String(Date.now()))
            } catch (e) {
              // ignore
            }
            return res
          }
        } catch (e) {
          // ignore and fallback to local
        }

        // Fallback: local-only add
        set((state) => ({ products: [...state.products, { ...product, id: `product-${Date.now()}` }] }))
        try {
          localStorage.setItem('products_updated_at', String(Date.now()))
        } catch (e) {
          // ignore
        }
        return { data: null, error: 'local-fallback', status: 0 }
      },

      updateProduct: async (id, product, token?: string) => {
        if (!token) {
          // Fallback: local-only update
          set((state) => ({ products: state.products.map((p) => (p.id === id ? { ...product, id } : p)) }))
          try {
            localStorage.setItem('products_updated_at', String(Date.now()))
          } catch (e) {}
          return
        }
        
        try {
          const res = await apiClient.updateProduct(token, id, product)
          if (res && res.error) {
            return res
          }
          if (!res.error) {
            const updated = res.data ?? product

            // If variants were provided, attempt to create or update them
            if (Array.isArray(product.variants) && product.variants.length > 0) {
              for (const v of product.variants) {
                try {
                  // If variant id looks like a temporary frontend id, create it; otherwise try update
                  if (String(v.id).startsWith('variant-')) {
                    const variantId = `${String(id)}-${String(v.storage || 'v')}-${String(v.color || Date.now())}`.replace(/\s+/g, '-').toLowerCase()
                    const payload: any = {
                      id: variantId,
                      product: String(id),
                      storage: v.storage ?? '',
                      color: v.color ?? '',
                      price: Number(v.price ?? 0),
                      stock: Number(v.stock ?? 0),
                      images: Array.isArray(v.images) ? v.images : [],
                      sku: v.sku ?? variantId,
                    }
                    await apiClient.createVariant(token, payload)
                  } else {
                    const payload: any = {
                      storage: v.storage ?? '',
                      color: v.color ?? '',
                      price: Number(v.price ?? 0),
                      stock: Number(v.stock ?? 0),
                      images: Array.isArray(v.images) ? v.images : [],
                    }
                    await apiClient.updateVariant(token, String(v.id), payload)
                  }
                } catch (err) {
                  console.warn('Failed to sync variant during product update', err)
                }
              }
            }

            set((state) => ({ products: state.products.map((p) => (p.id === id ? { ...updated, id } : p)) }))
            try {
              localStorage.setItem('products_updated_at', String(Date.now()))
            } catch (e) {}
            return res
          }
        } catch (e) {
          // ignore and fallback
        }
        set((state) => ({ products: state.products.map((p) => (p.id === id ? { ...product, id } : p)) }))
        try {
          localStorage.setItem('products_updated_at', String(Date.now()))
        } catch (e) {}
        return { data: null, error: 'local-fallback', status: 0 }
      },

      deleteProduct: async (id, token?: string) => {
        if (!token) {
          // Fallback: local-only delete
          set((state) => ({ products: state.products.filter((p) => p.id !== id) }))
          try {
            localStorage.setItem('products_updated_at', String(Date.now()))
          } catch (e) {}
          return
        }
        
        try {
          const res = await apiClient.deleteProduct(token, id)
          if (!res.error) {
            set((state) => ({ products: state.products.filter((p) => p.id !== id) }))
            try {
              localStorage.setItem('products_updated_at', String(Date.now()))
            } catch (e) {}
            return
          }
        } catch (e) {
          // ignore and fallback
        }
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }))
        try {
          localStorage.setItem('products_updated_at', String(Date.now()))
        } catch (e) {}
      },
    }),
    {
      name: "products-storage",
    },
  ),
)

// Fetch products from backend once on module load so admin pages have dynamic data
;(async () => {
  try {
    const res = await apiClient.getProducts()
    if (res && !res.error && Array.isArray(res.data)) {
      const remoteProducts = (res.data as any[]).map((p) => ({
        id: String(p.id ?? p.pk ?? p.sku ?? p.slug ?? p.name),
        name: p.name ?? p.title ?? "",
        description: p.description ?? "",
        price: Number(p.price ?? p.base_price ?? 0),
        basePrice: Number(p.price ?? p.base_price ?? 0),
        category: p.category ?? (p.category_name ?? ""),
        brand: p.brand ?? (p.brand_name ?? ""),
        image: p.image ?? p.thumbnail ?? undefined,
        inStock: typeof p.in_stock === "boolean" ? p.in_stock : (p.total_stock ?? 0) > 0,
        rating: Number(p.rating ?? 0),
        variants: Array.isArray(p.variants)
          ? p.variants.map((v: any) => ({ id: String(v.id ?? v.sku ?? v.name), name: v.name ?? "", price: Number(v.effective_price ?? v.price ?? v.list_price ?? 0), stock: Number(v.stock ?? v.quantity ?? 0), images: Array.isArray(v.images) ? v.images : [], sku: v.sku ?? undefined, storage: v.storage ?? undefined, color: v.color ?? undefined }))
          : [],
      }))

      const set = (useProducts as any).setState
      set({ products: remoteProducts })
      // update category product counts if categories store exists
      try {
        const setCats = (useCategories as any).setState
        const existingCats = (useCategories as any).getState?.()?.categories ?? []
        if (Array.isArray(existingCats)) {
          const counts: Record<string, number> = {}
          remoteProducts.forEach((p: any) => {
            const cat = p.category || ""
            counts[cat] = (counts[cat] || 0) + 1
          })
          const updatedCats = existingCats.map((c: any) => ({ ...c, productCount: counts[c.name] || 0 }))
          setCats({ categories: updatedCats })
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore — fallback to local/persisted product store
    // console.debug("Failed to fetch products:", e)
  }
})()

// Client-side: poll for product changes and listen for cross-tab updates
if (typeof window !== 'undefined') {
  const pollProducts = async () => {
    try {
      const res = await apiClient.getProducts()
      if (res && !res.error && (Array.isArray(res.data) || (res.data && (res.data.results || res.data.value)))) {
        const productsData = Array.isArray(res.data) ? res.data : (res.data.results || res.data.value || [])
        const remoteProducts = productsData.map((p: any) => ({
          id: String(p.id ?? p.pk ?? p.sku ?? p.slug ?? p.name),
          name: p.name ?? p.title ?? "",
          description: p.description ?? "",
          price: Number(p.price ?? p.base_price ?? 0),
          basePrice: Number(p.price ?? p.base_price ?? 0),
          category: p.category ?? (p.category_name ?? ""),
          brand: p.brand ?? (p.brand_name ?? ""),
          image: p.image ?? p.thumbnail ?? undefined,
          inStock: typeof p.in_stock === "boolean" ? p.in_stock : (p.total_stock ?? 0) > 0,
          rating: Number(p.rating ?? 0),
          variants: Array.isArray(p.variants)
            ? p.variants.map((v: any) => ({ id: String(v.id ?? v.sku ?? v.name), name: v.name ?? "", price: Number(v.effective_price ?? v.price ?? v.list_price ?? 0), stock: Number(v.stock ?? v.quantity ?? 0), images: Array.isArray(v.images) ? v.images : [], sku: v.sku ?? undefined, storage: v.storage ?? undefined, color: v.color ?? undefined }))
            : [],
        }))

        const set = (useProducts as any).setState
        set({ products: remoteProducts })
      }
    } catch (e) {
      // ignore polling errors
    }
  }

  // initial poll and periodic refresh every 30s
  pollProducts()
  const _productsPoll = setInterval(pollProducts, 30000)

  // listen for cross-tab updates triggered by localStorage 'products_updated_at'
  window.addEventListener('storage', (e) => {
    if (e.key === 'products_updated_at') {
      pollProducts()
    }
  })

  // cleanup when module is hot-reloaded (best-effort)
  if ((module as any).hot) {
    ;(module as any).hot.dispose(() => clearInterval(_productsPoll))
  }
}
