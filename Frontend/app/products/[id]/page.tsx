import { ProductDetails } from "@/components/products/product-details"
import { ShopHeader } from "@/components/shop/shop-header"
import { notFound } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch product from API
  let product
  try {
    const response = await fetch(`${API_BASE}/products/products/${id}/`, {
      cache: "no-store", // Always get fresh data
    })
    
    if (!response.ok) {
      notFound()
    }
    
    product = await response.json()
  } catch (error) {
    console.error("Failed to fetch product:", error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <ProductDetails product={product} />
    </div>
  )
}

// Disable static generation since products are now dynamic from database
export const dynamic = "force-dynamic"
