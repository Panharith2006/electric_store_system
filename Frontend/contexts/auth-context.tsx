"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '@/lib/api-client'

interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  role: 'ADMIN' | 'USER'
  is_admin: boolean
  email_verified: boolean
  phone_number?: string
  profile_picture?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, otp: string) => Promise<any>
  register: (data: RegisterData) => Promise<any>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

interface RegisterData {
  email: string
  username: string
  password: string
  otp: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, otp: string) => {
    const response = await apiClient.login({ email, otp })

    if (response.error || !response.data) {
      // Do not throw here; return the response so callers can handle friendly messages.
      return response
    }

    const { user: userData, token: authToken } = response.data as any

    setUser(userData)
    setToken(authToken)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    // Mirror token & role into cookies so middleware can protect routes (7 days)
    document.cookie = `auth_token=${authToken}; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    document.cookie = `auth_role=${encodeURIComponent(userData.role || (userData.is_admin ? 'ADMIN' : 'USER'))}; Path=/; Max-Age=${7 * 24 * 60 * 60}`

    return response
  }
  

  const register = async (data: RegisterData) => {
    const response = await apiClient.register(data)

    if (response.error || !response.data) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', response)
      }
      return response
    }

    const { user: userData, token: authToken } = response.data as any

    setUser(userData)
    setToken(authToken)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    // Mirror token & role into cookies so middleware can protect routes (7 days)
    document.cookie = `auth_token=${authToken}; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    document.cookie = `auth_role=${encodeURIComponent(userData.role || (userData.is_admin ? 'ADMIN' : 'USER'))}; Path=/; Max-Age=${7 * 24 * 60 * 60}`

    return response
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    // Clear cookies
    document.cookie = 'auth_token=; Path=/; Max-Age=0'
    document.cookie = 'auth_role=; Path=/; Max-Age=0'
    window.location.href = '/login'
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.is_admin || user?.role === 'ADMIN' || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
