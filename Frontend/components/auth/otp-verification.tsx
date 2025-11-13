"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

interface OtpVerificationProps {
  phoneNumber: string
  onVerify: (otp: string) => void
  onResend: () => void
  loading?: boolean
}

export function OtpVerification({ phoneNumber, onVerify, onResend, loading }: OtpVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length === 6) {
      onVerify(otpString)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-center text-card-foreground">Verify Your Phone</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to <br />
          <span className="font-medium text-foreground">{phoneNumber}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-12 rounded-lg border border-input bg-background text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading || otp.some((d) => !d)}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onResend}
              className="text-sm text-muted-foreground hover:text-primary"
              disabled={loading}
            >
              {"Didn't receive the code? "}
              <span className="font-medium text-primary">Resend</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
