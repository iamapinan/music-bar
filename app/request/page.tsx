import { BottomNav } from '@/components/bottom-nav'
import { RequestView } from '@/components/request-view'

export default function RequestPage() {
  return (
    <main className="min-h-screen bg-background">
      <RequestView />
      <BottomNav />
    </main>
  )
}
