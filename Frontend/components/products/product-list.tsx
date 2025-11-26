"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { products as localProducts, categories as localCategories, brands as localBrands, hasStock } from "@/lib/products-data"
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

  useEffect(() => {
    const category = searchParams.get("category")
    if (category && categories.includes(category)) {
      setSelectedCategory(category)
    } else if (!category) {
      setSelectedCategory("All Categories")
    }
  }, [searchParams])

  const [fetchedProducts, setFetchedProducts] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API base (frontend env var or default)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

  const [categoriesList, setCategoriesList] = useState<string[] | null>(null)
  const [brandsList, setBrandsList] = useState<string[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        // products list (lightweight)
        const [pRes, cRes, bRes] = await Promise.all([
          fetch(`${API_BASE}/products/products/`),
          fetch(`${API_BASE}/products/products/categories/`),
          fetch(`${API_BASE}/products/products/brands/`),
        ])

        if (!pRes.ok) throw new Error(`Failed to fetch products: ${pRes.status}`)
        const pData = await pRes.json()

        if (cRes.ok) {
          const cData = await cRes.json()
          if (!cancelled) setCategoriesList(["All Categories", ...cData.map((c: any) => c.name)])
        }
        if (bRes.ok) {
          const bData = await bRes.json()
          if (!cancelled) setBrandsList(["All Brands", ...bData.map((b: any) => b.name)])
        }

        if (!cancelled) setFetchedProducts(pData)
      } catch (err: any) {
        console.warn("Products fetch failed, falling back to local data:", err)
        if (!cancelled) setError(err.message || "Failed to fetch")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [])

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

  const productSource = (fetchedProducts ? fetchedProducts.map(normalize) : localProducts) as any[]

  const filteredProducts = useMemo(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase() || ""

    const filtered = productSource.filter((product: any) => {
      const categoryMatch = selectedCategory === "All Categories" || product.category === selectedCategory
      const brandMatch = selectedBrand === "All Brands" || product.brand === selectedBrand
      const priceMatch = product.basePrice >= priceRange[0] && product.basePrice <= priceRange[1]
      const stockMatch = !showInStockOnly || hasStock(product)

      const searchMatch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery) ||
        product.brand.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery)

      return categoryMatch && brandMatch && priceMatch && stockMatch && searchMatch
    })

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.basePrice - b.basePrice)
        break
      case "price-high":
        filtered.sort((a, b) => b.basePrice - a.basePrice)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // featured - keep original order
        break
    }

    return filtered
  }, [selectedCategory, selectedBrand, priceRange, sortBy, showInStockOnly, searchParams])

  const filterProps = {
    categories: categoriesList ?? localCategories,
    brands: brandsList ?? localBrands,
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

  return (
    <div className="container mx-auto px-4 py-8">
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
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
