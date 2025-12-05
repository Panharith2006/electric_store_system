"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSearchParams } from "next/navigation"
import { hasStock } from "@/lib/products-data"
import { ProductCard } from "./product-card"
import { ProductFilters } from "./product-filters"
import { PromotionalSlider } from "./promotional-slider"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function ProductList() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedBrand, setSelectedBrand] = useState("All Brands")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState("featured")
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [fetchedProducts, setFetchedProducts] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; count?: number; lastChecked?: string } | null>(null)
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [categoriesList, setCategoriesList] = useState<string[] | null>(null)
  const [brandsList, setBrandsList] = useState<string[] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // API base (frontend env var or default)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

  useEffect(() => {
    const category = searchParams.get("category")
    if (category && categoriesList && categoriesList.includes(category)) {
      setSelectedCategory(category)
    } else if (!category) {
      setSelectedCategory("All Categories")
    }
  }, [searchParams, categoriesList])

  // Listen for cross-tab product updates (admin CRUD) and trigger a refetch
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'products_updated_at') {
        setRefreshTick((t) => t + 1)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Fetch categories and brands once on mount
  useEffect(() => {
    let cancelled = false
    const fetchMetadata = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch(`${API_BASE}/products/products/categories/`),
          fetch(`${API_BASE}/products/products/brands/`),
        ])

        if (cRes.ok) {
          const cData = await cRes.json()
          if (!cancelled) setCategoriesList(["All Categories", ...cData.map((c: any) => c.name)])
        }
        if (bRes.ok) {
          const bData = await bRes.json()
          if (!cancelled) setBrandsList(["All Brands", ...bData.map((b: any) => b.name)])
        }
      } catch (err: any) {
        console.warn("Failed to fetch categories/brands:", err)
      }
    }

    fetchMetadata()
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch products with filters applied
  useEffect(() => {
    let cancelled = false
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        // Build query parameters for backend filtering
        const params = new URLSearchParams()
        
        // Search query
        const searchQuery = searchParams.get("search")
        if (searchQuery) {
          params.append("search", searchQuery)
        }
        
        // Category filter (use category ID from backend)
        if (selectedCategory !== "All Categories") {
          // We need to find category ID - for now use name
          params.append("category__name", selectedCategory)
        }
        
        // Brand filter
        if (selectedBrand !== "All Brands") {
          params.append("brand__name", selectedBrand)
        }
        
        // Price range filter
        if (priceRange[0] > 0) {
          params.append("min_price", priceRange[0].toString())
        }
        if (priceRange[1] < 5000) {
          params.append("max_price", priceRange[1].toString())
        }
        
        // Sorting
        if (sortBy === "price-low") {
          params.append("ordering", "base_price")
        } else if (sortBy === "price-high") {
          params.append("ordering", "-base_price")
        } else if (sortBy === "name") {
          params.append("ordering", "name")
        }
        
        const url = `${API_BASE}/products/products/?${params.toString()}`
        const response = await fetch(url)

        if (!response.ok) {
          // Record API status and throw for fallback
          if (!cancelled) setApiStatus({ ok: false, lastChecked: new Date().toISOString() })
          throw new Error(`Failed to fetch products: ${response.status}`)
        }

        const data = await response.json()

        // Update API status with count when possible
        const count = (data && (data.count ?? (Array.isArray(data) ? data.length : undefined))) || 0
        if (!cancelled) setApiStatus({ ok: true, count, lastChecked: new Date().toISOString() })

        if (!cancelled) setFetchedProducts(data)
      } catch (err: any) {
        console.warn("Products fetch failed, falling back to local data:", err)
        if (!cancelled) {
          setError(err.message || "Failed to fetch")
          setFetchedProducts(null) // Fall back to local data
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()

    // Poll for updates every 30s so admin changes appear for users
    const interval = setInterval(() => {
      fetchProducts()
    }, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [selectedCategory, selectedBrand, priceRange, sortBy, searchParams, refreshTick])

  // Normalize backend product shape to frontend shape when fetched
  const normalize = (item: any) => {
    return {
      id: item.id,
      name: item.name,
      brand: item.brand_name || item.brand || "",
      category: item.category_name || item.category || "",
      basePrice: item.base_price ?? item.basePrice ?? 0,
      image: item.image ?? item.images?.[0] ?? "",
      images: item.images ?? [],
      description: item.description ?? "",
      variants:
        item.variants && item.variants.length > 0
          ? item.variants
          : item.variant_count
          ? [
              {
                price: item.min_price ?? item.base_price ?? 0,
                originalPrice: item.max_price ?? null,
                stock: 1,
              },
            ]
          : [],
    }
  }

  // Handle paginated responses from DRF ( { count, next, previous, results: [...] } )
  const productSource = useMemo(() => {
    if (!fetchedProducts) return []
    if (Array.isArray(fetchedProducts)) return fetchedProducts.map(normalize)
    if ((fetchedProducts as any).results && Array.isArray((fetchedProducts as any).results)) {
      return (fetchedProducts as any).results.map(normalize)
    }
    // If API returned an object with data property
    if ((fetchedProducts as any).data && Array.isArray((fetchedProducts as any).data)) {
      return (fetchedProducts as any).data.map(normalize)
    }
    return []
  }, [fetchedProducts])

  // Apply client-side stock filter only (backend handles other filters)
  const filteredProducts = useMemo(() => {
    if (!showInStockOnly) return productSource
    
    return productSource.filter((product: any) => hasStock(product))
  }, [productSource, showInStockOnly])

  const filterProps = {
    categories: categoriesList ?? ["All Categories"],
    brands: brandsList ?? ["All Brands"],
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    showInStockOnly,
    setShowInStockOnly,
  }

  // Don't show anything until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // If not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="mb-4 text-xl font-semibold text-foreground">Please sign in to view products</p>
          <p className="text-muted-foreground mb-6">Products are available to signed-in customers. Admins manage inventory from the Admin Panel.</p>
          <div className="flex justify-center gap-3">
            <a href="/login" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">Sign in</a>
            <a href="/register" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium">Create account</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* API status banner for debugging and realtime visibility */}
      {apiStatus && (
        <div className={`mb-4 rounded-md p-2 text-sm ${apiStatus.ok ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {/* Visually hide the full message, expose a small status dot for customers, keep message for screen readers */}
          {apiStatus.ok ? (
            <div className="flex items-center gap-2">
              {/* <span className="inline-block h-2 w-2 rounded-full bg-green-600" aria-hidden="true" /> */}
              {/* <span className="sr-only">✓ Backend connected — {apiStatus.count ?? 0} products available (last checked: {new Date(apiStatus.lastChecked || '').toLocaleTimeString()})</span> */}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* <span className="inline-block h-2 w-2 rounded-full bg-red-600" aria-hidden="true" /> */}
              {/* <span className="sr-only">⚠ Backend unreachable — check if Django server is running at {API_BASE}</span> */}
            </div>
          )}
        </div>
      )}

      <PromotionalSlider />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Showing {filteredProducts.length} of {productSource.length} products
          </p>
        </div>

        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your product search</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ProductFilters {...filterProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-32">
            <ProductFilters {...filterProps} />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setSelectedCategory("All Categories")
                  setSelectedBrand("All Brands")
                  setPriceRange([0, 5000])
                  setShowInStockOnly(false)
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
