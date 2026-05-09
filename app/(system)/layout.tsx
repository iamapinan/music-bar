import { PlayerProvider } from '@/context/player-context'
import { PersistentYouTubePlayer } from '@/components/persistent-player'

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PlayerProvider>
      {/* Persistent player — ไม่ unmount เมื่อสลับหน้าระหว่าง / และ /admin */}
      <PersistentYouTubePlayer />
      {children}
    </PlayerProvider>
  )
}
