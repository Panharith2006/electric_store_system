"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesReports } from "./sales-reports"
import { BranchReports } from "./branch-reports"

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View sales and branch performance reports</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          {/* <TabsTrigger value="branch">Branch Reports</TabsTrigger> */}
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <SalesReports />
        </TabsContent>

        <TabsContent value="branch" className="space-y-6">
          <BranchReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
