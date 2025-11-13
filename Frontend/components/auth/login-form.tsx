"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Lock } from "lucide-react"
import { OtpVerification } from "./otp-verification"

export function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setLoading(false)
    setStep("otp")
  }

  const handleVerifyOtp = async (otp: string) => {
    setLoading(true)

    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("[v0] Login successful with OTP:", otp)
    setLoading(false)

    // Redirect to profile or dashboard
    window.location.href = "/profile"
  }

  if (step === "otp") {
    return (
      <OtpVerification
        phoneNumber={phoneNumber}
        onVerify={handleVerifyOtp}
        onResend={() => {
          console.log("[v0] Resending OTP")
          setStep("phone")
        }}
        loading={loading}
      />
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Sign In</CardTitle>
        <CardDescription>Enter your phone number to receive a verification code</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-card-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10 bg-background text-foreground"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !phoneNumber}>
            {loading ? "Sending Code..." : "Continue with Phone"}
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
