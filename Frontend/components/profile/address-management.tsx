"use client"

import { useState } from "react"
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
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      isDefault: true,
    },
    {
      id: "2",
      type: "work",
      street: "456 Business Ave",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      isDefault: false,
    },
  ])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
    console.log("[v0] Deleted address:", id)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setDialogOpen(true)
  }

  const handleSaveAddress = (address: Address) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map((addr) => (addr.id === address.id ? address : addr)))
      console.log("[v0] Updated address:", address)
    } else {
      // Add new address
      setAddresses([...addresses, address])
      console.log("[v0] Added new address:", address)
    }
    setDialogOpen(false)
    setEditingAddress(null)
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Saved Addresses</CardTitle>
              <CardDescription>Manage your delivery addresses</CardDescription>
            </div>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
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
                    {address.isDefault && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Default
                      </span>
                    )}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(address.id)}
                  disabled={address.isDefault}
                >
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
