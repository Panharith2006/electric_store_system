import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import type { Order } from "@/hooks/use-orders"
import { cn } from "@/lib/utils"

interface OrderTrackingProps {
  order: Order
}

export function OrderTracking({ order }: OrderTrackingProps) {
  const steps = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "processing", label: "Processing", icon: Package },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: CheckCircle },
  ]

  const currentStepIndex = steps.findIndex((step) => step.status === order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Tracking</CardTitle>
        {order.trackingNumber && (
          <p className="text-sm text-muted-foreground">Tracking Number: {order.trackingNumber}</p>
        )}
        {order.estimatedDelivery && (
          <p className="text-sm text-muted-foreground">
            Estimated Delivery: {format(new Date(order.estimatedDelivery), "MMMM d, yyyy")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <XCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Order Cancelled</p>
              <p className="text-sm text-muted-foreground">This order has been cancelled</p>
            </div>
          </div>
        ) : (
          <div className="relative space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn("absolute left-5 top-12 h-full w-0.5", isCompleted ? "bg-primary" : "bg-muted")}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p className={cn("font-semibold", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
