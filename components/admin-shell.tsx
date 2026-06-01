'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAdminAuth } from '@/app/(system)/admin/layout'
import { 
  Settings, LibraryBig, Radio, MonitorPlay, QrCode, RefreshCw, PowerOff,
  Music2, Download, Smartphone, Tablet, Monitor, X, LayoutDashboard
} from 'lucide-react'
import useSWR from 'swr'
import { cn } from '@/lib/utils'
import { forceUpdateApp } from '@/lib/app-update'
import { toast } from 'sonner'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth()
  const pathname = usePathname()
  
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [pageUrl, setPageUrl] = useState("")
  const [showPlayersModal, setShowPlayersModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: requests = [] } = useSWR("/api/requests", fetcher, { refreshInterval: 3000 })
  const { data: players = [], mutate: mutatePlayers } = useSWR(showPlayersModal ? "/api/players" : null, fetcher, { refreshInterval: 5000 })

  useEffect(() => {
    setPageUrl(window.location.origin + "/request")
  }, [])

  useEffect(() => {
    if (!showQR || !pageUrl) return
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pageUrl)}&bgcolor=ffffff&color=059669&format=png&margin=20`
    setQrDataUrl(qrUrl)
  }, [showQR, pageUrl])

  const handleDownloadQR = async () => {
    try {
      const res = await fetch(qrDataUrl)
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "music-bar-qr.png"
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast.error("ไม่สามารถดาวน์โหลดได้")
    }
  }

  const handleForceUpdate = () => forceUpdateApp(setIsUpdating)
  
  const handleTogglePlayer = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/players/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !currentStatus }) })
      mutatePlayers()
    } catch (err) { console.error(err) }
  }

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("ต้องการลบเครื่องเล่นนี้หรือไม่?")) return
    try {
      await fetch(`/api/players/${id}`, { method: "DELETE" })
      mutatePlayers()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="admin-shell flex min-h-[100dvh] pb-[88px] text-foreground sm:pb-[112px]">
      <aside className="admin-command-rail sticky top-0 hidden h-[100dvh] w-[76px] shrink-0 flex-col items-center border-r border-white/[0.07] py-5 xl:flex">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_32px_rgba(52,211,153,0.12)]">
          <Settings className="h-5 w-5" />
        </div>
        <div className="mt-10 flex flex-col gap-3">
          <Link href="/admin/dashboard" title="สถิติและภาพรวม">
            <Button variant="ghost" size="icon" className={cn("h-11 w-11", pathname === '/admin/dashboard' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-primary")}>
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin" title="คลังเพลง">
            <Button variant="ghost" size="icon" className={cn("h-11 w-11", pathname === '/admin' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-primary")}>
              <LibraryBig className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin?tab=requests" title="คำขอเพลง">
            <Button variant="ghost" size="icon" className="relative h-11 w-11 text-muted-foreground hover:text-primary">
              <Radio className="h-4 w-4" />
              {requests.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-primary" onClick={() => setShowPlayersModal(true)} title="จัดการเครื่องเล่น">
            <MonitorPlay className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-primary" onClick={() => setShowQR(true)} title="QR สำหรับลูกค้า">
            <QrCode className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-primary" onClick={handleForceUpdate} disabled={isUpdating} title="อัปเดตแอป">
            <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="mt-auto h-11 w-11 text-muted-foreground hover:text-destructive" onClick={logout} title="ออกจากระบบ">
          <PowerOff className="h-4 w-4" />
        </Button>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <header className="sticky top-2 z-40 mx-2 mb-2 flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-xl shadow-lg xl:hidden transition-all">
          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Music2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider text-white/90">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/admin/dashboard"><Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"><LayoutDashboard className="h-3.5 w-3.5" /></Button></Link>
            <Link href="/admin"><Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"><LibraryBig className="h-3.5 w-3.5" /></Button></Link>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setShowQR(true)}><QrCode className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setShowPlayersModal(true)}><MonitorPlay className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/70 hover:bg-destructive/80 hover:text-white" onClick={logout}><PowerOff className="h-3.5 w-3.5" /></Button>
          </div>
        </header>

        {children}
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md border-white/10 bg-black/90 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">QR Code สั่งเพลง</DialogTitle>
            <DialogDescription className="text-white/70">
              ให้ลูกค้าสแกนเพื่อเข้าสู่หน้าระบบขอเพลงของร้าน
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 gap-6">
            <div className="p-4 bg-white rounded-xl shadow-xl">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 sm:w-64 sm:h-64 object-contain" />
              ) : (
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-medium">กำลังสร้าง QR...</span>
                </div>
              )}
            </div>
            <Button onClick={handleDownloadQR} className="w-full sm:w-auto px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full">
              <Download className="w-4 h-4" />
              บันทึกภาพ QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Players Management Modal */}
      <Dialog open={showPlayersModal} onOpenChange={setShowPlayersModal}>
        <DialogContent className="sm:max-w-[500px] border-white/10 bg-black/90 text-white backdrop-blur-xl p-0 overflow-hidden">
          <div className="p-4 sm:p-6 pb-2">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-lg font-bold">จัดการเครื่องเล่น (TV/Web)</DialogTitle>
                <DialogDescription className="text-white/70 mt-1">
                  ควบคุมเครื่องเล่นที่กำลังเชื่อมต่อกับระบบ 
                  สามารถระงับเครื่องที่ไม่ได้ใช้งานได้
                </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white rounded-full" onClick={() => setShowPlayersModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] mt-4 -mx-2 px-2">
              <div className="flex flex-col gap-2 pb-2">
                {players.length === 0 ? (
                  <div className="text-center py-8 text-white/50 text-sm">
                    ไม่พบเครื่องเล่นที่เชื่อมต่ออยู่
                  </div>
                ) : (
                  players.map((player: any) => {
                    const isOnline = new Date().getTime() - new Date(player.last_ping).getTime() < 60000;
                    return (
                      <div key={player.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-full border shadow-sm", player.is_active ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/10 border-white/10 text-white/50")}>
                            {player.device_type === "Mobile" ? <Smartphone className="w-4 h-4" /> : player.device_type === "Tablet" ? <Tablet className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">{player.device_name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-green-500" : "bg-red-500")}></span>
                              <span className="text-sm text-white/60">{isOnline ? "ออนไลน์" : "ออฟไลน์"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant={player.is_active ? "default" : "outline"} className={cn("h-7 px-3 text-xs rounded-full", player.is_active ? "bg-primary text-primary-foreground" : "border-white/20 text-white")} onClick={() => handleTogglePlayer(player.id, player.is_active)}>
                            {player.is_active ? "เปิดใช้งาน" : "ระงับ"}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-full" onClick={() => handleDeletePlayer(player.id)} title="ลบเครื่องเล่น">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Trash2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
}
