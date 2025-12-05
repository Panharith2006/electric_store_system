"use client"

import { useEffect } from "react"
import { AdminCategoriesPage } from "@/components/admin/admin-categories-page"
import { useCategories } from "@/hooks/use-categories"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"

export default function CategoriesPage() {
  const { categories } = useCategories()
  const { token } = useAuth()

  useEffect(() => {
    // Fetch latest categories from backend on mount
    const fetchCategories = async () => {
      try {
        const res = await apiClient.getCategories()
        if (res && !res.error && Array.isArray(res.data)) {
          const remoteCategories = res.data.map((c: any) => ({
            id: String(c.id ?? c.pk ?? c.slug ?? c.name),
            name: c.name ?? c.title ?? "",
            description: c.description ?? "",
            productCount: typeof c.product_count === "number" ? c.product_count : c.productCount ?? 0,
          }))
          const set = (useCategories as any).setState
          set({ categories: remoteCategories })
        }
      } catch (e) {
        console.debug("Failed to fetch categories:", e)
      }
    }
    fetchCategories()
  }, [token])

  return <AdminCategoriesPage />
}
