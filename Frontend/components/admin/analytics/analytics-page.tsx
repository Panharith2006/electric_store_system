"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopSellingProducts } from "./top-selling-products"
import { ProductTrends } from "./product-trends"
import { ProductRelations } from "./product-relations"
import { LowSellingAnalysis } from "./low-selling-analysis"

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Insights and trends for data-driven decisions</p>
      </div>

      <Tabs defaultValue="top-selling" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="top-selling">Top Selling</TabsTrigger>
          <TabsTrigger value="trends">Product Trends</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="low-selling">Low Selling</TabsTrigger>
        </TabsList>

        <TabsContent value="top-selling" className="space-y-6">
          <TopSellingProducts />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <ProductTrends />
        </TabsContent>

        <TabsContent value="relations" className="space-y-6">
          <ProductRelations />
        </TabsContent>

        <TabsContent value="low-selling" className="space-y-6">
          <LowSellingAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}
