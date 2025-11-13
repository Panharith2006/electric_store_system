"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const productRelations = [
  {
    primary: {
      name: "iPhone 15 Pro Max",
      category: "Smartphones",
      image: "/modern-smartphone.png",
    },
    recommendations: [
      { name: "AirPods Pro 2nd Gen", confidence: 87, purchases: 1089 },
      { name: "MagSafe Charger", confidence: 76, purchases: 945 },
      { name: "iPhone 15 Pro Max Case", confidence: 92, purchases: 1147 },
      { name: "AppleCare+ Protection", confidence: 68, purchases: 847 },
    ],
  },
  {
    primary: {
      name: "MacBook Pro 16-inch M3 Max",
      category: "Laptops",
      image: "/macbook.jpg",
    },
    recommendations: [
      { name: "Magic Mouse", confidence: 72, purchases: 642 },
      { name: "USB-C Hub", confidence: 85, purchases: 758 },
      { name: "Laptop Sleeve", confidence: 79, purchases: 705 },
      { name: "External SSD 1TB", confidence: 64, purchases: 571 },
    ],
  },
  {
    primary: {
      name: "Samsung Galaxy S24 Ultra",
      category: "Smartphones",
      image: "/samsung-products.png",
    },
    recommendations: [
      { name: "Galaxy Buds Pro", confidence: 81, purchases: 882 },
      { name: "Wireless Charger", confidence: 74, purchases: 806 },
      { name: "S Pen Pro", confidence: 69, purchases: 751 },
      { name: "Screen Protector", confidence: 88, purchases: 959 },
    ],
  },
  {
    primary: {
      name: "iPad Pro 12.9-inch M2",
      category: "Tablets",
      image: "/silver-ipad-on-wooden-desk.png",
    },
    recommendations: [
      { name: "Apple Pencil 2nd Gen", confidence: 91, purchases: 689 },
      { name: "Magic Keyboard for iPad", confidence: 78, purchases: 590 },
      { name: "iPad Pro Case", confidence: 84, purchases: 636 },
      { name: "USB-C to HDMI Adapter", confidence: 62, purchases: 469 },
    ],
  },
]

export function ProductRelations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Product Relations</h2>
        <p className="text-sm text-muted-foreground">AI-powered recommendation logic based on purchase patterns</p>
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
            Our recommendation engine analyzes customer purchase patterns to suggest complementary products. The
            confidence score indicates how likely customers are to purchase the recommended item together with the
            primary product.
          </p>
          <div className="flex gap-4 pt-2">
            <Badge variant="secondary">90%+ = Highly Recommended</Badge>
            <Badge variant="secondary">70-89% = Recommended</Badge>
            <Badge variant="secondary">Below 70% = Consider</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {productRelations.map((relation, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <img
                  src={relation.primary.image || "/placeholder.svg"}
                  alt={relation.primary.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <CardTitle>{relation.primary.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mt-1">
                      {relation.primary.category}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Frequently Bought Together:</p>
                {relation.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{rec.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{rec.purchases} co-purchases</span>
                        <Badge
                          variant={rec.confidence >= 90 ? "default" : rec.confidence >= 70 ? "secondary" : "outline"}
                        >
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <Progress value={rec.confidence} className="h-2" />
                  </div>
                ))}
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Product Page Recommendations</p>
                <p className="text-sm text-muted-foreground">
                  Display high-confidence items (90%+) prominently on product pages as "Frequently Bought Together"
                  sections.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Cart Suggestions</p>
                <p className="text-sm text-muted-foreground">
                  Show medium-confidence items (70-89%) in the shopping cart as "You might also need" suggestions.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Bundle Deals</p>
                <p className="text-sm text-muted-foreground">
                  Create discounted bundles using products with high co-purchase rates to increase average order value.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                4
              </div>
              <div className="flex-1">
                <p className="font-medium">Email Marketing</p>
                <p className="text-sm text-muted-foreground">
                  Send personalized recommendations to customers who purchased the primary product but not the
                  accessories.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
