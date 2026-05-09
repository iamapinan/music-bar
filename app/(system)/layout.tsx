import { PlayerProvider } from '@/context/player-context'
import { PersistentYouTubePlayer } from '@/components/persistent-player'

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <PersistentYouTubePlayer />
      {children}
    </PlayerProvider>
  )
}
