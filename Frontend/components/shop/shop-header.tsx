"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Heart, ShoppingCart, User, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useFavorites } from "@/hooks/use-favorites"
import { useCart } from "@/hooks/use-cart"

export function ShopHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const { favorites } = useFavorites()
  const { getTotalItems } = useCart()
  const cartItemsCount = getTotalItems()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide the entire shop header on certain pages (cart, checkout, orders, profile)
  if (pathname && (pathname === "/cart" || pathname.startsWith("/checkout") || pathname.startsWith("/orders") || pathname === "/profile")) {
    return null
  }

  // Initialize input from URL once, and remove URL search param when input is cleared
  useEffect(() => {
    const param = searchParams?.get("search") ?? ""
    // Initialize only if query exists in URL and input is empty (avoid overwriting user typing)
    if (param && searchQuery === "") {
      setSearchQuery(param)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    // When user clears the search input, remove the `search` query param from URL
    if (searchQuery.trim() === "" && searchParams?.get("search")) {
      // replace to avoid adding extra history entries
      router.replace("/products")
    }
  }, [searchQuery, searchParams, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">ElectroStore</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl mx-8 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Actions */}
          <nav className="flex items-center gap-2">
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {mounted && favorites.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartItemsCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </nav>
        </div>

        {/* Navigation Links - only show on the store/products pages */}
        {pathname && (pathname === "/" || pathname.startsWith("/products")) && (
          <div className="flex h-12 items-center gap-6 text-sm">
            {/* Category links disabled in Navigation - render as plain text to avoid duplicate linking */}
            {/*
            <Link href="/products" className="font-medium text-foreground hover:text-primary transition-colors">
              All Products
            </Link>
            <Link
              href="/products?category=Smartphones"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Smartphones
            </Link>
            <Link
              href="/products?category=Laptops"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Laptops
            </Link>
            <Link
              href="/products?category=Headphones"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Headphones
            </Link>
            <Link
              href="/products?category=Cameras"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cameras
            </Link>
            */}

            {/* <span className="font-medium text-foreground">All Products</span>
            <span className="text-muted-foreground">Smartphones</span>
            <span className="text-muted-foreground">Laptops</span>
            <span className="text-muted-foreground">Headphones</span>
            <span className="text-muted-foreground">Cameras</span> */}
          </div>
        )}
      </div>
    </header>
  )
}
