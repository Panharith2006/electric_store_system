export interface ProductVariant {
  id: string // SKU
  storage: string
  color: string
  price: number
  originalPrice?: number
  stock: number
  images?: string[] // Color-specific images for this variant
}

export interface Product {
  id: string // Parent product ID
  name: string
  brand: string
  category: string
  basePrice: number // Starting price for display
  image: string // Default image
  images: string[] // Default images
  specs: {
    [key: string]: string
  }
  description: string
  features: string[]
  variants: ProductVariant[] // All color+storage combinations
  gifts?: string[]
  relatedProducts?: string[]
}

// ============================================================================
// STATIC DATA REMOVED - ALL DATA NOW FETCHED DYNAMICALLY FROM BACKEND API
// ============================================================================
// 
// These arrays are kept empty for backward compatibility with existing imports.
// All product, category, and brand data is now fetched dynamically from the
// backend API at runtime.
//
// DO NOT add static products here - use the Django backend database instead.
// Use the populate_products management command to seed data.
// ============================================================================

export const categories: string[] = []
export const brands: string[] = []
export const products: Product[] = []

// ============================================================================
// UTILITY FUNCTIONS - These work with dynamic product data
// ============================================================================

export function getAvailableColors(product: Product): string[] {
  if (!product?.variants) return []
  return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)))
}

export function getAvailableStorages(product: Product): string[] {
  if (!product?.variants) return []
  return Array.from(new Set(product.variants.map((v) => v.storage).filter(Boolean)))
}

export function getVariantByColorAndStorage(
  product: Product,
  color: string,
  storage: string,
): ProductVariant | undefined {
  if (!product?.variants) return undefined
  return product.variants.find((v) => v.color === color && v.storage === storage)
}

export function getLowestPrice(product: Product): number {
  if (!product?.variants || product.variants.length === 0) return product?.basePrice || 0
  return Math.min(...product.variants.map((v) => v.price))
}

export function hasStock(product: Product): boolean {
  if (!product?.variants || product.variants.length === 0) return false
  return product.variants.some((v) => v.stock > 0)
}
