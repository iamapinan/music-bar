'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { PinEntry } from '@/components/pin-entry'
import { Loader2 } from 'lucide-react'

type AdminAuthContextType = {
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

import { AdminShell } from '@/components/admin-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('admin-mode', 'dark')
    checkAuth()
    return () => {
      document.documentElement.classList.remove('admin-mode')
    }
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setIsAuthenticated(false)
  }

  if (isAuthenticated === null) {
    return (
      <main className="admin-shell flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-shell min-h-[100dvh]">
        <PinEntry onSuccess={handleLogin} />
      </main>
    )
  }

  return (
    <AdminAuthContext.Provider value={{ logout: handleLogout }}>
      <AdminShell>
        {children}
      </AdminShell>
    </AdminAuthContext.Provider>
  )
}
