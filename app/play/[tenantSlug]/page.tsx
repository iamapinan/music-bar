import { PersistentYouTubePlayer } from '@/components/persistent-player'
import { PlayerBottomBar } from '@/components/player-bottom-bar'
import { PlayerView } from '@/components/player-view'

export default function TenantPlayerPage() {
  return (
    <>
      <PersistentYouTubePlayer />
      <main className="min-h-[100dvh] overflow-y-auto bg-background sm:h-[100dvh] sm:overflow-hidden">
        <PlayerView />
      </main>
      <PlayerBottomBar />
    </>
  )
}
