"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"

type TrendItem = {
  id: string
  product: string
  product_name: string
  year?: number
  month?: number
  period_label?: string
  total_units_sold?: number
  total_revenue?: number
}

export function ProductTrends() {
  const { token } = useAuth()
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchTrends = async () => {
      if (!token) return
      try {
        const res = await apiClient.getProductTrendsList(token)
        if (!res.error && Array.isArray(res.data)) {
          if (!cancelled) setTrends(res.data as TrendItem[])
        } else if (!res.error && res.data && Array.isArray((res.data as any).results)) {
          if (!cancelled) setTrends((res.data as any).results)
        }
      } catch (e) {
        // ignore for now
      }
    }

    fetchTrends()
    return () => {
      cancelled = true
    }
  }, [token])

  const productNames = Array.from(new Set(trends.map((t) => t.product_name).filter(Boolean)))
  useEffect(() => {
    if (!selectedProduct && productNames.length > 0) setSelectedProduct(productNames[0])
  }, [productNames, selectedProduct])

  const selectedData = trends.filter((t) => t.product_name === selectedProduct).map((t) => ({ period: t.period_label || `${t.year || ''}-${t.month || ''}`, sales: t.total_units_sold || 0 }))

  const getTrendDirection = (arr: TrendItem[]) => {
    if (arr.length < 2) return 'stable'
    const first = arr[0].total_units_sold || 0
    const last = arr[arr.length - 1].total_units_sold || 0
    if (last > first) return 'up'
    if (last < first) return 'down'
    return 'stable'
  }

  const trendSummary = (name: string) => {
    const items = trends.filter((t) => t.product_name === name).sort((a, b) => (a.period_label || '').localeCompare(b.period_label || ''))
    const direction = getTrendDirection(items)
    const change = items.length >= 2 ? (((items[items.length - 1].total_units_sold || 0) - (items[0].total_units_sold || 0)) / Math.max(1, items[0].total_units_sold || 1)) * 100 : 0
    return { direction, change: Math.round(change * 10) / 10 }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Trends (3 Years)</h2>
          <p className="text-sm text-muted-foreground">Track product performance over time</p>
        </div>
        <Select value={selectedProduct ?? undefined} onValueChange={(v: any) => setSelectedProduct(v)}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {productNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {productNames.map((name) => {
          const s = trendSummary(name)
          return (
            <Card key={name} className={selectedProduct === name ? 'border-primary' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{name}</CardTitle>
                {getTrendIcon(s.direction)}
              </CardHeader>
              <CardContent>
                <div className={`${s.direction === 'up' ? 'text-green-600' : s.direction === 'down' ? 'text-red-600' : 'text-yellow-600'} text-2xl font-bold`}>{s.change}%</div>
                <p className="text-xs text-muted-foreground">Trend over selected period</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedProduct ?? 'Product'} - Trend</CardTitle>
          <CardDescription>Sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ sales: { label: 'Sales', color: 'hsl(var(--chart-1))' } }} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} name="Units Sold" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function AlertTriangle({ className }: { className?: string }) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function Lightbulb({ className }: { className?: string }) {
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
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
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
