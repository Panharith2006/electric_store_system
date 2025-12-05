"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStockManagement } from "@/hooks/use-stock-management"
import { useAuth } from "@/contexts/auth-context"

export function StockImport() {
  const { toast } = useToast()
  const { fetchStock, adjustStock, stockItems } = useStockManagement() as any
  const { token } = useAuth()
  const [manualEntry, setManualEntry] = useState({ sku: "", quantity: ""})
  const [loading, setLoading] = useState(false)

  const handleManualImport = async () => {
    if (!manualEntry.sku || !manualEntry.quantity) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    if (!token) {
      toast({ title: "Authentication required", description: "Please sign in as admin to perform this action", variant: "destructive" })
      return
    }

    const qty = Number.parseInt(manualEntry.quantity)
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "Invalid quantity", description: "Enter a positive integer", variant: "destructive" })
      return
    }

    // Find stock record by SKU
    const stockRecord = stockItems.find((s: any) => s.sku === manualEntry.sku)
    if (!stockRecord) {
      toast({ title: "SKU not found", description: `Could not find stock record for SKU ${manualEntry.sku}`, variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await adjustStock(stockRecord.id, qty, `Manual import by admin (${manualEntry.supplier || 'unknown'})`, token)
      toast({ title: "Stock Added Successfully", description: `Added ${qty} units to ${manualEntry.sku}` })
      setManualEntry({ sku: "", quantity: "", supplier: "", notes: "" })
      // Refresh stock
      await fetchStock(token)
    } catch (e) {
      toast({ title: "Import failed", description: "Could not add stock, see console for details", variant: "destructive" })
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <CardTitle>Manual Stock Entry</CardTitle>
          </div>
          <CardDescription>Add stock manually for individual product variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku">Product SKU *</Label>
            <Input id="sku" placeholder="e.g., IPHONE-15-PRO-256GB" value={manualEntry.sku} onChange={(e) => setManualEntry({ ...manualEntry, sku: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" type="number" min="1" placeholder="Enter quantity" value={manualEntry.quantity} onChange={(e) => setManualEntry({ ...manualEntry, quantity: e.target.value })} />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input id="supplier" placeholder="Supplier name" value={manualEntry.supplier} onChange={(e) => setManualEntry({ ...manualEntry, supplier: e.target.value })} />
          </div> */}

          {/* <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Additional notes..." value={manualEntry.notes} onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })} rows={3} />
          </div> */}

          <Button onClick={handleManualImport} className="w-full" disabled={loading}>
            Add Stock
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
