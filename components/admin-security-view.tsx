'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, Key, KeyRound, Lock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdminAuth } from '@/app/(system)/admin/layout'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

export function AdminSecurityView() {
  const { user, activeTenant } = useAdminAuth()

  const [pinEnabled, setPinEnabled] = useState(false)
  const [pinUpdatedAt, setPinUpdatedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Fetch current PIN status
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/pin-code')
        const data = await res.json()
        if (res.ok) {
          setPinEnabled(data.pin_enabled)
          setPinUpdatedAt(data.pin_updated_at)
        }
      } catch {
        // silent — PIN not supported or not configured
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSetPin = async () => {
    if (newPin.length < 4 || newPin.length > 8) {
      toast.error('PIN ต้องเป็นตัวเลข 4-8 หลัก')
      return
    }
    if (newPin !== confirmPin) {
      toast.error('PIN ทั้งสองช่องไม่ตรงกัน')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/auth/pin-code', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถตั้ง PIN ได้')
      setPinEnabled(true)
      setPinUpdatedAt(data.pin_updated_at || new Date().toISOString())
      setNewPin('')
      setConfirmPin('')
      toast.success('ตั้ง PIN สำเร็จ')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถตั้ง PIN ได้')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearPin = async () => {
    if (!confirm('ต้องการลบ PIN หรือไม่? หลังจากลบแล้วจะเข้าสู่ระบบด้วย PIN ไม่ได้อีก')) return

    setIsClearing(true)
    try {
      const res = await fetch('/api/auth/pin-code', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถลบ PIN ได้')
      setPinEnabled(false)
      setPinUpdatedAt(null)
      toast.success('ลบ PIN แล้ว')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถลบ PIN ได้')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 xl:gap-6 xl:px-8 xl:py-7">
      <section className="admin-dashboard-hero rounded-2xl border border-white/[0.08] p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            Security
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            ความปลอดภัย &amp; การเข้าใช้งาน
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            ตั้งค่า PIN สำหรับเข้าสู่ระบบ Admin แทน Google OAuth
            สามารถใช้ PIN แทนได้เมื่อไม่สะดวกใช้ Google Login
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        {/* Set / Change PIN */}
        <div className="admin-content-panel rounded-2xl p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <Key className="h-4 w-4 text-primary" />
            {pinEnabled ? 'เปลี่ยน PIN' : 'ตั้ง PIN'}
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {pinEnabled && pinUpdatedAt && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary/80">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  PIN ถูกตั้งไว้แล้ว ล่าสุดเมื่อ{' '}
                  {new Date(pinUpdatedAt).toLocaleString('th-TH')}
                </div>
              )}

              <div className="space-y-2">
                <Label>PIN ใหม่ (ตัวเลข 4-8 หลัก)</Label>
                <InputOTP
                  maxLength={8}
                  value={newPin}
                  onChange={setNewPin}
                  containerClassName="gap-1.5 justify-start"
                >
                  <InputOTPGroup className="gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 w-10 rounded-lg border-border! bg-black/20! text-base text-foreground! data-[active=true]:border-primary! data-[active=true]:ring-primary/20"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-2">
                <Label>ยืนยัน PIN</Label>
                <InputOTP
                  maxLength={8}
                  value={confirmPin}
                  onChange={setConfirmPin}
                  containerClassName="gap-1.5 justify-start"
                >
                  <InputOTPGroup className="gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 w-10 rounded-lg border-border! bg-black/20! text-base text-foreground! data-[active=true]:border-primary! data-[active=true]:ring-primary/20"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleSetPin}
                disabled={
                  isSaving ||
                  newPin.length < 4 ||
                  newPin !== confirmPin
                }
                className="w-full gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {pinEnabled ? 'เปลี่ยน PIN' : 'ตั้ง PIN'}
              </Button>
            </div>
          )}
        </div>

        {/* Status & Clear */}
        <div className="admin-content-panel rounded-2xl p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <Lock className="h-4 w-4 text-primary" />
            สถานะ PIN
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    สถานะ PIN
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {pinEnabled ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-white">
                          เปิดใช้งาน
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-white/40" />
                        <span className="text-sm font-semibold text-white/50">
                          ยังไม่ได้ตั้ง
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    การเข้าใช้งานหลัก
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    Google ({user?.email?.split('@')[0]})
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                  ร้านค้าที่ใช้งาน
                </p>
                <p className="text-sm font-semibold text-white">
                  {activeTenant?.display_name || activeTenant?.name || '-'}
                </p>
                <p className="text-xs text-white/40 font-mono mt-0.5">
                  /{activeTenant?.slug || '-'}
                </p>
              </div>

              {pinEnabled && (
                <Button
                  variant="outline"
                  onClick={handleClearPin}
                  disabled={isClearing}
                  className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  ลบ PIN
                </Button>
              )}

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-[11px] text-amber-400/80">
                  <strong>หมายเหตุ:</strong> PIN ใช้สำหรับเข้าระบบ Admin ได้เท่านั้น
                  (ไม่สามารถใช้งานกับ Google OAuth) สามารถเข้าสู่ระบบด้วย Email + PIN
                  ได้จากหน้า login
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
