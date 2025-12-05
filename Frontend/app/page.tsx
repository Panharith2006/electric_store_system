"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Shield, Smartphone, User } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()

  // If authenticated, route based on role
  useEffect(() => {
    // Start the app from the login page for unauthenticated visitors.
    // Avoid automatically routing admins to `/admin` when landing on `/`.
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    // For authenticated users, route to the storefront by default.
    // Admins can access the Admin dashboard via the Admin link.
    router.replace("/products")
  }, [isAuthenticated, isAdmin, router])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-balance">
            Your Trusted Electronics Store Management System
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-pretty">
            Secure, fast, and reliable platform for managing your electronic store operations with advanced customer
            features
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <User className="h-5 w-5" />
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Phone Authentication</h3>
              <p className="text-muted-foreground">
                Secure login with phone number and OTP verification for enhanced security
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Secure Profile</h3>
              <p className="text-muted-foreground">
                Manage your personal information, addresses, and payment methods safely
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Customer Dashboard</h3>
              <p className="text-muted-foreground">
                Access your orders, preferences, and account settings in one place
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
