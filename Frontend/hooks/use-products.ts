"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { products as initialProducts } from "@/lib/products-data"

export interface ProductVariant {
  id: string
  name: string
  price: number
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

export const useProducts = create<ProductsState>()(
  persist(
    (set) => ({
      products: initialProducts,
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, { ...product, id: `product-${Date.now()}` }],
        })),
      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...product, id } : p)),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "products-storage",
    },
  ),
)
