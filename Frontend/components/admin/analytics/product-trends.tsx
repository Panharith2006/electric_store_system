"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const productTrendsData = {
  smartphones: {
    name: "Smartphones",
    trend: "up",
    change: 15.3,
    data: [
      { year: "2022 Q1", sales: 2500 },
      { year: "2022 Q2", sales: 2800 },
      { year: "2022 Q3", sales: 3200 },
      { year: "2022 Q4", sales: 3800 },
      { year: "2023 Q1", sales: 3500 },
      { year: "2023 Q2", sales: 4100 },
      { year: "2023 Q3", sales: 4600 },
      { year: "2023 Q4", sales: 5200 },
      { year: "2024 Q1", sales: 4900 },
      { year: "2024 Q2", sales: 5800 },
      { year: "2024 Q3", sales: 6200 },
      { year: "2024 Q4", sales: 6800 },
    ],
  },
  laptops: {
    name: "Laptops",
    trend: "up",
    change: 8.7,
    data: [
      { year: "2022 Q1", sales: 1800 },
      { year: "2022 Q2", sales: 1900 },
      { year: "2022 Q3", sales: 2100 },
      { year: "2022 Q4", sales: 2400 },
      { year: "2023 Q1", sales: 2200 },
      { year: "2023 Q2", sales: 2500 },
      { year: "2023 Q3", sales: 2700 },
      { year: "2023 Q4", sales: 3000 },
      { year: "2024 Q1", sales: 2800 },
      { year: "2024 Q2", sales: 3200 },
      { year: "2024 Q3", sales: 3400 },
      { year: "2024 Q4", sales: 3600 },
    ],
  },
  tablets: {
    name: "Tablets",
    trend: "stable",
    change: 2.1,
    data: [
      { year: "2022 Q1", sales: 1200 },
      { year: "2022 Q2", sales: 1250 },
      { year: "2022 Q3", sales: 1180 },
      { year: "2022 Q4", sales: 1320 },
      { year: "2023 Q1", sales: 1280 },
      { year: "2023 Q2", sales: 1350 },
      { year: "2023 Q3", sales: 1290 },
      { year: "2023 Q4", sales: 1400 },
      { year: "2024 Q1", sales: 1360 },
      { year: "2024 Q2", sales: 1420 },
      { year: "2024 Q3", sales: 1380 },
      { year: "2024 Q4", sales: 1450 },
    ],
  },
  headphones: {
    name: "Headphones",
    trend: "down",
    change: -5.2,
    data: [
      { year: "2022 Q1", sales: 3200 },
      { year: "2022 Q2", sales: 3400 },
      { year: "2022 Q3", sales: 3600 },
      { year: "2022 Q4", sales: 3800 },
      { year: "2023 Q1", sales: 3500 },
      { year: "2023 Q2", sales: 3300 },
      { year: "2023 Q3", sales: 3100 },
      { year: "2023 Q4", sales: 3000 },
      { year: "2024 Q1", sales: 2900 },
      { year: "2024 Q2", sales: 2800 },
      { year: "2024 Q3", sales: 2700 },
      { year: "2024 Q4", sales: 2600 },
    ],
  },
}

export function ProductTrends() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof productTrendsData>("smartphones")

  const categoryData = productTrendsData[selectedCategory]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-yellow-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Trends (3 Years)</h2>
          <p className="text-sm text-muted-foreground">Track product category performance over time</p>
        </div>
        <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(productTrendsData).map(([key, data]) => (
              <SelectItem key={key} value={key}>
                {data.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(productTrendsData).map(([key, data]) => (
          <Card key={key} className={selectedCategory === key ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{data.name}</CardTitle>
              {getTrendIcon(data.trend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(data.trend)}`}>
                {data.change > 0 ? "+" : ""}
                {data.change}%
              </div>
              <p className="text-xs text-muted-foreground capitalize">{data.trend} trend</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{categoryData.name} - 3 Year Trend</CardTitle>
          <CardDescription>Quarterly sales performance from 2022 to 2024</CardDescription>
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
              <LineChart data={categoryData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} name="Units Sold" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>Key insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.trend === "up" && (
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Strong Growth Trajectory</p>
                    <p className="text-sm text-muted-foreground">
                      {categoryData.name} showing consistent growth of {categoryData.change}% over the past 3 years.
                      Consider increasing inventory and marketing budget.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Recommendation</p>
                    <p className="text-sm text-muted-foreground">
                      Stock up on popular models and consider expanding product variants to capitalize on growing
                      demand.
                    </p>
                  </div>
                </div>
              </>
            )}
            {categoryData.trend === "down" && (
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Declining Sales</p>
                    <p className="text-sm text-muted-foreground">
                      {categoryData.name} experiencing a {Math.abs(categoryData.change)}% decline. Immediate action
                      required to reverse the trend.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/20">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Action Required</p>
                    <p className="text-sm text-muted-foreground">
                      Consider promotional campaigns, bundle deals, or product refresh to stimulate demand. Review
                      pricing strategy.
                    </p>
                  </div>
                </div>
              </>
            )}
            {categoryData.trend === "stable" && (
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
                    <Minus className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Stable Performance</p>
                    <p className="text-sm text-muted-foreground">
                      {categoryData.name} maintaining steady sales with {categoryData.change}% change. Market is mature
                      and predictable.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Explore innovation opportunities or new product lines to drive growth in this stable category.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
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
