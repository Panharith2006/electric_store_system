"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingDown, Package, Bell } from "lucide-react"
import { useStockManagement } from "@/hooks/use-stock-management"

export function StockAlerts() {
  const { stockItems } = useStockManagement()

  const lowStockItems = stockItems.filter((item) => item.totalStock > 0 && item.totalStock <= item.lowStockThreshold)
  const outOfStockItems = stockItems.filter((item) => item.totalStock === 0)

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length + outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Below threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Urgent restock needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <CardTitle>Out of Stock - Urgent</CardTitle>
            </div>
            <CardDescription>These products are completely out of stock and need immediate restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outOfStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">Out of Stock</Badge>
                    <Button size="sm">Restock</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Low Stock Warnings</CardTitle>
            </div>
            <CardDescription>These products are running low and should be restocked soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.totalStock} units</p>
                      <p className="text-xs text-muted-foreground">Threshold: {item.lowStockThreshold}</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                      Low Stock
                    </Badge>
                    <Button size="sm" variant="outline">
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All Stock Levels Healthy</h3>
            <p className="text-sm text-muted-foreground">No low stock or out of stock alerts at this time</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
