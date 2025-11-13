"use client"

import { useCart } from "./use-cart"
import { useOrders, type Order, type OrderItem } from "./use-orders"

export function useCheckout() {
  const { items, clearCart } = useCart()
  const { addOrder } = useOrders()

  const placeOrder = (
    shippingInfo: {
      fullName: string
      email: string
      phone: string
      address: string
      city: string
      state: string
      zipCode: string
    },
    paymentInfo: {
      cardNumber: string
      cardName: string
      expiryDate: string
      cvv: string
    },
    totals: {
      subtotal: number
      shipping: number
      tax: number
      total: number
    },
  ) => {
    const orderItems: OrderItem[] = items.map((item) => {
      const variant =
        item.variantId && item.product.variants ? item.product.variants.find((v) => v.id === item.variantId) : null

      return {
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image || "/placeholder.svg",
        quantity: item.quantity,
        price: variant?.price || item.product.price,
        variant: variant?.name, // Store variant name for order history
      }
    })

    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`,
      date: new Date().toISOString(),
      status: "pending",
      items: orderItems,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      shippingAddress: {
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
      },
      paymentMethod: `${paymentInfo.cardNumber.startsWith("4") ? "Visa" : "Mastercard"} •••• ${paymentInfo.cardNumber.slice(-4)}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }

    addOrder(order)
    clearCart()

    return order
  }

  return { placeOrder }
}
