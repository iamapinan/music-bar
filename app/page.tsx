import { BottomNav } from '@/components/bottom-nav'
import { PlayerView } from '@/components/player-view'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <PlayerView />
      <BottomNav />
    </main>
  )
}
