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

export function RegisterForm() {
  const [step, setStep] = useState<"email" | "otp" | "details">("email")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [registerServerError, setRegisterServerError] = useState<string | null>(null)
  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRegisterServerError(null)

    try {
      const response = await apiClient.sendOTP({ email, purpose: 'register' })
      // DEBUG: log response for failed attempts to help surface backend validation
      if (response.status >= 400) {
        // put full response in console for dev debugging
        // eslint-disable-next-line no-console
        console.error('sendOTP failed', response)
      }

      if (response.error) {
        setError(response.error)
        return
      }

      // In development the backend may return otp_code; surface it in the UI for debugging
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
    setRegisterServerError(null)

    try {
      // Validate OTP by calling the login endpoint. Login validates the OTP
      // before attempting to find a user. If the OTP is invalid the API
      // returns 400. If the OTP is valid but the user does not exist the
      // API returns 404 — we treat that as a valid OTP for registration.
      const response = await apiClient.login({ email, otp })

      if (response?.error) {
        const raw = String(response.error || '')
        const lower = raw.toLowerCase()

        if (lower.includes('otp') || lower.includes('invalid') || lower.includes('expired')) {
          setRegisterServerError('Invalid verification code. Please check the code and try again.')
          setLoading(false)
          return
        }

        if (response.status === 404) {
          // OTP valid but user not found — proceed to details step
          setOtpCode(otp)
          setStep('details')
          setLoading(false)
          return
        }

        setRegisterServerError(response.error || 'Verification failed')
        setLoading(false)
        return
      }

      // Success (user exists and OTP valid) — proceed to details
      if (response?.data) {
        setOtpCode(otp)
        setStep('details')
        setLoading(false)
        return
      }
    } catch (err: any) {
      setRegisterServerError(err?.message || 'Verification failed')
      setLoading(false)
    }
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await register({
        email,
        username,
        password,
        otp: otpCode,
        first_name: name
      })

      if (response?.error) {
        const msg = response.error || 'Registration failed'
        // If the error looks like an OTP/verification error, show it on the OTP card
        const lower = (msg || '').toLowerCase()
        if (lower.includes('otp') || lower.includes('code') || lower.includes('verification') || lower.includes('invalid')) {
          setRegisterServerError(msg)
          setStep('otp')
          setLoading(false)
          return
        }

        setError(msg)
        setLoading(false)
        return
      }

      const next = searchParams.get('next')
      router.push(next || '/products')
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
      setLoading(false)
    }
  }

  if (step === "otp") {
    const resendOtp = async () => {
      setLoading(true)
      setRegisterServerError(null)
      try {
        const res = await apiClient.sendOTP({ email, purpose: 'register' })
        if (res?.error) {
          setRegisterServerError(res.error)
        }
        if (res?.data && (res.data as any).otp_code) {
          setDevOtp((res.data as any).otp_code)
        }
      } catch (err: any) {
        setRegisterServerError(err?.message || 'Failed to resend OTP')
      } finally {
        setLoading(false)
      }
    }

    return (
      <OtpVerification
        contact={email}
        contactType="email"
        purpose="register"
        onVerify={handleVerifyOtp}
        onResend={resendOtp}
        loading={loading}
        serverError={registerServerError || error || undefined}
      />
    )
  }

  if (step === "details") {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Complete Your Profile</CardTitle>
          <CardDescription>Tell us a bit more about yourself</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-card-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">
                Full Name (Optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background text-foreground"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !username || !password}>
              {loading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Register with Email</CardTitle>
        <CardDescription>{"We'll send you a verification code"}</CardDescription>
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
            <p className="text-xs text-muted-foreground">Enter your email address to get started</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? "Sending Code..." : "Send Verification Code"}
          </Button>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Your email is secure and will only be used for authentication
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
