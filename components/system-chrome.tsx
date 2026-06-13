'use client'

import { usePathname } from 'next/navigation'
import { PersistentYouTubePlayer } from '@/components/persistent-player'
import { PlayerBottomBar } from '@/components/player-bottom-bar'

export function SystemChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showPlayerChrome = !['/', '/apply'].includes(pathname)

  return (
    <>
      {showPlayerChrome && <PersistentYouTubePlayer />}
      <div>{children}</div>
      {showPlayerChrome && <PlayerBottomBar />}
    </>
  )
}
