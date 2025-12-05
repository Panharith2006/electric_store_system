"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Smartphone, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"

export function PersonalInfo() {
  const { user, token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  })

  const initialName = useMemo(() => {
    if (!user) return ""
    if (user.full_name && user.full_name.trim().length > 0) return user.full_name
    const fn = user.first_name || ""
    const ln = user.last_name || ""
    return `${fn} ${ln}`.trim()
  }, [user])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Seed from auth context immediately, then hydrate with fresh profile
  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      name: initialName,
      email: user.email || "",
      phone: user.phone_number || "",
      dateOfBirth: "",
    }))
  }, [user, initialName])

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return
      setLoading(true)
      try {
        const res = await apiClient.getProfile(token)
        if (res.data) {
          const profile = res.data as any
          const fullName = (profile.full_name as string) || `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
          setFormData({
            name: fullName,
            email: profile.email || "",
            phone: profile.phone_number || "",
            dateOfBirth: profile.date_of_birth || "",
          })
        }
      } catch (e) {
        // noop, already handled in client
        console.error("Failed to load profile", e)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [token])

  const handleSave = async () => {
    if (!token) return
    setLoading(true)
    try {
      // Split name into first/last (best-effort)
      const parts = (formData.name || "").trim().split(" ")
      const first_name = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] || ""
      const last_name = parts.length > 1 ? parts.slice(-1).join(" ") : ""

      const payload: any = {
        first_name,
        last_name,
        phone_number: formData.phone || null,
        date_of_birth: formData.dateOfBirth || null,
      }

      const res = await apiClient.updateProfile(token, payload)
      if (res.error) {
        console.error("Update failed:", res.error)
        return
      }
      if (res.data) {
        const profile = res.data as any
        const fullName = (profile.full_name as string) || `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        setFormData((prev) => ({
          ...prev,
          name: fullName,
          email: profile.email || prev.email,
          phone: profile.phone_number || prev.phone,
          dateOfBirth: profile.date_of_birth || prev.dateOfBirth,
        }))
      }
      setEditing(false)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline">
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-card-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                className="pl-10 bg-background text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled
                className="pl-10 bg-background text-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email is managed via account security and cannot be changed here.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-card-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                className={`pl-10 ${editing ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground'}`}
              />
            </div>
            <p className="text-xs text-muted-foreground">Provide a phone number here to receive SMS notifications and enable phone-based verification.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-card-foreground">
              Date of Birth
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={!editing || loading}
                className="pl-10 bg-background text-foreground"
              />
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1" disabled={loading}>
              Save Changes
            </Button>
            <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
