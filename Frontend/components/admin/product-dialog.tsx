"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { useProducts, type Product, type ProductVariant } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import { useToast } from "@/hooks/use-toast"
import { useStockManagement } from "@/hooks/use-stock-management"

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  productId?: string | null
}

export function ProductDialog({ open, onClose, productId }: ProductDialogProps) {
  const { products, addProduct, updateProduct } = useProducts()
  const { categories } = useCategories()
  const { toast } = useToast()
  const { token } = useAuth()
  const { fetchStock } = useStockManagement()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  // files selected per-variant (keyed by variant id)
  const [variantFiles, setVariantFiles] = useState<Record<string, File[]>>({})
  // Track images to delete per variant
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const editingProduct = productId ? products.find((p) => p.id === productId) : null

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    category: "",
    brand: "",
    image: "",
  })

  const [variants, setVariants] = useState<ProductVariant[]>([])

  const [initialStock, setInitialStock] = useState<string | number>("")

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        basePrice: editingProduct.basePrice?.toString() || "",
        category: editingProduct.category,
        brand: editingProduct.brand,
        image: editingProduct.image || "",
      })
      setVariants(editingProduct.variants || [])
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: "",
        category: "",
        brand: "",
        image: "",
      })
      setVariants([])
    }
  }, [editingProduct, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast({ title: "Authentication required", description: "Please sign in to continue", variant: "destructive" })
      return
    }

    ;(async () => {
      setUploading(true)
      let imageUrl = formData.image
      
      try {
        // Delete marked images first
        if (imagesToDelete.length > 0 && token) {
          for (const imgUrl of imagesToDelete) {
            try {
              await apiClient.deleteProductImage(token, imgUrl)
            } catch (e) {
              console.warn('Failed to delete image:', imgUrl, e)
            }
          }
          setImagesToDelete([])
        }

        // Upload image file if selected
        if (imageFile) {
          const uploadRes = await apiClient.uploadProductImage(token, imageFile)
          if (uploadRes.error) {
            toast({ title: "Image upload failed", description: uploadRes.error, variant: "destructive" })
            setUploading(false)
            return
          }
          imageUrl = uploadRes.data?.url || imageUrl
        }
        
        // If there are per-variant files selected, upload them and attach URLs to variants
        const variantsToSave = [...variants]
        for (let i = 0; i < variantsToSave.length; i++) {
          const v = variantsToSave[i]
          const files = variantFiles[v.id] || []
          if (files.length > 0 && token) {
            const uploadedUrls: string[] = []
            for (const f of files) {
              try {
                const up = await apiClient.uploadProductImage(token, f)
                if (!up.error && up.data?.url) uploadedUrls.push(up.data.url)
              } catch (err) {
                console.error('Variant image upload failed', err)
              }
            }
            // merge with existing images
            v.images = Array.isArray(v.images) ? [...(v.images || []), ...uploadedUrls] : uploadedUrls
          }
        }

        // collect product-level images including uploaded variant images
        const additionalVariantImages = variantsToSave.flatMap((v) => Array.isArray(v.images) ? v.images : [])

        const productData: Omit<Product, "id"> = {
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.basePrice),
          basePrice: Number.parseFloat(formData.basePrice),
          category: formData.category,
          brand: formData.brand,
          image: imageUrl,
          inStock: true,
          rating: 0,
          variants: variantsToSave.length > 0 ? variantsToSave : [],
        }

        // If there are no variants and initialStock was provided, include it
        if ((variantsToSave.length === 0 || !variantsToSave) && initialStock !== "") {
          ;(productData as any).initial_stock = Number(initialStock)
        }

        if (editingProduct) {
          const res = await (updateProduct as any)(editingProduct.id, productData, token)
          if (res && res.error) {
            // Try to show detailed errors returned by API
            const detail = (res.data && (res.data.detail || JSON.stringify(res.data))) || res.error
            toast({ title: "Update failed", description: String(detail), variant: "destructive" })
            setUploading(false)
            return
          }
          toast({ title: "Product updated", description: "The product has been updated successfully" })
        } else {
          const res = await (addProduct as any)(productData, token)
          if (res && res.error) {
            const detail = (res.data && (res.data.detail || JSON.stringify(res.data))) || res.error
            toast({ title: "Create failed", description: String(detail), variant: "destructive" })
            setUploading(false)
            return
          }
          // Refresh stock data so new product appears immediately in stock management
          try {
            await fetchStock(token ?? undefined)
          } catch (e) {
            // ignore
          }
          toast({ title: "Product added", description: "The product has been added to your catalog" })
        }

        // Refetch products and categories to ensure UI is in sync
        try {
          const productsRes = await apiClient.getProducts()
          if (productsRes && !productsRes.error && Array.isArray(productsRes.data)) {
            const remoteProducts = productsRes.data.map((p: any) => ({
              id: String(p.id ?? p.pk ?? p.sku ?? p.name),
              name: p.name ?? "",
              description: p.description ?? "",
              price: Number(p.price ?? p.base_price ?? 0),
              basePrice: Number(p.base_price ?? p.price ?? 0),
              category: p.category_name ?? p.category ?? "",
              brand: p.brand_name ?? p.brand ?? "",
              image: p.image ?? "",
              inStock: typeof p.in_stock === "boolean" ? p.in_stock : (p.total_stock ?? 0) > 0,
              rating: Number(p.rating ?? 0),
              variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({
                id: String(v.id ?? v.sku ?? ""),
                name: v.name ?? "",
                sku: v.sku ?? "",
                color: v.color ?? "",
                storage: v.storage ?? "",
                price: Number(v.price ?? 0),
                stock: Number(v.stock ?? 0),
                images: Array.isArray(v.images) ? v.images : []
              })) : []
            }))
            ;(useProducts as any).setState({ products: remoteProducts })
          }
          
          const categoriesRes = await apiClient.getCategories()
          if (categoriesRes && !categoriesRes.error && Array.isArray(categoriesRes.data)) {
            const { useCategories } = await import("@/hooks/use-categories")
            const remoteCategories = categoriesRes.data.map((c: any) => ({
              id: String(c.id ?? c.name),
              name: c.name ?? "",
              description: c.description ?? "",
              productCount: c.product_count ?? 0
            }))
            ;(useCategories as any).setState({ categories: remoteCategories })
          }
        } catch (e) {
          console.warn("Failed to refetch data after product save:", e)
        }

        setImageFile(null)
        setVariantFiles({})
        setImagesToDelete([])
        onClose()
      } catch (e: any) {
        toast({ title: "Operation failed", description: e.message || "Could not save the product", variant: "destructive" })
      } finally {
        setUploading(false)
      }
    })()
  }

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `variant-${Date.now()}`,
        name: `Variant ${variants.length + 1}`,
        sku: `SKU-${Date.now()}`,
        color: "",
        storage: "",
        price: Number.parseFloat(formData.basePrice) || 0,
        stock: 0,
        images: [],
      },
    ])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {editingProduct ? "Update product information" : "Add a new product to your catalog"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            {/* Initial stock for products without variants */}
            {variants.length === 0 && (
              <div className="space-y-2">
                <Label htmlFor="initialStock">Initial Stock (optional)</Label>
                <Input
                  id="initialStock"
                  type="number"
                  min={0}
                  value={String(initialStock)}
                  onChange={(e) => setInitialStock(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g., 10"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImageFile(file)
                    // Preview the file
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setFormData({ ...formData, image: reader.result as string })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              {formData.image && (
                <div className="mt-2 relative inline-block">
                  <img src={formData.image} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={async () => {
                      if (token && formData.image && formData.image.startsWith('http')) {
                        try {
                          await apiClient.deleteProductImage(token, formData.image)
                          toast({ title: "Image deleted", description: "The image has been removed" })
                        } catch (e) {
                          toast({ title: "Delete failed", variant: "destructive" })
                        }
                      }
                      setFormData({ ...formData, image: "" })
                      setImageFile(null)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Variants Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Product Variants (Color + Storage)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <div key={variant.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      placeholder="e.g., IP15PM-256-BLK"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      placeholder="e.g., Black, Blue"
                      value={variant.color}
                      onChange={(e) => updateVariant(index, "color", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Storage</Label>
                    <Input
                      placeholder="e.g., 256GB"
                      value={variant.storage}
                      onChange={(e) => updateVariant(index, "storage", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, "price", Number.parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, "stock", Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Variant Images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = e.target.files ? Array.from(e.target.files) : []
                      setVariantFiles((prev) => ({ ...prev, [variant.id]: files }))

                      // Immediately upload selected files and attach URLs to the variant
                      if (files.length > 0) {
                        const uploadedUrls: string[] = []
                        for (const f of files) {
                          try {
                            const up = await apiClient.uploadProductImage(token ?? undefined, f)
                            if (!up.error && up.data?.url) uploadedUrls.push(up.data.url)
                          } catch (err) {
                            console.error('Immediate variant image upload failed', err)
                          }
                        }

                        if (uploadedUrls.length > 0) {
                          // merge into local variant state
                          setVariants((prev) => {
                            const copy = [...prev]
                            const idx = copy.findIndex((x) => x.id === variant.id)
                            if (idx >= 0) {
                              const existing = Array.isArray(copy[idx].images) ? copy[idx].images : []
                              copy[idx] = { ...copy[idx], images: [...existing, ...uploadedUrls] }
                            }
                            return copy
                          })

                          // If editing an existing product, persist the variant images to backend
                          if (editingProduct && token) {
                            try {
                              // If this variant appears to be a temporary frontend id, create it on backend
                              if (String(variant.id).startsWith('variant-')) {
                                const variantId = `${String(editingProduct)}-${String(variant.storage || 'v')}-${String(variant.color || Date.now())}`.replace(/\s+/g, '-').toLowerCase()
                                const payload: any = {
                                  id: variantId,
                                  product: String(editingProduct),
                                  storage: variant.storage ?? '',
                                  color: variant.color ?? '',
                                  price: Number(variant.price ?? 0),
                                  stock: Number(variant.stock ?? 0),
                                  images: uploadedUrls,
                                  sku: variant.sku ?? variantId,
                                }
                                await apiClient.createVariant(token, payload)
                              } else {
                                // existing variant: append images via PATCH
                                await apiClient.updateVariant(token, String(variant.id), { images: uploadedUrls })
                              }

                              // Refresh products store so admin UI shows updated variant counts/images
                              try {
                                const productsRes = await apiClient.getProducts()
                                if (productsRes && !productsRes.error && Array.isArray(productsRes.data)) {
                                  const remoteProducts = productsRes.data.map((p: any) => ({
                                    id: String(p.id ?? p.pk ?? p.sku ?? p.name),
                                    name: p.name ?? "",
                                    description: p.description ?? "",
                                    price: Number(p.price ?? p.base_price ?? 0),
                                    basePrice: Number(p.base_price ?? p.price ?? 0),
                                    category: p.category_name ?? p.category ?? "",
                                    brand: p.brand_name ?? p.brand ?? "",
                                    image: p.image ?? "",
                                    inStock: typeof p.in_stock === "boolean" ? p.in_stock : (p.total_stock ?? 0) > 0,
                                    rating: Number(p.rating ?? 0),
                                    variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({ id: String(v.id ?? v.sku ?? ""), name: v.name ?? "", sku: v.sku ?? "", color: v.color ?? "", storage: v.storage ?? "", price: Number(v.price ?? 0), stock: Number(v.stock ?? 0), images: Array.isArray(v.images) ? v.images : [] })) : []
                                  }))
                                  ;(useProducts as any).setState({ products: remoteProducts })
                                }
                              } catch (e) {
                                // ignore
                              }
                            } catch (err) {
                              console.warn('Failed to persist variant images immediately', err)
                            }
                          }
                        }
                      }
                    }}
                  />

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {/* show existing images from variant.images with delete button */}
                    {Array.isArray(variant.images) && variant.images.map((img: string, i: number) => (
                      <div key={i} className="relative group">
                        <img src={img} className="h-16 w-16 object-cover rounded-md" alt={`variant-${index}-img-${i}`} />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={async () => {
                            // Mark for deletion and remove from variant
                            if (token && img.startsWith('http')) {
                              setImagesToDelete((prev) => [...prev, img])
                            }
                            const newVariants = [...variants]
                            newVariants[index].images = (newVariants[index].images || []).filter((_, idx) => idx !== i)
                            setVariants(newVariants)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    {/* show previews for newly selected files */}
                    {(variantFiles[variant.id] || []).map((f, i) => (
                      <div key={i} className="relative group">
                        <img src={URL.createObjectURL(f)} className="h-16 w-16 object-cover rounded-md" alt={`preview-${i}`} />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const files = variantFiles[variant.id] || []
                            setVariantFiles((prev) => ({ ...prev, [variant.id]: files.filter((_, idx) => idx !== i) }))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Remove Variant
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : (editingProduct ? "Update Product" : "Add Product")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
