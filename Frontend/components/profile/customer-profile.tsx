"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalInfo } from "./personal-info"
import { AddressManagement } from "./address-management"
import { PaymentMethods } from "./payment-methods"
import { Preferences } from "./preferences"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"


export function CustomerProfile() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <Link href="/orders">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Package className="h-4 w-4" />
            My Orders
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfo />
        </TabsContent>

        <TabsContent value="addresses">
          <AddressManagement />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="preferences">
          <Preferences />
        </TabsContent>
      </Tabs>
    </div>
  )
}
