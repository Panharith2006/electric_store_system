"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, LogOut, Heart, ShoppingCart } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"

export function ProfileHeader() {
  const { favorites } = useFavorites()

  const handleLogout = () => {
    console.log("[v0] User logged out")
    window.location.href = "/"
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">ElectroStore</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="ghost">Products</Button>
          </Link>
          <Link href="/favorites">
            <Button variant="ghost" className="relative gap-2">
              <Heart className="h-4 w-4" />
              Favorites
              {favorites.length > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {favorites.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Button variant="ghost" className="relative">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Link href="/profile">
            <Button variant="ghost">My Profile</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}
