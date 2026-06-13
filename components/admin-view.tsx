"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useSWR from "swr";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Music2,
  Loader2,
  List,
  Radio,
  LayoutGrid,
  Rows3,
  Star,
  Power,
  PowerOff,
  Download,
  Youtube,
  CheckSquare,
  Square,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Sparkles,
  TrendingUp,
  Flame,
  Coffee,
  Moon,
  Laptop,
  Music,
  Library,
  ArrowUpRight,
  X,
  ListMusic,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type {
  Playlist,
  PlaylistSong,
  YouTubeSearchResult,
  YouTubePlaylistResult,
  SongRequest,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/context/player-context";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

/* ─── Configuration ─── */
const recommendedPlaylists = [
  {
    title: "Thai pop hits 2026",
    detail: "เพลงไทยใหม่ ฟังง่าย เหมาะกับคาเฟ่และร้านอาหาร",
    query: "Thai pop hits 2026 playlist",
    color: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/15 hover:border-rose-500/40",
    iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    icon: "Flame" as const,
  },
  {
    title: "Acoustic cafe",
    detail: "อะคูสติกเบา ๆ สำหรับช่วงกลางวัน",
    query: "acoustic cafe playlist",
    color: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/15 hover:border-amber-500/40",
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: "Coffee" as const,
  },
  {
    title: "Dinner lounge",
    detail: "โทนอุ่น สุภาพ เหมาะกับช่วงอาหารเย็น",
    query: "dinner lounge playlist",
    color: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/15 hover:border-indigo-500/40",
    iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    icon: "Moon" as const,
  },
  {
    title: "T-Pop popular",
    detail: "เพลงยอดนิยมที่ลูกค้ามักขอเปิด",
    query: "T-pop popular playlist",
    color: "from-violet-500/10 via-violet-500/5 to-transparent border-violet-500/15 hover:border-violet-500/40",
    iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    icon: "Sparkles" as const,
  },
  {
    title: "Lo-fi working bar",
    detail: "จังหวะนิ่งสำหรับร้านที่มีโซนนั่งทำงาน",
    query: "lofi cafe playlist",
    color: "from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/15 hover:border-cyan-500/40",
    iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    icon: "Laptop" as const,
  },
];

const IconMap = { Flame, Coffee, Moon, Sparkles, Laptop };

/* ─── Beautiful Playlist Cover ─── */
function PlaylistCover({
  playlist,
  className,
}: {
  playlist: Playlist;
  className?: string;
}) {
  if (playlist.cover_thumbnail) {
    return (
      <img
        src={playlist.cover_thumbnail}
        alt={playlist.name}
        className={cn(
          "rounded object-cover shadow-sm border border-white/10 shrink-0 transition-all duration-500 group-hover:scale-105",
          className,
        )}
      />
    );
  }

  const firstLetters = playlist.name.slice(0, 2).toUpperCase();
  const gradients = [
    "from-emerald-950 to-teal-800 border-emerald-400/20 text-emerald-100",
    "from-cyan-950 to-blue-900 border-cyan-400/20 text-cyan-100",
    "from-indigo-950 to-violet-900 border-indigo-400/20 text-indigo-100",
    "from-violet-950 to-fuchsia-900 border-violet-400/20 text-violet-100",
    "from-rose-950 to-orange-900 border-rose-400/20 text-rose-100",
  ];
  const gradientClass = gradients[playlist.id % gradients.length];

  return (
    <div
      className={cn(
        "rounded bg-gradient-to-br border flex items-center justify-center font-bold tracking-wider shrink-0 shadow-sm",
        gradientClass,
        className,
      )}
    >
      {firstLetters}
    </div>
  );
}

/* ─── Animated Equalizer Bars ─── */
function EqualizerBars() {
  return (
    <span className="playing-bars" aria-label="กำลังเล่น">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className="playing-bar" />
      ))}
    </span>
  );
}

/* ─── Animated Equalizer Bars ─── */
function PlaylistCard({
  playlist,
  isCurrent,
  isSelected,
  isPlaying,
  onSelect,
  onToggleSelect,
  onSetDefault,
  onToggleEnabled,
  onExport,
  onDelete,
}: {
  playlist: Playlist;
  isCurrent: boolean;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
  onSetDefault: () => void;
  onToggleEnabled: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex w-[130px] shrink-0 cursor-pointer flex-col gap-2 transition-all duration-500 sm:w-[148px] xl:w-[164px]",
        isCurrent && "scale-[1.02]",
        !playlist.is_enabled && "opacity-40",
      )}
      onClick={onSelect}
    >
      {/* Cover art */}
      <div
        className={cn(
          "relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-muted shadow-lg transition-all duration-500",
          isCurrent
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_30px_oklch(0.76_0.17_158/0.2)]"
            : "ring-1 ring-white/[0.06] group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] group-hover:ring-primary/30",
        )}
      >
        <PlaylistCover playlist={playlist} className="h-full w-full text-lg" />

        {/* Gradient overlay + Hover actions */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Hover overlay actions - centered, clean, no slide */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-2.5 bg-black/40 transition-opacity duration-300",
            isCurrent
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {!playlist.is_default && (
            <button
              type="button"
              onClick={onSetDefault}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:text-white hover:scale-110"
              title="ตั้งเป็นเพลย์ลิสต์หลัก"
            >
              <Star className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleEnabled}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110",
              playlist.is_enabled
                ? "bg-white/10 text-white/80 hover:bg-white/25 hover:text-white"
                : "bg-primary/20 text-primary hover:bg-primary/40",
            )}
            title={playlist.is_enabled ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
          >
            {playlist.is_enabled ? (
              <PowerOff className="h-3.5 w-3.5" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onExport}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:text-white hover:scale-110"
            title="ส่งออกไฟล์"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {!playlist.is_default && (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/40 hover:text-red-300 hover:scale-110"
              title="ลบเพลย์ลิสต์"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Checkbox for stream selection - Rendered AFTER hover overlay so it sits on top and remains clickable */}
        <button
          type="button"
          aria-label={`เลือก ${playlist.name} สำหรับเล่นต่อเนื่อง`}
          className={cn(
            "absolute left-2.5 top-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-md border border-white/25 bg-black/40 text-white/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-black/60 hover:text-white",
            isSelected && "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_oklch(0.76_0.17_158/0.35)]",
          )}
          onClick={onToggleSelect}
        >
          {isSelected ? (
            <CheckSquare className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </button>

        {/* Default badge */}
        {playlist.is_default && (
          <span className="absolute right-2.5 top-2.5 z-20 rounded-md border border-white/15 bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/80 backdrop-blur-sm">
            หลัก
          </span>
        )}

        {/* Now Playing indicator */}
        {isPlaying && isCurrent && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md shadow-sm">
            <EqualizerBars />
            <span className="text-[10px] font-bold text-white/90">กำลังเล่น</span>
          </div>
        )}
      </div>

      {/* Info + Always-visible action row */}
      <div className="min-w-0 space-y-1.5 px-0.5">
        <div>
          <p className="truncate text-xs font-bold leading-tight text-foreground">
            {playlist.name}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {Number(playlist.song_count ?? 0).toLocaleString()} เพลง
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Song Row (List View) ─── */
function SongRow({
  song,
  index,
  isCurrentSong,
  isPlaying,
  onPlayPause,
  onRemove,
}: {
  song: PlaylistSong;
  index: number;
  isCurrentSong: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
        isCurrentSong && isPlaying
          ? "border-primary/30 bg-primary/[0.04] shadow-[0_0_20px_oklch(0.76_0.17_158/0.06)]"
          : "border-white/[0.04] bg-white/[0.015] hover:border-white/[0.1] hover:bg-white/[0.03]",
      )}
    >
      {/* Index / Playing indicator */}
      <span className="flex w-6 items-center justify-center">
        {isCurrentSong && isPlaying ? (
          <EqualizerBars />
        ) : (
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </span>

      {/* Thumbnail */}
      {song.thumbnail && (
        <img
          src={song.thumbnail}
          alt={song.title}
          className="h-10 w-14 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-white/[0.06]"
        />
      )}

      {/* Title + Artist */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-xs font-bold transition-colors duration-200",
            isCurrentSong ? "text-primary" : "text-foreground",
          )}
        >
          {song.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {song.artist || "ไม่ระบุผู้แต่ง"}
        </p>
      </div>

      {/* Duration */}
      {song.duration && (
        <span className="hidden text-[11px] font-medium text-muted-foreground tabular-nums sm:block">
          {song.duration}
        </span>
      )}

      {/* Play/Pause */}
      <button
        type="button"
        onClick={onPlayPause}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          isCurrentSong && isPlaying
            ? "bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.76_0.17_158/0.3)]"
            : "text-muted-foreground/60 hover:bg-primary/10 hover:text-primary",
        )}
        aria-label={isPlaying && isCurrentSong ? `หยุด ${song.title}` : `เล่น ${song.title}`}
      >
        {isCurrentSong && isPlaying ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5 ml-0.5" />
        )}
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/40 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        aria-label={`ลบ ${song.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Song Grid Card ─── */
function SongGridCard({
  song,
  isCurrentSong,
  isPlaying,
  onPlayPause,
  onRemove,
}: {
  song: PlaylistSong;
  isCurrentSong: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card/80 p-2.5 transition-all duration-200",
        isCurrentSong && isPlaying
          ? "border-primary/30 shadow-[0_0_24px_oklch(0.76_0.17_158/0.1)]"
          : "border-white/[0.06] hover:border-white/[0.12]",
      )}
    >
      {/* Thumbnail */}
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg shadow-inner">
        <img
          src={song.thumbnail || ""}
          alt={song.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-2 bg-black/45 transition-opacity duration-200",
            isCurrentSong && isPlaying
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
          )}
        >
          <button
            type="button"
            onClick={onPlayPause}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110",
              isCurrentSong && isPlaying
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.76_0.17_158/0.4)]"
                : "bg-primary/90 text-white hover:bg-primary",
            )}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/80 text-white transition-all hover:bg-red-500 hover:scale-110"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {/* Now playing badge */}
        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-1.5 left-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              <EqualizerBars />
              กำลังเล่น
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <p className="truncate text-xs font-bold text-foreground" title={song.title}>
          {song.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {song.artist || "ไม่ระบุผู้แต่ง"}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Admin Library View ─── */
export function AdminView() {
  const {
    activePlaylistIds,
    setActivePlaylistIds,
    playSongImmediately,
    currentSong,
    isPlaying,
    togglePlay,
  } = usePlayer();

  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [ytPlaylistResults, setYtPlaylistResults] = useState<YouTubePlaylistResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<"video" | "playlist">("video");
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [importingId, setImportingId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [activePreviewPlaylist, setActivePreviewPlaylist] = useState<YouTubePlaylistResult | null>(null);
  const [previewSongs, setPreviewSongs] = useState<
    { id: string; youtube_id: string; title: string; thumbnail: string | null; channelTitle: string }[]
  >([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<number>>(new Set());
  const [targetPlaylistId, setTargetPlaylistId] = useState<number | null>(null);
  const [showAddPlaylistInput, setShowAddPlaylistInput] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>("tracks");
  const [musicListView, setMusicListView] = useState<"list" | "grid">("list");
  const [showRecommended, setShowRecommended] = useState(false);

  const addInputRef = useRef<HTMLInputElement>(null);

  /* ── Data ── */
  const { data: playlists = [], mutate: mutatePlaylists } = useSWR<Playlist[]>("/api/playlists", fetcher);
  const currentPlaylist = activePlaylistId
    ? playlists.find((p) => p.id === activePlaylistId)
    : playlists.find((p) => p.is_default) || playlists[0];

  const { data: playlistSongs = [], mutate: mutateSongs } = useSWR<PlaylistSong[]>(
    currentPlaylist ? `/api/playlists/${currentPlaylist.id}/songs` : null,
    fetcher,
  );

  const { data: requests = [], mutate: mutateRequests } = useSWR<SongRequest[]>("/api/requests", fetcher, {
    refreshInterval: 3000,
  });

  /* ── Derived ── */
  const totalSongs = useMemo(() => playlists.reduce((sum, pl) => sum + Number(pl.song_count ?? 0), 0), [playlists]);

  useEffect(() => {
    setSelectedPlaylists(new Set(activePlaylistIds));
  }, [activePlaylistIds]);

  useEffect(() => {
    if (showAddPlaylistInput && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddPlaylistInput]);

  /* ── Handlers ── */
  const handleSearch = useCallback(async (overrideQuery?: string) => {
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&type=${searchType}`);
      const data = await res.json();
      if (searchType === "playlist") {
        setYtPlaylistResults(data.items || []);
        setSearchResults([]);
      } else {
        setSearchResults(data.items || []);
        setYtPlaylistResults([]);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchType]);

  const handleAddToPlaylist = async (result: YouTubeSearchResult) => {
    const targetId = targetPlaylistId || currentPlaylist?.id;
    if (!targetId) {
      toast.error("กรุณาสร้างหรือเลือก playlist ก่อนเพิ่มเพลง");
      return;
    }
    if (addingIds.has(result.id)) return;
    setAddingIds((prev) => new Set(prev).add(result.id));
    try {
      const res = await fetch(`/api/playlists/${targetId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtube_id: result.id,
          title: result.title,
          thumbnail: result.thumbnail,
          artist: result.channelTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถเพิ่มเพลงได้");
      mutateSongs();
      mutatePlaylists();
      const targetName = playlists.find((p) => p.id === targetId)?.name || "";
      toast.success(`เพิ่มเพลงไปยัง ${targetName} แล้ว`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถเพิ่มเพลงได้");
    } finally {
      setAddingIds((prev) => {
        const n = new Set(prev);
        n.delete(result.id);
        return n;
      });
    }
  };

  const handleImportYoutubePlaylist = async (ytPlaylist: YouTubePlaylistResult) => {
    setImportingId(ytPlaylist.id);
    try {
      const res = await fetch("/api/playlists/import-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId: ytPlaylist.id, name: ytPlaylist.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      mutatePlaylists();
      toast.success(`Import สำเร็จ ${data.imported} เพลง`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ไม่สามารถ import ได้");
    } finally {
      setImportingId(null);
    }
  };

  const handleRemoveFromPlaylist = async (songId: number) => {
    if (!currentPlaylist) return;
    try {
      await fetch(`/api/playlists/${currentPlaylist.id}/songs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      mutateSongs();
      mutatePlaylists();
      toast.success("ลบเพลงแล้ว");
    } catch {
      toast.error("ไม่สามารถลบเพลงได้");
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);
    try {
      await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlaylistName.trim() }),
      });
      mutatePlaylists();
      setNewPlaylistName("");
      setShowAddPlaylistInput(false);
      toast.success("สร้าง playlist แล้ว");
    } catch {
      toast.error("ไม่สามารถสร้างได้");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    const res = await fetch("/api/playlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_default: true }),
    });
    if (!res.ok) {
      toast.error("ไม่สามารถตั้ง playlist เริ่มต้นได้");
      return;
    }
    await setActivePlaylistIds([]);
    await mutatePlaylists();
    toast.success("ตั้งเป็น playlist เริ่มต้นแล้ว");
  };

  const handleToggleEnabled = async (id: number, current: boolean) => {
    await fetch("/api/playlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_enabled: !current }),
    });
    mutatePlaylists();
    toast.success(!current ? "เปิดใช้งานแล้ว" : "ปิดใช้งานแล้ว");
  };

  const handleDeletePlaylist = async (id: number) => {
    await fetch("/api/playlists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    mutatePlaylists();
    if (activePlaylistId === id) setActivePlaylistId(null);
    toast.success("ลบ playlist แล้ว");
  };

  const handleExportPlaylist = (id: number) => {
    window.open(`/api/playlists/${id}/export`, "_blank");
  };

  const handleRemoveRequest = async (requestId: number) => {
    await fetch("/api/requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: requestId }),
    });
    mutateRequests();
    toast.success("ลบคำขอแล้ว");
  };

  const handlePlayPauseSong = (song: { youtube_id: string; title: string; thumbnail?: string | null; artist?: string | null }) => {
    if (currentSong?.youtube_id === song.youtube_id) {
      togglePlay();
    } else {
      playSongImmediately(song);
    }
  };

  const handlePreviewPlaylist = async (pl: YouTubePlaylistResult) => {
    setActivePreviewPlaylist(pl);
    setIsPreviewModalOpen(true);
    setIsLoadingPreview(true);
    setPreviewSongs([]);
    try {
      const res = await fetch(`/api/youtube/playlist-items?playlistId=${pl.id}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewSongs(data.items || []);
      } else {
        toast.error("ไม่สามารถโหลดรายชื่อเพลงได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleRecommendedPlaylist = (query: string) => {
    setSearchType("playlist");
    setActiveWorkspaceTab("search");
    setSearchQuery(query);
    handleSearch(query);
  };

  const toggleSelectPlaylist = (id: number) => {
    setSelectedPlaylists((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const handleApplySelectedPlaylists = async () => {
    await setActivePlaylistIds([...selectedPlaylists]);
    toast.success(
      selectedPlaylists.size === 0
        ? "ยกเลิกการเลือกทั้งหมดแล้ว ระบบจะใช้ Playlist เริ่มต้น"
        : `ใช้ ${selectedPlaylists.size} playlist เล่นต่อเนื่องแล้ว`,
    );
  };

  const isInPlaylist = (youtubeId: string) => playlistSongs.some((s) => s.youtube_id === youtubeId);

  const isSongCurrent = (song: { youtube_id: string }) =>
    currentSong?.youtube_id === song.youtube_id;

  return (
    <div className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-5 px-4 py-5 sm:px-6 xl:gap-6 xl:px-8 xl:py-6">

      {/* ════════════════════════════════════════════════════
         PLAYLIST RACK SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 shadow-lg sm:p-5">
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.04] blur-[80px]" />

        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddPlaylistInput(!showAddPlaylistInput)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_20px_oklch(0.76_0.17_158/0.2)]"
              title="เพิ่มเพลย์ลิสต์"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-foreground">
                คลังเพลย์ลิสต์
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {playlists.length} รายการ · {totalSongs} เพลง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedPlaylists.size > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedPlaylists(new Set())}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive"
                >
                  ล้าง
                </button>
                <button
                  type="button"
                  onClick={handleApplySelectedPlaylists}
                  className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary transition-all hover:bg-primary/20"
                >
                  ใช้งาน {selectedPlaylists.size} รายการ
                </button>
              </>
            )}
          </div>
        </div>

        {/* Add playlist input */}
        {showAddPlaylistInput && (
          <div className="mb-4 flex animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="relative w-full max-w-xs">
              <Input
                ref={addInputRef}
                placeholder="ชื่อเพลย์ลิสต์ใหม่..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                className="h-9 border-primary/20 bg-primary/[0.04] pr-10 text-xs transition-all focus:border-primary/40 focus:shadow-[0_0_20px_oklch(0.76_0.17_158/0.08)]"
              />
              <button
                type="button"
                onClick={handleCreatePlaylist}
                disabled={isCreating || !newPlaylistName.trim()}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/80 text-primary-foreground transition-all hover:bg-primary disabled:opacity-40"
              >
                {isCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Playlist cards */}
        <div className="w-full overflow-x-auto scrollbar-none">
          <div className="flex w-max min-w-full gap-3 pb-1">
            {playlists.length === 0 ? (
              <div className="flex w-full items-center justify-center py-12 text-sm text-muted-foreground">
                <div className="text-center">
                  <Library className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p>ยังไม่มีเพลย์ลิสต์ — กด + เพื่อสร้าง</p>
                </div>
              </div>
            ) : (
              playlists.map((pl, i) => (
                <div key={pl.id} style={{ animation: `slide-up 0.3s ease-out ${i * 0.04}s both` }}>
                  <PlaylistCard
                    playlist={pl}
                    isCurrent={currentPlaylist?.id === pl.id}
                    isSelected={selectedPlaylists.has(pl.id)}
                    isPlaying={isSongCurrent({ youtube_id: "" }) && isPlaying}
                    onSelect={() => setActivePlaylistId(pl.id)}
                    onToggleSelect={(e) => {
                      e.stopPropagation();
                      toggleSelectPlaylist(pl.id);
                    }}
                    onSetDefault={() => handleSetDefault(pl.id)}
                    onToggleEnabled={() => handleToggleEnabled(pl.id, pl.is_enabled)}
                    onExport={() => handleExportPlaylist(pl.id)}
                    onDelete={() => handleDeletePlaylist(pl.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
         RECOMMENDED PLAYLISTS
      ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 shadow-lg sm:p-5">
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-primary/[0.03] blur-[70px]" />
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Recommended
            </p>
            <h2 className="mt-1 text-base font-extrabold tracking-tight text-foreground">
              เพลย์ลิสต์แนะนำและกำลังนิยม
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-right">
            กดที่การ์ดเพื่อค้นหาเพลย์ลิสต์บน YouTube และนำเข้าคลังเพลงของร้าน
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {recommendedPlaylists.map((item, i) => {
            const Icon = IconMap[item.icon];
            return (
              <div
                key={item.query}
                role="button"
                tabIndex={0}
                onClick={() => handleRecommendedPlaylist(item.query)}
                onKeyDown={(e) => e.key === 'Enter' && handleRecommendedPlaylist(item.query)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]",
                  item.color,
                )}
                style={{ animation: `slide-up 0.3s ease-out ${i * 0.06}s both` }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground to-transparent opacity-0 transition-opacity group-hover:opacity-[0.04]" />
                <div
                  className={cn(
                    "mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                    item.iconColor,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/70">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
         WORKSPACE: TRACKS / SEARCH / REQUESTS
      ════════════════════════════════════════════════════ */}
      <section className="flex min-h-[60vh] flex-col gap-4 xl:min-h-[68vh]">
        {/* Workspace header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/[0.03] to-transparent px-4 py-2.5 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="truncate text-sm font-extrabold tracking-tight text-foreground">
              {currentPlaylist ? currentPlaylist.name : "เลือกเพลย์ลิสต์"}
            </h2>
            {currentPlaylist?.is_default && (
              <Badge className="border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                เริ่มต้น
              </Badge>
            )}
            <span className="hidden text-xs text-muted-foreground sm:inline-block tabular-nums">
              {playlistSongs.length} แทร็ก
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => setMusicListView("list")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  musicListView === "list"
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="มุมมองรายการ"
              >
                <Rows3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setMusicListView("grid")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  musicListView === "grid"
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="มุมมองตาราง"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tab buttons */}
            <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.03] p-0.5">
              {([
                { key: "tracks", icon: ListMusic, label: "เพลง", badge: 0 },
                { key: "search", icon: Search, label: "ค้นหา", badge: 0 },
                { key: "requests", icon: Radio, label: "คำขอ", badge: requests.length },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveWorkspaceTab(tab.key)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    activeWorkspaceTab === tab.key
                      ? "bg-primary/15 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TRACKS TAB ═══ */}
        {activeWorkspaceTab === "tracks" && (
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/[0.04] bg-white/[0.01] p-3 shadow-lg sm:p-4">
            {playlistSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Music2 className="mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm font-bold text-foreground">เพลย์ลิสต์นี้ว่างเปล่า</p>
                <p className="mt-1 max-w-[280px] text-xs">
                  กดแถบ "ค้นหา" เพื่อดึงเพลงจาก YouTube เข้าคลัง
                </p>
              </div>
            ) : musicListView === "list" ? (
              <ScrollArea className="h-0 flex-1 pr-1">
                <div className="flex flex-col gap-1.5 pb-2">
                  {playlistSongs.map((song, i) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={i}
                      isCurrentSong={isSongCurrent(song)}
                      isPlaying={isPlaying}
                      onPlayPause={() => handlePlayPauseSong(song)}
                      onRemove={() => handleRemoveFromPlaylist(song.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-0 flex-1 pr-1">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-2">
                  {playlistSongs.map((song) => (
                    <SongGridCard
                      key={song.id}
                      song={song}
                      isCurrentSong={isSongCurrent(song)}
                      isPlaying={isPlaying}
                      onPlayPause={() => handlePlayPauseSong(song)}
                      onRemove={() => handleRemoveFromPlaylist(song.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* ═══ SEARCH TAB ═══ */}
        {activeWorkspaceTab === "search" && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.01] p-3 shadow-lg sm:p-4">
            {/* Search controls */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.03] p-0.5">
                <button
                  type="button"
                  onClick={() => { setSearchType("video"); setSearchResults([]); setYtPlaylistResults([]); }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    searchType === "video" ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Music2 className="mr-1.5 inline h-3 w-3" />
                  ค้นหาเดี่ยว
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchType("playlist"); setSearchResults([]); setYtPlaylistResults([]); }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    searchType === "playlist" ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Youtube className="mr-1.5 inline h-3 w-3" />
                  เพลย์ลิสต์
                </button>
              </div>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchType === "playlist" ? "ลิงก์หรือคีย์เวิร์ดเพลย์ลิสต์..." : "ชื่อเพลงหรือศิลปิน..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-9 border-white/[0.08] bg-white/[0.03] pl-9 text-xs transition-all focus:border-primary/30 focus:shadow-[0_0_20px_oklch(0.76_0.17_158/0.06)]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-primary/10 px-4 text-xs font-bold text-primary transition-all hover:bg-primary/20 disabled:opacity-40"
              >
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                )}
                ค้นหา
              </button>
            </div>

            {/* Destination selector */}
            {searchType === "video" && playlists.length > 0 && (
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <span className="whitespace-nowrap text-xs font-bold text-muted-foreground">
                  เพิ่มไปยัง:
                </span>
                <select
                  value={targetPlaylistId || currentPlaylist?.id || ""}
                  onChange={(e) => setTargetPlaylistId(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-xs font-bold text-foreground outline-none transition-all focus:border-primary/30"
                >
                  {playlists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.is_default ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Recommended quick tags */}
            {searchType === "playlist" && playlists.length > 0 && (
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  คีย์เวิร์ด:
                </span>
                {playlists.slice(0, 5).map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(pl.name);
                      handleSearch(pl.name);
                    }}
                    className="rounded-full border border-primary/15 bg-primary/[0.04] px-2.5 py-0.5 text-[10px] font-bold text-primary transition-all hover:bg-primary/10 active:scale-95"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            <ScrollArea className="h-0 flex-1 pr-1">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">กำลังค้นหาจาก YouTube...</p>
                </div>
              ) : musicListView === "list" ? (
                <div className="flex flex-col gap-1.5 pb-2">
                  {/* Video results */}
                  {searchResults.map((result) => {
                    const inPl = isInPlaylist(result.id);
                    const isAdding = addingIds.has(result.id);
                    return (
                      <div
                        key={result.id}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-300",
                          inPl
                            ? "border-white/[0.04] bg-white/[0.01] opacity-50"
                            : "border-white/[0.04] bg-white/[0.015] hover:border-white/[0.1] hover:bg-white/[0.03] hover:translate-x-1",
                        )}
                      >
                        {result.thumbnail && (
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="h-9 w-14 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-white/[0.06]"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground" title={result.title}>
                            {result.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {result.channelTitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlayPauseSong({
                            youtube_id: result.id,
                            title: result.title,
                            thumbnail: result.thumbnail,
                            artist: result.channelTitle,
                          })}
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                            isSongCurrent({ youtube_id: result.id }) && isPlaying
                              ? "bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.76_0.17_158/0.3)]"
                              : "text-foreground/60 hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {isSongCurrent({ youtube_id: result.id }) && isPlaying ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="ml-0.5 h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={inPl || isAdding}
                          onClick={() => handleAddToPlaylist(result)}
                          className={cn(
                            "flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all",
                            inPl
                              ? "bg-white/[0.04] text-muted-foreground"
                              : "bg-primary/10 text-primary hover:bg-primary/20",
                          )}
                        >
                          {isAdding ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : inPl ? (
                            "เพิ่มแล้ว"
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              <span className="hidden sm:inline">เพิ่ม</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* YouTube playlist results */}
                  {ytPlaylistResults.map((pl) => (
                    <div
                      key={pl.id}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03]"
                    >
                      {pl.thumbnail && (
                        <img
                          src={pl.thumbnail}
                          alt={pl.title}
                          className="h-9 w-14 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-white/[0.06]"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground" title={pl.title}>
                          {pl.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {pl.channelTitle} · {pl.itemCount} เพลง
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePreviewPlaylist(pl)}
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-primary/15 px-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/5"
                        title="ดูรายชื่อเพลง"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">ดู</span>
                      </button>
                      <button
                        type="button"
                        disabled={importingId === pl.id}
                        onClick={() => handleImportYoutubePlaylist(pl)}
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary transition-all hover:bg-primary/20 disabled:opacity-40"
                      >
                        {importingId === pl.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        <span className="hidden sm:inline">Import</span>
                      </button>
                    </div>
                  ))}

                  {/* Empty state */}
                  {searchResults.length === 0 && ytPlaylistResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Search className="mb-2 h-10 w-10 opacity-20" />
                      <p className="text-xs">ใส่ชื่อเพลงหรือคีย์เวิร์ดเพื่อค้นหา</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Grid view */
                <div className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {searchResults.map((result) => {
                    const inPl = isInPlaylist(result.id);
                    const isAdding = addingIds.has(result.id);
                    return (
                      <div
                        key={result.id}
                        className={cn(
                          "group relative rounded-xl border bg-card/80 p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                          inPl ? "border-white/[0.04] opacity-40" : "border-white/[0.06] hover:border-primary/20",
                        )}
                      >
                        <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg shadow-inner">
                          <img
                            src={result.thumbnail || ""}
                            alt={result.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handlePlayPauseSong({
                                youtube_id: result.id, title: result.title,
                                thumbnail: result.thumbnail, artist: result.channelTitle,
                              })}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110",
                                isSongCurrent({ youtube_id: result.id }) && isPlaying
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-primary/90 text-white hover:bg-primary",
                              )}
                            >
                              {isSongCurrent({ youtube_id: result.id }) && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="ml-0.5 h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={inPl || isAdding}
                              onClick={() => handleAddToPlaylist(result)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-white transition-all hover:bg-primary hover:scale-110 disabled:opacity-40"
                            >
                              {isAdding ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : inPl ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="truncate text-xs font-bold text-foreground" title={result.title}>
                          {result.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {result.channelTitle}
                        </p>
                      </div>
                    );
                  })}

                  {ytPlaylistResults.map((pl) => (
                    <div
                      key={pl.id}
                      className="group relative rounded-xl border border-white/[0.06] bg-card/80 p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
                    >
                      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg shadow-inner">
                        <img
                          src={pl.thumbnail || ""}
                          alt={pl.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handlePreviewPlaylist(pl)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-white transition-all hover:bg-primary hover:scale-110"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={importingId === pl.id}
                            onClick={() => handleImportYoutubePlaylist(pl)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-white transition-all hover:bg-primary hover:scale-110 disabled:opacity-40"
                          >
                            {importingId === pl.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="truncate text-xs font-bold text-foreground" title={pl.title}>
                        {pl.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {pl.channelTitle} · {pl.itemCount} เพลง
                      </p>
                    </div>
                  ))}

                  {searchResults.length === 0 && ytPlaylistResults.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Search className="mb-2 h-10 w-10 opacity-20" />
                      <p className="text-xs">ใส่ชื่อเพลงหรือคีย์เวิร์ดเพื่อค้นหา</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

          </div>
        )}

        {/* ═══ REQUESTS TAB ═══ */}
        {activeWorkspaceTab === "requests" && (
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/[0.04] bg-white/[0.01] p-3 shadow-lg sm:p-4">
            <div className="mb-3 flex items-center justify-between shrink-0">
              <p className="text-xs text-muted-foreground">
                คำขอเพลงจากลูกค้า · <span className="font-bold text-foreground">{requests.length}</span> รายการ
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Radio className="mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm font-bold text-foreground">ยังไม่มีคำขอเพลง</p>
                <p className="mt-1 max-w-[260px] text-xs">
                  แชร์ QR Code หรือลิงก์ให้ลูกค้าส่งคำขอเพลงได้เลย
                </p>
              </div>
            ) : musicListView === "list" ? (
              <ScrollArea className="h-0 flex-1 pr-1">
                <div className="flex flex-col gap-1.5 pb-2">
                  {requests.map((req, i) => {
                    const isCurrentQueued = i === 0;
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300",
                          isCurrentQueued
                            ? "border-primary/20 bg-primary/[0.03] shadow-[0_0_20px_oklch(0.76_0.17_158/0.04)]"
                            : "border-white/[0.04] bg-white/[0.015] hover:border-white/[0.1]",
                        )}
                      >
                        <span className="flex w-6 items-center justify-center">
                          {isCurrentQueued ? (
                            <EqualizerBars />
                          ) : (
                            <span className="queue-number text-xs font-semibold text-muted-foreground">
                              {i + 1}
                            </span>
                          )}
                        </span>

                        {req.thumbnail && (
                          <img
                            src={req.thumbnail}
                            alt={req.title}
                            className="h-9 w-14 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-white/[0.06]"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">
                            {req.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            โดย {req.requested_by || "ลูกค้าทั่วไป"}
                          </p>
                        </div>

                        {isCurrentQueued && (
                          <Badge className="border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary shrink-0">
                            กำลังเล่น
                          </Badge>
                        )}

                        <button
                          type="button"
                          onClick={() => handlePlayPauseSong({
                            youtube_id: req.youtube_id, title: req.title,
                            thumbnail: req.thumbnail, artist: req.requested_by || "ลูกค้าทั่วไป",
                          })}
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                            isSongCurrent({ youtube_id: req.youtube_id }) && isPlaying
                              ? "bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.76_0.17_158/0.3)]"
                              : "text-foreground/60 hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          {isSongCurrent({ youtube_id: req.youtube_id }) && isPlaying ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="ml-0.5 h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveRequest(req.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-destructive/60 transition-all hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-0 flex-1 pr-1">
                <div className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {requests.map((req, i) => {
                    const isCurrentQueued = i === 0;
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          "group relative rounded-xl border bg-card/80 p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                          isCurrentQueued
                            ? "border-primary/30 shadow-[0_0_24px_oklch(0.76_0.17_158/0.1)]"
                            : "border-white/[0.06] hover:border-primary/20",
                        )}
                      >
                        <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg shadow-inner">
                          <img
                            src={req.thumbnail || ""}
                            alt={req.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handlePlayPauseSong({
                                youtube_id: req.youtube_id, title: req.title,
                                thumbnail: req.thumbnail, artist: req.requested_by || "ลูกค้าทั่วไป",
                              })}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110",
                                isSongCurrent({ youtube_id: req.youtube_id }) && isPlaying
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-primary/90 text-white hover:bg-primary",
                              )}
                            >
                              {isSongCurrent({ youtube_id: req.youtube_id }) && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="ml-0.5 h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveRequest(req.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/80 text-white transition-all hover:bg-red-500 hover:scale-110"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {isCurrentQueued && (
                            <div className="absolute bottom-1.5 left-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                <EqualizerBars />
                                กำลังเล่น
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="truncate text-xs font-bold text-foreground" title={req.title}>
                          {req.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          โดย {req.requested_by || "ลูกค้าทั่วไป"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════
         YOUTUBE PLAYLIST PREVIEW MODAL
      ════════════════════════════════════════════════════ */}
      {isPreviewModalOpen && activePreviewPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative flex w-full max-w-2xl max-h-[85vh] flex-col rounded-2xl border border-primary/20 bg-background/95 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {activePreviewPlaylist.thumbnail && (
                  <img
                    src={activePreviewPlaylist.thumbnail}
                    alt={activePreviewPlaylist.title}
                    className="h-10 w-14 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-white/[0.06]"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-extrabold text-foreground">
                    {activePreviewPlaylist.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {activePreviewPlaylist.channelTitle} · {activePreviewPlaylist.itemCount} เพลง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-white/[0.08] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 overflow-y-auto px-5 py-4">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">กำลังโหลดรายชื่อเพลง...</p>
                </div>
              ) : previewSongs.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">ไม่พบรายชื่อเพลง</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {previewSongs.map((song, i) => {
                    const isThisSongPlaying = isSongCurrent({ youtube_id: song.youtube_id }) && isPlaying;
                    return (
                      <div
                        key={song.id}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200",
                          isThisSongPlaying
                            ? "border-primary/20 bg-primary/[0.03]"
                            : "border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03]",
                        )}
                      >
                        <span className="w-6 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {song.thumbnail && (
                          <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="h-9 w-12 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-white/[0.06]"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate text-xs font-bold transition-colors", isThisSongPlaying ? "text-primary" : "text-foreground")}>
                            {song.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {song.channelTitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlayPauseSong(song)}
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                            isThisSongPlaying
                              ? "bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.76_0.17_158/0.3)]"
                              : "text-foreground/60 hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          {isThisSongPlaying ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="ml-0.5 h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-muted-foreground transition-all hover:bg-white/[0.04] hover:text-foreground"
              >
                ปิด
              </button>
              <button
                type="button"
                disabled={importingId === activePreviewPlaylist.id}
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleImportYoutubePlaylist(activePreviewPlaylist);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 disabled:opacity-40"
              >
                {importingId === activePreviewPlaylist.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                นำเข้าเพลย์ลิสต์นี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
