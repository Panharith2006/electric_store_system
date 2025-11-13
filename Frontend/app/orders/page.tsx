import { OrdersPage } from "@/components/orders/orders-page"
import { ShopHeader } from "@/components/shop/shop-header"

export default function Orders() {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <OrdersPage />
    </div>
  )
}
