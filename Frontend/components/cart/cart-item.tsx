"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart, type CartItem as CartItemType } from "@/hooks/use-cart"

interface CartItemProps {
  item: CartItemType
  isSelected?: boolean
  onSelectChange?: (selected: boolean) => void
}

export function CartItem({ item, isSelected, onSelectChange }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const { product, quantity, selectedVariant } = item

  const itemPrice = selectedVariant?.price ?? product.basePrice
  const totalPrice = itemPrice * quantity

  const displayImage = selectedVariant?.images?.[0] || selectedVariant?.image || product.image

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {onSelectChange && (
            <div className="flex items-center">
              <Checkbox checked={isSelected} onCheckedChange={onSelectChange} className="h-5 w-5" />
            </div>
          )}

          {/* Product Image - displays color-specific image based on selection */}
          <Link href={`/products/${product.id}`} className="flex-shrink-0">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-muted">
              <Image
                src={displayImage || "/placeholder.svg"}
                alt={`${product.name} - ${selectedVariant?.color || "product"}`}
                fill
                className="object-cover"
              />
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                {selectedVariant && (
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.color && (
                      <Badge variant="outline" className="text-xs">
                        {selectedVariant.color}
                      </Badge>
                    )}
                    {selectedVariant.storage && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedVariant.storage}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => updateQuantity(product.id, selectedVariant?.id || "", quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => updateQuantity(product.id, selectedVariant?.id || "", quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-foreground">${totalPrice.toFixed(2)}</span>
                <Button variant="ghost" size="icon" onClick={() => removeItem(product.id, selectedVariant?.id || "")}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
