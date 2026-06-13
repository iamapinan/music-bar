'use client'

import useSWR from 'swr'
import { Music2, Radio, LibraryBig, LayoutDashboard } from 'lucide-react'
import { Playlist, PlaylistSong, SongRequest } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function DashboardView() {
  const { data: playlists = [] } = useSWR<Playlist[]>("/api/playlists", fetcher)
  
  // To get the default/current playlist to show "Current tracks" stats like before
  const currentPlaylist = playlists.find(p => p.is_default) || playlists[0]
  
  const { data: playlistSongs = [] } = useSWR<PlaylistSong[]>(
    currentPlaylist ? `/api/playlists/${currentPlaylist.id}/songs` : null,
    fetcher
  )

  const { data: requests = [] } = useSWR<SongRequest[]>(
    "/api/requests",
    fetcher,
    { refreshInterval: 3000 }
  )

  return (
    <main className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 xl:gap-6 xl:px-8 xl:py-7 flex-1 overflow-y-auto">
      <div className="flex items-center gap-2 px-1 mb-2">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-bold text-foreground">ภาพรวมระบบ (Dashboard)</h1>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          ["Playlists", playlists.length, "ชุดบรรยากาศ", <LibraryBig key="lib" className="w-4 h-4 text-primary" />],
          ["Current tracks", playlistSongs.length, "ในเพลย์ลิสต์นี้", <Music2 key="mus" className="w-4 h-4 text-primary" />],
          ["Requests", requests.length, "คำขอจากลูกค้า", <Radio key="rad" className="w-4 h-4 text-primary" />],
        ].map(([label, value, detail, icon]) => (
          <div key={String(label)} className="admin-metric-card relative overflow-hidden rounded-xl border border-border/60 p-4 transition-all hover:border-primary/30 sm:p-5 xl:rounded-2xl xl:p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs sm:text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <div className="p-2 bg-primary/10 rounded-full border border-primary/20">
                {icon}
              </div>
            </div>
            <p className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground xl:mt-2 xl:text-5xl">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
            
            {/* Decorative background glow */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
          </div>
        ))}
      </section>

      {/* Placeholder for future charts or more stats */}
      <section className="mt-4 flex h-[300px] flex-col items-center justify-center rounded-xl border border-border/60 bg-secondary/30 p-8 text-center opacity-70">
        <LayoutDashboard className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-foreground">พื้นที่สถิติเชิงลึก (Coming Soon)</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          ในอนาคตคุณสามารถดูสถิติการขอเพลงยอดฮิต, ช่วงเวลาที่มีผู้ใช้งานเยอะที่สุด และแนวเพลงที่ลูกค้าชื่นชอบได้ที่นี่
        </p>
      </section>
    </main>
  )
}
