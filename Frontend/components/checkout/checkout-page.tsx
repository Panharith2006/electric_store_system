"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { useOrders } from "@/hooks/use-orders"
import { ShippingForm } from "./shipping-form"
import { PaymentForm } from "./payment-form"
import dynamic from "next/dynamic"

const OrderSummary = dynamic(() => import("./order-summary").then((mod) => mod.OrderSummary), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-md bg-muted" />,
})
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

  const [redirectingToCart, setRedirectingToCart] = useState(false)

  useEffect(() => {
    // Previously we auto-redirected to /cart when there were no items.
    // That made the checkout page impossible to test. Instead, keep the
    // page open and show an informational message while allowing the
    // shipping/payment forms to be filled (useful for testing guest checkout).
    // If you prefer strict behavior (enforce items before checkout),
    // set redirecting behavior back.
    if (items.length === 0) {
      setRedirectingToCart(false)
    }
  }, [items, router])

  // If you prefer the old redirect behavior enable the following line:
  // if (redirectingToCart) return null

  const handleShippingSubmit = async (data: any) => {
    // Before proceeding, validate stock availability for items in cart
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

      // Fetch fresh product data for each unique product in the cart
      const productIds = Array.from(new Set(items.map((it) => it.product.id)))
      const freshMap: Record<string, any> = {}

      await Promise.all(
        productIds.map(async (pid) => {
          try {
            const res = await fetch(`${API_BASE}/products/products/${pid}/`, { cache: 'no-store' })
            if (res.ok) {
              const json = await res.json()
              freshMap[String(pid)] = json
            }
          } catch (err) {
            // ignore network errors for individual products
          }
        }),
      )

      const insufficient: string[] = []

      for (const it of items) {
        const pid = String(it.product.id)
        const variantId = it.selectedVariant.id
        const qty = it.quantity

        const fresh = freshMap[pid]
        let available = undefined as number | undefined

        if (fresh && Array.isArray(fresh.variants)) {
          const fv = fresh.variants.find((v: any) => String(v.id) === String(variantId))
          if (fv) available = Number(fv.stock ?? fv.quantity ?? fv.stock_level ?? 0)
        }

        // If we couldn't fetch fresh info, fall back to client-side product info
        if (available === undefined) {
          const clientVariant = it.product.variants?.find((v: any) => String(v.id) === String(variantId))
          if (clientVariant) available = Number(clientVariant.stock ?? 0)
        }

        if ((available ?? 0) < qty) {
          insufficient.push(`${it.product.name} (${it.selectedVariant.storage} - ${it.selectedVariant.color})`)
        }
      }

      if (insufficient.length > 0) {
        toast({ title: "Insufficient stock", description: `Not enough stock for: ${insufficient.join(', ')}`, variant: "destructive" })
        return
      }

      setShippingData(data)
      setStep("payment")
    } catch (e) {
      // On error, allow the flow but warn the user
      toast({ title: "Stock check failed", description: "Could not verify stock. Proceeding with checkout.", variant: "warning" })
      setShippingData(data)
      setStep("payment")
    }
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
        <div className="lg:col-span-2 space-y-6 relative z-10">
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
        <div className="lg:col-span-1 relative z-0">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
