"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, TrendingDown, TrendingUp, AlertTriangle, Search } from "lucide-react"
import { useStockManagement } from "@/hooks/use-stock-management"
import { useState, useEffect } from "react"

export function StockOverview() {
  const { stockItems, getTotalStock, getLowStockCount, getOutOfStockCount, syncWithProducts } = useStockManagement()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    syncWithProducts()
  }, [syncWithProducts])

  const filteredItems = stockItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variantName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalProducts = stockItems.length
  const totalStockUnits = getTotalStock()
  const lowStockItems = getLowStockCount()
  const outOfStockItems = getOutOfStockCount()

  const stats = [
    {
      title: "Total Variants",
      value: totalProducts,
      icon: Package,
      description: "Product variants tracked",
    },
    {
      title: "Total Stock Units",
      value: totalStockUnits.toLocaleString(),
      icon: TrendingUp,
      description: "Units in inventory",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      icon: AlertTriangle,
      description: "Needs restocking",
      alert: lowStockItems > 0,
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      icon: TrendingDown,
      description: "Unavailable items",
      alert: outOfStockItems > 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.alert ? "text-destructive" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Stock Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Inventory by Variant</CardTitle>
              <CardDescription>Real-time stock levels for each product variant</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Variant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Total Stock</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Available</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Reserved</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.variantName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-xs">{item.sku}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">${item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{item.totalStock}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.available}</td>
                      <td className="px-4 py-3 text-sm text-right text-muted-foreground">{item.reserved}</td>
                      <td className="px-4 py-3 text-center">
                        {item.totalStock === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : item.totalStock <= item.lowStockThreshold ? (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                            In Stock
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No products found matching your search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
