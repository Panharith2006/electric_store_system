"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { useOrders } from "@/hooks/use-orders"
import { ShippingForm } from "./shipping-form"
import { PaymentForm } from "./payment-form"
import { OrderSummary } from "./order-summary"
import { useToast } from "@/hooks/use-toast"

export function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const { addOrder } = useOrders()
  const { toast } = useToast()
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const [shippingData, setShippingData] = useState<any>(null)

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 1000 ? 0 : 29.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  const handleShippingSubmit = (data: any) => {
    setShippingData(data)
    setStep("payment")
  }

  const handlePaymentSubmit = (paymentData: any) => {
    // Create order
    const order = {
      id: Date.now().toString(),
      orderNumber: `ORD-2024-${Math.floor(Math.random() * 900000) + 100000}`,
      date: new Date().toISOString(),
      status: "pending" as const,
      items: items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: shippingData,
      paymentMethod: `${paymentData.cardType} •••• ${paymentData.cardNumber.slice(-4)}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }

    addOrder(order)
    clearCart()

    toast({
      title: "Order placed successfully!",
      description: `Your order ${order.orderNumber} has been confirmed.`,
    })

    router.push(`/orders/${order.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "shipping" ? (
                <ShippingForm onSubmit={handleShippingSubmit} />
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">{shippingData?.fullName}</p>
                  <p className="text-muted-foreground">{shippingData?.street}</p>
                  <p className="text-muted-foreground">
                    {shippingData?.city}, {shippingData?.state} {shippingData?.zipCode}
                  </p>
                  <p className="text-muted-foreground">{shippingData?.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </span>
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "payment" ? (
                <PaymentForm onSubmit={handlePaymentSubmit} onBack={() => setStep("shipping")} />
              ) : (
                <p className="text-sm text-muted-foreground">Complete shipping information first</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary items={items} subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
        </div>
      </div>
    </div>
  )
}
