"use client"

import Image from "next/image"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"

export function OrderSummary() {
  // Use client-side cart to compute totals to avoid SSR/client mismatch
  const { items, getTotalPrice } = useCart()

  const subtotal = useMemo(() => getTotalPrice(), [getTotalPrice, items])
  const shipping = useMemo(() => (subtotal >= 1000 ? 0 : 29.99), [subtotal])
  const tax = useMemo(() => subtotal * 0.08, [subtotal])
  const total = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax])
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="max-h-64">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={`${item.product.id}-${(item.selectedVariant && item.selectedVariant.id) || "default"}`} className="flex gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={(item.selectedVariant && item.selectedVariant.image) || item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</p>
                  {item.selectedVariant && (
                    <Badge variant="secondary" className="text-xs">
                      {item.selectedVariant.storage ? `${item.selectedVariant.storage} ${item.selectedVariant.color}`.trim() : item.selectedVariant.id}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {(Number(item.selectedVariant?.price ?? item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
