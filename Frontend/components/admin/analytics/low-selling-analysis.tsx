"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingDown, Tag, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"

type LowProduct = {
  id: string
  product_name: string
  units_sold: number
  revenue: number
  variant_details?: any
}

export function LowSellingAnalysis() {
  const { token } = useAuth()
  const [items, setItems] = useState<LowProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchLow = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.getLowSellingProducts(token)
        if (!res.error && Array.isArray(res.data)) {
          if (!cancelled) setItems(res.data as LowProduct[])
        } else if (!res.error && res.data && Array.isArray((res.data as any).results)) {
          if (!cancelled) setItems((res.data as any).results)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load low selling products")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLow()
    return () => {
      cancelled = true
    }
  }, [token])

  const criticalCount = items.filter((i) => (i.units_sold || 0) < 10).length
  const warningCount = items.length - criticalCount
  const totalStock = 0
  const totalValue = items.reduce((sum, p) => sum + ((p.revenue || 0)), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Low Selling Product Analysis</h2>
        <p className="text-sm text-muted-foreground">Identify underperforming products and take action</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Products</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Products</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excess Stock</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Units to clear</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tied Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">In slow-moving inventory</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {items.map((p) => (
          <Card key={p.id} className={"border-yellow-200"}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{p.product_name}</CardTitle>
                      <Badge variant={"outline"}>{/* category placeholder */}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{p.units_sold} units sold</span>
                      <span>{/* stock not provided */}— in stock</span>
                      <span>{/* daysInStock */}— days in inventory</span>
                      <span>{/* lastSale */}—</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${Math.round((p.revenue || 0) / (p.units_sold || 1))}</p>
                  <p className="text-sm text-muted-foreground">Avg price</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sales Performance</span>
                  <span className="font-medium">{(((p.units_sold || 0) / Math.max(1, 100)) * 100).toFixed(1)}% sold</span>
                </div>
                <Progress value={(((p.units_sold || 0) / Math.max(1, 100)) * 100)} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recommended Actions:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    Consider Promotion
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    Price Reduction
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Tag className="h-4 w-4" />
                  Create Promotion
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <TrendingDown className="h-4 w-4" />
                  Reduce Price
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="h-4 w-4" />
                  Discontinue
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
