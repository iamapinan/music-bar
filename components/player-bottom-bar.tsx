"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music2,
  Shuffle,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlayer } from "@/context/player-context";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Lightweight seek bar — no Radix, no React reconciliation flicker */
function SeekBar({
  currentTime: ct,
  duration: dur,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPct, setDragPct] = useState(0);
  const isDragging = useRef(false);

  const max = dur || 100;
  const pct = dragging
    ? dragPct
    : max > 0
      ? Math.min((ct / max) * 100, 100)
      : 0;

  const getPct = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDragging.current = true;
      setDragging(true);
      const p = getPct(e.clientX);
      setDragPct(p * 100);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getPct],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const p = getPct(e.clientX);
      setDragPct(p * 100);
    },
    [getPct],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);
      const p = getPct(e.clientX);
      onSeek(p * max);
    },
    [getPct, max, onSeek],
  );

  return (
    <div
      className="absolute right-0 bottom-16 left-0 z-20 h-5 flex items-center justify-between gap-3 px-3 pointer-events-none sm:bottom-20 sm:px-4"
    >
      <span className="text-[10px] font-semibold text-white/55 tabular-nums select-none shrink-0 pointer-events-auto">
        {formatTime(ct)}
      </span>

      <div
        ref={barRef}
        className="group relative flex-1 h-5 flex items-center cursor-pointer pointer-events-auto"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        <div className="relative w-full h-1 rounded-full overflow-hidden bg-white/10 group-hover:h-1.5 transition-[height] duration-150">
          {/* Progress fill — uses transform: scaleX for GPU compositing, no layout/paint */}
          <div
            className="absolute inset-0 origin-left rounded-full bg-primary will-change-transform"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3.5 rounded-full border-2 border-primary bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>

      <span className="text-[10px] font-semibold text-white/55 tabular-nums select-none shrink-0 pointer-events-auto">
        {formatTime(dur)}
      </span>
    </div>
  );
}

export function PlayerBottomBar() {
  const {
    isPlaying,
    currentSong,
    volume,
    isMuted,
    isShuffle,
    currentTime,
    duration,
    playerRef,
    togglePlay,
    handleSkip,
    handlePrevious,
    handleVolumeChange,
    toggleMute,
    toggleShuffle,
    playMode,
    isVideoMode,
    setIsVideoMode,
    isFullscreen,
    setIsFullscreen,
    showControls,
  } = usePlayer();

  const pathname = usePathname();
  const [isDraggingTime, setIsDraggingTime] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const displayTime = isDraggingTime ? dragTime : currentTime;

  const handleSeek = useCallback(
    (t: number) => {
      playerRef.current?.seekTo(t);
    },
    [playerRef],
  );

  if (!currentSong) {
    return (
      <div
        className={cn(
          "fixed right-0 bottom-0 left-0 z-[100] border-t border-white/10 bg-background/25 shadow-[0_-18px_70px_rgba(0,0,0,0.28)] backdrop-blur-3xl",
          pathname === "/admin" && "admin-player-dock",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] transition-[transform,opacity] duration-500",
        pathname === "/" && isVideoMode && isFullscreen && !showControls
          ? "translate-y-24 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto",
      )}
    >
      <div
        className={cn(
          "player-ambient pointer-events-auto relative w-full border-t border-white/10 bg-background/35 shadow-[0_-18px_70px_rgba(0,0,0,0.32)] backdrop-blur-3xl",
          pathname === "/admin" && "admin-player-dock",
        )}
      >
        <SeekBar
          currentTime={displayTime}
          duration={duration}
          onSeek={(t) => {
            setIsDraggingTime(false);
            handleSeek(t);
          }}
        />

        <div className="relative z-10 flex h-16 items-center justify-between gap-1 px-2.5 sm:h-20 sm:gap-4 sm:px-4">
          {/* Left: Song Info */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <div className="relative group shrink-0">
              <div className="h-10 w-10 overflow-hidden rounded border border-white/10 bg-muted sm:h-16 sm:w-16">
                {currentSong.thumbnail ? (
                  <img
                    src={currentSong.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold truncate text-white leading-tight">
                {currentSong.title}
              </h3>
              <p className="text-[9px] sm:text-xs text-white/90 font-medium mt-0.5 truncate uppercase tracking-wider">
                {"requested_by" in currentSong
                  ? `${currentSong.requested_by || "ลูกค้า"}`
                  : "Playlist"}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-6">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevious}
              className="hidden sm:flex w-10 h-10 rounded-full text-white/60 hover:text-white disabled:opacity-30"
              disabled={playMode === "request"}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleSkip}
              className="w-10 h-10 rounded-full text-white/60 hover:text-white"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Right: Extra Controls */}
          <div className="flex flex-1 items-center justify-end gap-0 sm:gap-4">
            {/* Desktop Only Controls */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "w-10 h-10 rounded-full",
                  isShuffle
                    ? "text-primary bg-primary/10"
                    : "text-white/60 hover:text-white",
                )}
                onClick={toggleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2 w-24 lg:w-32 mr-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 rounded-full shrink-0 text-white/60 hover:text-white"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="flex-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Mobile/Tablet "More" Menu & Primary Actions */}
            <div className="flex items-center gap-0.5 sm:gap-2 lg:hidden">
              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-white/60 hover:text-white sm:h-10 sm:w-10"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 glass backdrop-blur-xl border-white/10 z-[120]"
                >
                  <DropdownMenuItem
                    onClick={toggleShuffle}
                    className="flex items-center gap-2 py-3"
                  >
                    <Shuffle
                      className={cn("w-4 h-4", isShuffle && "text-primary")}
                    />
                    <span>สุ่มเพลง: {isShuffle ? "เปิด" : "ปิด"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
