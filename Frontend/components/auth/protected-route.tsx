"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    // Return nothing while we determine auth status to avoid server/client
    // markup mismatches (hydration errors). The redirect will happen in
    // useEffect on the client once loading completes.
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/')
      }
    }
  }, [isAdmin, isAuthenticated, loading, router])

  if (loading) {
    // Avoid rendering a different full-screen spinner on the server which
    // can cause hydration mismatches. Return null and let the client handle
    // redirects once loading finishes.
    return null
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return <>{children}</>
}
