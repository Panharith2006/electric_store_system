"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, DollarSign, Package } from "lucide-react"

const topProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    category: "Smartphones",
    unitsSold: 1245,
    revenue: 1493750,
    growth: 23.5,
    image: "/modern-smartphone.png",
  },
  {
    id: 2,
    name: "MacBook Pro 16-inch M3 Max",
    category: "Laptops",
    unitsSold: 892,
    revenue: 2497600,
    growth: 18.2,
    image: "/macbook.jpg",
  },
  {
    id: 3,
    name: "Samsung Galaxy S24 Ultra",
    category: "Smartphones",
    unitsSold: 1089,
    revenue: 1197900,
    growth: 15.8,
    image: "/samsung-products.png",
  },
  {
    id: 4,
    name: "iPad Pro 12.9-inch M2",
    category: "Tablets",
    unitsSold: 756,
    revenue: 982800,
    growth: 12.4,
    image: "/silver-ipad-on-wooden-desk.png",
  },
  {
    id: 5,
    name: "AirPods Pro 2nd Gen",
    category: "Audio",
    unitsSold: 2134,
    revenue: 533500,
    growth: 28.9,
    image: "/generic-wireless-earbuds.png",
  },
]

const chartData = topProducts.map((product) => ({
  name: product.name.split(" ").slice(0, 2).join(" "),
  units: product.unitsSold,
  revenue: product.revenue / 1000,
}))

export function TopSellingProducts() {
  const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0)
  const totalUnits = topProducts.reduce((sum, p) => sum + p.unitsSold, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Top Selling Products</h2>
        <p className="text-sm text-muted-foreground">Best performing products by revenue and units sold</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">From top 5 products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(topProducts.reduce((sum, p) => sum + p.growth, 0) / topProducts.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Units Sold</CardTitle>
          <CardDescription>Comparison of top products performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              units: {
                label: "Units Sold",
                color: "hsl(var(--chart-1))",
              },
              revenue: {
                label: "Revenue (K)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="units" fill="var(--color-units)" name="Units Sold" />
                <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" name="Revenue ($K)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Rankings</CardTitle>
          <CardDescription>Detailed breakdown of top performing products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
                  #{index + 1}
                </div>
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{product.name}</p>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{product.unitsSold.toLocaleString()} units sold</span>
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      {product.growth}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${(product.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
