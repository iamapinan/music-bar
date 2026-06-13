'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Radio, Send, Store } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function StoreApplicationForm() {
  const [storeName, setStoreName] = useState('')
  const [requestedSlug, setRequestedSlug] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!storeName.trim() || !applicantName.trim() || !applicantEmail.trim()) {
      toast.error('กรุณากรอกชื่อร้าน ชื่อผู้ติดต่อ และ Google email')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/store-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storeName.trim(),
          requestedSlug: requestedSlug.trim(),
          applicantName: applicantName.trim(),
          applicantEmail: applicantEmail.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถส่งคำขอได้')
      setIsSubmitted(true)
      toast.success('ส่งคำขอเปิดร้านแล้ว')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถส่งคำขอได้')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,oklch(0.42_0.12_158_/_0.22),transparent_28rem),radial-gradient(circle_at_88%_78%,oklch(0.34_0.08_205_/_0.16),transparent_30rem)]" />
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/65 transition hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>
        <Link href="/admin">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
            Admin
          </Button>
        </Link>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pt-20">
        <div className="lg:pt-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
            <Store className="h-6 w-6" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Open a store</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-5xl">
            ขอเปิดสถานีเพลงสำหรับร้านของคุณ
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
            ส่งข้อมูลร้านและ Google email ที่ต้องการใช้เข้าระบบ หลังอนุมัติแล้วบัญชีนั้นจะได้สิทธิ์ owner เพื่อจัดการเพลง QR และเครื่องเล่นของร้านเอง
          </p>
          <div className="mt-8 grid gap-3 text-sm text-white/65">
            {['สร้างร้านแยกข้อมูลจากสาขาอื่น', 'ให้สิทธิ์ owner กับ Google account ของร้าน', 'เปิดหน้าเครื่องเล่นและ QR ขอเพลงได้ทันที'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl sm:p-6">
          {isSubmitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">รับคำขอแล้ว</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
                เมื่อ super admin อนุมัติ คุณสามารถ login ด้วย Google email ที่กรอกไว้เพื่อเข้าหลังบ้านของร้านได้ทันที
              </p>
              <Link href="/" className="mt-6">
                <Button className="rounded-full px-5">กลับไปเลือกสถานี</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Radio className="h-4 w-4 text-primary" />
                  ข้อมูลคำขอ
                </h2>
                <p className="mt-1 text-sm text-white/50">ใช้ Google email จริง เพราะระบบจะผูกสิทธิ์กับ email นี้</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>ชื่อร้าน</Label>
                  <Input value={storeName} onChange={event => setStoreName(event.target.value)} placeholder="เช่น ฟาร์มอร่อย สาขา 2" className="border-white/10 bg-black/20" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Slug ที่อยากได้</Label>
                  <Input value={requestedSlug} onChange={event => setRequestedSlug(event.target.value)} placeholder="เช่น farm-aroi-2 (เว้นว่างได้)" className="border-white/10 bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label>ชื่อผู้ติดต่อ</Label>
                  <Input value={applicantName} onChange={event => setApplicantName(event.target.value)} placeholder="ชื่อของคุณ" className="border-white/10 bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทร</Label>
                  <Input value={phone} onChange={event => setPhone(event.target.value)} placeholder="ถ้ามี" className="border-white/10 bg-black/20" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Google email สำหรับเข้าหลังบ้าน</Label>
                  <Input type="email" value={applicantEmail} onChange={event => setApplicantEmail(event.target.value)} placeholder="name@gmail.com" className="border-white/10 bg-black/20" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>รายละเอียดเพิ่มเติม</Label>
                  <Textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="แนวเพลง เวลาใช้งาน หรือข้อมูลร้านที่อยากแจ้ง" className="min-h-28 border-white/10 bg-black/20" />
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={isSubmitting} className="h-11 w-full rounded-full gap-2 font-bold">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                ส่งคำขอเปิดร้าน
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
