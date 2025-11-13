"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Category {
  id: string
  name: string
  description: string
  productCount?: number
}

interface CategoriesState {
  categories: Category[]
  addCategory: (category: Omit<Category, "id" | "productCount">) => void
  updateCategory: (id: string, category: Omit<Category, "id" | "productCount">) => void
  deleteCategory: (id: string) => void
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
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: `category-${Date.now()}`, productCount: 0 }],
        })),
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...category, id, productCount: c.productCount } : c,
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "categories-storage",
    },
  ),
)
