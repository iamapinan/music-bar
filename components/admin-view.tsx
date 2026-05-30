'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  Plus, Search, Trash2, Music2, Loader2, List, Settings, Radio, LayoutGrid, Rows3, LibraryBig,
  Star, Power, PowerOff, Download, Youtube,
  CheckSquare, Square, X, RefreshCw, QrCode
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import type { Playlist, PlaylistSong, YouTubeSearchResult, YouTubePlaylistResult, SongRequest } from '@/lib/types'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/context/player-context'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

interface AdminViewProps {
  onLogout: () => void
}

// Beautiful Premium Playlist Cover Component
const PlaylistCover = ({ playlist }: { playlist: Playlist }) => {
  if (playlist.cover_thumbnail) {
    return (
      <img
        src={playlist.cover_thumbnail}
        alt={playlist.name}
        className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/10 shrink-0"
      />
    )
  }

  const firstLetters = playlist.name.slice(0, 2).toUpperCase()
  const gradients = [
    'from-emerald-600/30 to-teal-800/30 border-emerald-500/20 text-emerald-300',
    'from-cyan-600/30 to-blue-800/30 border-cyan-500/20 text-cyan-300',
    'from-indigo-600/30 to-purple-800/30 border-indigo-500/20 text-indigo-300',
    'from-violet-600/30 to-fuchsia-800/30 border-violet-500/20 text-violet-300',
    'from-rose-600/30 to-orange-800/30 border-rose-500/20 text-rose-300',
  ]
  const gradientClass = gradients[playlist.id % gradients.length]

  return (
    <div className={cn(
      'w-12 h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-md',
      gradientClass
    )}>
      {firstLetters}
    </div>
  )
}

export function AdminView({ onLogout }: AdminViewProps) {
  const { activePlaylistIds, setActivePlaylistIds } = usePlayer()
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([])
  const [ytPlaylistResults, setYtPlaylistResults] = useState<YouTubePlaylistResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState<'video' | 'playlist'>('video')
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [importingId, setImportingId] = useState<string | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<number>>(new Set())
  const [targetPlaylistId, setTargetPlaylistId] = useState<number | null>(null)
  const [playlistView, setPlaylistView] = useState<'cards' | 'table'>('cards')
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>('tracks')
  
  // QR Code States
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [pageUrl, setPageUrl] = useState('')

  const { data: playlists = [], mutate: mutatePlaylists } = useSWR<Playlist[]>('/api/playlists', fetcher)
  const currentPlaylist = activePlaylistId
    ? playlists.find(p => p.id === activePlaylistId)
    : playlists.find(p => p.is_default) || playlists[0]

  const { data: playlistSongs = [], mutate: mutateSongs } = useSWR<PlaylistSong[]>(
    currentPlaylist ? `/api/playlists/${currentPlaylist.id}/songs` : null,
    fetcher
  )

  const { data: requests = [], mutate: mutateRequests } = useSWR<SongRequest[]>(
    '/api/requests', fetcher, { refreshInterval: 5000 }
  )

  // Initialize QR Code URL
  useEffect(() => {
    setPageUrl(window.location.origin + '/request')
  }, [])

  useEffect(() => {
    setSelectedPlaylists(new Set(activePlaylistIds))
  }, [activePlaylistIds])

  useEffect(() => {
    if (!showQR || !pageUrl) return
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pageUrl)}&bgcolor=101a17&color=6ee7b7&format=png&margin=20`
    setQrDataUrl(qrUrl)
  }, [showQR, pageUrl])

  const handleDownloadQR = async () => {
    try {
      const res = await fetch(qrDataUrl)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'music-bar-qr.png'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast.error('ไม่สามารถดาวน์โหลดได้')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`)
      const data = await res.json()
      if (searchType === 'playlist') {
        setYtPlaylistResults(data.items || [])
        setSearchResults([])
      } else {
        setSearchResults(data.items || [])
        setYtPlaylistResults([])
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการค้นหา')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToPlaylist = async (result: YouTubeSearchResult) => {
    const targetId = targetPlaylistId || currentPlaylist?.id
    if (!targetId || addingIds.has(result.id)) return
    setAddingIds(prev => new Set(prev).add(result.id))
    try {
      const res = await fetch(`/api/playlists/${targetId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_id: result.id, title: result.title, thumbnail: result.thumbnail, artist: result.channelTitle }),
      })
      if (!res.ok) throw new Error()
      mutateSongs()
      mutatePlaylists() // refresh cover thumbnail
      const targetName = playlists.find(p => p.id === targetId)?.name || ''
      toast.success(`เพิ่มเพลงไปยัง ${targetName} แล้ว`)
    } catch {
      toast.error('ไม่สามารถเพิ่มเพลงได้')
    } finally {
      setAddingIds(prev => { const n = new Set(prev); n.delete(result.id); return n })
    }
  }

  const handleImportYoutubePlaylist = async (ytPlaylist: YouTubePlaylistResult) => {
    setImportingId(ytPlaylist.id)
    try {
      const res = await fetch('/api/playlists/import-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId: ytPlaylist.id, name: ytPlaylist.title }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      mutatePlaylists()
      toast.success(`Import สำเร็จ ${data.imported} เพลง`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ไม่สามารถ import ได้')
    } finally {
      setImportingId(null)
    }
  }

  const handleRemoveFromPlaylist = async (songId: number) => {
    if (!currentPlaylist) return
    try {
      await fetch(`/api/playlists/${currentPlaylist.id}/songs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      })
      mutateSongs()
      mutatePlaylists() // refresh cover thumbnail
      toast.success('ลบเพลงแล้ว')
    } catch {
      toast.error('ไม่สามารถลบเพลงได้')
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return
    setIsCreating(true)
    try {
      await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName.trim() }),
      })
      mutatePlaylists()
      setNewPlaylistName('')
      toast.success('สร้าง playlist แล้ว')
    } catch {
      toast.error('ไม่สามารถสร้างได้')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSetDefault = async (id: number) => {
    await fetch('/api/playlists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_default: true }),
    })
    mutatePlaylists()
    toast.success('ตั้งเป็น playlist เริ่มต้นแล้ว')
  }

  const handleToggleEnabled = async (id: number, current: boolean) => {
    await fetch('/api/playlists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_enabled: !current }),
    })
    mutatePlaylists()
    toast.success(!current ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว')
  }

  const handleDeletePlaylist = async (id: number) => {
    await fetch('/api/playlists', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutatePlaylists()
    if (activePlaylistId === id) setActivePlaylistId(null)
    toast.success('ลบ playlist แล้ว')
  }

  const handleExportPlaylist = (id: number) => {
    window.open(`/api/playlists/${id}/export`, '_blank')
  }

  const handleRemoveRequest = async (requestId: number) => {
    await fetch('/api/requests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: requestId }),
    })
    mutateRequests()
    toast.success('ลบคำขอแล้ว')
  }

  const toggleSelectPlaylist = (id: number) => {
    setSelectedPlaylists(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const handleApplySelectedPlaylists = async () => {
    await setActivePlaylistIds([...selectedPlaylists])
    if (selectedPlaylists.size === 0) {
      toast.success('ยกเลิกการเลือกทั้งหมดแล้ว ระบบจะใช้ Playlist เริ่มต้น')
    } else {
      toast.success(`ใช้ ${selectedPlaylists.size} playlist เล่นต่อเนื่องแล้ว`)
    }
  }

  const isInPlaylist = (youtubeId: string) => playlistSongs.some(s => s.youtube_id === youtubeId)

  return (
    <div className="admin-shell min-h-[100dvh] pb-12">
      {/* Header (Top Nav) */}
      <header className="admin-glass sticky top-0 z-30 border-b border-border/20">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-primary/80">Venue Console</p>
              <h1 className="text-sm font-bold tracking-tight sm:text-base text-foreground">Music Library Control</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(true)}
              className="h-9 gap-1.5 border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 border-border/60 transition-all rounded-xl"
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Responsive Split Grid */}
      <main className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
          
          {/* LEFT COLUMN: Sidebar Console (Library & Playlists) */}
          <div className="flex flex-col gap-4">
            
            {/* Quick Stats Widget */}
            <div className="admin-surface rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <LibraryBig className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {currentPlaylist?.name || 'ยังไม่ได้เลือกเพลย์ลิสต์'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {currentPlaylist?.is_default ? 'เพลย์ลิสต์ตั้งต้นระบบ' : 'เพลย์ลิสต์ทั่วไป'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-border/30 pt-3 text-center">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Playlists</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">{playlists.length}</p>
                </div>
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Tracks</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">{playlistSongs.length}</p>
                </div>
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Requests</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-primary">{requests.length}</p>
                </div>
              </div>
            </div>

            {/* Playlist Controller Panel */}
            <div className="admin-surface rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">คลังเพลย์ลิสต์</h2>
                
                {/* View Switcher */}
                <div className="flex rounded-lg border border-border/40 bg-black/10 p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPlaylistView('cards')}
                    className={cn('h-6 w-8 p-0', playlistView === 'cards' && 'bg-white/10 text-primary shadow-sm hover:bg-white/10')}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPlaylistView('table')}
                    className={cn('h-6 w-8 p-0', playlistView === 'table' && 'bg-white/10 text-primary shadow-sm hover:bg-white/10')}
                  >
                    <Rows3 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Create Playlist Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="ชื่อเพลย์ลิสต์ใหม่..."
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
                  className="h-9 border-border/40 bg-black/5 text-xs rounded-xl shadow-inner text-foreground placeholder:text-muted-foreground"
                />
                <Button size="sm" onClick={handleCreatePlaylist} disabled={isCreating || !newPlaylistName.trim()} className="h-9 w-9 rounded-xl shrink-0 p-0">
                  {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                </Button>
              </div>

              {/* Selected Playlists Multi-play Panel */}
              <div className="flex flex-col gap-2 rounded-xl border border-border/40 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground font-medium">
                    เลือกเล่นต่อเนื่อง ({selectedPlaylists.size})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Button size="sm" className="h-8 text-xs flex-1 rounded-lg" onClick={handleApplySelectedPlaylists}>
                    ใช้ชุดนี้เล่นต่อเนื่อง
                  </Button>
                  {selectedPlaylists.size > 0 && (
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg" onClick={() => setSelectedPlaylists(new Set())}>
                      ล้าง
                    </Button>
                  )}
                </div>
              </div>

              {/* Scrollable list of playlists */}
              <ScrollArea className="h-[340px] pr-1">
                {playlistView === 'cards' ? (
                  <div className="flex flex-col gap-2">
                    {playlists.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        ไม่มีรายการเพลย์ลิสต์
                      </div>
                    ) : (
                      playlists.map(pl => {
                        const isCurrent = currentPlaylist?.id === pl.id
                        return (
                          <div
                            key={pl.id}
                            className={cn(
                              'group overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer',
                              isCurrent
                                ? 'border-primary/40 bg-primary/[0.03] shadow-[0_8px_20px_rgba(110,231,183,0.04)]'
                                : 'border-border/40 bg-white/[0.01] hover:bg-white/[0.03] hover:border-border/80',
                              !pl.is_enabled && 'opacity-50'
                            )}
                            onClick={() => setActivePlaylistId(pl.id)}
                          >
                            <div className="flex items-center gap-3 p-3">
                              {/* Checkbox for continuous play selection */}
                              <button
                                className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                onClick={e => { e.stopPropagation(); toggleSelectPlaylist(pl.id) }}
                              >
                                {selectedPlaylists.has(pl.id)
                                  ? <CheckSquare className="w-4 h-4 text-primary" />
                                  : <Square className="w-4 h-4" />
                                }
                              </button>

                              {/* Beautiful Playlist Cover */}
                              <PlaylistCover playlist={pl} />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-xs font-bold text-foreground">{pl.name}</span>
                                  {pl.is_default && (
                                    <Badge className="h-4 border-primary/20 bg-primary/10 px-1 text-[8px] text-primary pointer-events-none">Default</Badge>
                                  )}
                                </div>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">{pl.song_count ?? 0} เพลง</p>
                              </div>
                              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', isCurrent ? 'bg-primary animate-pulse' : 'bg-transparent')} />
                            </div>

                            {/* Options inside current playlist card */}
                            {isCurrent && (
                              <div className="flex items-center gap-1 border-t border-border/30 bg-black/15 px-3 py-1.5">
                                {!pl.is_default && (
                                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 hover:bg-white/5 rounded" onClick={e => { e.stopPropagation(); handleSetDefault(pl.id) }}>
                                    <Star className="w-3 h-3 text-amber-400" />
                                    ตั้งเป็นหลัก
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 hover:bg-white/5 rounded" onClick={e => { e.stopPropagation(); handleToggleEnabled(pl.id, pl.is_enabled) }}>
                                  {pl.is_enabled ? <PowerOff className="w-3 h-3 text-red-400" /> : <Power className="w-3 h-3 text-emerald-400" />}
                                  {pl.is_enabled ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 hover:bg-white/5 rounded" onClick={e => { e.stopPropagation(); handleExportPlaylist(pl.id) }}>
                                  <Download className="w-3 h-3" />
                                  ส่งออก
                                </Button>
                                {!pl.is_default && (
                                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive rounded ml-auto" onClick={e => { e.stopPropagation(); handleDeletePlaylist(pl.id) }}>
                                    <Trash2 className="w-3 h-3" />
                                    ลบ
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border/40 bg-black/15">
                    <Table>
                      <TableHeader className="bg-white/[0.02]">
                        <TableRow className="border-b border-border/30">
                          <TableHead className="w-8 h-8 px-2 text-[10px]"></TableHead>
                          <TableHead className="px-2 text-[10px] text-muted-foreground">ชื่อ</TableHead>
                          <TableHead className="w-16 px-2 text-[10px] text-muted-foreground text-center">เพลง</TableHead>
                          <TableHead className="w-16 px-2 text-[10px] text-muted-foreground text-right">ควบคุม</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {playlists.map(pl => {
                          const isCurrent = currentPlaylist?.id === pl.id
                          return (
                            <TableRow
                              key={pl.id}
                              onClick={() => setActivePlaylistId(pl.id)}
                              className={cn(
                                'cursor-pointer border-b border-border/20 hover:bg-white/[0.02] transition-colors',
                                isCurrent && 'bg-primary/[0.02]',
                                !pl.is_enabled && 'opacity-40'
                              )}
                            >
                              <TableCell className="p-2">
                                <button
                                  className="flex h-5 w-5 items-center justify-center text-muted-foreground"
                                  onClick={e => { e.stopPropagation(); toggleSelectPlaylist(pl.id) }}
                                >
                                  {selectedPlaylists.has(pl.id)
                                    ? <CheckSquare className="h-3.5 w-3.5 text-primary" />
                                    : <Square className="h-3.5 w-3.5" />
                                  }
                                </button>
                              </TableCell>
                              <TableCell className="p-2 min-w-0">
                                <div className="flex items-center gap-2">
                                  <PlaylistCover playlist={pl} />
                                  <div className="truncate">
                                    <p className="font-bold text-xs text-foreground truncate">{pl.name}</p>
                                    {pl.is_default && <span className="text-[8px] text-primary">Default</span>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-2 text-center text-xs tabular-nums text-foreground">{pl.song_count ?? 0}</TableCell>
                              <TableCell className="p-2 text-right">
                                <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                                  {!pl.is_default && (
                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-white/5" onClick={() => handleSetDefault(pl.id)} title="ตั้งเป็นหลัก">
                                      <Star className="h-3 w-3 text-amber-400" />
                                    </Button>
                                  )}
                                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-white/5" onClick={() => handleToggleEnabled(pl.id, pl.is_enabled)} title={pl.is_enabled ? 'ปิด' : 'เปิด'}>
                                    {pl.is_enabled ? <PowerOff className="h-3 w-3 text-red-400" /> : <Power className="h-3 w-3 text-emerald-400" />}
                                  </Button>
                                  {!pl.is_default && (
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md" onClick={() => handleDeletePlaylist(pl.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* RIGHT COLUMN: Workspace (Playlist Songs, Search, Customer Requests) */}
          <div className="admin-surface rounded-3xl p-4 sm:p-5 flex flex-col gap-4">
            
            {/* Console Switcher Tabs */}
            <div className="border-b border-border/20 pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {currentPlaylist ? currentPlaylist.name : 'กรุณาเลือกเพลย์ลิสต์'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  จัดการแทร็กในเพลย์ลิสต์ ค้นหาเพลง หรือรับฟังคิวเพลงจากลูกค้า
                </p>
              </div>

              {/* Tabs list triggers */}
              <div className="flex rounded-xl bg-black/20 p-1 border border-border/40 self-start sm:self-center">
                <button
                  onClick={() => setActiveWorkspaceTab('tracks')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
                    activeWorkspaceTab === 'tracks'
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground border border-transparent'
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                  เพลงในเพลย์ลิสต์
                </button>
                <button
                  onClick={() => setActiveWorkspaceTab('search')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
                    activeWorkspaceTab === 'search'
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground border border-transparent'
                  )}
                >
                  <Search className="w-3.5 h-3.5" />
                  ค้นหาเพลง
                </button>
                <button
                  onClick={() => setActiveWorkspaceTab('requests')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 relative',
                    activeWorkspaceTab === 'requests'
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground border border-transparent'
                  )}
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse text-primary" />
                  คำขอจากลูกค้า
                  {requests.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground px-1 border border-background">
                      {requests.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB CONTENT: PLAYLIST TRACKS */}
            {activeWorkspaceTab === 'tracks' && (
              <div className="flex flex-col gap-2 min-h-[400px]">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">รายการแทร็กเสียง ({playlistSongs.length} รายการ)</p>
                </div>

                <ScrollArea className="h-[460px] pr-1">
                  {playlistSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                      <Music2 className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-xs font-bold text-foreground">เพลย์ลิสต์ว่างเปล่า</p>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[240px]">
                        ท่านสามารถกดแถบค้นหาที่ด้านขวาบนเพื่อค้นหาเพลงจาก YouTube และบันทึกลงในเพลย์ลิสต์นี้ได้ทันที
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {playlistSongs.map((song, i) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-border/20 bg-white/[0.01] hover:bg-white/[0.03] hover:border-border/60 transition-all group"
                        >
                          <span className="text-[10px] font-semibold text-muted-foreground w-6 text-center tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>

                          {song.thumbnail && (
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-12 h-9 rounded-lg object-cover shadow border border-white/5 flex-shrink-0"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {song.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {song.artist || 'ไม่ระบุผู้แต่ง'}
                            </p>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-destructive hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                            onClick={() => handleRemoveFromPlaylist(song.id)}
                            title="ลบเพลงออกจากเพลย์ลิสต์"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {/* TAB CONTENT: SEARCH YOUTUBE */}
            {activeWorkspaceTab === 'search' && (
              <div className="flex flex-col gap-3 min-h-[400px]">
                
                {/* Search Type Picker */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={searchType === 'video' ? 'default' : 'outline'}
                    className="h-8 text-[10px] gap-1.5 rounded-lg font-bold"
                    onClick={() => { setSearchType('video'); setSearchResults([]); setYtPlaylistResults([]) }}
                  >
                    <Music2 className="w-3 h-3" />
                    แทร็กเดี่ยว
                  </Button>
                  <Button
                    size="sm"
                    variant={searchType === 'playlist' ? 'default' : 'outline'}
                    className="h-8 text-[10px] gap-1.5 rounded-lg font-bold"
                    onClick={() => { setSearchType('playlist'); setSearchResults([]); setYtPlaylistResults([]) }}
                  >
                    <Youtube className="w-3 h-3" />
                    เพลย์ลิสต์ YouTube
                  </Button>
                </div>

                {/* Query bar */}
                <div className="flex gap-2">
                  <Input
                    placeholder={searchType === 'playlist' ? 'ค้นหา YouTube Playlist คีย์เวิร์ด...' : 'ค้นหาชื่อเพลงหรือชื่อศิลปิน...'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="h-10 border-border/40 bg-black/10 text-xs rounded-xl shadow-inner text-foreground placeholder:text-muted-foreground"
                  />
                  <Button size="sm" onClick={handleSearch} disabled={isSearching} className="h-10 px-4 rounded-xl shrink-0">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Target Destination Playlist */}
                {searchType === 'video' && playlists.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-black/15 p-2.5 border border-border/30">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-bold">บันทึกเพลงลงเพลย์ลิสต์:</span>
                    <select
                      className="flex-1 h-7 px-2 text-[10px] rounded-lg border border-border/50 bg-black/35 text-foreground font-bold focus:outline-none"
                      value={targetPlaylistId || currentPlaylist?.id || ''}
                      onChange={e => setTargetPlaylistId(Number(e.target.value))}
                    >
                      {playlists.map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-foreground">
                          {p.name} {p.is_default ? '(เริ่มต้น)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Search Results Display */}
                <ScrollArea className="h-[360px] pr-1">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-[10px] text-muted-foreground mt-2">กำลังสืบค้นฐานข้อมูล YouTube...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Video Single Track Results */}
                      {searchResults.map(result => {
                        const inPlaylist = isInPlaylist(result.id)
                        const isAdding = addingIds.has(result.id)
                        return (
                          <div
                            key={result.id}
                            className={cn(
                              'flex items-center gap-3 rounded-xl border border-border/20 bg-white/[0.01] p-2 hover:border-border/60 hover:bg-white/[0.03] transition-all',
                              inPlaylist && 'opacity-50'
                            )}
                          >
                            {result.thumbnail && (
                              <img
                                src={result.thumbnail}
                                alt={result.title}
                                className="w-14 h-10 rounded-lg object-cover flex-shrink-0 shadow border border-white/5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{result.title}</p>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{result.channelTitle}</p>
                            </div>
                            <Button
                              size="sm"
                              variant={inPlaylist ? 'secondary' : 'default'}
                              disabled={inPlaylist || isAdding}
                              onClick={() => handleAddToPlaylist(result)}
                              className="h-8 text-[10px] px-3 font-bold rounded-lg shrink-0"
                            >
                              {isAdding ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : inPlaylist ? (
                                'มีในลิสต์แล้ว'
                              ) : (
                                <>
                                  <Plus className="w-3 h-3 mr-1" />
                                  เพิ่มเพลง
                                </>
                              )}
                            </Button>
                          </div>
                        )
                      })}

                      {/* YouTube Playlist Results */}
                      {ytPlaylistResults.map(pl => (
                        <div
                          key={pl.id}
                          className="flex items-center gap-3 rounded-xl border border-border/20 bg-white/[0.01] p-2 hover:border-border/60 hover:bg-white/[0.03] transition-all"
                        >
                          {pl.thumbnail && (
                            <img
                              src={pl.thumbnail}
                              alt={pl.title}
                              className="w-14 h-10 rounded-lg object-cover flex-shrink-0 shadow border border-white/5"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{pl.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {pl.channelTitle} · {pl.itemCount} เพลง
                            </p>
                          </div>
                          <Button
                            size="sm"
                            disabled={importingId === pl.id}
                            onClick={() => handleImportYoutubePlaylist(pl)}
                            className="h-8 text-[10px] px-3 font-bold rounded-lg shrink-0"
                          >
                            {importingId === pl.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                นำเข้าคลัง
                              </>
                            )}
                          </Button>
                        </div>
                      ))}

                      {searchResults.length === 0 && ytPlaylistResults.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                          <Search className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-[10px]">ป้อนคำค้นหาเพื่อเริ่มต้นสแกนรายการเพลง</p>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {/* TAB CONTENT: CUSTOMER SONG REQUESTS */}
            {activeWorkspaceTab === 'requests' && (
              <div className="flex flex-col gap-2 min-h-[400px]">
                <p className="text-xs text-muted-foreground">
                  รายการเพลงขอรับบริการโดยลูกค้า ({requests.length} แทร็กคิวรอ)
                </p>

                <ScrollArea className="h-[460px] pr-1">
                  {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                      <Radio className="w-12 h-12 mb-3 opacity-20 text-muted-foreground" />
                      <p className="text-xs font-bold text-foreground">ยังไม่มีการส่งคำขอเพลงในขณะนี้</p>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                        บาร์โค้ด QR สำหรับลูกค้าอยู่ตรงด้านบนขวา ลูกค้าสามารถสแกนเพื่อส่งคำขอได้ทันที
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {requests.map((req, i) => {
                        const isCurrentPlaying = i === 0
                        return (
                          <div
                            key={req.id}
                            className={cn(
                              'flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200',
                              isCurrentPlaying
                                ? 'border-primary/40 bg-primary/[0.04] shadow-[0_8px_20px_rgba(110,231,183,0.03)]'
                                : 'border-border/20 bg-white/[0.01]'
                            )}
                          >
                            <span className="text-xs font-semibold text-muted-foreground w-6 text-center tabular-nums">
                              {i + 1}
                            </span>

                            {req.thumbnail && (
                              <img
                                src={req.thumbnail}
                                alt={req.title}
                                className="w-12 h-9 rounded-lg object-cover shadow border border-white/5 flex-shrink-0"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{req.title}</p>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                ขอโดย: {req.requested_by || 'ลูกค้าทั่วไป'}
                              </p>
                            </div>

                            {isCurrentPlaying && (
                              <Badge className="h-5 px-1.5 text-[8px] bg-primary/20 text-primary border-primary/30 pointer-events-none font-bold uppercase shrink-0">
                                กำลังเล่น
                              </Badge>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                              onClick={() => handleRemoveRequest(req.id)}
                              title="ลบออกหรือข้ามสคริปต์นี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QR Code Floating Modal Component */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowQR(false)}>
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full border border-border/60 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-foreground">ลิงก์ส่งคำขอเพลงสำหรับลูกค้า</h3>
              <Button size="icon" variant="ghost" className="w-8 h-8 rounded-xl" onClick={() => setShowQR(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-4 text-center select-all">{pageUrl}</p>
            {qrDataUrl ? (
              <div className="flex flex-col items-center gap-5">
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#101a17] p-3 shadow-inner">
                  <img src={qrDataUrl} alt="Request Webpage QR Code" className="w-52 h-52 object-contain" />
                </div>
                <Button className="w-full gap-2 rounded-xl font-bold h-10 text-xs" onClick={handleDownloadQR}>
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดภาพ QR Code
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-52">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
