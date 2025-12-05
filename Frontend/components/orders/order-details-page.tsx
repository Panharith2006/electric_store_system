"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, MapPin, CreditCard, Package } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { format } from "date-fns";
import { OrderTracking } from "./order-tracking";
import { useEffect, useState } from "react";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

interface OrderDetailsPageProps {
  orderId: string;
}

export function OrderDetailsPage({ orderId }: OrderDetailsPageProps) {
  const router = useRouter();
  const { getOrderById } = useOrders();
  const order = getOrderById(orderId);

  const [fallbackOrder, setFallbackOrder] = useState<typeof order | null>(null);

  useEffect(() => {
    if (order) return;
    try {
      const raw = localStorage.getItem("orders-storage");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const ordersArr = parsed?.orders || parsed?.state?.orders || parsed?.state || null;
      if (Array.isArray(ordersArr)) {
        const found = ordersArr.find((o: any) => String(o.id) === String(orderId));
        if (found) setFallbackOrder(found);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [order, orderId]);

  const displayOrder = order || fallbackOrder;

  if (!displayOrder) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Order not found</h2>
          <p className="mb-6 text-muted-foreground">The order you're looking for doesn't exist</p>
          <Link href="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {displayOrder.orderNumber}
            </h1>
            <p className="text-muted-foreground">
              Placed on{" "}
              {format(new Date(displayOrder.date), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Badge className={statusColors[displayOrder.status]} variant="outline">
            {displayOrder.status.charAt(0).toUpperCase() + displayOrder.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Tracking */}
          <OrderTracking order={displayOrder} />

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayOrder.items.map((item, index) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                return (
                  <div key={index}>
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                              {item.productName}
                            </h3>
                          </Link>
                          {item.variant && (
                            <Badge variant="secondary" className="text-xs mb-1">
                              {item.variant}
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Quantity: {quantity}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            ${price.toFixed(2)} each
                          </p>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          ${(price * quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {index < displayOrder.items.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    ${displayOrder.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">
                    {displayOrder.shipping === 0
                      ? "FREE"
                      : `$${displayOrder.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">
                    ${displayOrder.tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  ${displayOrder.total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">
                  {displayOrder.shippingAddress.street}
                </p>
                <p className="text-foreground">
                  {displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.state}{" "}
                  {displayOrder.shippingAddress.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{displayOrder.paymentMethod}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
