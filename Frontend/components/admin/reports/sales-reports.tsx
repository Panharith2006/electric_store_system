"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react"
import { useOrders } from "@/hooks/use-orders"
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns"

export function SalesReports() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const { orders } = useOrders()

  const reportData = useMemo(() => {
    const now = new Date()
    const data: any[] = []

    if (period === "daily") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)

        const dayOrders = orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate >= dayStart && orderDate <= dayEnd
        })

        data.push({
          date: format(date, "EEE"),
          sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
          orders: dayOrders.length,
          items: dayOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0),
        })
      }
    } else if (period === "weekly") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subDays(now, i * 7))
        const weekEnd = endOfWeek(subDays(now, i * 7))

        const weekOrders = orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate >= weekStart && orderDate <= weekEnd
        })

        data.push({
          week: `Week ${4 - i}`,
          sales: weekOrders.reduce((sum, order) => sum + order.total, 0),
          orders: weekOrders.length,
          items: weekOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0),
        })
      }
    } else if (period === "monthly") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStart = startOfMonth(monthDate)
        const monthEnd = endOfMonth(monthDate)

        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate >= monthStart && orderDate <= monthEnd
        })

        data.push({
          month: format(monthDate, "MMM"),
          sales: monthOrders.reduce((sum, order) => sum + order.total, 0),
          orders: monthOrders.length,
          items: monthOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0),
        })
      }
    } else {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const yearDate = new Date(now.getFullYear() - i, 0, 1)
        const yearStart = startOfYear(yearDate)
        const yearEnd = endOfYear(yearDate)

        const yearOrders = orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate >= yearStart && orderDate <= yearEnd
        })

        data.push({
          year: yearDate.getFullYear().toString(),
          sales: yearOrders.reduce((sum, order) => sum + order.total, 0),
          orders: yearOrders.length,
          items: yearOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0),
        })
      }
    }

    return data
  }, [period, orders])

  const getXAxisKey = () => {
    switch (period) {
      case "daily":
        return "date"
      case "weekly":
        return "week"
      case "monthly":
        return "month"
      case "yearly":
        return "year"
    }
  }

  const totalSales = reportData.reduce((sum, item) => sum + item.sales, 0)
  const totalOrders = reportData.reduce((sum, item) => sum + item.orders, 0)
  const totalItems = reportData.reduce((sum, item) => sum + item.items, 0)
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Reports</h2>
          <p className="text-sm text-muted-foreground">Real-time sales performance from actual orders</p>
        </div>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily (Last 7 days)</SelectItem>
            <SelectItem value="weekly">Weekly (Last 4 weeks)</SelectItem>
            <SelectItem value="monthly">Monthly (Last 6 months)</SelectItem>
            <SelectItem value="yearly">Yearly (Last 3 years)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {period === "daily"
                ? "Last 7 days"
                : period === "weekly"
                  ? "Last 4 weeks"
                  : period === "monthly"
                    ? "Last 6 months"
                    : "Last 3 years"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Orders completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Revenue trends from actual order data</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisKey()} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} name="Sales ($)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders & Items</CardTitle>
          <CardDescription>Order count and items sold from real data</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              orders: {
                label: "Orders",
                color: "hsl(var(--chart-2))",
              },
              items: {
                label: "Items",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisKey()} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="orders" fill="var(--color-orders)" name="Orders" />
                <Bar dataKey="items" fill="var(--color-items)" name="Items Sold" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
