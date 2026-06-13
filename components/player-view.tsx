"use client";

import { useState } from "react";

import { AudioLines, Clock3, Disc3, Maximize2, Minimize2, Music2, Play, Radio, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/context/player-context";
import type { SongRequest } from "@/lib/types";
import { forceUpdateApp } from "@/lib/app-update";
import { PlayerStage } from "@/components/player-stage";

export function PlayerView() {
  const {
    isPlaying,
    currentSong,
    nextSong,
    playMode,
    isShuffle,
    isVideoMode,
    isFullscreen,
    currentTime,
    duration,
    currentIndex,
    playlistSongs,
    isPlaylistLoading,
    playlists,
    setIsVideoMode,
    setIsFullscreen,
    showControls,
    setShowControls,
    togglePlay,
    playSong,
  } = usePlayer();

  const [isUpdating, setIsUpdating] = useState(false);
  const handleForceUpdate = () => {
    forceUpdateApp(setIsUpdating);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Music Bar",
      text: "ฟังเพลงและขอเพลงที่ร้านนี้กับพวกเรา!",
      url: window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("แชร์สำเร็จ");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("ไม่สามารถแชร์ได้");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("คัดลอกลิงก์แชร์ลงคลิปบอร์ดแล้ว");
      } catch {
        toast.error("ไม่สามารถคัดลอกลิงก์ได้");
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  };

  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;
  const queuePreview = (() => {
    return playlistSongs
      .slice(currentIndex + 1)
      .concat(playlistSongs.slice(0, currentIndex));
  })();
  const nextSongIsFromPlaylist = nextSong && "playlist_id" in nextSong;
  const miniPlaylist = queuePreview.slice(nextSongIsFromPlaylist ? 1 : 0, nextSongIsFromPlaylist ? 4 : 3);

  if (!currentSong) {
    return (
      <div className="app-shell flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="surface-panel flex h-24 w-24 items-center justify-center rounded-3xl">
            <Music2 className="h-10 w-10 text-primary/75" />
          </div>
        </div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">Music bar</p>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          {isPlaylistLoading ? "กำลังโหลดเพลง" : "ยังไม่มีเพลง"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isPlaylistLoading
            ? "กำลังเตรียม playlist สำหรับเครื่องเล่น"
            : "เพิ่มเพลงใน playlist หรือรอให้ลูกค้าขอเพลง"}
        </p>
      </div>
    );
  }

  const requestedBy = "requested_by" in currentSong ? currentSong.requested_by : null;
  const currentPlaylistName = "playlist_id" in currentSong
    ? playlists.find((playlist) => playlist.id === currentSong.playlist_id)?.name || "House playlist"
    : "Guest request";

  return (
    <div
      className={cn(
        "app-shell relative flex min-h-[100dvh] flex-col overflow-y-auto bg-background transition-all duration-300 sm:h-[100dvh] sm:overflow-hidden",
        isFullscreen && "fixed inset-0 z-50",
      )}
    >
      <div className="player-stage-ambient pointer-events-none absolute inset-0 overflow-hidden">
        {!isVideoMode && currentSong.thumbnail && (
          <img
            src={currentSong.thumbnail}
            alt=""
            className="player-stage-art absolute inset-[-12%] h-[124%] w-[124%] object-cover"
          />
        )}
        <div className="player-stage-wash absolute inset-0" />
      </div>

      {/* ===== FULL-PAGE TOUCH OVERLAY (topmost, captures all taps to show controls) ===== */}
      <div
        className="absolute inset-0 z-[80]"
        onClick={() => {
          if (!showControls) {
            setShowControls(true);
          }
        }}
        onTouchStart={() => {
          if (!showControls) {
            setShowControls(true);
          }
        }}
        style={{ pointerEvents: showControls ? "none" : "auto" }}
      />

      {/* Fullscreen header bar */}
      {isFullscreen && (
        <div
          className={cn(
            "glass absolute top-0 left-0 right-0 z-[100] flex shrink-0 items-center justify-between border-b border-white/10 p-4 transition-opacity",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Music Bar</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="rounded-full hover:bg-white/10 text-white"
              title="แชร์"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(false)}
              className="rounded-full hover:bg-white/10 text-white"
            >
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <header className="absolute top-0 right-0 left-0 z-30 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <AudioLines className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Music bar</p>
              <p className="mt-0.5 text-xs text-white/50">Now playing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-7 gap-1.5 rounded-full border-white/10 bg-white/5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80 backdrop-blur transition-all hover:bg-white/10 hover:text-white"
            >
              <Share2 className="w-3 h-3 text-primary" />
              แชร์
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceUpdate}
              disabled={isUpdating}
              className="h-7 gap-1.5 rounded-full border-white/10 bg-white/5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80 backdrop-blur transition-all hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={cn("w-3 h-3", isUpdating && "animate-spin")} />
              อัปเดตแอป
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 backdrop-blur">
              <Radio className="h-3 w-3 text-primary" />
              Live
            </div>
          </div>
        </header>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-3 pb-[11rem] sm:p-8 sm:pb-[13rem]">
        <div className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center pt-14 sm:pt-16">
          {isVideoMode ? (
            <div
              className={cn(
                "relative w-full max-w-4xl overflow-hidden border border-white/10 bg-black/50 shadow-[0_26px_80px_rgba(0,0,0,0.36)] ring-1 ring-white/5 transition-all duration-500 aspect-video rounded-xl sm:rounded-2xl",
                isFullscreen && "fixed inset-0 z-[60] h-[100dvh] w-full max-w-none rounded-none border-none",
              )}
            >
            {/* The actual target where PersistentYouTubePlayer will move the iframe */}
            <div
              id="video-target-rect"
              className="w-full h-full absolute inset-0"
            />

            {/* Interaction Overlay on video: toggle play when controls visible */}
            <div
              className="absolute inset-0 z-[70] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (showControls) {
                  togglePlay();
                } else {
                  setShowControls(true);
                }
              }}
            />

            {/* Top Controls (Video/Fullscreen buttons) */}
            <div
              className={cn(
                "absolute inset-0 z-[95] flex items-start justify-between p-3 transition-opacity pointer-events-none sm:p-5",
                showControls ? "opacity-100" : "opacity-0",
              )}
            >
              <button
                className="pointer-events-auto flex h-10 w-10 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-black/30 backdrop-blur-md transition-all hover:bg-black/60 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoMode(!isVideoMode);
                }}
                title={isVideoMode ? "โหมดเพลง" : "โหมดวิดีโอ"}
              >
                <AudioLines className={cn("h-4 w-4", isVideoMode ? "text-primary" : "text-white/70")} />
              </button>

              <button
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur-md transition-all hover:bg-black/60 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(!isFullscreen);
                }}
                title={isFullscreen ? "ย่อหน้าจอ" : "ขยายเต็มจอ"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Song Info Overlay (bottom of video) */}
            <div
              className={cn(
                "pointer-events-none absolute right-0 bottom-0 left-0 z-[90] bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 pt-20 transition-opacity sm:p-9 sm:pt-28",
                showControls ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                {playMode === "request" && (
                  <Badge className="bg-accent text-accent-foreground border-none text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full">
                    Requested
                  </Badge>
                )}
                {isShuffle && (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-widest px-3 py-0.5 border-white/20 text-white rounded-full bg-white/5 backdrop-blur-sm"
                  >
                    Shuffle
                  </Badge>
                )}
              </div>
              <h2 className="mb-2 line-clamp-2 max-w-3xl text-2xl font-semibold leading-[1.1] tracking-tight text-white drop-shadow-lg sm:text-4xl">
                {currentSong.title}
              </h2>
              <p className="text-sm font-medium text-white/65 drop-shadow-md sm:text-base">
                {"requested_by" in currentSong &&
                (currentSong as SongRequest).requested_by
                  ? `Requested by: ${(currentSong as SongRequest).requested_by}`
                  : "Music Bar Selection"}
              </p>
            </div>
            </div>
          ) : (
            <section className="grid w-full max-w-6xl gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
              <div className="player-glass-card player-glass-card-featured relative overflow-hidden rounded-2xl p-4 sm:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(110,231,183,0.12),transparent_42%)]" />
                <div className="relative grid gap-5 sm:grid-cols-[minmax(11rem,0.82fr)_minmax(0,1.18fr)] sm:items-center">
                  <div className="relative aspect-square overflow-hidden rounded border border-white/10 bg-black/30 shadow-2xl">
                    {currentSong.thumbnail ? (
                      <img
                        src={currentSong.thumbnail}
                        alt={currentSong.title}
                        className={cn("h-full w-full object-cover transition-transform duration-700", isPlaying && "scale-105")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Disc3 className="h-20 w-20 text-primary/45" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                      <AudioLines className="h-3 w-3 text-primary" />
                      Audio mode
                    </div>
                    <div className="absolute right-3 bottom-3 flex h-8 items-end gap-1 rounded-full border border-white/15 bg-black/35 px-3 py-2 backdrop-blur">
                      {[40, 78, 55, 92, 62].map((height, index) => (
                        <span
                          key={height}
                          className={cn("w-0.5 rounded-full bg-primary", isPlaying && "animate-pulse")}
                          style={{ height: `${height}%`, animationDelay: `${index * 120}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Badge className="border-primary/20 bg-primary/10 text-primary">Now playing</Badge>
                      {playMode === "request" && <Badge variant="outline" className="border-white/15 text-white/65">Requested</Badge>}
                      {isShuffle && <Badge variant="outline" className="border-white/15 text-white/65">Shuffle</Badge>}
                    </div>
                    <h1 className="line-clamp-3 text-2xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl">
                      {currentSong.title}
                    </h1>
                    <p className="mt-3 text-sm text-white/55">
                      {requestedBy ? `Requested by ${requestedBy}` : "Curated for Music Bar"}
                    </p>

                    <div className="mt-8">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-medium tabular-nums text-white/45">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Source</p>
                        <p className="mt-1.5 truncate text-sm font-medium text-white/80">{currentPlaylistName}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Playback</p>
                        <p className="mt-1.5 text-sm font-medium text-white/80">{isPlaying ? "Playing live" : "Paused"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="player-glass-card rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">Up next</p>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">01</span>
                  </div>
                  {nextSong ? (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
                        {nextSong.thumbnail ? <img src={nextSong.thumbnail} alt={nextSong.title} className="h-full w-full object-cover" /> : <Music2 className="m-5 h-6 w-6 text-white/30" />}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-white/85">{nextSong.title}</p>
                        <p className="mt-1 text-xs text-white/40">Next in queue</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-white/45">ไม่มีเพลงถัดไปในคิว</p>
                  )}
                </div>
                <div className="player-glass-card rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white/75">
                      <Clock3 className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Mini playlist</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Later</span>
                  </div>
                  {miniPlaylist.length > 0 ? (
                    <div className="mt-3 divide-y divide-white/10">
                      {miniPlaylist.map((song, index) => (
                        <button
                          key={`${song.id}-${index}`}
                          type="button"
                          onClick={() => playSong(song)}
                          className="group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-all duration-300 hover:bg-white/[0.075] hover:pl-3 hover:text-primary"
                        >
                          <span className="w-4 text-[10px] font-medium tabular-nums text-white/30">{index + 1}</span>
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
                            {song.thumbnail ? <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" /> : <Music2 className="m-2.5 h-4 w-4 text-white/30" />}
                          </div>
                          <p className="line-clamp-2 text-xs font-medium leading-snug text-white/70 transition-colors group-hover:text-primary">{song.title}</p>
                          <Play className="ml-auto h-3.5 w-3.5 shrink-0 text-white/0 transition-colors group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-white/45">ยังไม่มีเพลงเพิ่มเติมในคิว</p>
                  )}
                </div>
              </aside>
            </section>
          )}

          {/* --- Premium playlist stage rail --- */}
          {!isVideoMode && <PlayerStage />}
        </div>
      </div>
    </div>
  );
}
