import { ProductList } from "@/components/products/product-list"
import { ShopHeader } from "@/components/shop/shop-header"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <ProductList />
    </div>
  )
}
