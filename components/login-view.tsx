'use client'

import { useEffect, useState } from 'react'
import { getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { Loader2, LogIn, Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { firebaseAuth, googleProvider } from '@/lib/firebase/client'
import { toast } from 'sonner'

type LoginViewProps = {
  onSuccess: () => Promise<void> | void
}

async function createServerSession(idToken: string) {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'ไม่สามารถเข้าสู่ระบบได้')
  return data
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    getRedirectResult(firebaseAuth)
      .then(async result => {
        if (!result || !mounted) return
        setIsLoading(true)
        const idToken = await result.user.getIdToken()
        await createServerSession(idToken)
        toast.success('เข้าสู่ระบบสำเร็จ')
        await onSuccess()
      })
      .catch(error => {
        console.error(error)
        toast.error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ')
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [onSuccess])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      const idToken = await result.user.getIdToken()
      await createServerSession(idToken)
      toast.success('เข้าสู่ระบบสำเร็จ')
      await onSuccess()
    } catch (error: any) {
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(firebaseAuth, googleProvider)
        return
      }
      console.error(error)
      toast.error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-shell flex min-h-[100dvh] flex-col items-center justify-center p-6">
      <div className="admin-surface w-full max-w-sm rounded-[1.75rem] p-6 text-center sm:p-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <Music2 className="h-7 w-7 text-primary" />
        </div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Music bar</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Admin access</h1>
        <p className="text-muted-foreground mb-8">เข้าสู่ระบบด้วย Google เพื่อจัดการร้านของคุณ</p>
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="h-12 w-full gap-2 font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Continue with Google
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
