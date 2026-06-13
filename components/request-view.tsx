'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { Search, Plus, Music2, Loader2, Check, QrCode, Download, X, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { YouTubeSearchResult, SongRequest } from '@/lib/types'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/context/player-context'
import { forceUpdateApp } from '@/lib/app-update'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

function getOrCreateDeviceId(storagePrefix: string): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(`${storagePrefix}:device_id`) || localStorage.getItem('music_bar_device_id')
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36)
  }
  localStorage.setItem(`${storagePrefix}:device_id`, id)
  return id
}

export function RequestView() {
  const pathname = usePathname()
  const tenantSlug = pathname?.match(/^\/play\/([^/]+)/)?.[1] || null
  const tenantStoragePrefix = tenantSlug ? `music_bar:${tenantSlug}` : 'music_bar'
  const apiPath = (path: string) => {
    if (!tenantSlug) return path
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}tenant=${encodeURIComponent(tenantSlug)}`
  }
  const { isRequestsEnabled } = usePlayer()
  const [deviceId, setDeviceId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [requesterName, setRequesterName] = useState('')
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleForceUpdate = () => {
    forceUpdateApp(setIsUpdating)
  }

  // All requests for queue position
  const { data: allRequests = [] } = useSWR<SongRequest[]>(apiPath('/api/requests'), fetcher, { refreshInterval: 3000 })
  // My requests with queue_position
  const { data: myRequests = [], mutate } = useSWR<(SongRequest & { queue_position: number })[]>(
    deviceId ? apiPath(`/api/requests?device_id=${deviceId}`) : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  useEffect(() => {
    const id = getOrCreateDeviceId(tenantStoragePrefix)
    setDeviceId(id)
    setPageUrl(window.location.origin + (tenantSlug ? `/play/${tenantSlug}/request` : '/request'))
  }, [tenantSlug, tenantStoragePrefix])

  // Generate QR code using qrcode.js via CDN canvas approach
  useEffect(() => {
    if (!showQR || !pageUrl) return
    generateQRCode(pageUrl)
  }, [showQR, pageUrl])

  const generateQRCode = async (url: string) => {
    try {
      // Use a free QR code API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=101a17&color=6ee7b7&format=png&margin=20`
      setQrDataUrl(qrUrl)
    } catch {
      toast.error('ไม่สามารถสร้าง QR code ได้')
    }
  }

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
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการค้นหา')
        return
      }
      setSearchResults(data.items || [])
    } catch {
      toast.error('เกิดข้อผิดพลาดในการค้นหา')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToQueue = async (result: YouTubeSearchResult) => {
    if (addingIds.has(result.id) || addedIds.has(result.id)) return
    setAddingIds(prev => new Set(prev).add(result.id))
    try {
      const res = await fetch(apiPath('/api/requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_id: result.id,
          title: result.title,
          thumbnail: result.thumbnail,
          duration: result.duration,
          requested_by: requesterName.trim() || 'ลูกค้า',
          device_id: deviceId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'ไม่สามารถเพิ่มเพลงได้')
        return
      }
      setAddedIds(prev => new Set(prev).add(result.id))
      mutate()
      toast.success('เพิ่มเพลงในคิวแล้ว')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setAddingIds(prev => { const n = new Set(prev); n.delete(result.id); return n })
    }
  }

  const isInQueue = (youtubeId: string) =>
    allRequests.some(r => r.youtube_id === youtubeId) || addedIds.has(youtubeId)

  // Find global queue position for my songs
  const getQueuePosition = (youtubeId: string) => {
    const idx = allRequests.findIndex(r => r.youtube_id === youtubeId)
    return idx >= 0 ? idx + 1 : null
  }

  if (!isRequestsEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2">
          <Music2 className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">ขออภัย! ขณะนี้ปิดรับขอเพลง</h1>
        <p className="text-muted-foreground text-sm max-w-[250px]">
          ทางร้านยังไม่เปิดรับคำขอเพลงในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold gradient-text">ขอเพลง</h1>
            <p className="text-muted-foreground text-xs">ค้นหาและเพิ่มเพลงที่คุณอยากฟัง</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs rounded-lg border-border"
              onClick={handleForceUpdate}
              disabled={isUpdating}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isUpdating && "animate-spin")} />
              อัปเดตแอป
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setShowQR(true)}
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Code
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border/60 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg gradient-text">QR Code ขอเพลง</h2>
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

      <div className="flex flex-col">
        {/* My Queue (mini) */}
        {myRequests.length > 0 && (
          <div className="px-4 py-2.5 border-b border-border/40 bg-card/30">
            <p className="text-xs text-muted-foreground mb-1.5">เพลงที่คุณขอ ({myRequests.length})</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {myRequests.map(req => {
                const pos = getQueuePosition(req.youtube_id)
                return (
                  <div key={req.id} className="relative flex-shrink-0">
                    {req.thumbnail && (
                      <img src={req.thumbnail} alt={req.title} className="w-10 h-10 rounded object-cover" />
                    )}
                    {pos !== null && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold leading-none">
                        {pos}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Name input */}
        <div className="px-4 pt-3 pb-2">
          <Input
            placeholder="ชื่อของคุณ (ไม่บังคับ)"
            value={requesterName}
            onChange={e => setRequesterName(e.target.value)}
            className="bg-card border-border h-9 text-sm"
          />
        </div>

        {/* Search */}
        <div className="flex gap-2 px-4 pb-2">
          <Input
            placeholder="ค้นหาเพลง..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="bg-card border-border h-9 text-sm"
          />
          <Button size="sm" onClick={handleSearch} disabled={isSearching} className="h-9 px-3">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {/* Results */}
        <div className="px-4 pb-24 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div className="space-y-2 pr-1">
            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Music2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">ค้นหาเพลงที่คุณชอบ</p>
              </div>
            )}

            {isSearching && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">กำลังค้นหา...</p>
              </div>
            )}

            {searchResults.map(result => {
              const inQueue = isInQueue(result.id)
              const isAdding = addingIds.has(result.id)
              const pos = getQueuePosition(result.id)

              return (
                <div
                  key={result.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 transition-all hover-lift',
                    inQueue && 'opacity-70'
                  )}
                >
                  {result.thumbnail && (
                    <img src={result.thumbnail} alt={result.title} className="w-16 h-12 rounded object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2 leading-snug">{result.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{result.channelTitle}</p>
                    {inQueue && pos && (
                      <Badge variant="outline" className="mt-1 h-4 px-1.5 text-[10px] border-accent/30 text-accent">
                        คิวที่ {pos}
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant={inQueue ? 'secondary' : 'default'}
                    disabled={inQueue || isAdding}
                    onClick={() => handleAddToQueue(result)}
                    className={cn('flex-shrink-0 w-9 h-9', !inQueue && 'bg-primary hover:bg-primary/90')}
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" />
                      : inQueue ? <Check className="w-4 h-4" />
                        : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
