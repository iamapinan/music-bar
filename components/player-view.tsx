"use client";

import { useState } from "react";

import {
  AudioLines,
  Clock3,
  Disc3,
  Maximize2,
  Minimize2,
  Music2,
  Play,
  Radio,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/context/player-context";
import type { SongRequest } from "@/lib/types";
import { forceUpdateApp } from "@/lib/app-update";

export function PlayerView() {
  const {
    isPlaying,
    currentSong,
    nextSong,
    playMode,
    isShuffle,
    isVideoMode,
    isFullscreen,
    currentIndex,
    playlistSongs,
    isPlaylistLoading,
    playlists,
    activePlaylistIds,
    setIsVideoMode,
    setIsFullscreen,
    showControls,
    setShowControls,
    togglePlay,
    playSong,
  } = usePlayer();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showFullMiniPlaylist, setShowFullMiniPlaylist] = useState(false);
  const handleForceUpdate = () => {
    forceUpdateApp(setIsUpdating);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Music Bar",
      text: "ฟังเพลงและขอเพลงที่ร้านนี้กับพวกเรา!",
      url: window.location.href,
    };
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
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

  const queuePreview = (() => {
    return playlistSongs
      .slice(currentIndex + 1)
      .concat(playlistSongs.slice(0, currentIndex));
  })();
  const nextSongIsFromPlaylist = nextSong && "playlist_id" in nextSong;
  const miniPlaylistStart = nextSongIsFromPlaylist ? 1 : 0;
  const miniPlaylistItems = queuePreview.slice(
    miniPlaylistStart,
    miniPlaylistStart + 10,
  );
  const visibleMiniPlaylist = miniPlaylistItems.slice(
    0,
    showFullMiniPlaylist ? 10 : 6,
  );
  const canToggleMiniPlaylist = miniPlaylistItems.length > 6;

  if (!currentSong) {
    return (
      <div className="app-shell flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="surface-panel flex h-24 w-24 items-center justify-center rounded-3xl">
            <img
              src="/musicbar-logo-white.png"
              alt="Music Bar"
              className="h-14 w-14 object-contain opacity-95"
            />
          </div>
        </div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80">
          Music bar
        </p>
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

  const requestedBy =
    "requested_by" in currentSong ? currentSong.requested_by : null;
  const defaultPlaylist =
    playlists.find((playlist) => playlist.is_default) || playlists[0];
  const currentPlaylist =
    "playlist_id" in currentSong
      ? playlists.find((playlist) => playlist.id === currentSong.playlist_id)
      : null;
  const activePlaylist =
    activePlaylistIds.length === 1
      ? playlists.find((playlist) => playlist.id === activePlaylistIds[0])
      : null;
  const currentPlaylistName =
    currentPlaylist?.name ||
    activePlaylist?.name ||
    defaultPlaylist?.name ||
    "Playlist";
  const sourceLabel =
    playMode === "request"
      ? requestedBy
        ? `Guest request • ${requestedBy}`
        : "Guest request"
      : currentPlaylistName;

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10">
              <img
                src="/musicbar-logo-white.png"
                alt="Music Bar"
                className="h-5 w-5 object-contain opacity-95"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Music Bar
            </span>
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
              <img
                src="/musicbar-logo-white.png"
                alt="Music Bar"
                className="h-6 w-6 object-contain opacity-95"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">
                Music bar
              </p>
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
              <span>แชร์</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceUpdate}
              disabled={isUpdating}
              className="h-7 gap-1.5 rounded-full border-white/10 bg-white/5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80 backdrop-blur transition-all hover:bg-white/10 hover:text-white"
            >
              <RefreshCw
                className={cn("w-3 h-3", isUpdating && "animate-spin")}
              />
              <span className="hidden sm:inline">อัปเดตแอป</span>
              <span className="sm:hidden">อัปเดต</span>
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 backdrop-blur">
              <Radio className="h-3 w-3 text-primary" />
              Live
            </div>
          </div>
        </header>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-3 pb-[11rem] sm:p-8 sm:pb-[13rem]">
        <div className="relative flex h-full w-full max-w-[92rem] flex-col items-center justify-center pt-14 sm:pt-16">
          {isVideoMode ? (
            <div className="relative w-full max-w-4xl flex items-center justify-center">
              {/* Theater Light / Motion Glow effect */}
              {!isFullscreen && currentSong.thumbnail && (
                <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-visible">
                  {/* Layer 1: Outer wide blur */}
                  <img
                    src={currentSong.thumbnail}
                    alt=""
                    className={cn(
                      "absolute inset-[-10%] h-[120%] w-[120%] object-cover opacity-75 mix-blend-screen transition-opacity duration-1000",
                      isPlaying
                        ? "animate-theater-drift animate-theater-pulse"
                        : "opacity-35",
                    )}
                    style={{
                      filter: "blur(64px) saturate(1.8) brightness(1.1)",
                    }}
                  />
                  {/* Layer 2: Tight bright glow */}
                  <img
                    src={currentSong.thumbnail}
                    alt=""
                    className={cn(
                      "absolute inset-[-4%] h-[108%] w-[108%] object-cover opacity-60 mix-blend-screen transition-opacity duration-1000",
                      isPlaying
                        ? "animate-theater-drift-reverse animate-theater-pulse"
                        : "opacity-25",
                    )}
                    style={{
                      filter: "blur(36px) saturate(2) brightness(1)",
                    }}
                  />
                </div>
              )}

              <div
                className={cn(
                  "relative w-full overflow-hidden border border-white/10 bg-black/50 shadow-[0_26px_80px_rgba(0,0,0,0.36)] ring-1 ring-white/5 transition-all duration-500 aspect-video rounded-xl sm:rounded-2xl",
                  isFullscreen &&
                    "fixed inset-0 z-[60] h-[100dvh] w-full max-w-none rounded-none border-none",
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
                    <AudioLines
                      className={cn(
                        "h-4 w-4",
                        isVideoMode ? "text-primary" : "text-white/70",
                      )}
                    />
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
                  <h2 className="mb-2 line-clamp-2 max-w-3xl text-xl font-semibold leading-[1.1] tracking-tight text-white drop-shadow-lg sm:text-2xl">
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
            </div>
          ) : (
            <section className="grid w-full max-w-[92rem] gap-4 xl:grid-cols-[minmax(0,1.42fr)_minmax(21rem,0.58fr)] xl:gap-5">
              <article className="player-glass-card player-glass-card-featured relative min-h-[32rem] overflow-hidden rounded-[2rem] p-4 sm:min-h-[30rem] sm:p-6 xl:min-h-[28rem] xl:p-7">
                <div className="pointer-events-none absolute inset-0">
                  {currentSong.thumbnail && (
                    <img
                      src={currentSong.thumbnail}
                      alt=""
                      className="absolute inset-[-18%] h-[136%] w-[136%] object-cover opacity-[0.18] blur-3xl saturate-50"
                    />
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(110,231,183,0.13),transparent_22rem),radial-gradient(circle_at_76%_18%,rgba(106,92,255,0.18),transparent_22rem),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_34%,rgba(0,0,0,0.24))]" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </div>

                <div className="relative flex h-full flex-col gap-5">
                  <div className="grid flex-1 gap-5 sm:grid-cols-[minmax(14rem,0.78fr)_minmax(0,1.22fr)] sm:items-start lg:gap-7">
                    <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-none">
                      <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl" />
                      <div className="relative mx-auto aspect-square w-full max-w-[19rem] overflow-hidden rounded-[1.35rem] border border-white/12 bg-black/35 shadow-[0_28px_80px_rgba(0,0,0,0.48)] ring-1 ring-white/5 sm:max-w-none">
                        {currentSong.thumbnail ? (
                          <img
                            src={currentSong.thumbnail}
                            alt={currentSong.title}
                            className={cn(
                              "h-full w-full object-cover transition-transform duration-700",
                              isPlaying && "scale-105",
                            )}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Disc3 className="h-20 w-20 text-primary/45" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/8 to-transparent" />
                        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/15 bg-black/42 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/82 shadow-[0_10px_26px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                            <AudioLines className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate sm:hidden">Audio</span>
                            <span className="hidden truncate sm:inline">
                              Audio mode
                            </span>
                          </div>
                          <div className="flex h-10 shrink-0 items-end gap-1 rounded-full border border-white/15 bg-black/42 px-3 py-2.5 shadow-[0_10px_26px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                            {[40, 78, 55, 92, 62].map((height, index) => (
                              <span
                                key={height}
                                className={cn(
                                  "w-0.5 rounded-full bg-primary",
                                  isPlaying && "animate-pulse",
                                )}
                                style={{
                                  height: `${height}%`,
                                  animationDelay: `${index * 120}ms`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col justify-start py-1 sm:py-0">
                      <div className="mb-5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/12 px-3 py-1.5 text-xs font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full bg-primary",
                              isPlaying && "animate-pulse",
                            )}
                          />
                          Now playing
                        </span>
                        {playMode === "request" && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-white/15 bg-white/[0.03] text-white/65"
                          >
                            Requested
                          </Badge>
                        )}
                        {isShuffle && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-white/15 bg-white/[0.03] text-white/65"
                          >
                            Shuffle
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-[clamp(2.25rem, 2.4vw, 1.45rem)] font-semibold leading-[1.06] tracking-normal text-white text-balance xl:text-[clamp(1.75rem,2.8vw,2.85rem)]">
                        {currentSong.title}
                      </h1>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-white/52">
                        {requestedBy
                          ? `Requested by ${requestedBy}`
                          : "Curated for Music Bar"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/16 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 sm:tracking-[0.28em]">
                        Source
                      </p>
                      <p className="mt-2 truncate text-sm font-medium text-white/84 sm:text-base">
                        {sourceLabel}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/16 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary sm:tracking-[0.28em]">
                          Up next
                        </p>
                        <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
                          01
                        </span>
                      </div>
                      {nextSong ? (
                        <button
                          type="button"
                          onClick={() => playSong(nextSong as any)}
                          className="group flex w-full items-center gap-3 text-left"
                        >
                          <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_14px_34px_rgba(0,0,0,0.22)] sm:block">
                            {nextSong.thumbnail ? (
                              <img
                                src={nextSong.thumbnail}
                                alt={nextSong.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Music2 className="m-4 h-6 w-6 text-white/30" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-xs font-medium leading-snug text-white/82 transition-colors group-hover:text-primary sm:text-sm">
                              {nextSong.title}
                            </p>
                            <p className="mt-1 hidden text-xs text-white/40 sm:block">
                              Next in queue
                            </p>
                          </div>
                        </button>
                      ) : (
                        <p className="text-sm text-white/45">
                          ไม่มีเพลงถัดไปในคิว
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>

              <aside>
                <section className="player-glass-card relative flex max-h-[32rem] min-h-[28rem] flex-col overflow-hidden rounded-[2rem] p-4 sm:p-5 xl:max-h-[36rem] xl:min-h-[28rem]">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
                  <div className="relative flex min-h-0 flex-1 flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-white/75">
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/20 bg-primary/10">
                          <Clock3 className="h-4 w-4 text-primary" />
                        </span>
                        <p className="text-base font-medium">Mini playlist</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                        Later
                      </span>
                    </div>
                    {visibleMiniPlaylist.length > 0 ? (
                      <div className="scrollbar-none mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {visibleMiniPlaylist.map((song, index) => (
                          <button
                            key={`${song.id}-${index}`}
                            type="button"
                            onClick={() => playSong(song)}
                            className="group flex w-full items-center gap-3 rounded-[1.1rem] border border-transparent px-2 py-2.5 text-left transition-all duration-300 hover:border-white/10 hover:bg-white/[0.055] hover:px-3"
                          >
                            <span className="w-5 text-center font-mono text-xs font-medium tabular-nums text-white/30">
                              {index + 1}
                            </span>
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                              {song.thumbnail ? (
                                <img
                                  src={song.thumbnail}
                                  alt={song.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Music2 className="m-2.5 h-4 w-4 text-white/30" />
                              )}
                            </div>
                            <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug text-white/68 transition-colors group-hover:text-white">
                              {song.title}
                            </p>
                            <Play className="h-3.5 w-3.5 shrink-0 text-white/0 transition-colors group-hover:text-primary" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-white/45">
                        ยังไม่มีเพลงเพิ่มเติมในคิว
                      </p>
                    )}
                    {canToggleMiniPlaylist && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowFullMiniPlaylist((value) => !value)
                        }
                        className="mt-4 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/72 transition hover:border-primary/35 hover:bg-primary/10 hover:text-white"
                      >
                        {showFullMiniPlaylist
                          ? "ย่อรายการ"
                          : `เพิ่มเติม (${miniPlaylistItems.length - visibleMiniPlaylist.length})`}
                      </button>
                    )}
                  </div>
                </section>
              </aside>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
