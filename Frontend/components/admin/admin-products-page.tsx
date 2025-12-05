"use client"

import { useState } from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AdminLayout } from "./admin-layout"
import { ProductsTable } from "./products-table"
import { ProductDialog } from "./product-dialog"
import { useProducts } from "@/hooks/use-products"

export function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  // subscribe specifically to `products` so this component re-renders
  // only when the products array changes (Zustand selector)
  const products = useProducts((s) => s.products)

  useEffect(() => {
    // Ensure we have fresh products when the admin page mounts.
    // The `useProducts` store already fetches on module load, but in dev
    // or after backend changes this ensures the admin sees current data.
    ;(async () => {
      try {
        const res = await (await import("@/lib/api-client")).default.getProducts()
        if (res && !res.error && Array.isArray(res.data)) {
          const remoteProducts = (res.data as any[]).map((p) => ({
            id: String(p.id ?? p.pk ?? p.sku ?? p.slug ?? p.name),
            name: p.name ?? p.title ?? "",
            description: p.description ?? "",
            price: Number(p.price ?? p.base_price ?? 0),
            basePrice: Number(p.price ?? p.base_price ?? 0),
            category: p.category ?? (p.category_name ?? ""),
            brand: p.brand ?? (p.brand_name ?? ""),
            image: p.image ?? p.thumbnail ?? undefined,
            inStock: typeof p.in_stock === "boolean" ? p.in_stock : (p.total_stock ?? 0) > 0,
            rating: Number(p.rating ?? 0),
            variants: Array.isArray(p.variants)
              ? p.variants.map((v: any) => ({ id: String(v.id ?? v.sku ?? v.name), name: v.name ?? "", price: Number(v.price ?? v.list_price ?? 0), stock: Number(v.stock ?? v.quantity ?? 0) }))
              : [],
          }))
          ;(useProducts as any).setState({ products: remoteProducts })
        }
      } catch (e) {
        // ignore — useProducts has fallbacks
      }
    })()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (productId: string) => {
    setEditingProduct(productId)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Product Management</h2>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <ProductsTable products={filteredProducts} onEdit={handleEdit} />

        {/* Product Dialog */}
        <ProductDialog open={isDialogOpen} onClose={handleCloseDialog} productId={editingProduct} />
      </div>
    </AdminLayout>
  )
}
