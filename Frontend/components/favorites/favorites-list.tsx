"use client"

import { products } from "@/lib/products-data"
import { ProductCard } from "@/components/products/product-card"
import { useFavorites } from "@/hooks/use-favorites"
import { Heart } from "lucide-react"

export function FavoritesList() {
  const { favorites } = useFavorites()
  const favoriteProducts = products.filter((product) => favorites.includes(product.id))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
        <p className="text-muted-foreground mt-2">
          {favoriteProducts.length === 0
            ? "You haven't saved any products yet"
            : `${favoriteProducts.length} saved ${favoriteProducts.length === 1 ? "product" : "products"}`}
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h2>
          <p className="text-muted-foreground max-w-md">
            Start browsing products and click the heart icon to save your favorites for later
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
