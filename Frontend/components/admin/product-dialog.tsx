"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  productId?: string | null
}

export function ProductDialog({ open, onClose, productId }: ProductDialogProps) {
  const { products, addProduct, updateProduct } = useProducts()
  const { categories } = useCategories()
  const { toast } = useToast()

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

    const productData: Omit<Product, "id"> = {
      name: formData.name,
      description: formData.description,
      basePrice: Number.parseFloat(formData.basePrice),
      category: formData.category,
      brand: formData.brand,
      image: formData.image || "/placeholder.svg",
      variants: variants.length > 0 ? variants : [],
      images: [formData.image || "/placeholder.svg"],
      specifications: {},
      gifts: [],
      relatedProducts: [],
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
      toast({
        title: "Product updated",
        description: "The product has been updated successfully",
      })
    } else {
      addProduct(productData)
      toast({
        title: "Product added",
        description: "The product has been added to your catalog",
      })
    }

    onClose()
  }

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `variant-${Date.now()}`,
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
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/placeholder.svg"
              />
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

                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Remove Variant
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingProduct ? "Update Product" : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
