"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { CartItem } from "./cart-item"

export function CartPage() {
  const router = useRouter()
  const { items, getTotalPrice } = useCart()
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(items.map((item) => `${item.product.id}-${item.selectedVariant?.id || ""}`)),
  )

  const selectedItems = items.filter((item) =>
    selectedItemIds.has(`${item.product.id}-${item.selectedVariant?.id || ""}`),
  )

  const subtotal = selectedItems.reduce((sum, item) => {
    const price = item.selectedVariant?.price ?? item.product.basePrice
    return sum + price * item.quantity
  }, 0)

  const shipping = subtotal > 0 ? (subtotal >= 1000 ? 0 : 29.99) : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedItemIds.size === items.length) {
      setSelectedItemIds(new Set())
    } else {
      setSelectedItemIds(new Set(items.map((item) => `${item.product.id}-${item.selectedVariant?.id || ""}`)))
    }
  }

  const handleCheckout = () => {
    if (selectedItems.length === 0) return

    // Store selected items in sessionStorage for checkout page
    sessionStorage.setItem(
      "checkoutItems",
      JSON.stringify(
        selectedItems.map((item) => ({
          productId: item.product.id,
          variantId: item.selectedVariant?.id || "",
          quantity: item.quantity,
        })),
      ),
    )

    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Add some products to get started</p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              Browse Products
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Checkbox
                checked={selectedItemIds.size === items.length && items.length > 0}
                onCheckedChange={toggleSelectAll}
                className="h-5 w-5"
              />
              <span className="text-sm font-medium">
                Select All ({selectedItems.length} of {items.length} selected)
              </span>
            </CardContent>
          </Card>

          {items.map((item) => {
            const itemId = `${item.product.id}-${item.selectedVariant?.id || ""}`
            return (
              <CartItem
                key={itemId}
                item={item}
                isSelected={selectedItemIds.has(itemId)}
                onSelectChange={(selected) => toggleItemSelection(itemId)}
              />
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({selectedItems.length} items)</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>

              {subtotal < 1000 && subtotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add ${(1000 - subtotal).toFixed(2)} more to get FREE shipping
                </p>
              )}

              <Button size="lg" className="w-full gap-2" onClick={handleCheckout} disabled={selectedItems.length === 0}>
                Checkout Selected ({selectedItems.length})
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
