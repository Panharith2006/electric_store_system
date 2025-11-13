"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PricingRule {
  quantity: number
  price: number
}

interface PricingRulesProps {
  rules: PricingRule[]
  onChange: (rules: PricingRule[]) => void
  basePrice: number
}

export function PricingRules({ rules, onChange, basePrice }: PricingRulesProps) {
  const addRule = () => {
    onChange([...rules, { quantity: 1, price: basePrice }])
  }

  const updateRule = (index: number, field: keyof PricingRule, value: number) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], [field]: value }
    onChange(newRules)
  }

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index))
  }

  const calculateDiscount = (rulePrice: number) => {
    if (!basePrice || basePrice === 0) return 0
    return Math.round(((basePrice - rulePrice) / basePrice) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Bulk Pricing & Promotions
        </CardTitle>
        <CardDescription>Set special prices for bulk purchases (e.g., Buy 10 get 20% off)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 10"
                value={rule.quantity}
                onChange={(e) => updateRule(index, "quantity", Number.parseInt(e.target.value))}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Price per Unit ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 80.00"
                value={rule.price}
                onChange={(e) => updateRule(index, "price", Number.parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="w-24 space-y-2">
              <Label>Discount</Label>
              <div className="flex h-10 items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium">
                {calculateDiscount(rule.price)}%
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addRule} className="w-full gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Pricing Rule
        </Button>

        {rules.length > 0 && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Preview:</p>
            {rules.map((rule, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                Buy {rule.quantity}+ units → ${rule.price.toFixed(2)} each ({calculateDiscount(rule.price)}% off)
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
