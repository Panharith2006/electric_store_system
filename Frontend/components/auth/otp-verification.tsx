"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

interface OtpVerificationProps {
  contact: string
  contactType?: "email" | "phone"
  purpose?: "register" | "login"
  onVerify: (otp: string) => void
  onResend: () => void
  loading?: boolean
  serverError?: string
}

export function OtpVerification({ contact, contactType = "email", purpose = "login", onVerify, onResend, loading, serverError }: OtpVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [localError, setLocalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
      // Support both sync and async onVerify handlers. Handle synchronous throws
      // and promise rejections so Next's overlay doesn't show.
      setLocalError(null)
      setSubmitting(true)
      try {
        const result = onVerify(otpString)
        const p = Promise.resolve(result)
        p.catch((err: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('OTP verification error:', err)
          }
          setLocalError('Invalid verification code. Please check the code and try again.')
        }).finally(() => setSubmitting(false))
      } catch (err: any) {
        // onVerify threw synchronously
        if (process.env.NODE_ENV === 'development') {
          console.error('OTP verification synchronous error:', err)
        }
        setLocalError('Invalid verification code. Please check the code and try again.')
        setSubmitting(false)
      }
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-center text-card-foreground">
          {contactType === "email" ? "Verify Your Email" : "Verify Your Phone"}
        </CardTitle>
        <CardDescription className="text-center">
          {purpose === "register" ? (
            <>
              Enter the 6-digit code to complete your registration and verify <br />
              <span className="font-medium text-foreground">{contact}</span>
            </>
          ) : (
            <>
              Enter the 6-digit code to sign in to your account and verify <br />
              <span className="font-medium text-foreground">{contact}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {(serverError || localError) && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <p>{serverError ?? localError}</p>
            </div>
          )}

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

          <Button type="submit" className="w-full" disabled={(loading || submitting) || otp.some((d) => !d)}>
            {(loading || submitting) ? "Verifying..." : purpose === "register" ? "Verify & Register" : "Verify & Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setLocalError(null)
                setOtp(["", "", "", "", "", ""])
                onResend()
              }}
              className="text-sm text-muted-foreground hover:text-primary"
              disabled={loading}
            >
              {contactType === "email" ? "Didn't receive the email? " : "Didn't receive the code? "}
              <span className="font-medium text-primary">Resend</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
