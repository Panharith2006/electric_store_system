"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Lock, AlertCircle } from "lucide-react"
import { OtpVerification } from "./otp-verification"
import apiClient from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

export function LoginForm() {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.sendOTP({ email, purpose: 'login' })
      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data && (response.data as any).otp_code) {
        setDevOtp((response.data as any).otp_code)
      }

      setStep("otp")
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setLoading(true)
    setError(null)

    const response = await login(email, otp)

    if (response?.error || !response?.data) {
      const raw = String(response?.error || '')
      const lower = raw.toLowerCase()
      if (lower.includes('otp') || lower.includes('invalid') || lower.includes('verification')) {
        setError('Invalid verification code. Please check the code and try again.')
      } else {
        setError('Login failed. Please try again.')
      }
      setLoading(false)
      return
    }

    // success
    const next = searchParams.get('next')
    router.push(next || '/products')
    setLoading(false)
  }

  if (step === "otp") {
    const resendOtp = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.sendOTP({ email, purpose: 'login' })
        if (res?.error) {
          setError(res.error)
        }
        if (res?.data && (res.data as any).otp_code) {
          setDevOtp((res.data as any).otp_code)
        }
        // stay on OTP step — user will receive a new code
      } catch (err: any) {
        setError(err?.message || 'Failed to resend OTP')
      } finally {
        setLoading(false)
      }
    }

    return (
      <OtpVerification
        contact={email}
        contactType="email"
        purpose="login"
        onVerify={handleVerifyOtp}
        onResend={resendOtp}
        serverError={error}
        loading={loading}
      />
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Sign In</CardTitle>
        <CardDescription>Enter your email to receive a verification code</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}
        {devOtp && (
          <div className="mb-4 rounded-lg bg-accent/10 p-3 text-sm text-accent-foreground">
            <p className="font-medium">Dev OTP (debug): <span className="font-mono">{devOtp}</span></p>
            <p className="text-xs text-muted-foreground">This appears only in development (DEBUG=True).</p>
          </div>
        )}
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background text-foreground"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? "Sending Code..." : "Continue with Email"}
          </Button>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Secure authentication with OTP verification</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
