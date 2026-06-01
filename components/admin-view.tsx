"use client";

import { useState, useEffect } from "react";
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

// Beautiful Premium Playlist Cover Component (Standard rounded roundness)
const PlaylistCover = ({
  playlist,
  className,
}: {
  playlist: Playlist;
  className?: string;
}) => {
  if (playlist.cover_thumbnail) {
    return (
      <img
        src={playlist.cover_thumbnail}
        alt={playlist.name}
        className={cn(
          "rounded object-cover shadow-sm border border-white/10 shrink-0",
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
};

export function AdminView() {
  const { activePlaylistIds, setActivePlaylistIds } = usePlayer();
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [ytPlaylistResults, setYtPlaylistResults] = useState<
    YouTubePlaylistResult[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<"video" | "playlist">("video");
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [importingId, setImportingId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<number>>(
    new Set(),
  );
  const [targetPlaylistId, setTargetPlaylistId] = useState<number | null>(null);
  const [showAddPlaylistInput, setShowAddPlaylistInput] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<string>("tracks");
  const [isPlaylistsExpanded, setIsPlaylistsExpanded] = useState(true);

  // Music List Toggle View (List vs Grid)
  const [musicListView, setMusicListView] = useState<"list" | "grid">("list");

  const { data: playlists = [], mutate: mutatePlaylists } = useSWR<Playlist[]>(
    "/api/playlists",
    fetcher,
  );
  const currentPlaylist = activePlaylistId
    ? playlists.find((p) => p.id === activePlaylistId)
    : playlists.find((p) => p.is_default) || playlists[0];

  const { data: playlistSongs = [], mutate: mutateSongs } = useSWR<
    PlaylistSong[]
  >(
    currentPlaylist ? `/api/playlists/${currentPlaylist.id}/songs` : null,
    fetcher,
  );

  const { data: requests = [], mutate: mutateRequests } = useSWR<SongRequest[]>(
    "/api/requests",
    fetcher,
    { refreshInterval: 3000 },
  );

  useEffect(() => {
    setSelectedPlaylists(new Set(activePlaylistIds));
  }, [activePlaylistIds]);

  const handleSearch = async (overrideQuery?: string) => {
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}&type=${searchType}`,
      );
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
  };

  const handleAddToPlaylist = async (result: YouTubeSearchResult) => {
    const targetId = targetPlaylistId || currentPlaylist?.id;
    if (!targetId || addingIds.has(result.id)) return;
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
      if (!res.ok) throw new Error();
      mutateSongs();
      mutatePlaylists(); // refresh cover thumbnail
      const targetName = playlists.find((p) => p.id === targetId)?.name || "";
      toast.success(`เพิ่มเพลงไปยัง ${targetName} แล้ว`);
    } catch {
      toast.error("ไม่สามารถเพิ่มเพลงได้");
    } finally {
      setAddingIds((prev) => {
        const n = new Set(prev);
        n.delete(result.id);
        return n;
      });
    }
  };

  const handleImportYoutubePlaylist = async (
    ytPlaylist: YouTubePlaylistResult,
  ) => {
    setImportingId(ytPlaylist.id);
    try {
      const res = await fetch("/api/playlists/import-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: ytPlaylist.id,
          name: ytPlaylist.title,
        }),
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
      mutatePlaylists(); // refresh cover thumbnail
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
    if (selectedPlaylists.size === 0) {
      toast.success("ยกเลิกการเลือกทั้งหมดแล้ว ระบบจะใช้ Playlist เริ่มต้น");
    } else {
      toast.success(`ใช้ ${selectedPlaylists.size} playlist เล่นต่อเนื่องแล้ว`);
    }
  };

  const isInPlaylist = (youtubeId: string) =>
    playlistSongs.some((s) => s.youtube_id === youtubeId);

  return (

        <main className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 xl:gap-6 xl:px-8 xl:py-7">
          <section className="admin-library-panel flex flex-col gap-3">
            {/* Playlist Manager */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaylistsExpanded(!isPlaylistsExpanded)}
                  className="flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-colors"
                >
                  {isPlaylistsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  เพลย์ลิสต์ของร้าน
                </button>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href="#playlist-studio"
                  className="hidden rounded-full px-2 py-1.5 text-sm font-bold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-primary/10 sm:block"
                >
                  จัดการเพลง
                </a>
                <button
                  type="button"
                  onClick={() => setShowAddPlaylistInput(!showAddPlaylistInput)}
                  className={cn(
                    "flex h-8 items-center gap-1.5 px-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors",
                    showAddPlaylistInput
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                  title="เพิ่มเพลย์ลิสต์ใหม่"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่ม
                </button>
              </div>
            </div>

            {/* Create Playlist Input (Conditionally rendered) */}
            {showAddPlaylistInput && (
              <div className="flex gap-2 relative group px-1 animate-in slide-in-from-top-2 fade-in duration-200">
                <Input
                  placeholder="เพิ่มเพลย์ลิสต์ใหม่..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                  autoFocus
                  className="h-9 pl-4 pr-10 border-primary/20 bg-primary/5 hover:bg-primary/10 focus:bg-primary/10 text-xs rounded-full shadow-inner transition-colors text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  size="sm"
                  onClick={handleCreatePlaylist}
                  disabled={isCreating || !newPlaylistName.trim()}
                  aria-label="สร้างเพลย์ลิสต์"
                  className="absolute right-2 top-1 bottom-1 h-7 w-7 rounded-full p-0 shadow-sm transition-transform hover:scale-105 bg-primary/80 hover:bg-primary text-primary-foreground"
                >
                  {isCreating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Quiet stream selection bar */}
            {isPlaylistsExpanded && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-y border-border/50 px-1 py-2">
              <div className="flex min-w-0 items-center gap-2 px-1">
                <div className="flex h-5 w-5 items-center justify-center text-primary">
                  <CheckSquare className="w-3 h-3" />
                </div>
                <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  สตรีมต่อเนื่อง{" "}
                  <span className="ml-0.5 text-primary">
                    {selectedPlaylists.size} รายการ
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                {selectedPlaylists.size > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-sm text-muted-foreground hover:text-destructive"
                    onClick={() => setSelectedPlaylists(new Set())}
                    title="ล้างการเลือก"
                  >
                    ล้าง
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-sm font-bold uppercase tracking-[0.08em] text-primary hover:bg-primary/5 hover:text-primary"
                  onClick={handleApplySelectedPlaylists}
                >
                  ใช้งานชุดนี้
                </Button>
              </div>
            </div>

            {/* Scrollable area of Playlists */}
            <div className="w-full overflow-x-auto scrollbar-none pb-2">
              <div className="flex w-max min-w-full gap-3 px-1">
                {playlists.length === 0 ? (
                  <div className="py-8 w-full text-center text-xs text-muted-foreground">
                    ไม่มีเพลย์ลิสต์
                  </div>
                ) : (
                  playlists.map((pl) => {
                    const isCurrent = currentPlaylist?.id === pl.id;
                    return (
                      <div
                        key={pl.id}
                        className={cn(
                          "admin-playlist-collection group relative flex w-[126px] shrink-0 cursor-pointer flex-col gap-2 transition-all duration-300 sm:w-[138px] xl:w-[154px]",
                          isCurrent
                            ? "text-foreground"
                            : "text-foreground/85 hover:text-foreground",
                          !pl.is_enabled && "opacity-45",
                        )}
                        onClick={() => setActivePlaylistId(pl.id)}
                      >
                        <div
                          className={cn(
                            "relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-muted shadow-sm transition-all duration-300",
                            isCurrent
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : "ring-1 ring-white/[0.08] group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.32)]",
                          )}
                        >
                          <PlaylistCover
                            playlist={pl}
                            className="h-full w-full text-lg"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 transition-opacity group-hover:opacity-100" />

                          <button
                            type="button"
                            aria-label={`เลือก ${pl.name} สำหรับเล่นต่อเนื่อง`}
                            className={cn(
                              "absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-sm backdrop-blur-md transition-all hover:bg-black/45",
                              selectedPlaylists.has(pl.id) &&
                                "bg-primary text-primary-foreground border-primary",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectPlaylist(pl.id);
                            }}
                          >
                            {selectedPlaylists.has(pl.id) ? (
                              <CheckSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {pl.is_default && (
                            <span className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-sm font-bold uppercase tracking-[0.1em] text-white/95 backdrop-blur-md">
                              Default
                            </span>
                          )}

                          {isCurrent && (
                            <div
                              className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-full border border-white/15 bg-black/40 px-1.5 py-1 text-white backdrop-blur-xl"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-0.5">
                                {!pl.is_default && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                    onClick={() => handleSetDefault(pl.id)}
                                    title="ตั้งเป็นหลัก"
                                  >
                                    <Star className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                  onClick={() =>
                                    handleToggleEnabled(pl.id, pl.is_enabled)
                                  }
                                  title={
                                    pl.is_enabled
                                      ? "ปิดการใช้งาน"
                                      : "เปิดการใช้งาน"
                                  }
                                >
                                  {pl.is_enabled ? (
                                    <PowerOff className="h-3 w-3" />
                                  ) : (
                                    <Power className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                  onClick={() => handleExportPlaylist(pl.id)}
                                  title="ส่งออก"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                              {!pl.is_default && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-white/90 hover:bg-destructive hover:text-white"
                                  onClick={() => handleDeletePlaylist(pl.id)}
                                  title="ลบ"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 px-0.5">
                          <p className="truncate text-xs font-bold leading-tight">
                            {pl.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {pl.song_count ?? 0} เพลง
                            {isCurrent ? " · จัดการ" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
              </>
            )}
          </section>

          <section
            id="playlist-studio"
            className="flex min-h-[64vh] scroll-mt-16 flex-col gap-3 overflow-hidden xl:min-h-[72vh] xl:gap-4"
          >
            {/* Header Area inside Workspace */}
            <div className="admin-surface admin-workspace-header mx-0 flex shrink-0 items-center justify-between gap-2 rounded-xl border border-primary/15 px-3 py-1.5 sm:mx-1 sm:px-4 xl:mt-1 xl:rounded-full xl:py-2">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="truncate whitespace-nowrap text-sm font-extrabold text-foreground tracking-tight">
                  {currentPlaylist
                    ? currentPlaylist.name
                    : "กรุณาเลือกเพลย์ลิสต์"}
                </h2>
                {currentPlaylist?.is_default && (
                  <Badge className="h-4 px-1.5 bg-primary/15 border-primary/20 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
                    เริ่มต้น
                  </Badge>
                )}
              </div>

              {/* Console controls & toggle layout view */}
              <div className="scrollbar-none flex max-w-full shrink-0 flex-nowrap items-center gap-2 overflow-x-auto sm:border-l sm:border-border/40 sm:pl-3">
                {/* View Mode Grid/List selectors */}
                <div className="flex shrink-0 rounded-full border border-border/60 bg-black/5 shadow-inner p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMusicListView("list")}
                    className={cn(
                      "h-6 w-7 rounded-full p-0 transition-all",
                      musicListView === "list"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                    title="มุมมองรายการ"
                  >
                    <Rows3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMusicListView("grid")}
                    className={cn(
                      "h-6 w-7 rounded-full p-0 transition-all",
                      musicListView === "grid"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                    title="มุมมองตารางรูปปก"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Tab switch buttons */}
                <div className="scrollbar-none flex shrink-0 overflow-x-auto rounded-full border border-border/60 bg-black/5 shadow-inner p-0.5 gap-0.5">
                  <button
                    onClick={() => setActiveWorkspaceTab("tracks")}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all",
                      activeWorkspaceTab === "tracks"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    <List className="w-3 h-3" />
                    เพลงในเพลย์ลิสต์
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("search")}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all",
                      activeWorkspaceTab === "search"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    <Search className="w-3 h-3" />
                    ค้นหาและเพิ่มเพลง
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("requests")}
                    className={cn(
                      "relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all",
                      activeWorkspaceTab === "requests"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    <Radio
                      className={cn(
                        "w-3 h-3",
                        activeWorkspaceTab === "requests"
                          ? "text-primary"
                          : "text-primary animate-pulse",
                      )}
                    />
                    คำขอจากลูกค้า
                    {requests.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full text-xs font-bold px-1 border border-background bg-primary text-primary-foreground">
                        {requests.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: PLAYLIST TRACKS (Full Div Height enabled) */}
            {activeWorkspaceTab === "tracks" && (
              <div className="admin-content-panel flex min-h-0 flex-1 flex-col rounded-xl p-2.5 sm:p-3">
                <div className="flex items-center justify-between shrink-0 mb-2 px-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    รายการเพลงทั้งหมดในแผง ({playlistSongs.length} แทร็ก)
                  </p>
                </div>

                <ScrollArea className="h-0 flex-1 pr-1">
                  {playlistSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                      <Music2 className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-xs font-bold text-foreground">
                        เพลย์ลิสต์นี้ว่างเปล่า
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                        ท่านสามารถกดแถบค้นหาที่แถบเมนูด้านบน
                        เพื่อดึงคลังเพลงใหม่ๆ เข้ามาสะสมไว้ได้ทันที
                      </p>
                    </div>
                  ) : musicListView === "list" ? (
                    /* List View (Standard rounded style) */
                    <div className="flex flex-col gap-1.5">
                      {playlistSongs.map((song, i) => (
                        <div
                          key={song.id}
                          className="admin-track-row flex items-center gap-3 rounded-lg border p-2.5 transition-all duration-300 group"
                        >
                          <span className="text-xs font-semibold text-muted-foreground w-6 text-center tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          {song.thumbnail && (
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-12 h-9 rounded object-cover shadow-sm border border-black/5 flex-shrink-0"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {song.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {song.artist || "ไม่ระบุผู้แต่ง"}
                            </p>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex-shrink-0 rounded text-destructive transition-all hover:bg-destructive/10 hover:text-destructive xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100"
                            onClick={() => handleRemoveFromPlaylist(song.id)}
                            aria-label={`ลบ ${song.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Grid Thumbnail View (Spotify album grid style) */
                    <div className="grid grid-cols-2 gap-3.5 p-0.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {playlistSongs.map((song) => (
                        <div
                          key={song.id}
                          className="admin-track-card group relative rounded-lg border border-border/40 bg-card p-2 flex flex-col gap-2 transition-all duration-300"
                        >
                          {/* Song Thumbnail */}
                          <div className="relative aspect-square w-full rounded overflow-hidden shadow-inner bg-muted shrink-0">
                            <img
                              src={song.thumbnail || ""}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8 rounded bg-destructive/90 text-white hover:bg-destructive hover:scale-105"
                                onClick={() =>
                                  handleRemoveFromPlaylist(song.id)
                                }
                                aria-label={`ลบ ${song.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <p
                              className="text-xs font-bold text-foreground truncate leading-tight"
                              title={song.title}
                            >
                              {song.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {song.artist || "ไม่ระบุผู้แต่ง"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {/* TAB CONTENT: SEARCH YOUTUBE (Full Div Height enabled) */}
            {activeWorkspaceTab === "search" && (
              <div className="admin-content-panel flex-1 min-h-0 flex flex-col overflow-hidden gap-3 rounded-xl p-3">
                {/* Search Type controls */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={searchType === "video" ? "default" : "outline"}
                    className="h-8 text-xs gap-1 rounded font-bold"
                    onClick={() => {
                      setSearchType("video");
                      setSearchResults([]);
                      setYtPlaylistResults([]);
                    }}
                  >
                    <Music2 className="w-3 h-3" />
                    ค้นหาเดี่ยว
                  </Button>
                  <Button
                    size="sm"
                    variant={searchType === "playlist" ? "default" : "outline"}
                    className="h-8 text-xs gap-1 rounded font-bold"
                    onClick={() => {
                      setSearchType("playlist");
                      setSearchResults([]);
                      setYtPlaylistResults([]);
                    }}
                  >
                    <Youtube className="w-3 h-3" />
                    เพลย์ลิสต์ YouTube
                  </Button>
                </div>

                {/* Input query field */}
                <div className="flex gap-2 shrink-0">
                  <Input
                    placeholder={
                      searchType === "playlist"
                        ? "ใส่ลิงก์หรือคีย์เวิร์ดเพลย์ลิสต์..."
                        : "ป้อนชื่อเพลงหรือคำสืบค้นคลังเพลง..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-9 border-border bg-black/5 text-xs rounded shadow-inner text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSearch()}
                    disabled={isSearching || !searchQuery.trim()}
                    aria-label="ค้นหาเพลงจาก YouTube"
                    className="h-9 px-4 rounded shrink-0"
                  >
                    {isSearching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>

                {/* Suggestions for YouTube Playlist Search */}
                {searchType === "playlist" && playlists.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 px-1 py-0.5 shrink-0 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">
                      แนะนำคีย์เวิร์ด:
                    </span>
                    {playlists.map((pl) => (
                      <button
                        key={pl.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery(pl.name);
                          handleSearch(pl.name);
                        }}
                        className="rounded-full bg-primary/5 hover:bg-primary/15 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary hover:text-primary transition-all active:scale-95 cursor-pointer"
                      >
                        {pl.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Destination Dropdown for single search */}
                {searchType === "video" && playlists.length > 0 && (
                  <div className="flex items-center gap-2 rounded bg-black/5 p-2 border border-border shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap font-bold">
                      บันทึกเข้าสู่:
                    </span>
                    <select
                      className="flex-1 h-7 px-2 text-xs rounded border border-border/60 bg-background text-foreground font-bold focus:outline-none"
                      value={targetPlaylistId || currentPlaylist?.id || ""}
                      onChange={(e) =>
                        setTargetPlaylistId(Number(e.target.value))
                      }
                    >
                      {playlists.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="text-foreground bg-background"
                        >
                          {p.name} {p.is_default ? "(Default)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Scrollable list/grid of search results */}
                <ScrollArea className="flex-1 min-h-0 h-0 pr-1">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground mt-2">
                        กำลังกวาดสัญญาณ YouTube API...
                      </p>
                    </div>
                  ) : musicListView === "list" ? (
                    /* List View style for search results */
                    <div className="flex flex-col gap-2">
                      {/* Video Results */}
                      {searchResults.map((result) => {
                        const inPlaylist = isInPlaylist(result.id);
                        const isAdding = addingIds.has(result.id);
                        return (
                          <div
                            key={result.id}
                            className={cn(
                              "admin-track-row flex items-center gap-2 rounded border border-border/20 bg-black/[0.01] p-1.5 transition-all duration-300",
                              inPlaylist && "opacity-50",
                            )}
                          >
                            {result.thumbnail && (
                              <img
                                src={result.thumbnail}
                                alt={result.title}
                                className="w-10 h-7 rounded-sm object-cover flex-shrink-0 shadow border border-black/5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {result.channelTitle}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={inPlaylist ? "secondary" : "default"}
                              disabled={inPlaylist || isAdding}
                              onClick={() => handleAddToPlaylist(result)}
                              className="h-8 text-xs px-3 font-bold rounded shrink-0"
                            >
                              {isAdding ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : inPlaylist ? (
                                "เพิ่มแล้ว"
                              ) : (
                                <>
                                  <Plus className="w-3 h-3 mr-1" />
                                  เพิ่มลงคลัง
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}

                      {/* YouTube Playlist Results */}
                      {ytPlaylistResults.map((pl) => (
                        <div
                          key={pl.id}
                          className="admin-track-row flex items-center gap-2 rounded border border-border/20 bg-black/[0.01] p-1.5 transition-all duration-300"
                        >
                          {pl.thumbnail && (
                            <img
                              src={pl.thumbnail}
                              alt={pl.title}
                              className="w-10 h-7 rounded-sm object-cover flex-shrink-0 shadow border border-black/5"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {pl.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {pl.channelTitle} · {pl.itemCount} เพลง
                            </p>
                          </div>
                          <Button
                            size="sm"
                            disabled={importingId === pl.id}
                            onClick={() => handleImportYoutubePlaylist(pl)}
                            className="h-8 text-xs px-3 font-bold rounded shrink-0"
                          >
                            {importingId === pl.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Import
                              </>
                            )}
                          </Button>
                        </div>
                      ))}

                      {searchResults.length === 0 &&
                        ytPlaylistResults.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                            <Search className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-xs">
                              ใส่หัวข้อหรือศิลปินที่คุณชื่นชอบลงในแถบค้นหา
                            </p>
                          </div>
                        )}
                    </div>
                  ) : (
                    /* Grid View style for search results (Grid Thumbnail View) */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 p-0.5">
                      {searchResults.map((result) => {
                        const inPlaylist = isInPlaylist(result.id);
                        const isAdding = addingIds.has(result.id);
                        return (
                          <div
                            key={result.id}
                            className={cn(
                              "admin-track-card group relative rounded-lg border border-border/40 bg-card p-2 flex flex-col gap-2 transition-all duration-300",
                              inPlaylist && "opacity-40",
                            )}
                          >
                            {/* Video cover */}
                            <div className="relative aspect-square w-full rounded overflow-hidden shadow bg-muted shrink-0">
                              <img
                                src={result.thumbnail || ""}
                                alt={result.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  disabled={inPlaylist || isAdding}
                                  className="w-8 h-8 rounded bg-primary/95 text-white hover:bg-primary hover:scale-105"
                                  onClick={() => handleAddToPlaylist(result)}
                                  aria-label={`เพิ่ม ${result.title} ลงในเพลย์ลิสต์`}
                                >
                                  {isAdding ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                  ) : inPlaylist ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Plus className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="min-w-0 flex flex-col gap-0.5">
                              <p
                                className="text-xs font-bold text-foreground truncate leading-tight"
                                title={result.title}
                              >
                                {result.title}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {result.channelTitle}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* YouTube Playlists Grid fallbacks */}
                      {ytPlaylistResults.map((pl) => (
                        <div
                          key={pl.id}
                          className="admin-track-card group relative rounded-lg border border-border/40 bg-card p-2 flex flex-col gap-2 transition-all duration-300"
                        >
                          <div className="relative aspect-square w-full rounded overflow-hidden shadow bg-muted shrink-0">
                            <img
                              src={pl.thumbnail || ""}
                              alt={pl.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={importingId === pl.id}
                                className="w-8 h-8 rounded bg-primary/95 text-white hover:bg-primary hover:scale-105"
                                onClick={() => handleImportYoutubePlaylist(pl)}
                                aria-label={`นำเข้าเพลย์ลิสต์ ${pl.title}`}
                              >
                                {importingId === pl.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <p
                              className="text-xs font-bold text-foreground truncate leading-tight"
                              title={pl.title}
                            >
                              {pl.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {pl.channelTitle} · {pl.itemCount} เพลง
                            </p>
                          </div>
                        </div>
                      ))}

                      {searchResults.length === 0 &&
                        ytPlaylistResults.length === 0 && (
                          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                            <Search className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-xs">
                              ใส่หัวข้อหรือศิลปินที่คุณชื่นชอบลงในแถบค้นหา
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {/* TAB CONTENT: CUSTOMER SONG REQUESTS (Full Div Height enabled) */}
            {activeWorkspaceTab === "requests" && (
              <div className="admin-content-panel flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl p-3">
                <div className="flex items-center justify-between shrink-0 mb-1.5">
                  <p className="text-xs text-muted-foreground">
                    รายการแทร็กเพลงที่มีผู้ยื่นขอระบบคิว ({requests.length}{" "}
                    แทร็ก)
                  </p>
                </div>

                <ScrollArea className="flex-1 min-h-0 h-0 pr-1">
                  {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                      <Radio className="w-12 h-12 mb-3 opacity-20 text-muted-foreground" />
                      <p className="text-xs font-bold text-foreground">
                        ยังไม่มีคำขอเพลงจากระบบ
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                        ท่านสามารถนำลิงก์รหัสสแกนด้านบนไปแชร์ให้แก่ลูกค้า
                        เพื่อทำการส่งขอเพลงเข้าระบบได้ทันที
                      </p>
                    </div>
                  ) : musicListView === "list" ? (
                    /* List View requests style */
                    <div className="flex flex-col gap-2">
                      {requests.map((req, i) => {
                        const isCurrentPlaying = i === 0;
                        return (
                          <div
                            key={req.id}
                            className={cn(
                              "flex items-center gap-2 p-1.5 rounded border transition-all duration-200",
                              isCurrentPlaying
                                ? "border-primary/45 bg-primary/[0.04] shadow-sm"
                                : "border-border/20 bg-black/[0.01]",
                            )}
                          >
                            <span className="text-xs font-semibold text-muted-foreground w-5 text-center tabular-nums">
                              {i + 1}
                            </span>

                            {req.thumbnail && (
                              <img
                                src={req.thumbnail}
                                alt={req.title}
                                className="w-10 h-7 rounded-sm object-cover shadow border border-black/5 flex-shrink-0"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {req.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                ส่งขอโดย: {req.requested_by || "ลูกค้าทั่วไป"}
                              </p>
                            </div>

                            {isCurrentPlaying && (
                              <Badge className="h-5 px-1.5 text-xs bg-primary/20 text-primary border-primary/30 pointer-events-none font-bold shrink-0">
                                กำลังเล่น
                              </Badge>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                              onClick={() => handleRemoveRequest(req.id)}
                              aria-label={`ลบคำขอ ${req.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Grid View requests style */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 p-0.5">
                      {requests.map((req, i) => {
                        const isCurrentPlaying = i === 0;
                        return (
                          <div
                            key={req.id}
                            className={cn(
                              "admin-track-card group relative rounded-lg border bg-card p-2 flex flex-col gap-2 transition-all duration-300",
                              isCurrentPlaying
                                ? "border-primary bg-primary/[0.02]"
                                : "border-border/40",
                            )}
                          >
                            {/* Request cover */}
                            <div className="relative aspect-square w-full rounded overflow-hidden shadow bg-muted shrink-0">
                              <img
                                src={req.thumbnail || ""}
                                alt={req.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-8 h-8 rounded bg-destructive/90 text-white hover:bg-destructive hover:scale-105"
                                  onClick={() => handleRemoveRequest(req.id)}
                                  aria-label={`ลบคำขอ ${req.title}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {isCurrentPlaying && (
                                <div className="absolute bottom-1.5 left-1.5">
                                  <Badge className="h-4 px-1 bg-primary text-primary-foreground text-xs font-bold">
                                    กำลังเล่น
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex flex-col gap-0.5">
                              <p
                                className="text-xs font-bold text-foreground truncate leading-tight"
                                title={req.title}
                              >
                                {req.title}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                โดย: {req.requested_by || "ลูกค้าทั่วไป"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </section>
        </main>
  );
}
