import { PersistentYouTubePlayer } from '@/components/persistent-player'
import { PlayerBottomBar } from '@/components/player-bottom-bar'

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* Persistent player — ไม่ unmount เมื่อสลับหน้าระหว่าง / และ /admin */}
      <PersistentYouTubePlayer />
      <div className="pb-24 sm:pb-32">
        {children}
      </div>
      <PlayerBottomBar />
    </>
  )
}
