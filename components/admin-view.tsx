'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  Plus, Search, Trash2, Music2, Loader2, List, Settings, Radio, LayoutGrid, Rows3, LibraryBig,
  Star, StarOff, Power, PowerOff, Download, Import, Youtube,
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
    if (selectedPlaylists.size === 0) return
    await setActivePlaylistIds([...selectedPlaylists])
    toast.success(`ใช้ ${selectedPlaylists.size} playlist เล่นต่อเนื่องแล้ว`)
  }

  const isInPlaylist = (youtubeId: string) => playlistSongs.some(s => s.youtube_id === youtubeId)

  return (
    <div className="admin-shell min-h-[100dvh] pb-28 sm:pb-36">
      {/* Header */}
      <header className="admin-glass sticky top-0 z-30 border-b border-slate-200/80">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Venue console</p>
            <h1 className="text-base font-semibold leading-tight tracking-tight sm:text-lg">Music library</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowQR(true)} className="h-9 gap-1.5 border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10 hover:text-primary">
            <QrCode className="w-3.5 h-3.5" />
            QR
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout} className="h-9 text-xs">
            ออกจากระบบ
          </Button>
        </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="admin-surface grid gap-4 rounded-xl px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <LibraryBig className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{currentPlaylist?.name || 'ยังไม่ได้เลือก Playlist'}</p>
                {currentPlaylist?.is_default && <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-primary sm:inline">Default rotation</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">จัดคิวเพลง บริหารชุดเพลง และรับคำขอจากลูกค้าในพื้นที่เดียว</p>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 pt-3 sm:border-t-0 sm:pt-0">
            <div className="px-3 sm:px-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Playlists</p>
              <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">{playlists.length}</p>
            </div>
            <div className="px-3 sm:px-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tracks</p>
              <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">{playlistSongs.length}</p>
            </div>
            <div className="px-3 sm:px-5">
              <div className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-primary" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Requests</p>
              </div>
              <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-primary">{requests.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border/60 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg gradient-text">QR Code สำหรับลูกค้า</h2>
              <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setShowQR(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4 text-center">{pageUrl}</p>
            {qrDataUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-[#101a17] p-2">
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 object-contain" />
                </div>
                <Button className="w-full gap-2" onClick={handleDownloadQR}>
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด QR Code
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-56">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="playlists" className="mx-auto flex max-w-[1440px] flex-col px-4 sm:px-6 lg:px-8">
        <TabsList className="mt-4 grid h-11 grid-cols-3 rounded-xl border border-slate-200 bg-white/70 p-1 sm:mt-5 sm:max-w-md">
          <TabsTrigger value="playlists" className="text-xs gap-1.5">
            <List className="w-3.5 h-3.5" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="search" className="text-xs gap-1.5">
            <Search className="w-3.5 h-3.5" />
            ค้นหา
          </TabsTrigger>
          <TabsTrigger value="requests" className="text-xs gap-1.5">
            <Music2 className="w-3.5 h-3.5" />
            คำขอ
            {requests.length > 0 && (
              <Badge className="h-4 px-1 text-[10px] bg-accent text-white ml-0.5">{requests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* PLAYLISTS TAB */}
        <TabsContent value="playlists" className="admin-surface mt-3 flex flex-col rounded-xl p-3 pb-0 sm:p-5 sm:pb-0">
          {/* Create New */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="ชื่อ playlist ใหม่..."
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
              className="h-10 border-slate-200 bg-white text-sm shadow-sm"
            />
            <Button size="sm" onClick={handleCreatePlaylist} disabled={isCreating || !newPlaylistName.trim()} className="h-10 px-4">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">คลัง Playlist</p>
              <p className="text-xs text-muted-foreground">เลือกมุมมองให้เหมาะกับงานที่กำลังทำ</p>
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPlaylistView('cards')}
                className={cn('h-8 gap-1.5 px-2.5 text-xs', playlistView === 'cards' && 'bg-white text-primary shadow-sm hover:bg-white')}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPlaylistView('table')}
                className={cn('h-8 gap-1.5 px-2.5 text-xs', playlistView === 'table' && 'bg-white text-primary shadow-sm hover:bg-white')}
              >
                <Rows3 className="h-3.5 w-3.5" />
                Table
              </Button>
            </div>
          </div>

          {selectedPlaylists.size > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-2.5">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary flex-1">เลือก {selectedPlaylists.size} playlist เพื่อเล่นต่อเนื่อง</span>
              <Button size="sm" className="h-7 text-xs" onClick={handleApplySelectedPlaylists}>
                ใช้ชุดนี้เล่น
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => setSelectedPlaylists(new Set())}>
                <X className="w-3 h-3 mr-1" />ล้าง
              </Button>
            </div>
          )}

          <div className="pb-20">
            {playlistView === 'cards' ? (
            <div className="grid gap-2 pr-1 lg:grid-cols-2">
              {playlists.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <List className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มี playlist</p>
                </div>
              ) : (
                playlists.map(pl => (
                  <div
                    key={pl.id}
                    className={cn(
                      'group overflow-hidden rounded-xl border bg-white/72 transition-all duration-200',
                      currentPlaylist?.id === pl.id
                        ? 'border-primary/45 shadow-[0_12px_30px_rgba(29,102,104,0.1)]'
                        : 'border-slate-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_12px_28px_rgba(29,102,104,0.08)]',
                      !pl.is_enabled && 'opacity-60'
                    )}
                  >
                    <div
                      className="flex cursor-pointer items-center gap-3 p-3.5"
                      onClick={() => setActivePlaylistId(pl.id)}
                    >
                      <button
                        className="flex-shrink-0"
                        onClick={e => { e.stopPropagation(); toggleSelectPlaylist(pl.id) }}
                      >
                        {selectedPlaylists.has(pl.id)
                          ? <CheckSquare className="w-4 h-4 text-primary" />
                          : <Square className="w-4 h-4 text-muted-foreground" />
                        }
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{pl.name}</span>
                          {pl.is_default && <Badge className="h-4 border-primary/20 bg-primary/10 px-1.5 text-[10px] text-primary">Default</Badge>}
                          {!pl.is_enabled && <Badge variant="outline" className="h-4 px-1.5 text-[10px]">ปิด</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{pl.song_count ?? 0} tracks</p>
                      </div>
                      <span className={cn('h-2 w-2 rounded-full', currentPlaylist?.id === pl.id ? 'bg-primary' : 'bg-slate-200 group-hover:bg-primary/40')} />
                    </div>

                    {currentPlaylist?.id === pl.id && (
                      <div className="flex flex-wrap gap-1.5 border-t border-primary/10 bg-primary/[0.035] px-3 py-2.5">
                        {!pl.is_default && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleSetDefault(pl.id)}>
                            <Star className="w-3 h-3" />ตั้งเป็นหลัก
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleToggleEnabled(pl.id, pl.is_enabled)}>
                          {pl.is_enabled ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                          {pl.is_enabled ? 'ปิด' : 'เปิด'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleExportPlaylist(pl.id)}>
                          <Download className="w-3 h-3" />Export
                        </Button>
                        {!pl.is_default && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePlaylist(pl.id)}>
                            <Trash2 className="w-3 h-3" />ลบ
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Songs in this playlist */}
                    {currentPlaylist?.id === pl.id && (
                      <div className="border-t border-border/30 px-3 pb-3">
                        <p className="text-xs text-muted-foreground pt-2 pb-2">เพลงใน playlist ({playlistSongs.length})</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {playlistSongs.map(song => (
                            <div key={song.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/30 group">
                              {song.thumbnail && (
                                <img src={song.thumbnail} alt={song.title} className="w-8 h-6 rounded object-cover flex-shrink-0" />
                              )}
                              <p className="flex-1 text-xs truncate">{song.title}</p>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-6 h-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveFromPlaylist(song.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Playlist</TableHead>
                      <TableHead className="w-28">เพลง</TableHead>
                      <TableHead className="w-28">สถานะ</TableHead>
                      <TableHead className="w-64 text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playlists.map(pl => (
                      <TableRow
                        key={pl.id}
                        onClick={() => setActivePlaylistId(pl.id)}
                        className={cn('cursor-pointer', currentPlaylist?.id === pl.id && 'bg-primary/5', !pl.is_enabled && 'opacity-60')}
                      >
                        <TableCell>
                          <button
                            className="flex h-7 w-7 items-center justify-center"
                            onClick={e => { e.stopPropagation(); toggleSelectPlaylist(pl.id) }}
                          >
                            {selectedPlaylists.has(pl.id)
                              ? <CheckSquare className="h-4 w-4 text-primary" />
                              : <Square className="h-4 w-4 text-muted-foreground" />
                            }
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="max-w-[34rem] truncate font-medium">{pl.name}</span>
                            {pl.is_default && <Badge className="border-primary/20 bg-primary/10 text-primary">เริ่มต้น</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">{pl.song_count ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={pl.is_enabled ? 'border-primary/20 text-primary' : 'text-muted-foreground'}>
                            {pl.is_enabled ? 'เปิดใช้งาน' : 'ปิด'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            {!pl.is_default && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={e => { e.stopPropagation(); handleSetDefault(pl.id) }}>
                                <Star className="h-3 w-3" />หลัก
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={e => { e.stopPropagation(); handleToggleEnabled(pl.id, pl.is_enabled) }}>
                              {pl.is_enabled ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                              {pl.is_enabled ? 'ปิด' : 'เปิด'}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={e => { e.stopPropagation(); handleExportPlaylist(pl.id) }}>
                              <Download className="h-3 w-3" />Export
                            </Button>
                            {!pl.is_default && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={e => { e.stopPropagation(); handleDeletePlaylist(pl.id) }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="admin-surface mt-3 flex flex-col rounded-xl p-3 pb-0 sm:p-5 sm:pb-0">
          {/* Search type toggle */}
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant={searchType === 'video' ? 'default' : 'outline'}
              className="h-8 text-xs gap-1.5"
              onClick={() => { setSearchType('video'); setSearchResults([]); setYtPlaylistResults([]) }}
            >
              <Music2 className="w-3.5 h-3.5" />เพลง
            </Button>
            <Button
              size="sm"
              variant={searchType === 'playlist' ? 'default' : 'outline'}
              className="h-8 text-xs gap-1.5"
              onClick={() => { setSearchType('playlist'); setSearchResults([]); setYtPlaylistResults([]) }}
            >
              <Youtube className="w-3.5 h-3.5" />YouTube Playlist
            </Button>
          </div>

          <div className="flex gap-2 mb-3">
            <Input
              placeholder={searchType === 'playlist' ? 'ค้นหา YouTube Playlist...' : 'ค้นหาเพลง...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="h-10 border-slate-200 bg-white text-sm shadow-sm"
            />
            <Button size="sm" onClick={handleSearch} disabled={isSearching} className="h-10 px-4">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {searchType === 'video' && playlists.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">เพิ่มไปยัง:</span>
              <select
                className="flex-1 h-8 px-2 text-xs rounded-lg border border-border bg-card text-foreground"
                value={targetPlaylistId || currentPlaylist?.id || ''}
                onChange={e => setTargetPlaylistId(Number(e.target.value))}
              >
                {playlists.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.is_default ? '(เริ่มต้น)' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pb-20">
            <div className="grid gap-2 pr-1 lg:grid-cols-2">
              {isSearching && (
                <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" /></div>
              )}

              {/* Video results */}
              {searchResults.map(result => {
                const inPlaylist = isInPlaylist(result.id)
                const isAdding = addingIds.has(result.id)
                return (
                  <div key={result.id} className={cn('flex items-center gap-3 rounded-xl border border-border/40 bg-background/25 p-2.5 transition-colors hover:border-border', inPlaylist && 'opacity-60')}>
                    {result.thumbnail && (
                      <img src={result.thumbnail} alt={result.title} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.channelTitle}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={inPlaylist ? 'secondary' : 'default'}
                      disabled={inPlaylist || isAdding}
                      onClick={() => handleAddToPlaylist(result)}
                      className="h-8 text-xs px-3 flex-shrink-0"
                    >
                      {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : inPlaylist ? 'เพิ่มแล้ว' : <><Plus className="w-3 h-3 mr-1" />เพิ่ม</>}
                    </Button>
                  </div>
                )
              })}

              {/* Playlist results */}
              {ytPlaylistResults.map(pl => (
                <div key={pl.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/25 p-2.5 transition-colors hover:border-border">
                  {pl.thumbnail && (
                    <img src={pl.thumbnail} alt={pl.title} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate font-medium">{pl.title}</p>
                    <p className="text-xs text-muted-foreground">{pl.channelTitle} · {pl.itemCount} เพลง</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={importingId === pl.id}
                    onClick={() => handleImportYoutubePlaylist(pl)}
                    className="h-8 text-xs px-3 flex-shrink-0"
                  >
                    {importingId === pl.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw className="w-3 h-3 mr-1" />Import</>}
                  </Button>
                </div>
              ))}

              {!isSearching && searchResults.length === 0 && ytPlaylistResults.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ค้นหาเพลงหรือ playlist จาก YouTube</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* REQUESTS TAB */}
        <TabsContent value="requests" className="admin-surface mt-3 flex flex-col rounded-xl p-3 pb-0 sm:p-5 sm:pb-0">
          <div className="pb-20">
            <div className="grid gap-2 pr-1 lg:grid-cols-2">
              {requests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีคำขอเพลง</p>
                </div>
              ) : (
                requests.map((req, i) => (
                  <div key={req.id} className={cn(
                    'flex items-center gap-3 p-2.5 rounded-xl border',
                    i === 0 ? 'border-primary/30 bg-primary/5' : 'border-border/40 bg-background/25'
                  )}>
                    <span className="text-xs text-muted-foreground w-5 text-center tabular-nums">{i + 1}</span>
                    {req.thumbnail && (
                      <img src={req.thumbnail} alt={req.title} className="w-10 h-8 rounded object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium">{req.title}</p>
                      <p className="text-xs text-muted-foreground">ขอโดย: {req.requested_by || 'ลูกค้า'}</p>
                    </div>
                    {i === 0 && (
                      <Badge className="h-5 px-1.5 text-[10px] bg-primary/20 text-primary border-primary/30 flex-shrink-0">กำลังเล่น</Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={() => handleRemoveRequest(req.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
