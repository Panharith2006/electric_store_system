"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Building2, DollarSign, Package, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const branchData = {
  "main-warehouse": {
    name: "Main Warehouse",
    sales: 2450000,
    orders: 8950,
    stock: 12450,
    revenue: [
      { month: "Jan", sales: 385000 },
      { month: "Feb", sales: 410000 },
      { month: "Mar", sales: 425000 },
      { month: "Apr", sales: 398000 },
      { month: "May", sales: 432000 },
      { month: "Jun", sales: 400000 },
    ],
  },
  "store-downtown": {
    name: "Downtown Store",
    sales: 1850000,
    orders: 6780,
    stock: 3250,
    revenue: [
      { month: "Jan", sales: 295000 },
      { month: "Feb", sales: 310000 },
      { month: "Mar", sales: 325000 },
      { month: "Apr", sales: 298000 },
      { month: "May", sales: 322000 },
      { month: "Jun", sales: 300000 },
    ],
  },
  "store-mall": {
    name: "Mall Store",
    sales: 1620000,
    orders: 5920,
    stock: 2180,
    revenue: [
      { month: "Jan", sales: 255000 },
      { month: "Feb", sales: 270000 },
      { month: "Mar", sales: 285000 },
      { month: "Apr", sales: 268000 },
      { month: "May", sales: 282000 },
      { month: "Jun", sales: 260000 },
    ],
  },
  "store-airport": {
    name: "Airport Store",
    sales: 980000,
    orders: 3580,
    stock: 1450,
    revenue: [
      { month: "Jan", sales: 155000 },
      { month: "Feb", sales: 165000 },
      { month: "Mar", sales: 172000 },
      { month: "Apr", sales: 158000 },
      { month: "May", sales: 168000 },
      { month: "Jun", sales: 162000 },
    ],
  },
}

export function BranchReports() {
  const [selectedBranch, setSelectedBranch] = useState<keyof typeof branchData>("main-warehouse")

  const branch = branchData[selectedBranch]
  const avgOrderValue = branch.sales / branch.orders

  const allBranches = Object.entries(branchData).map(([id, data]) => ({
    name: data.name,
    sales: data.sales,
    orders: data.orders,
    stock: data.stock,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Branch Reports</h2>
          <p className="text-sm text-muted-foreground">View performance by location</p>
        </div>
        <Select value={selectedBranch} onValueChange={(value: any) => setSelectedBranch(value)}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(branchData).map(([id, data]) => (
              <SelectItem key={id} value={id}>
                {data.name}
              </SelectItem>
            ))}
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
            <div className="text-2xl font-bold">${branch.sales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branch.orders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branch.stock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
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
          <CardTitle>{branch.name} - Monthly Revenue</CardTitle>
          <CardDescription>Sales performance over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branch.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" name="Sales ($)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Branches Comparison</CardTitle>
          <CardDescription>Compare performance across all locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allBranches.map((branch, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{branch.name}</p>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{branch.orders.toLocaleString()} orders</span>
                    <span>{branch.stock.toLocaleString()} units</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${(branch.sales / 1000).toFixed(0)}K</p>
                  <Badge variant="secondary" className="mt-1">
                    ${(branch.sales / branch.orders).toFixed(2)} avg
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
