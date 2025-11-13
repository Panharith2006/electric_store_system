"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin } from "lucide-react"
import { useStockManagement } from "@/hooks/use-stock-management"

export function StockLocations() {
  const { getStockByLocation } = useStockManagement()

  const locations = [
    {
      id: "main-warehouse",
      name: "Main Warehouse",
      address: "123 Industrial Blvd, City Center",
      type: "Warehouse",
      capacity: 50000,
    },
    {
      id: "store-downtown",
      name: "Downtown Store",
      address: "456 Main Street, Downtown",
      type: "Retail Store",
      capacity: 5000,
    },
    {
      id: "store-mall",
      name: "Shopping Mall Store",
      address: "789 Mall Avenue, Shopping District",
      type: "Retail Store",
      capacity: 3000,
    },
    {
      id: "store-airport",
      name: "Airport Store",
      address: "Airport Terminal 2, Gate B",
      type: "Retail Store",
      capacity: 2000,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {locations.map((location) => {
          const stockData = getStockByLocation(location.id)
          const utilizationPercent = ((stockData.totalUnits / location.capacity) * 100).toFixed(1)

          return (
            <Card key={location.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{location.type}</Badge>
                </div>
                <CardTitle className="text-base mt-3">{location.name}</CardTitle>
                <CardDescription className="flex items-start gap-1 text-xs">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {location.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Units</span>
                    <span className="font-semibold">{stockData.totalUnits.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Products</span>
                    <span className="font-semibold">{stockData.productCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-semibold">{utilizationPercent}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(Number.parseFloat(utilizationPercent), 100)}%` }}
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Details
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Stock by Location */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Distribution by Location</CardTitle>
          <CardDescription>Detailed breakdown of inventory across all locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.map((location) => {
              const stockData = getStockByLocation(location.id)
              return (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{location.name}</h4>
                        <p className="text-sm text-muted-foreground">{location.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stockData.totalUnits.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Units</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Products</p>
                      <p className="text-lg font-semibold">{stockData.productCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                      <p className="text-lg font-semibold text-yellow-600">{stockData.lowStock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                      <p className="text-lg font-semibold text-destructive">{stockData.outOfStock}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
