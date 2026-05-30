'use client'

import { useState, useEffect } from 'react'
import { AdminView } from '@/components/admin-view'
import { PinEntry } from '@/components/pin-entry'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('admin-mode')
    document.documentElement.classList.remove('dark')
    checkAuth()
    return () => {
      document.documentElement.classList.remove('admin-mode')
      document.documentElement.classList.add('dark')
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

  // Loading state
  if (isAuthenticated === null) {
    return (
      <main className="admin-shell flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <main className="admin-shell min-h-[100dvh]">
        <PinEntry onSuccess={handleLogin} />
      </main>
    )
  }

  // Authenticated
  return (
    <main className="admin-shell min-h-[100dvh]">
      <AdminView onLogout={handleLogout} />
    </main>
  )
}
