"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { products } from "@/lib/products-data"

export interface StockLocation {
  locationId: string
  quantity: number
  lastUpdated: Date
}

export interface StockItem {
  id: string // Variant SKU
  productId: string // Parent product ID
  productName: string
  variantName: string // e.g., "256GB Natural Titanium"
  sku: string
  category: string
  price: number
  totalStock: number
  available: number
  reserved: number
  lowStockThreshold: number
  locations: StockLocation[]
  lastRestocked: Date
}

interface StockManagementState {
  stockItems: StockItem[]
  initializeFromProducts: () => void
  addStock: (sku: string, quantity: number, locationId: string) => void
  removeStock: (sku: string, quantity: number, locationId: string) => void
  updateStock: (sku: string, quantity: number, locationId: string) => void
  reserveStock: (sku: string, quantity: number) => void
  releaseStock: (sku: string, quantity: number) => void
  getTotalStock: () => number
  getLowStockCount: () => number
  getOutOfStockCount: () => number
  getStockByLocation: (locationId: string) => {
    totalUnits: number
    productCount: number
    lowStock: number
    outOfStock: number
  }
  syncWithProducts: () => void
}

const initializeStockFromProducts = (): StockItem[] => {
  const stockItems: StockItem[] = []

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      const variantName = [variant.storage, variant.color].filter(Boolean).join(" ")

      stockItems.push({
        id: variant.id,
        productId: product.id,
        productName: product.name,
        variantName: variantName || "Standard",
        sku: variant.id,
        category: product.category,
        price: variant.price,
        totalStock: variant.stock,
        available: variant.stock,
        reserved: 0,
        lowStockThreshold: 20,
        locations: [
          { locationId: "main-warehouse", quantity: Math.floor(variant.stock * 0.6), lastUpdated: new Date() },
          { locationId: "store-downtown", quantity: Math.floor(variant.stock * 0.2), lastUpdated: new Date() },
          { locationId: "store-mall", quantity: Math.floor(variant.stock * 0.15), lastUpdated: new Date() },
          { locationId: "store-airport", quantity: Math.floor(variant.stock * 0.05), lastUpdated: new Date() },
        ].filter((loc) => loc.quantity > 0),
        lastRestocked: new Date(),
      })
    })
  })

  return stockItems
}

export const useStockManagement = create<StockManagementState>()(
  persist(
    (set, get) => ({
      stockItems: initializeStockFromProducts(),

      initializeFromProducts: () => {
        set({ stockItems: initializeStockFromProducts() })
      },

      syncWithProducts: () => {
        const currentStock = get().stockItems
        const newStock = initializeStockFromProducts()

        // Merge: keep existing stock levels but add new products
        const mergedStock = newStock.map((newItem) => {
          const existing = currentStock.find((item) => item.sku === newItem.sku)
          return existing || newItem
        })

        set({ stockItems: mergedStock })
      },

      addStock: (sku, quantity, locationId) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) => {
            if (item.sku === sku) {
              const locationIndex = item.locations.findIndex((loc) => loc.locationId === locationId)
              const newLocations = [...item.locations]

              if (locationIndex >= 0) {
                newLocations[locationIndex] = {
                  ...newLocations[locationIndex],
                  quantity: newLocations[locationIndex].quantity + quantity,
                  lastUpdated: new Date(),
                }
              } else {
                newLocations.push({
                  locationId,
                  quantity,
                  lastUpdated: new Date(),
                })
              }

              return {
                ...item,
                totalStock: item.totalStock + quantity,
                available: item.available + quantity,
                locations: newLocations,
                lastRestocked: new Date(),
              }
            }
            return item
          }),
        }))
      },

      removeStock: (sku, quantity, locationId) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) => {
            if (item.sku === sku) {
              const locationIndex = item.locations.findIndex((loc) => loc.locationId === locationId)
              if (locationIndex >= 0) {
                const newLocations = [...item.locations]
                const newQuantity = Math.max(0, newLocations[locationIndex].quantity - quantity)
                newLocations[locationIndex] = {
                  ...newLocations[locationIndex],
                  quantity: newQuantity,
                  lastUpdated: new Date(),
                }

                return {
                  ...item,
                  totalStock: Math.max(0, item.totalStock - quantity),
                  available: Math.max(0, item.available - quantity),
                  locations: newLocations.filter((loc) => loc.quantity > 0),
                }
              }
            }
            return item
          }),
        }))
      },

      updateStock: (sku, quantity, locationId) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) => {
            if (item.sku === sku) {
              const locationIndex = item.locations.findIndex((loc) => loc.locationId === locationId)
              const newLocations = [...item.locations]

              if (locationIndex >= 0) {
                const oldQuantity = newLocations[locationIndex].quantity
                newLocations[locationIndex] = {
                  ...newLocations[locationIndex],
                  quantity,
                  lastUpdated: new Date(),
                }

                const difference = quantity - oldQuantity
                return {
                  ...item,
                  totalStock: item.totalStock + difference,
                  available: item.available + difference,
                  locations: newLocations,
                }
              }
            }
            return item
          }),
        }))
      },

      reserveStock: (sku, quantity) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) => {
            if (item.sku === sku && item.available >= quantity) {
              return {
                ...item,
                available: item.available - quantity,
                reserved: item.reserved + quantity,
              }
            }
            return item
          }),
        }))
      },

      releaseStock: (sku, quantity) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) => {
            if (item.sku === sku) {
              return {
                ...item,
                available: item.available + quantity,
                reserved: Math.max(0, item.reserved - quantity),
              }
            }
            return item
          }),
        }))
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

      getStockByLocation: (locationId) => {
        const items = get().stockItems
        let totalUnits = 0
        let productCount = 0
        let lowStock = 0
        let outOfStock = 0

        items.forEach((item) => {
          const location = item.locations.find((loc) => loc.locationId === locationId)
          if (location) {
            totalUnits += location.quantity
            productCount++
            if (item.totalStock === 0) outOfStock++
            else if (item.totalStock <= item.lowStockThreshold) lowStock++
          }
        })

        return { totalUnits, productCount, lowStock, outOfStock }
      },
    }),
    {
      name: "stock-management-storage",
    },
  ),
)
