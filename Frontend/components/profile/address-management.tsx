"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { AddressDialog } from "./address-dialog"

interface Address {
  id: string
  type: "home" | "work" | "other"
  street: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

export function AddressManagement() {
  const [mounted, setMounted] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadAddresses = async () => {
      if (!token) return
      try {
        const res = await apiClient.getProfile(token)
        if (res.data) {
          const profile: any = res.data
          // User model has single address fields, so map them to a single address
          const hasAddress = profile.address_line1 || profile.city || profile.state || profile.postal_code
          if (hasAddress) {
            const primaryAddress: Address = {
              id: 'primary',
              type: 'home',
              street: `${profile.address_line1 || ''}${profile.address_line2 ? ' ' + profile.address_line2 : ''}`.trim(),
              city: profile.city || '',
              state: profile.state || '',
              zipCode: profile.postal_code || '',
              // Do not assume the address is "Default"; preserve explicit flag from backend when available
              isDefault: Boolean(profile.is_default) || false,
            }
            setAddresses([primaryAddress])
          } else {
            setAddresses([])
          }
        }
      } catch (err) {
        // ignore network errors in this component; start empty
        console.error('Failed to load addresses', err)
      }
    }
    loadAddresses()
  }, [token])

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      // Clear address fields in backend
      await apiClient.updateProfile(token, {
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
      })
      setAddresses(addresses.filter((addr) => addr.id !== id))
      console.log("[AddressManagement] Deleted address:", id)
    } catch (err) {
      console.error('Failed to delete address', err)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setDialogOpen(true)
  }

  const handleSaveAddress = async (address: Address) => {
    if (!token) return
    try {
      // Split street into address_line1 and address_line2 if needed
      const streetParts = address.street.split(',').map(s => s.trim())
      const address_line1 = streetParts[0] || ''
      const address_line2 = streetParts.length > 1 ? streetParts.slice(1).join(', ') : ''

      // Save to backend User model address fields
      const res = await apiClient.updateProfile(token, {
        address_line1,
        address_line2,
        city: address.city,
        state: address.state,
        postal_code: address.zipCode,
      })

      if (res.error) {
        console.error('Failed to save address:', res.error)
        return
      }

      // Update local state
      const savedAddress = { ...address, id: 'primary', isDefault: Boolean(address.isDefault) }
      if (editingAddress) {
        setAddresses(addresses.map((addr) => (addr.id === address.id ? savedAddress : addr)))
        console.log("[AddressManagement] Updated address:", savedAddress)
      } else {
        // Replace any existing address (we only support one primary address)
        setAddresses([savedAddress])
        console.log("[AddressManagement] Added new address:", savedAddress)
      }
      setDialogOpen(false)
      setEditingAddress(null)
    } catch (err) {
      console.error('Failed to save address', err)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Primary Address</CardTitle>
              <CardDescription>Manage your primary delivery address</CardDescription>
            </div>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {addresses.length > 0 ? 'Edit Address' : 'Add Address'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between rounded-lg border border-border bg-background p-4"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold capitalize text-foreground">{address.type}</span>
                  </div>
                  <p className="text-sm text-foreground">{address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(address)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editingAddress}
        onSave={handleSaveAddress}
      />
    </>
  )
}
