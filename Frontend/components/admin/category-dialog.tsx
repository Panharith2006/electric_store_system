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
import { useCategories, type Category } from "@/hooks/use-categories"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"

interface CategoryDialogProps {
  open: boolean
  onClose: () => void
  categoryId?: string | null
}

export function CategoryDialog({ open, onClose, categoryId }: CategoryDialogProps) {
  const { categories, addCategory, updateCategory } = useCategories()
  const { token } = useAuth()
  const { toast } = useToast()

  const editingCategory = categoryId ? categories.find((c) => c.id === categoryId) : null

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description,
      })
    } else {
      setFormData({
        name: "",
        description: "",
      })
    }
  }, [editingCategory, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const categoryData: Omit<Category, "id" | "productCount"> = {
      name: formData.name,
      description: formData.description,
    }

    ;(async () => {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData, token ?? undefined)
        toast({
          title: "Category updated",
          description: "The category has been updated successfully",
        })
      } else {
        await addCategory(categoryData, token ?? undefined)
        toast({
          title: "Category added",
          description: "The category has been added successfully",
        })
      }

      // Refetch categories to ensure UI is in sync
      try {
        const categoriesRes = await apiClient.getCategories()
        if (categoriesRes && !categoriesRes.error && Array.isArray(categoriesRes.data)) {
          const remoteCategories = categoriesRes.data.map((c: any) => ({
            id: String(c.id ?? c.name),
            name: c.name ?? "",
            description: c.description ?? "",
            productCount: c.product_count ?? 0
          }))
          ;(useCategories as any).setState({ categories: remoteCategories })
        }
      } catch (e) {
        console.warn("Failed to refetch categories:", e)
      }

      onClose()
    })()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>
            {editingCategory ? "Update category information" : "Add a new category to organize your products"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Smartphones, Laptops"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category"
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingCategory ? "Update Category" : "Add Category"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
