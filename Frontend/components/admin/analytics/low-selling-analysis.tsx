"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingDown, Tag, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const lowSellingProducts = [
  {
    id: 1,
    name: "Sony WH-1000XM5",
    category: "Headphones",
    unitsSold: 23,
    stock: 145,
    daysInStock: 89,
    lastSale: "12 days ago",
    price: 399,
    status: "critical",
    image: "/sony-headphones.png",
    recommendations: ["Price reduction", "Bundle deal", "Clearance sale"],
  },
  {
    id: 2,
    name: "Dell XPS 15",
    category: "Laptops",
    unitsSold: 34,
    stock: 67,
    daysInStock: 72,
    lastSale: "8 days ago",
    price: 1899,
    status: "warning",
    image: "/dell-laptop.png",
    recommendations: ["Marketing campaign", "Student discount", "Trade-in program"],
  },
  {
    id: 3,
    name: "Google Pixel Watch 2",
    category: "Wearables",
    unitsSold: 18,
    stock: 98,
    daysInStock: 95,
    lastSale: "15 days ago",
    price: 349,
    status: "critical",
    image: "/pixel-watch.jpg",
    recommendations: ["Discontinue", "Deep discount", "Bundle with Pixel phone"],
  },
  {
    id: 4,
    name: "Microsoft Surface Go 3",
    category: "Tablets",
    unitsSold: 41,
    stock: 82,
    daysInStock: 68,
    lastSale: "6 days ago",
    price: 549,
    status: "warning",
    image: "/surface-tablet.jpg",
    recommendations: ["Business promotion", "Education discount", "Accessory bundle"],
  },
  {
    id: 5,
    name: "Bose QuietComfort Earbuds II",
    category: "Audio",
    unitsSold: 29,
    stock: 124,
    daysInStock: 81,
    lastSale: "10 days ago",
    price: 299,
    status: "warning",
    image: "/bose-earbuds.jpg",
    recommendations: ["Flash sale", "Influencer partnership", "Gift promotion"],
  },
]

export function LowSellingAnalysis() {
  const criticalCount = lowSellingProducts.filter((p) => p.status === "critical").length
  const warningCount = lowSellingProducts.filter((p) => p.status === "warning").length
  const totalStock = lowSellingProducts.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = lowSellingProducts.reduce((sum, p) => sum + p.stock * p.price, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Low Selling Product Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Identify underperforming products and take action to improve sales or clear inventory
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Products</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Products</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excess Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Units to clear</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tied Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">In slow-moving inventory</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
            <AlertTriangle className="h-5 w-5" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-red-800 dark:text-red-200">
          <p>
            You have {criticalCount} products with critically low sales performance. These items have been in stock for
            over 80 days with minimal movement. Consider implementing promotional strategies or discontinuing these
            products to free up capital and warehouse space.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {lowSellingProducts.map((product) => (
          <Card key={product.id} className={product.status === "critical" ? "border-red-200" : "border-yellow-200"}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant={product.status === "critical" ? "destructive" : "secondary"}>
                        {product.status === "critical" ? "Critical" : "Warning"}
                      </Badge>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{product.unitsSold} units sold</span>
                      <span>{product.stock} in stock</span>
                      <span>{product.daysInStock} days in inventory</span>
                      <span>Last sale: {product.lastSale}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${product.price}</p>
                  <p className="text-sm text-muted-foreground">Current price</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sales Performance</span>
                  <span className="font-medium">{((product.unitsSold / product.stock) * 100).toFixed(1)}% sold</span>
                </div>
                <Progress value={(product.unitsSold / product.stock) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recommended Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {product.recommendations.map((rec, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {rec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Tag className="h-4 w-4" />
                  Create Promotion
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <TrendingDown className="h-4 w-4" />
                  Reduce Price
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="h-4 w-4" />
                  Discontinue
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strategies to Improve Low-Selling Products</CardTitle>
          <CardDescription>Proven tactics to boost sales or clear inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Promotional Strategies</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Flash sales (24-48 hour limited offers)</li>
                <li>• Bundle deals with popular products</li>
                <li>• Buy-one-get-one promotions</li>
                <li>• Seasonal clearance events</li>
                <li>• Email marketing to targeted segments</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Inventory Management</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Return to supplier if possible</li>
                <li>• Liquidation to third-party buyers</li>
                <li>• Donate for tax benefits</li>
                <li>• Transfer to better-performing locations</li>
                <li>• Discontinue and focus on winners</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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

function DollarSign({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
