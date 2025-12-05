"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import type { Product } from "@/lib/products-data"
import { getLowestPrice, hasStock, getAvailableStorages } from "@/lib/products-data"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const isFavorite = favorites.includes(product.id)

  const lowestPrice = getLowestPrice(product)
  const inStock = hasStock(product)
  const lowestPriceVariant = (product.variants ?? []).find((v) => v.price === lowestPrice)
  const storages = getAvailableStorages(product)
  const showStorageInfo = product.category === "Smartphones" || product.category === "Laptops"

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {lowestPriceVariant?.originalPrice && (Number(lowestPriceVariant.originalPrice) - Number(lowestPrice)) > 0 && (
            <Badge className="absolute left-3 top-3 bg-destructive">
              Save ${Number(lowestPriceVariant.originalPrice) - Number(lowestPrice)}
            </Badge>
          )}
          {!inStock && <Badge className="absolute left-3 top-3 bg-muted-foreground">Out of Stock</Badge>}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/products/${product.id}`} className="flex-1">
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFavorite(product.id)
              // blur the button to remove focus outline when clicked
              try {
                ;(e.currentTarget as HTMLButtonElement).blur()
              } catch {
                /* ignore */
              }
            }}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-destructive text-destructive")} />
          </Button>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-foreground">${lowestPrice}</span>
          {lowestPriceVariant?.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${lowestPriceVariant.originalPrice}</span>
          )}
        </div>
        {showStorageInfo && storages.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            From {storages[0]} • {storages.length} storage options
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button className="w-full" disabled={!inStock}>
            {inStock ? "Available now" : "Out of Stock"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
