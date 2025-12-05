"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"

type Relation = {
  id: string
  product_a_name: string
  product_a_image?: string
  product_b_name: string
  product_b_image?: string
  times_bought_together: number
  confidence_score: number
}

export function ProductRelations() {
  const { token } = useAuth()
  const [relations, setRelations] = useState<Relation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchRelations = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.getProductRelationsList(token)
        if (!res.error && Array.isArray(res.data)) {
          if (!cancelled) setRelations(res.data as Relation[])
        } else if (!res.error && res.data && Array.isArray((res.data as any).results)) {
          if (!cancelled) setRelations((res.data as any).results)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load relations")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRelations()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Product Relations</h2>
        <p className="text-sm text-muted-foreground">Recommendations from historical purchase data</p>
      </div>

      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Recommendations are derived from historical orders and co-purchase frequency. Confidence score shows
            strength of association.
          </p>
          <div className="flex gap-4 pt-2">
            <Badge variant="secondary">90%+ = Highly Recommended</Badge>
            <Badge variant="secondary">70-89% = Recommended</Badge>
            <Badge variant="secondary">Below 70% = Consider</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {relations.map((rel) => (
          <Card key={rel.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <img src={rel.product_a_image || "/placeholder.svg"} alt={rel.product_a_name} className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <CardTitle>{rel.product_a_name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mt-1">
                      Co-purchases: {rel.times_bought_together}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Frequently Bought Together:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{rel.product_b_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{rel.times_bought_together} co-purchases</span>
                      <Badge variant={rel.confidence_score >= 90 ? "default" : rel.confidence_score >= 70 ? "secondary" : "outline"}>
                        {rel.confidence_score}% confidence
                      </Badge>
                    </div>
                  </div>
                  <Progress value={rel.confidence_score} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Tips</CardTitle>
          <CardDescription>How to use these insights effectively</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">1</div>
              <div className="flex-1">
                <p className="font-medium">Product Page Recommendations</p>
                <p className="text-sm text-muted-foreground">Display high-confidence items (90%+) on product pages as "Frequently Bought Together".</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">2</div>
              <div className="flex-1">
                <p className="font-medium">Cart Suggestions</p>
                <p className="text-sm text-muted-foreground">Show medium-confidence items (70-89%) in the cart as related suggestions.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
