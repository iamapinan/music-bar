import { PlayerView } from '@/components/player-view'

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] overflow-y-auto bg-background sm:h-[100dvh] sm:overflow-hidden">
      <PlayerView />
    </main>
  )
}
