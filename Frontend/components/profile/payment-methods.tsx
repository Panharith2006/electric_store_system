"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Plus, Trash2 } from "lucide-react"

interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "bank"
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: "2",
      type: "card",
      last4: "5555",
      brand: "Mastercard",
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
  ])

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id))
    console.log("[v0] Deleted payment method:", id)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {method.brand} •••• {method.last4}
                  </span>
                  {method.isDefault && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires {method.expiryMonth}/{method.expiryYear}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)} disabled={method.isDefault}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <CreditCard className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-1 text-sm font-medium text-foreground">No payment methods yet</p>
          <p className="text-xs text-muted-foreground">Add a payment method to make checkout faster</p>
        </div>
      </CardContent>
    </Card>
  )
}
