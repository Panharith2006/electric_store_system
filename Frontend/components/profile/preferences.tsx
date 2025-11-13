"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Preferences() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    language: "en",
    currency: "usd",
  })

  const handleSave = () => {
    console.log("[v0] Saving preferences:", preferences)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Preferences</CardTitle>
        <CardDescription>Customize your account settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notif" className="text-foreground">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              id="email-notif"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notif" className="text-foreground">
                SMS Notifications
              </Label>
              <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
            </div>
            <Switch
              id="sms-notif"
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-updates" className="text-foreground">
                Order Updates
              </Label>
              <p className="text-xs text-muted-foreground">Get updates about your orders</p>
            </div>
            <Switch
              id="order-updates"
              checked={preferences.orderUpdates}
              onCheckedChange={(checked) => setPreferences({ ...preferences, orderUpdates: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promotions" className="text-foreground">
                Promotions
              </Label>
              <p className="text-xs text-muted-foreground">Receive promotional offers</p>
            </div>
            <Switch
              id="promotions"
              checked={preferences.promotions}
              onCheckedChange={(checked) => setPreferences({ ...preferences, promotions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter" className="text-foreground">
                Newsletter
              </Label>
              <p className="text-xs text-muted-foreground">Subscribe to our newsletter</p>
            </div>
            <Switch
              id="newsletter"
              checked={preferences.newsletter}
              onCheckedChange={(checked) => setPreferences({ ...preferences, newsletter: checked })}
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">Regional Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-foreground">
              Language
            </Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => setPreferences({ ...preferences, language: value })}
            >
              <SelectTrigger id="language" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-foreground">
              Currency
            </Label>
            <Select
              value={preferences.currency}
              onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
            >
              <SelectTrigger id="currency" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="jpy">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
