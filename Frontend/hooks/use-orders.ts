"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import apiClient from "@/lib/api-client"

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
  fetchOrders: (token?: string) => Promise<void>
  addOrder: (order: Order) => void
  getOrderById: (id: string) => Order | undefined
}

export const useOrders = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      fetchOrders: async (token?: string) => {
        try {
          const res = await apiClient.getOrders(token)
          if (!res.error && Array.isArray(res.data)) {
            // Normalize backend order shape to frontend Order
            const normalized = (res.data as any[]).map((o) => ({
              id: String(o.id),
              orderNumber: o.order_number || o.id,
              date: o.created_at || new Date().toISOString(),
              status: (o.status || 'pending') as OrderStatus,
              items: (o.items || []).map((it: any) => ({
                productId: String(it.product || it.product_id || ''),
                productName: it.product_name || it.product?.name || '',
                productImage: it.product_image || '',
                quantity: Number(it.quantity || 0),
                price: Number(it.unit_price || it.price || 0),
                variant: [it.variant_storage, it.variant_color].filter(Boolean).join(' ') || undefined,
              })),
              subtotal: Number(o.subtotal || 0),
              shipping: Number(o.shipping_cost || 0),
              tax: Number(o.tax || 0),
              total: Number(o.total || 0),
              shippingAddress: {
                street: o.shipping_address_line1 || '',
                city: o.shipping_city || '',
                state: o.shipping_state || '',
                zipCode: o.shipping_postal_code || '',
              },
              paymentMethod: o.payment_method || '',
              trackingNumber: o.tracking_number || undefined,
              estimatedDelivery: o.estimated_delivery || undefined,
            }))

            set({ orders: normalized })
          }
        } catch (e) {
          console.error('Failed to fetch orders:', e)
        }
      },

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
