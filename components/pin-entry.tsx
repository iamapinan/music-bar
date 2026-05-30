'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PinEntryProps {
  onSuccess: () => void
}

export function PinEntry({ onSuccess }: PinEntryProps) {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (pin.length < 4) {
      toast.error('กรุณากรอก PIN 4 หลัก')
      return
    }
    
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'PIN ไม่ถูกต้อง')
        setPin('')
        return
      }
      
      toast.success('เข้าสู่ระบบสำเร็จ')
      onSuccess()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-shell flex min-h-[100dvh] flex-col items-center justify-center p-6">
      <div className="admin-surface w-full max-w-sm rounded-2xl p-6 text-center sm:p-8">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>

        {/* Title */}
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Music bar</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Admin access</h1>
        <p className="text-muted-foreground mb-8">กรุณากรอก PIN เพื่อเข้าสู่ระบบ</p>

        {/* PIN Input */}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={setPin}
            onComplete={handleSubmit}
            containerClassName="gap-2"
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="h-14 w-14 rounded-xl border-slate-300! bg-white! text-xl text-slate-900! shadow-sm data-[active=true]:border-primary! data-[active=true]:ring-primary/20" />
              <InputOTPSlot index={1} className="h-14 w-14 rounded-xl border-slate-300! bg-white! text-xl text-slate-900! shadow-sm data-[active=true]:border-primary! data-[active=true]:ring-primary/20" />
              <InputOTPSlot index={2} className="h-14 w-14 rounded-xl border-slate-300! bg-white! text-xl text-slate-900! shadow-sm data-[active=true]:border-primary! data-[active=true]:ring-primary/20" />
              <InputOTPSlot index={3} className="h-14 w-14 rounded-xl border-slate-300! bg-white! text-xl text-slate-900! shadow-sm data-[active=true]:border-primary! data-[active=true]:ring-primary/20" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={pin.length < 4 || isLoading}
          className="h-12 w-full font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังตรวจสอบ...
            </>
          ) : (
            'เข้าสู่ระบบ'
          )}
        </Button>

        {/* Hint */}
        <p className="text-xs text-muted-foreground mt-6">
          PIN เริ่มต้น: 1234
        </p>
      </div>
    </div>
  )
}
