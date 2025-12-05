"use client"

import { create } from "zustand"
import apiClient from "@/lib/api-client"

export interface StockItem {
  id: string // Stock record ID (backend pk)
  variantId: string // ProductVariant ID
  productId: string // Parent product ID
  productName: string
  variantName: string // e.g., "256GB Natural Titanium"
  sku: string
  category: string
  price: number
  images?: string[]
  thumbnail?: string
  totalStock: number
  available: number
  reserved: number
  lowStockThreshold: number
  lastRestocked: Date | string
}

interface StockManagementState {
  stockItems: StockItem[]
  loading: boolean
  fetchStock: (token?: string) => Promise<void>
  adjustStock: (stockId: string, adjustment: number, reason: string, token: string) => Promise<void>
  updateThreshold: (stockId: string, threshold: number, token: string) => Promise<void>
  getTotalStock: () => number
  getLowStockCount: () => number
  getOutOfStockCount: () => number
  syncWithProducts: () => void
}

export const useStockManagement = create<StockManagementState>()((set, get) => ({
  stockItems: [],
  loading: false,

  fetchStock: async (token?: string) => {
    set({ loading: true })
    try {
      const res = await apiClient.getStock(token)
      console.log('[Stock Management] API Response:', res)
      
      if (!res.error && res.data) {
        // Handle both array responses and paginated responses
        const dataArray = Array.isArray(res.data) ? res.data : ((res.data as any).results || (res.data as any).value || [])
        console.log('[Stock Management] Data array:', dataArray, 'Length:', dataArray.length)
        
        const normalized = dataArray.map((item: any) => {
          const variant = item.variant_details ?? item.variant ?? {}
          const productName = item.product_name ?? variant.product?.name ?? 'Unknown'
          const variantName = [variant.storage, variant.color].filter(Boolean).join(' ') || 'Default'
          const sku = variant.id ?? item.variant ?? ''
          const price = Number(variant.effective_price ?? variant.price ?? item.price ?? 0)
          const total = Number(item.quantity ?? (variant.stock ?? 0))
          const reserved = Number(item.reserved_quantity ?? 0)
          const available = Number(item.available_quantity ?? (total - reserved))
          const images = Array.isArray(variant.images) ? variant.images : (variant.images ? [variant.images] : [])
          const thumbnail = images.length > 0 ? images[0] : (variant.product?.image ?? '')

          return {
            id: String(item.id ?? item.pk ?? ''),
            variantId: String(variant.id ?? item.variant ?? ''),
            productId: String(variant.product?.id ?? ''),
            productName,
            variantName,
            sku,
            category: variant.product?.category ?? '',
            price,
            images,
            thumbnail,
            totalStock: total,
            available,
            reserved,
            lowStockThreshold: Number(item.low_stock_threshold ?? 10),
            lastRestocked: item.last_restocked_at ?? new Date().toISOString(),
          }
        })
        console.log('[Stock Management] Normalized items:', normalized.length, normalized)
        // Merge with products that have no Stock rows so admin/stock team
        // can see newly created products and import stock for them.
        try {
          const prodRes = await apiClient.getProducts()
          if (!prodRes.error && Array.isArray(prodRes.data)) {
            const allProducts = prodRes.data as any[]
            // collect existing variant ids
            const existingVariantIds = new Set(normalized.map((i) => String(i.variantId)))

            for (const p of allProducts) {
              const variants = Array.isArray(p.variants) ? p.variants : []
              if (variants.length === 0) {
                // create a synthetic entry for product without variants
                const synthId = `synthetic-${String(p.id ?? p.pk ?? p.slug ?? p.name)}`
                // only add if not already present by productId
                const existsByProduct = normalized.some((i) => String(i.productId) === String(p.id ?? p.pk ?? ''))
                if (!existsByProduct) {
                  normalized.push({
                    id: synthId,
                    variantId: synthId.replace('synthetic-', ''),
                    productId: String(p.id ?? p.pk ?? ''),
                    productName: p.name ?? p.title ?? '',
                    variantName: 'Default',
                    sku: p.sku ?? '',
                    category: p.category_name ?? p.category ?? '',
                    price: Number(p.base_price ?? p.price ?? 0),
                    images: Array.isArray(p.images) ? p.images : p.images ? [p.images] : [],
                    thumbnail: p.image ?? '',
                    totalStock: 0,
                    available: 0,
                    reserved: 0,
                    lowStockThreshold: 10,
                    lastRestocked: new Date().toISOString(),
                  })
                }
              } else {
                for (const v of variants) {
                  const vid = String(v.id ?? v.sku ?? '')
                  if (vid && !existingVariantIds.has(vid)) {
                    normalized.push({
                      id: `synthetic-${vid}`,
                      variantId: vid,
                      productId: String(p.id ?? p.pk ?? ''),
                      productName: p.name ?? p.title ?? '',
                      variantName: [v.storage, v.color].filter(Boolean).join(' ') || 'Default',
                      sku: v.sku ?? vid,
                      category: p.category_name ?? p.category ?? '',
                      price: Number(v.effective_price ?? v.price ?? p.base_price ?? 0),
                      images: Array.isArray(v.images) ? v.images : v.images ? [v.images] : [],
                      thumbnail: (Array.isArray(v.images) && v.images[0]) || p.image || '',
                      totalStock: 0,
                      available: 0,
                      reserved: 0,
                      lowStockThreshold: Number(v.low_stock_threshold ?? 10),
                      lastRestocked: new Date().toISOString(),
                    })
                  }
                }
              }
            }
          }
        } catch (e) {
          // if product merge fails, continue with stock-only result
          console.warn('[Stock Management] Failed to merge products:', e)
        }

        set({ stockItems: normalized, loading: false })
      } else {
        console.warn('[Stock Management] No data or error:', res.error)
        set({ loading: false })
      }
    } catch (e) {
      console.error('[Stock Management] Failed to fetch stock:', e)
      set({ loading: false })
    }
  },

  // Start a background poll when running in the browser so the admin view stays up-to-date
  // across tabs and after backend changes. Also listen for storage events triggered by
  // other tabs when products or stock are updated.
  // Note: use a best-effort approach; failures are logged but won't break the app.
  __startPolling: (() => {
    if (typeof window === 'undefined') return
    const poll = async () => {
      try {
        const token = localStorage.getItem('auth_token') || undefined
        await (get().fetchStock as any)(token)
      } catch (e) {
        // ignore
      }
    }

    poll()
    const iv = setInterval(poll, 30000)

    window.addEventListener('storage', (e) => {
      if (e.key === 'products_updated_at' || e.key === 'stock_updated_at') {
        poll()
      }
    })

    if ((module as any).hot) {
      ;(module as any).hot.dispose(() => clearInterval(iv))
    }
  })(),

  adjustStock: async (stockId: string, adjustment: number, reason: string, token: string) => {
    try {
      // Handle synthesized variant-level stock (no Stock row)
      if (typeof stockId === 'string' && stockId.startsWith('synthetic-')) {
        const variantId = stockId.replace('synthetic-', '')
        // find current item to compute new stock
        const item = get().stockItems.find((i) => i.variantId === variantId)
        const current = item ? Number(item.totalStock ?? 0) : 0
        // Clamp new stock to zero minimum to avoid negative values
        const newStock = Math.max(0, current + Number(adjustment))

        // Update ProductVariant directly
        const res = await apiClient.updateVariant(token, variantId, { stock: newStock })
        if (!res.error) {
          await get().fetchStock(token)
        }
        return
      }

      // Normal path: adjust an existing Stock record
      const res = await apiClient.adjustStock(token, stockId, adjustment, reason)
      if (!res.error && res.data) {
        // Re-fetch to get updated stock
        await get().fetchStock(token)
        try {
          localStorage.setItem('stock_updated_at', String(Date.now()))
        } catch (e) {}
      }
    } catch (e) {
      console.error('Failed to adjust stock:', e)
    }
  },

  updateThreshold: async (stockId: string, threshold: number, token: string) => {
    try {
      const res = await apiClient.updateStockThreshold(token, stockId, threshold)
      if (!res.error && res.data) {
        set((state) => ({
          stockItems: state.stockItems.map((item) =>
            item.id === stockId ? { ...item, lowStockThreshold: threshold } : item
          ),
        }))
        try {
          localStorage.setItem('stock_updated_at', String(Date.now()))
        } catch (e) {}
      }
    } catch (e) {
      console.error('Failed to update threshold:', e)
    }
  },

  // Apply a local optimistic adjustment so the UI updates immediately
  applyLocalAdjustment: (stockId: string, adjustment: number) => {
    set((state) => ({
      stockItems: state.stockItems.map((item) => {
        if (item.id === stockId) {
          const newTotal = Math.max(0, Number(item.totalStock ?? 0) + Number(adjustment))
          const newAvailable = Math.max(0, Number(item.available ?? 0) + Number(adjustment))
          return { ...item, totalStock: newTotal, available: newAvailable }
        }
        // handle synthetic ids where item.variantId may match
        if (stockId.startsWith('synthetic-') && item.variantId === stockId.replace('synthetic-', '')) {
          const newTotal = Math.max(0, Number(item.totalStock ?? 0) + Number(adjustment))
          const newAvailable = Math.max(0, Number(item.available ?? 0) + Number(adjustment))
          return { ...item, totalStock: newTotal, available: newAvailable }
        }
        return item
      }),
    }))
  },

  syncWithProducts: () => {
    // No-op for now; call fetchStock with token to sync
  },

  getTotalStock: () => {
    return get().stockItems.reduce((total, item) => total + item.totalStock, 0)
  },

  getLowStockCount: () => {
    return get().stockItems.filter((item) => item.totalStock > 0 && item.totalStock <= item.lowStockThreshold)
      .length
  },

  getOutOfStockCount: () => {
    return get().stockItems.filter((item) => item.totalStock === 0).length
  },
}))
