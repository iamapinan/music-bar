'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { 
  ArrowRight, Headphones, LibraryBig, MonitorPlay, QrCode, Radio, 
  Send, ShieldCheck, Store, Sparkles, Activity, Flame, Volume2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Station = {
  id: string
  slug: string
  name: string
  display_name: string | null
  logo_url: string | null
  playlist_count: string
  song_count: string
  cover_thumbnail: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

export function LandingPage() {
  const { data: stations = [] } = useSWR<Station[]>('/api/stations', fetcher)

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#0a0f0d] text-foreground font-sans relative selection:bg-primary/30 selection:text-primary-foreground">
      {/* Decorative Cyberpunk Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.18_158_/_0.15)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,oklch(0.45_0.15_200_/_0.12)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute top-[40%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.18_158_/_0.08)_0%,transparent_70%)] blur-[60px]" />
        
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between rounded-full border border-white/[0.08] bg-[#0c1210]/60 px-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Radio className="h-4.5 w-4.5 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white">Music Bar</p>
              <p className="text-[9px] font-bold text-primary tracking-wide">MULTIVERSE JUKEBOX</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" className="rounded-full text-xs font-bold text-white/80 hover:text-white hover:bg-white/5 px-4 h-9">
                ระบบจัดการ
              </Button>
            </Link>
            <Link href="/apply">
              <Button className="rounded-full text-xs font-bold px-4 h-9 shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
                ขอเปิดสถานี
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-[0_0_15px_rgba(16,185,129,0.06)] animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart Multi-Tenant Audio Controller</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">
            ระบบจัดคิวเพลง<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-teal-200 drop-shadow-[0_2px_10px_rgba(52,211,153,0.15)]">
              สำหรับร้านค้าทุกสาขา
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-white/60 max-w-2xl mx-auto">
            ควบคุมเครื่องเล่นเพลง คลังเพลง และคิวขอเพลงของทุกสาขาได้ในระบบเดียว 
            ให้ลูกค้าสแกน QR เพื่อเลือกและส่งเพลงจากโทรศัพท์ได้อย่างง่ายดาย
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#stations">
              <Button size="lg" className="h-12 rounded-full px-7 font-black gap-2 text-sm shadow-[0_8px_24px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.35)] transition-all duration-300">
                เลือกสถานีร้านค้า
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/apply">
              <Button size="lg" variant="outline" className="h-12 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 px-7 font-bold text-primary text-sm gap-2">
                ส่งคำขอเปิดร้าน
                <Send className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'แยก Tenant อิสระ',
              detail: 'จัดสรรคลังเพลง Playlist สถิติ และตั้งค่าแยกของแต่ละสาขาออกจากกันอย่างอิสระ',
              icon: <Store className="h-5 w-5" />,
              glow: 'rgba(16,185,129,0.08)'
            },
            {
              title: 'ระบบ Admin ปลอดภัย',
              detail: 'ควบคุมการดูแลระบบและกำหนดสิทธิ์ผู้เข้าใช้งานแผงควบคุมด้วย Google Sign-In',
              icon: <ShieldCheck className="h-5 w-5" />,
              glow: 'rgba(6,182,212,0.08)'
            },
            {
              title: 'สแกน QR ส่งขอเพลง',
              detail: 'ลูกค้าสแกน QR Code หน้าโต๊ะเพื่อส่งขอเพลงตามคิวได้ทันทีโดยไม่ต้องลงแอป',
              icon: <QrCode className="h-5 w-5" />,
              glow: 'rgba(236,72,153,0.08)'
            },
            {
              title: 'Player ไร้รอยต่อ',
              detail: 'หน้าเครื่องเล่นเบราว์เซอร์รับคำสั่งเรียลไทม์ พร้อมแผงควบคุมเสียงสไตล์มิกเซอร์',
              icon: <MonitorPlay className="h-5 w-5" />,
              glow: 'rgba(245,158,11,0.08)'
            },
          ].map((feat) => (
            <div 
              key={feat.title} 
              className="group rounded-2xl border border-white/[0.06] bg-[#0c1210]/40 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              style={{ boxShadow: `0 10px 30px -10px ${feat.glow}` }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15 transition-transform group-hover:scale-110">
                {feat.icon}
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-primary transition-colors">{feat.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{feat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stations List Section */}
      <section id="stations" className="relative px-4 pb-24 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 scroll-mt-20">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">LIVE TRANSMISSION</p>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              เลือกสถานีร้านค้าเพื่อเปิดฟัง
            </h2>
          </div>
          <p className="text-sm text-white/45 max-w-sm">
            เลือกสาขาที่ท่านต้องการควบคุมเพื่อเปิดเครื่องเล่นเพลง หรือเข้าจัดการรายชื่อเพลง
          </p>
        </div>

        {/* Stations Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stations.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
              <Headphones className="h-12 w-12 text-white/20 mx-auto mb-4 animate-bounce" />
              <p className="text-sm font-bold text-white/60">ยังไม่พบสถานีเปิดให้บริการในขณะนี้</p>
              <p className="text-xs text-white/40 mt-1">สามารถส่งคำขอเปิดสถานีสาขาของคุณได้ที่ปุ่มด้านบน</p>
            </div>
          ) : (
            stations.map(station => (
              <Link 
                key={station.id} 
                href={`/play/${station.slug}`} 
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c1210]/50 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)]"
              >
                {/* Image Cover */}
                <div className="aspect-[16/10] w-full bg-black/40 overflow-hidden relative shrink-0">
                  {station.cover_thumbnail ? (
                    <img 
                      src={station.cover_thumbnail} 
                      alt="" 
                      className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-95" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0c1210] to-[#121c18] text-primary">
                      <Headphones className="h-12 w-12 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  )}
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 border border-white/15 px-2.5 py-1 backdrop-blur-md">
                    <Activity className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">ONLINE</span>
                  </div>
                  
                  {/* Slugs URL text overlay at bottom-left */}
                  <div className="absolute bottom-3 left-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
                      /play/{station.slug}
                    </p>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate text-lg font-extrabold text-white group-hover:text-primary transition-colors">
                        {station.display_name || station.name}
                      </h3>
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-primary transition duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Counters */}
                  <div className="mt-5 flex gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 font-bold text-white/70">
                      <Volume2 className="h-3.5 w-3.5 text-primary" />
                      {station.playlist_count} เพลย์ลิสต์
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 font-bold text-white/55">
                      <Flame className="h-3.5 w-3.5 text-emerald-400" />
                      {station.song_count} เพลง
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
