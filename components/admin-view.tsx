'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Plus, Search, Trash2, Music2, Loader2, List, Settings,
  Star, StarOff, Power, PowerOff, Download, Import, Youtube,
  CheckSquare, Square, X, RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Playlist, PlaylistSong, YouTubeSearchResult, YouTubePlaylistResult, SongRequest } from '@/lib/types'
import { cn } from '@/lib/utils'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

interface AdminViewProps {
  onLogout: () => void
}

export function AdminView({ onLogout }: AdminViewProps) {
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
    if (!currentPlaylist || addingIds.has(result.id)) return
    setAddingIds(prev => new Set(prev).add(result.id))
    try {
      const res = await fetch(`/api/playlists/${currentPlaylist.id}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_id: result.id, title: result.title, thumbnail: result.thumbnail, artist: result.channelTitle }),
      })
      if (!res.ok) throw new Error()
      mutateSongs()
      toast.success('เพิ่มเพลงแล้ว')
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

  const isInPlaylist = (youtubeId: string) => playlistSongs.some(s => s.youtube_id === youtubeId)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/50 glass">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">จัดการเพลง</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout} className="text-xs h-8">
          ออกจากระบบ
        </Button>
      </div>

      <Tabs defaultValue="playlists" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 grid grid-cols-3 h-9">
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
        <TabsContent value="playlists" className="flex-1 flex flex-col overflow-hidden p-4 pb-0">
          {/* Create New */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="ชื่อ playlist ใหม่..."
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
              className="bg-card border-border h-9 text-sm"
            />
            <Button size="sm" onClick={handleCreatePlaylist} disabled={isCreating || !newPlaylistName.trim()} className="h-9 px-3">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>

          {selectedPlaylists.size > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary flex-1">เลือก {selectedPlaylists.size} playlist เพื่อเล่นต่อเนื่อง</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => setSelectedPlaylists(new Set())}>
                <X className="w-3 h-3 mr-1" />ล้าง
              </Button>
            </div>
          )}

          <ScrollArea className="flex-1 pb-20">
            <div className="space-y-2 pr-1">
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
                      'rounded-xl border transition-all',
                      currentPlaylist?.id === pl.id
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/50 bg-card/60',
                      !pl.is_enabled && 'opacity-60'
                    )}
                  >
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer"
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm truncate">{pl.name}</span>
                          {pl.is_default && <Badge className="h-4 px-1.5 text-[10px] bg-primary/20 text-primary border-primary/30">เริ่มต้น</Badge>}
                          {!pl.is_enabled && <Badge variant="outline" className="h-4 px-1.5 text-[10px]">ปิด</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{pl.song_count ?? 0} เพลง</p>
                      </div>
                    </div>

                    {currentPlaylist?.id === pl.id && (
                      <div className="flex gap-1.5 px-3 pb-3 flex-wrap">
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
          </ScrollArea>
        </TabsContent>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="flex-1 flex flex-col overflow-hidden p-4 pb-0">
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
              className="bg-card border-border h-9 text-sm"
            />
            <Button size="sm" onClick={handleSearch} disabled={isSearching} className="h-9 px-3">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {currentPlaylist && searchType === 'video' && (
            <p className="text-xs text-muted-foreground mb-2">
              เพิ่มไปยัง: <span className="text-primary font-medium">{currentPlaylist.name}</span>
            </p>
          )}

          <ScrollArea className="flex-1 pb-20">
            <div className="space-y-2 pr-1">
              {isSearching && (
                <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" /></div>
              )}

              {/* Video results */}
              {searchResults.map(result => {
                const inPlaylist = isInPlaylist(result.id)
                const isAdding = addingIds.has(result.id)
                return (
                  <div key={result.id} className={cn('flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/40', inPlaylist && 'opacity-60')}>
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
                <div key={pl.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/40">
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
          </ScrollArea>
        </TabsContent>

        {/* REQUESTS TAB */}
        <TabsContent value="requests" className="flex-1 flex flex-col overflow-hidden p-4 pb-0">
          <ScrollArea className="flex-1 pb-20">
            <div className="space-y-2 pr-1">
              {requests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีคำขอเพลง</p>
                </div>
              ) : (
                requests.map((req, i) => (
                  <div key={req.id} className={cn(
                    'flex items-center gap-3 p-2.5 rounded-xl border',
                    i === 0 ? 'border-primary/30 bg-primary/5' : 'border-border/40 bg-card/60'
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
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
