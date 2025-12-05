"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockOverview } from "./stock/stock-overview"
import { StockImport } from "./stock/stock-import"
import { StockAlerts } from "./stock/stock-alerts"

export function StockManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage inventory levels, track stock movements, and receive low stock alerts
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StockOverview />
        </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <StockImport />
          </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <StockAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
