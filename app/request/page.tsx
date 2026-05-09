import { RequestView } from '@/components/request-view'

export default function RequestPage() {
  return (
    <main className="min-h-[100dvh] bg-background flex flex-col items-center">
      <div className="w-full max-w-md bg-card/20 min-h-[100dvh] flex flex-col shadow-[0_0_50px_-15px_rgba(0,0,0,0.5)] border-x border-border/10 relative">
        <RequestView />
      </div>
    </main>
  )
}
