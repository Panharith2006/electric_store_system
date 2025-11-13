"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AdminLayout } from "./admin-layout"
import { CategoriesTable } from "./categories-table"
import { CategoryDialog } from "./category-dialog"

export function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  const handleEdit = (categoryId: string) => {
    setEditingCategory(categoryId)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Category Management</h2>
            <p className="text-muted-foreground">Organize your product categories</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Categories Table */}
        <CategoriesTable onEdit={handleEdit} />

        {/* Category Dialog */}
        <CategoryDialog open={isDialogOpen} onClose={handleCloseDialog} categoryId={editingCategory} />
      </div>
    </AdminLayout>
  )
}
