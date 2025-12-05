"use client"

import React, { useEffect, useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Package, FolderTree, ArrowLeft, Warehouse, BarChart3, TrendingUp } from "lucide-react"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()



function AuthLogout() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  try {
    const { logout, isAuthenticated } = useAuth()
    if (!mounted) return null
    if (!isAuthenticated) return null
    return (
      <Button variant="ghost" onClick={() => logout()} className="gap-2">
        Logout
      </Button>
    )
  } catch (e) {
    return null
  }
}
  const navItems = [
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/stock", label: "Stock Management", icon: Warehouse },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button variant={pathname === item.href ? "default" : "ghost"} className="gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                {/* <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Store
                </Button> */}
              </Link>
              {/* Logout - shown when authenticated */}
              <AuthLogout />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
