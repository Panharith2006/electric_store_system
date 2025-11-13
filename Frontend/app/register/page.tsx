import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ElectroStore</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground">Register with your phone number to get started</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
