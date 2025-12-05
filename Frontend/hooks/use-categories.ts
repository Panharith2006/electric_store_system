"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "@/lib/api-client"

export interface Category {
  id: string
  name: string
  description: string
  productCount?: number
}

interface CategoriesState {
  categories: Category[]
  addCategory: (category: Omit<Category, "id" | "productCount">, token?: string) => Promise<void>
  updateCategory: (id: string, category: Omit<Category, "id" | "productCount">, token?: string) => Promise<void>
  deleteCategory: (id: string, token?: string) => Promise<void>
}

const initialCategories: Category[] = [
  { id: "1", name: "Smartphones", description: "Mobile phones and accessories", productCount: 0 },
  { id: "2", name: "Laptops", description: "Portable computers and notebooks", productCount: 0 },
  { id: "3", name: "Tablets", description: "Tablet devices and accessories", productCount: 0 },
  { id: "4", name: "Smartwatches", description: "Wearable smart devices", productCount: 0 },
  { id: "5", name: "Headphones", description: "Audio devices and headsets", productCount: 0 },
  { id: "6", name: "Cameras", description: "Digital cameras and photography equipment", productCount: 0 },
  { id: "7", name: "TVs", description: "Televisions and displays", productCount: 0 },
  { id: "8", name: "Gaming", description: "Gaming consoles and accessories", productCount: 0 },
]

export const useCategories = create<CategoriesState>()(
  persist(
    (set) => ({
      categories: initialCategories,
      addCategory: async (category, token?: string) => {
        if (!token) {
          set((state) => ({
            categories: [...state.categories, { ...category, id: `category-${Date.now()}`, productCount: 0 }],
          }))
          try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
          return
        }
        try {
          const res = await apiClient.createCategory(token, category)
          if (!res.error && res.data) {
            const c = res.data
            const created = { id: String(c.id ?? c.pk ?? c.name), name: c.name, description: c.description || '', productCount: c.product_count ?? 0 }
            set((state) => ({ categories: [...state.categories.filter(cc => cc.id !== created.id), created] }))
            try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
            return
          }
        } catch (e) {}
        // fallback local
        set((state) => ({ categories: [...state.categories, { ...category, id: `category-${Date.now()}`, productCount: 0 }] }))
        try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
      },

      updateCategory: async (id, category, token?: string) => {
        if (!token) {
          set((state) => ({ categories: state.categories.map((c) => (c.id === id ? { ...category, id, productCount: c.productCount } : c)) }))
          try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
          return
        }
        try {
          const res = await apiClient.updateCategory(token, id, category)
          if (!res.error && res.data) {
            const c = res.data
            const updated = { id: String(c.id ?? c.pk ?? c.name), name: c.name, description: c.description || '', productCount: c.product_count ?? 0 }
            set((state) => ({ categories: state.categories.map((cc) => (cc.id === id ? updated : cc)) }))
            try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
            return
          }
        } catch (e) {}
        // fallback local
        set((state) => ({ categories: state.categories.map((c) => (c.id === id ? { ...category, id, productCount: c.productCount } : c)) }))
        try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
      },

      deleteCategory: async (id, token?: string) => {
        if (!token) {
          set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
          try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
          return
        }
        try {
          const res = await apiClient.deleteCategory(token, id)
          if (!res.error) {
            set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
            try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
            return
          }
        } catch (e) {}
        // fallback local
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
        try { localStorage.setItem('categories_updated_at', String(Date.now())) } catch (e) {}
      },
    }),
    {
      name: "categories-storage",
    },
  ),
)

// Fetch categories from backend once on module load to keep admin pages in sync
;(async () => {
  try {
    const res = await apiClient.getCategories()
    if (res && !res.error && Array.isArray(res.data)) {
      // normalize to Category shape expected by the store
      const remoteCategories = res.data.map((c: any) => ({
        id: String(c.id ?? c.pk ?? c.slug ?? c.name),
        name: c.name ?? c.title ?? "",
        description: c.description ?? "",
        productCount: typeof c.product_count === "number" ? c.product_count : c.productCount ?? 0,
      }))

      // set fetched categories into the zustand store
      const set = (useCategories as any).setState
      set({ categories: remoteCategories })

      // If products are loaded, update productCount per category
      try {
        const productsState = (await import("@/hooks/use-products"))?.useProducts
        const existingProducts = productsState?.getState?.()?.products ?? []
        if (Array.isArray(existingProducts) && existingProducts.length > 0) {
          const counts: Record<string, number> = {}
          existingProducts.forEach((p: any) => {
            const cat = p.category || ""
            counts[cat] = (counts[cat] || 0) + 1
          })
          const updatedCats = remoteCategories.map((c: any) => ({ ...c, productCount: counts[c.name] || 0 }))
          set({ categories: updatedCats })
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore — fallback to persisted/local categories
    // console.debug("Failed to fetch categories:", e)
  }
})()
