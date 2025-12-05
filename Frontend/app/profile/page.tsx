import { CustomerProfile } from "@/components/profile/customer-profile"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <CustomerProfile />
      </div>
    </div>
  )
}
