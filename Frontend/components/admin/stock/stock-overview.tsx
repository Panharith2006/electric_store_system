"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Package, TrendingDown, TrendingUp, AlertTriangle, Search, Plus, Minus, RefreshCw } from "lucide-react"
import { useStockManagement } from "@/hooks/use-stock-management"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function StockOverview() {
  const { stockItems, loading, fetchStock, adjustStock, getTotalStock, getLowStockCount, getOutOfStockCount } = useStockManagement()
  const { applyLocalAdjustment } = useStockManagement()
  const { token } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [adjusting, setAdjusting] = useState<string | null>(null)

  useEffect(() => {
    // Fetch stock for all users; admin token enables write actions
    fetchStock(token ?? undefined)
  }, [token, fetchStock])

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
    // {
    //   title: "Total Variants",
    //   value: totalProducts,
    //   icon: Package,
    //   description: "Product variants tracked",
    // },
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchStock(token ?? undefined)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Product / Variant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Total Stock</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Available</th>
                    {/* Commented out Reserved column per request. Keep data logic intact in hooks. */}
                    {/* <th className="px-4 py-3 text-right text-sm font-medium">Reserved</th> */}
                    <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item: any) => {
                    const handleAdjust = async (adj: number) => {
                      if (!token) {
                        toast({ title: "Authentication required", variant: "destructive" })
                        return
                      }

                      // If attempting to remove more than available, cap adjustment
                      let adjToUse = adj
                      if (adj < 0) {
                        const available = Number(item.totalStock ?? 0)
                        const removing = Math.abs(adj)
                        const actualRemove = Math.min(removing, available)
                        adjToUse = -actualRemove
                      }

                      // Optimistic UI update
                      applyLocalAdjustment(item.id, adjToUse)
                      setAdjusting(item.id)

                      try {
                        await adjustStock(item.id, adjToUse, adjToUse > 0 ? 'Stock added' : 'Stock removed', token)
                        toast({ title: "Stock updated", description: `${adjToUse > 0 ? 'Added' : 'Removed'} ${Math.abs(adjToUse)} units` })
                      } catch (err) {
                        toast({ title: 'Failed to update stock', variant: 'destructive', description: String(err) })
                        await fetchStock(token ?? undefined)
                      } finally {
                        setAdjusting(null)
                      }
                    }

                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <img src={item.thumbnail || '/placeholder.svg'} alt={item.variantName} className="h-10 w-10 object-cover rounded-md" />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{item.productName} — {item.variantName}</td>
                        <td className="px-4 py-3 text-sm font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">${Number(item.price ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">{item.totalStock}</td>
                        <td className="px-4 py-3 text-sm text-right">{item.available}</td>
                        {/* Reserved column hidden in UI per request. */}
                        {/* <td className="px-4 py-3 text-sm text-right text-muted-foreground">{item.reserved}</td> */}
                        <td className="px-4 py-3 text-center">
                          {/* If this is a synthesized entry (no Stock row) show "No stock yet" */}
                          {String(item.id).startsWith('synthetic-') ? (
                            <Badge variant="outline">No stock yet</Badge>
                          ) : item.totalStock === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : item.totalStock <= item.lowStockThreshold ? (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Low Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">In Stock</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleAdjust(5)}
                              disabled={adjusting === item.id}
                            >
                              <Plus className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleAdjust(-5)}
                              disabled={adjusting === item.id || item.totalStock === 0}
                            >
                              <Minus className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
