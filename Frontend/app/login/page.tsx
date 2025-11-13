import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ElectroStore</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account with phone verification</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
