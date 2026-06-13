'use client'

import { useCallback, useEffect, useState, createContext, useContext } from 'react'
import { LoginView } from '@/components/login-view'
import { Loader2 } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import type { AppUser, TenantMembership } from '@/lib/types'

type AdminAuthContextType = {
  user: AppUser | null
  tenants: TenantMembership[]
  activeTenant: TenantMembership | null
  logout: () => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
  refreshSession: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [tenants, setTenants] = useState<TenantMembership[]>([])
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!res.ok || !data.authenticated) {
        setIsAuthenticated(false)
        setUser(null)
        setTenants([])
        setActiveTenantId(null)
        return
      }

      setUser(data.user)
      setTenants(data.tenants || [])
      const nextActiveTenantId = data.activeTenantId || data.tenants?.[0]?.tenant_id || null
      if (nextActiveTenantId) {
        setActiveTenantId(nextActiveTenantId)
        await fetch('/api/auth/active-tenant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId: nextActiveTenantId }),
        })
      }
      setIsAuthenticated(true)
    } catch {
      setIsAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('admin-mode')
    const theme = localStorage.getItem('music_bar_admin_theme') || 'dark'
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light-theme')
    }
    checkAuth()
    return () => {
      document.documentElement.classList.remove('admin-mode', 'light-theme', 'dark')
    }
  }, [checkAuth])

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setIsAuthenticated(false)
    setUser(null)
    setTenants([])
    setActiveTenantId(null)
  }

  const switchTenant = async (tenantId: string) => {
    const res = await fetch('/api/auth/active-tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    })
    if (!res.ok) throw new Error('Failed to switch tenant')
    setActiveTenantId(tenantId)
    window.location.reload()
  }

  const activeTenant =
    tenants.find(tenant => tenant.tenant_id === activeTenantId) ||
    tenants[0] ||
    null

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
        <LoginView onSuccess={checkAuth} />
      </main>
    )
  }

  return (
    <AdminAuthContext.Provider value={{
      user,
      tenants,
      activeTenant,
      logout: handleLogout,
      switchTenant,
      refreshSession: checkAuth,
    }}>
      <AdminShell>
        {children}
      </AdminShell>
    </AdminAuthContext.Provider>
  )
}
