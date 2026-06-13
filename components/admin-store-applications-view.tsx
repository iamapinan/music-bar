'use client'

import useSWR from 'swr'
import { Check, Clock3, ExternalLink, Loader2, Store, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { StoreApplication } from '@/lib/types'
import { cn } from '@/lib/utils'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

export function AdminStoreApplicationsView() {
  const { data: applications = [], mutate } = useSWR<StoreApplication[]>('/api/admin/store-applications', fetcher, { refreshInterval: 8000 })
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [editedSlugs, setEditedSlugs] = useState<Record<string, string>>({})

  const review = async (id: string, action: 'approve' | 'reject') => {
    setReviewingId(id)
    const slug = editedSlugs[id]
    try {
      const res = await fetch('/api/admin/store-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, rejectionReason, slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถดำเนินการได้')
      toast.success(action === 'approve' ? 'อนุมัติและสร้างร้านแล้ว' : 'ปฏิเสธคำขอแล้ว')
      setRejectionReason('')
      setEditedSlugs(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      await mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถดำเนินการได้')
    } finally {
      setReviewingId(null)
    }
  }

  const pendingCount = applications.filter(app => app.status === 'pending').length

  return (
    <main className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 xl:gap-6 xl:px-8 xl:py-7">
      <section className="admin-dashboard-hero rounded-2xl border border-border/60 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Store applications</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">คำขอเปิดร้าน</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              อนุมัติคำขอเพื่อสร้างร้านใหม่และให้สิทธิ์ owner กับ Google email ของผู้สมัครโดยอัตโนมัติ
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 text-right">
            <p className="text-2xl font-semibold text-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">รออนุมัติ</p>
          </div>
        </div>
      </section>

      <section className="admin-content-panel rounded-2xl p-4 sm:p-5">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>ร้าน / ผู้สมัคร</TableHead>
              <TableHead>Google email</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead className="w-[220px]">ดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  ยังไม่มีคำขอเปิดร้าน
                </TableCell>
              </TableRow>
            ) : (
              applications.map(application => (
                <TableRow key={application.id} className="border-border align-top">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Store className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{application.store_name}</p>
                        {application.status === 'pending' ? (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">/</span>
                            <Input
                              value={editedSlugs[application.id] !== undefined ? editedSlugs[application.id] : (application.requested_slug || '')}
                              onChange={event => setEditedSlugs(prev => ({ ...prev, [application.id]: event.target.value }))}
                              placeholder="slug เช่น mybar"
                              className="h-6 max-w-[160px] rounded-md border-border bg-secondary/40 px-2 text-xs"
                            />
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">/{application.approved_tenant_slug || application.requested_slug || 'auto'}</p>
                        )}
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserRound className="h-3.5 w-3.5 text-primary" />
                          {application.applicant_name}
                          {application.phone ? ` · ${application.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{application.applicant_email}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]',
                      application.status === 'pending' && 'border-amber-300/25 bg-amber-300/10 text-amber-200',
                      application.status === 'approved' && 'border-primary/25 bg-primary/10 text-primary',
                      application.status === 'rejected' && 'border-destructive/30 bg-destructive/10 text-destructive',
                    )}>
                      {application.status === 'pending' && <Clock3 className="h-3.5 w-3.5" />}
                      {application.status === 'approved' && <Check className="h-3.5 w-3.5" />}
                      {application.status === 'rejected' && <X className="h-3.5 w-3.5" />}
                      {application.status}
                    </span>
                    {application.approved_tenant_slug && (
                      <a href={`/play/${application.approved_tenant_slug}`} className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline" target="_blank">
                        เปิดสถานี
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-sm whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {application.notes || 'ไม่มีรายละเอียดเพิ่มเติม'}
                    </p>
                    {application.rejection_reason && (
                      <p className="mt-2 text-xs text-destructive">{application.rejection_reason}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {application.status === 'pending' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={rejectionReason}
                          onChange={event => setRejectionReason(event.target.value)}
                          placeholder="เหตุผลถ้าปฏิเสธ"
                          className="min-h-16 border-border bg-secondary/40 text-xs"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-8 flex-1 gap-1" onClick={() => review(application.id, 'approve')} disabled={reviewingId === application.id}>
                            {reviewingId === application.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            อนุมัติ
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 flex-1 gap-1 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => review(application.id, 'reject')} disabled={reviewingId === application.id}>
                            <X className="h-3.5 w-3.5" />
                            ปฏิเสธ
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        reviewed {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString('th-TH') : ''}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
