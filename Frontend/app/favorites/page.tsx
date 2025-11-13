import { FavoritesList } from "@/components/favorites/favorites-list"
import { ShopHeader } from "@/components/shop/shop-header"

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <div className="container mx-auto px-4 py-8">
        <FavoritesList />
      </div>
    </div>
  )
}
