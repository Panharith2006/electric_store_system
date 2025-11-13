"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface Address {
  id: string
  type: "home" | "work" | "other"
  street: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address | null
  onSave: (address: Address) => void
}

export function AddressDialog({ open, onOpenChange, address, onSave }: AddressDialogProps) {
  const [formData, setFormData] = useState({
    type: "home" as "home" | "work" | "other",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  })

  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        isDefault: address.isDefault,
      })
    } else {
      setFormData({
        type: "home",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false,
      })
    }
  }, [address])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: address?.id || Date.now().toString(),
      ...formData,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            {address ? "Update your address details" : "Add a new delivery address"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Address Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "home" | "work" | "other") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="123 Main Street"
              required
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="NY"
                required
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="10001"
              required
              className="bg-background"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="default"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
            />
            <Label htmlFor="default" className="text-sm font-normal">
              Set as default address
            </Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Save Address
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
