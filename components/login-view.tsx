'use client'

import { useEffect, useState } from 'react'
import { getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { Loader2, LogIn, Music2, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { firebaseAuth, googleProvider } from '@/lib/firebase/client'
import { toast } from 'sonner'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'

type LoginViewProps = {
  onSuccess: () => Promise<void> | void
}

type LoginMethod = 'google' | 'pin'

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
  const [method, setMethod] = useState<LoginMethod>('google')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')

  // Google redirect result handler
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

    return () => { mounted = false }
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

  const handlePinLogin = async () => {
    if (!email.trim() || pin.length < 4) {
      toast.error('กรุณากรอก Email และ PIN ให้ถูกต้อง')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/pin-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Email หรือ PIN ไม่ถูกต้อง')
        setPin('')
        return
      }

      toast.success('เข้าสู่ระบบสำเร็จ')
      await onSuccess()
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-shell flex min-h-[100dvh] flex-col items-center justify-center p-6">
      <div className="admin-surface w-full max-w-sm rounded-[1.75rem] p-6 text-center sm:p-8">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <Music2 className="h-7 w-7 text-primary" />
        </div>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          Music bar
        </p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Admin access</h1>
        <p className="text-muted-foreground mb-8">
          {method === 'google'
            ? 'เข้าสู่ระบบด้วย Google เพื่อจัดการร้านของคุณ'
            : 'กรอก Email และ PIN เพื่อเข้าใช้งาน'
          }
        </p>

        {/* Method Tabs */}
        <div className="mb-6 flex rounded-xl border border-white/10 bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setMethod('google')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
              method === 'google'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-white/50 hover:text-white'
            )}
          >
            <LogIn className="h-3.5 w-3.5" />
            Google
          </button>
          <button
            type="button"
            onClick={() => setMethod('pin')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
              method === 'pin'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-white/50 hover:text-white'
            )}
          >
            <Lock className="h-3.5 w-3.5" />
            Email + PIN
          </button>
        </div>

        {method === 'google' ? (
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
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handlePinLogin()
            }}
            className="space-y-4"
          >
            <div className="text-left space-y-2">
              <label className="text-xs font-medium text-white/70">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-11 border-white/10 bg-black/20 pl-9 text-white placeholder:text-white/30"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="text-left space-y-2">
              <label className="text-xs font-medium text-white/70">PIN (4-8 หลัก)</label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={8}
                  value={pin}
                  onChange={setPin}
                  containerClassName="gap-1.5"
                >
                  <InputOTPGroup className="gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 w-9 rounded-lg border-border! bg-black/20! text-base text-foreground! data-[active=true]:border-primary! data-[active=true]:ring-primary/20"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email.trim() || pin.length < 4}
              className="h-12 w-full gap-2 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  เข้าสู่ระบบด้วย PIN
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
