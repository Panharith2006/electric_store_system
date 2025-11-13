import { ProductDetails } from "@/components/products/product-details"
import { ShopHeader } from "@/components/shop/shop-header"
import { products } from "@/lib/products-data"
import { notFound } from "next/navigation"

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <ProductDetails product={product} />
    </div>
  )
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}
