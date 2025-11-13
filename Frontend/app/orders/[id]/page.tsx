import { OrderDetailsPage } from "@/components/orders/order-details-page"
import { ShopHeader } from "@/components/shop/shop-header"

export default function OrderDetails({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <OrderDetailsPage orderId={params.id} />
    </div>
  )
}
