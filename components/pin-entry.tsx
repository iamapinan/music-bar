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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
        <p className="text-muted-foreground mb-8">กรุณากรอก PIN เพื่อเข้าสู่ระบบ</p>

        {/* PIN Input */}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={setPin}
            onComplete={handleSubmit}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-14 h-14 text-xl" />
              <InputOTPSlot index={1} className="w-14 h-14 text-xl" />
              <InputOTPSlot index={2} className="w-14 h-14 text-xl" />
              <InputOTPSlot index={3} className="w-14 h-14 text-xl" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={pin.length < 4 || isLoading}
          className="w-full h-12"
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
