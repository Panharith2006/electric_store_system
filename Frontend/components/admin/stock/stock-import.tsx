"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Plus, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStockManagement } from "@/hooks/use-stock-management"

export function StockImport() {
  const { toast } = useToast()
  const { addStock } = useStockManagement()
  const [importMethod, setImportMethod] = useState<"manual" | "csv">("manual")
  const [manualEntry, setManualEntry] = useState({
    sku: "",
    quantity: "",
    location: "",
    supplier: "",
    notes: "",
  })

  const handleManualImport = () => {
    if (!manualEntry.sku || !manualEntry.quantity || !manualEntry.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    addStock(manualEntry.sku, Number.parseInt(manualEntry.quantity), manualEntry.location)

    toast({
      title: "Stock Added Successfully",
      description: `Added ${manualEntry.quantity} units to ${manualEntry.sku}`,
    })

    setManualEntry({
      sku: "",
      quantity: "",
      location: "",
      supplier: "",
      notes: "",
    })
  }

  const handleCSVImport = () => {
    toast({
      title: "CSV Import",
      description: "CSV import functionality will be implemented with backend integration",
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Manual Import */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <CardTitle>Manual Stock Entry</CardTitle>
          </div>
          <CardDescription>Add stock manually for individual products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku">Product SKU *</Label>
            <Input
              id="sku"
              placeholder="e.g., IPHONE-15-PRO-256GB"
              value={manualEntry.sku}
              onChange={(e) => setManualEntry({ ...manualEntry, sku: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={manualEntry.quantity}
              onChange={(e) => setManualEntry({ ...manualEntry, quantity: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select
              value={manualEntry.location}
              onValueChange={(value) => setManualEntry({ ...manualEntry, location: value })}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-warehouse">Main Warehouse</SelectItem>
                <SelectItem value="store-downtown">Store - Downtown</SelectItem>
                <SelectItem value="store-mall">Store - Shopping Mall</SelectItem>
                <SelectItem value="store-airport">Store - Airport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input
              id="supplier"
              placeholder="Supplier name"
              value={manualEntry.supplier}
              onChange={(e) => setManualEntry({ ...manualEntry, supplier: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={manualEntry.notes}
              onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button onClick={handleManualImport} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </CardContent>
      </Card>

      {/* CSV Import */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <CardTitle>Bulk Import from CSV</CardTitle>
          </div>
          <CardDescription>Import multiple stock entries from a CSV file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </div>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>

          <div className="space-y-2">
            <Label>CSV Format Requirements</Label>
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
              <p>Required columns:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>SKU</li>
                <li>Quantity</li>
                <li>Location</li>
              </ul>
              <p className="mt-2">Optional columns:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Supplier</li>
                <li>Notes</li>
                <li>Date</li>
              </ul>
            </div>
          </div>

          <Button onClick={handleCSVImport} className="w-full" variant="secondary">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
