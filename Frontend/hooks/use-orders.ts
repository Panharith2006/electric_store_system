"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  variant?: string // Added variant field to store storage/color selection
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  paymentMethod: string
  trackingNumber?: string
  estimatedDelivery?: string
}

interface OrdersStore {
  orders: Order[]
  addOrder: (order: Order) => void
  getOrderById: (id: string) => Order | undefined
}

export const useOrders = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [
        // Mock order for demonstration
        {
          id: "1",
          orderNumber: "ORD-2024-001234",
          date: "2024-03-15T10:30:00Z",
          status: "shipped",
          items: [
            {
              productId: "1",
              productName: "iPhone 15 Pro Max",
              productImage: "/iphone-15-pro-max-titanium.png",
              quantity: 1,
              price: 1199,
              variant: "Space Gray", // Added variant field
            },
            {
              productId: "5",
              productName: "Sony WH-1000XM5",
              productImage: "/sony-wh-1000xm5-headphones-black.jpg",
              quantity: 1,
              price: 399,
              variant: "Black", // Added variant field
            },
          ],
          subtotal: 1598,
          shipping: 0,
          tax: 127.84,
          total: 1725.84,
          shippingAddress: {
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
          },
          paymentMethod: "Visa •••• 4242",
          trackingNumber: "1Z999AA10123456784",
          estimatedDelivery: "2024-03-20",
        },
        {
          id: "2",
          orderNumber: "ORD-2024-001189",
          date: "2024-03-10T14:20:00Z",
          status: "delivered",
          items: [
            {
              productId: "3",
              productName: "MacBook Pro 16-inch M3 Max",
              productImage: "/macbook-pro-16-inch-space-black.jpg",
              quantity: 1,
              price: 3499,
              variant: "Space Black", // Added variant field
            },
          ],
          subtotal: 3499,
          shipping: 0,
          tax: 279.92,
          total: 3778.92,
          shippingAddress: {
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
          },
          paymentMethod: "Mastercard •••• 5555",
          trackingNumber: "1Z999AA10123456789",
          estimatedDelivery: "2024-03-15",
        },
      ],
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      getOrderById: (id) => {
        const state = get()
        return state.orders.find((order) => order.id === id)
      },
    }),
    {
      name: "orders-storage",
    },
  ),
)
