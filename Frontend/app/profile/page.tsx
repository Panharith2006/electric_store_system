import { CustomerProfile } from "@/components/profile/customer-profile"
import { ProfileHeader } from "@/components/profile/profile-header"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader />
      <div className="container mx-auto px-4 py-8">
        <CustomerProfile />
      </div>
    </div>
  )
}
