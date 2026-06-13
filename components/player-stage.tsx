'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/context/player-context'

/**
 * Ambient visualizer bars that dance while music plays.
 * Renders animated bars with different heights and random-ish animation delays.
 */
function AmbientVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = useRef<number[]>([])
  if (bars.current.length === 0) {
    bars.current = Array.from({ length: 36 }, () => Math.floor(Math.random() * 80 + 20))
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-[3px] px-4 pb-2 sm:gap-[4px] sm:pb-4">
      {bars.current.map((height, i) => (
        <span
          key={i}
          className={cn(
            'w-[2px] rounded-full transition-all duration-300 sm:w-[3px]',
            isPlaying
              ? 'bg-primary/10 opacity-60'
              : 'bg-white/[0.04] opacity-30',
          )}
          style={{
            height: `${isPlaying ? height : 20}%`,
            animation: isPlaying
              ? `visualizer-bounce ${Math.random() * 0.6 + 0.4}s ease-in-out ${i * 0.06}s infinite alternate`
              : 'none',
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Floating particles / shimmer overlay for ambient motion.
 */
function AmbientParticles({ isPlaying }: { isPlaying: boolean }) {
  const particles = useRef<{ x: number; y: number; size: number; delay: number; duration: number }[]>([])
  if (particles.current.length === 0) {
    particles.current = Array.from({ length: 12 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: Math.random() * 4 + 3,
    }))
  }

  if (!isPlaying) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.current.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Full-width ambient stage background behind the now-playing view.
 * Shows thumbnail blur backdrop, visualizer bars, and floating particles.
 */
export function PlayerStage() {
  const { isPlaying, currentSong } = usePlayer()

  if (!currentSong) return null

  return (
    <div className="player-stage-surface relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30 sm:mt-4">
      {/* Ambient background — thumbnail as blurred backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {currentSong.thumbnail && (
          <img
            src={currentSong.thumbnail}
            alt=""
            className="absolute inset-[-24%] h-[148%] w-[148%] scale-105 object-cover blur-3xl opacity-30 saturate-[0.7]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent_60%)]" />
      </div>

      {/* Visualizer bars */}
      <AmbientVisualizer isPlaying={isPlaying} />

      {/* Floating particles */}
      <AmbientParticles isPlaying={isPlaying} />
    </div>
  )
}
