'use client'

import { useEffect, useState } from 'react'
import { getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { Loader2, LogIn, Lock, Mail, Moon, Sun } from 'lucide-react'
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

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

  useEffect(() => {
    const storedTheme = localStorage.getItem('music_bar_admin_theme')
    const nextTheme = storedTheme === 'light' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light')
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('music_bar_admin_theme', nextTheme)
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light')
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

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
    <div
      className={cn(
        "admin-login-page admin-shell relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden p-6",
        theme === 'light' && "light-theme",
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-20 h-10 w-10 rounded-full border-border bg-card text-foreground shadow-sm hover:bg-secondary"
        title={theme === 'light' ? 'เปลี่ยนเป็น dark theme' : 'เปลี่ยนเป็น light theme'}
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      <div className="admin-login-panel relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] p-6 text-center sm:p-8">
        <div className="absolute inset-x-0 top-0 h-[4px] bg-primary" />

        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <img
            src="/icon-512.png"
            alt="Music Bar Logo"
            className="relative h-16 w-16 rounded-2xl border border-border object-cover shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>

        <p className="admin-login-brand mb-2 text-[10px] font-bold uppercase tracking-[0.35em]">
          Music Bar
        </p>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
          Admin Access
        </h1>
        <p className="admin-login-copy mb-8 text-sm">
          {method === "google"
            ? "เข้าสู่ระบบด้วย Google เพื่อจัดการร้านของคุณ"
            : "กรอก Email และ PIN เพื่อเข้าใช้งาน"}
        </p>

        <div className="admin-login-tabs relative mb-8 flex rounded-full border p-1">
          <div
            className={cn(
              "admin-login-tab-indicator absolute bottom-1 left-1 top-1 rounded-full transition-all duration-300 ease-out",
              method === "google" ? "w-[calc(50%-4px)] translate-x-0" : "w-[calc(50%-4px)] translate-x-[calc(100%+4px)]"
            )}
          />
          <button
            type="button"
            onClick={() => setMethod("google")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-colors duration-300",
              method === "google"
                ? "admin-login-tab-active font-bold"
                : "admin-login-tab-inactive hover:text-foreground",
            )}
          >
            <LogIn className="h-4 w-4" />
            Google
          </button>
          <button
            type="button"
            onClick={() => setMethod("pin")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-colors duration-300",
              method === "pin"
                ? "admin-login-tab-active font-bold"
                : "admin-login-tab-inactive hover:text-foreground",
            )}
          >
            <Lock className="h-4 w-4" />
            Email + PIN
          </button>
        </div>

        <div key={method} className="slide-up">
          {method === "google" ? (
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="admin-login-google group relative h-12 w-full overflow-hidden rounded-xl font-semibold shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  กำลังเชื่อมต่อ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </span>
              )}
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePinLogin();
              }}
              className="space-y-6"
            >
              <div className="text-left space-y-2">
                <label htmlFor="email" className="admin-login-label pl-1 text-xs font-semibold uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="admin-login-input-icon pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="admin-login-input h-12 rounded-xl pl-11 placeholder:text-muted-foreground transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="text-left space-y-2">
                <label className="admin-login-label pl-1 text-xs font-semibold uppercase tracking-wider">
                  PIN (4-8 digits)
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={8}
                    value={pin}
                    onChange={setPin}
                    containerClassName="gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="admin-login-pin-slot h-12 w-10 rounded-xl text-lg font-semibold transition-all duration-300 data-[active=true]:scale-105 data-[active=true]:border-primary! data-[active=true]:ring-2! data-[active=true]:ring-primary/25!"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim() || pin.length < 4}
                className="admin-login-submit h-12 w-full gap-2 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
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
    </div>
  )
}
