import { CheckoutPage } from "@/components/checkout/checkout-page"
import { ShopHeader } from "@/components/shop/shop-header"

export default function Checkout() {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <CheckoutPage />
    </div>
  )
}
