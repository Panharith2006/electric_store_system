"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, User, Heart, Package, LayoutDashboard, LogOut, Menu } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import ThemeToggle from "./theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useEffect, useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamic navigation based on auth status:
  // - Unauthenticated: Show Home only (no Products)
  // - User (customer): Show Products only (no Home)
  // - Admin: Show Admin only (no Home or Products)
  const getNavLinks = () => {
    if (!mounted) return [{ href: "/", label: "Home" }]
    
    if (!isAuthenticated) {
      return [{ href: "/", label: "Home" }]
    }
    
    if (isAdmin) {
      return [] // Admins don't see Home or Products
    }
    
    // Regular authenticated users
    return [{ href: "/products", label: "Products" }]
  }

  const navLinks = getNavLinks()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Electric Store</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === link.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {mounted && isAdmin && (
              <Link
                href="/admin"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname?.startsWith("/admin") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                <LayoutDashboard className="inline-block mr-1 h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {!mounted ? (
            // Defer auth-dependent UI to avoid SSR hydration mismatch
            <ThemeToggle />
          ) : isAuthenticated ? (
            <>
              <ThemeToggle />
              {/* Only show cart and favorites for regular users, not admins */}
              {!isAdmin && (
                <>
                  <Link
                    href="/favorites"
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Favorites</span>
                  </Link>
                  <Link
                    href="/cart"
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">Cart</span>
                  </Link>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.full_name || user?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">Favorites</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "default" })}>
                Sign In
              </Link>
              <Link href="/register" className={buttonVariants({ variant: "default", size: "default" })}>
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`text-sm font-medium ${
                      pathname === link.href ? "text-foreground" : "text-foreground/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {mounted && isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-foreground/60"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
