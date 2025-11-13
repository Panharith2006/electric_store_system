import { CartPage } from "@/components/cart/cart-page"
import { ShopHeader } from "@/components/shop/shop-header"

export default function Cart() {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <CartPage />
    </div>
  )
}
