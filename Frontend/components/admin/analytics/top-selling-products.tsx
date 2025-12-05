"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, DollarSign, Package } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"

type TopProduct = {
  product__name: string
  total_sold: number
  total_revenue: number
}

export function TopSellingProducts() {
  const { token } = useAuth()
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchTop = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.getTopSellingProducts(token)
        if (!res.error && Array.isArray(res.data)) {
          if (!cancelled) setTopProducts(res.data as TopProduct[])
        } else if (!res.error && res.data && Array.isArray((res.data as any).results)) {
          if (!cancelled) setTopProducts((res.data as any).results)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load top sellers")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTop()
    return () => {
      cancelled = true
    }
  }, [token])

  const chartData = topProducts.map((p) => ({ name: String(p.product__name).split(" ").slice(0, 2).join(" "), units: p.total_sold || 0, revenue: (p.total_revenue || 0) / 1000 }))

  const totalRevenue = topProducts.reduce((sum, p) => sum + (p.total_revenue || 0), 0)
  const totalUnits = topProducts.reduce((sum, p) => sum + (p.total_sold || 0), 0)

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
            <p className="text-xs text-muted-foreground">From top products</p>
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
            <div className="text-2xl font-bold">—</div>
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
              <div key={`${product.product__name}-${index}`} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
                  #{index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{product.product__name}</p>
                    <Badge variant="secondary">—</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{(product.total_sold || 0).toLocaleString()} units sold</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${((product.total_revenue || 0) / 1000).toFixed(0)}K</p>
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
