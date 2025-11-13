"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Lock } from "lucide-react"
import { OtpVerification } from "./otp-verification"

export function RegisterForm() {
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
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

    setLoading(false)
    setStep("details")
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate registration completion
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("[v0] Registration completed:", { phoneNumber, name, email })
    setLoading(false)

    // Redirect to profile or dashboard
    window.location.href = "/profile"
  }

  if (step === "otp") {
    return (
      <OtpVerification
        phoneNumber={phoneNumber}
        onVerify={handleVerifyOtp}
        onResend={() => console.log("[v0] Resending OTP")}
        loading={loading}
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
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email Address (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background text-foreground"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !name}>
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
        <CardTitle className="text-card-foreground">Register with Phone</CardTitle>
        <CardDescription>{"We'll send you a verification code"}</CardDescription>
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
            <p className="text-xs text-muted-foreground">Enter your phone number with country code</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !phoneNumber}>
            {loading ? "Sending Code..." : "Send Verification Code"}
          </Button>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Your phone number is secure and will only be used for authentication
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
