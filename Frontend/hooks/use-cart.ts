"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/lib/products-data"

export interface CartItem {
  product: Product
  quantity: number
  selectedVariant: {
    id: string // SKU
    storage: string
    color: string
    price: number
    image?: string // Add image field to store color-specific image
  }
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, variantId?: string) => void
  removeItem: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, variantId) =>
        set((state) => {
          if (!variantId) {
            console.error("[v0] Cannot add item without variant ID")
            return state
          }

          const variant = (product.variants ?? []).find((v) => v.id === variantId)
          if (!variant) {
            console.error("[v0] Variant not found:", variantId)
            return state
          }

          // Check if this exact variant is already in cart
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.selectedVariant.id === variantId,
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.selectedVariant.id === variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                product,
                quantity,
                selectedVariant: {
                  id: variant.id,
                  storage: variant.storage,
                  color: variant.color,
                        price: variant.effective_price ?? variant.price,
                  image: variant.images?.[0], // Store the first color-specific image
                },
              },
            ],
          }
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.selectedVariant.id === variantId),
          ),
        })),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => !(item.product.id === productId && item.selectedVariant.id === variantId))
              : state.items.map((item) =>
                  item.product.id === productId && item.selectedVariant.id === variantId ? { ...item, quantity } : item,
                ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const state = get()
        return state.items.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        const state = get()
        return state.items.reduce((total, item) => {
          return total + item.selectedVariant.price * item.quantity
        }, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
