"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Plus,
  Search,
  Trash2,
  Music2,
  Loader2,
  List,
  Settings,
  Radio,
  LayoutGrid,
  Rows3,
  LibraryBig,
  Star,
  Power,
  PowerOff,
  Download,
  Youtube,
  CheckSquare,
  Square,
  X,
  RefreshCw,
  QrCode,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface AdminViewProps {
  onLogout: () => void;
}

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
          "rounded object-cover shadow-sm border border-black/5 shrink-0",
          className,
        )}
      />
    );
  }

  const firstLetters = playlist.name.slice(0, 2).toUpperCase();
  const gradients = [
    "from-emerald-100 to-teal-200 border-emerald-300/60 text-emerald-800",
    "from-cyan-100 to-blue-200 border-cyan-300/60 text-cyan-800",
    "from-indigo-100 to-purple-200 border-indigo-300/60 text-indigo-800",
    "from-violet-100 to-fuchsia-200 border-violet-300/60 text-violet-800",
    "from-rose-100 to-orange-200 border-rose-300/60 text-rose-800",
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

export function AdminView({ onLogout }: AdminViewProps) {
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
  const [playlistView, setPlaylistView] = useState<"cards" | "table">("cards");
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<string>("tracks");

  // Resizable & Toggleable Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);

  // Music List Toggle View (List vs Grid)
  const [musicListView, setMusicListView] = useState<"list" | "grid">("list");

  // QR Code States
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");

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
    { refreshInterval: 5000 },
  );

  // Initialize QR Code URL
  useEffect(() => {
    setPageUrl(window.location.origin + "/request");
  }, []);

  useEffect(() => {
    setSelectedPlaylists(new Set(activePlaylistIds));
  }, [activePlaylistIds]);

  useEffect(() => {
    if (!showQR || !pageUrl) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pageUrl)}&bgcolor=ffffff&color=059669&format=png&margin=20`;
    setQrDataUrl(qrUrl);
  }, [showQR, pageUrl]);

  const handleDownloadQR = async () => {
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "music-bar-qr.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("ไม่สามารถดาวน์โหลดได้");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
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
    await fetch("/api/playlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_default: true }),
    });
    mutatePlaylists();
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

  // Drag Handle Resize Sidebar Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(240, Math.min(480, startWidth + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="admin-shell min-h-[100dvh] flex flex-col pb-6 text-foreground bg-background">
      {/* Header (Top Navigation) */}
      <header className="admin-glass sticky top-0 z-30 border-b border-border/60">
        <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-9 w-9 rounded border-border hover:bg-black/5 shrink-0"
              title={isSidebarOpen ? "พับเก็บเมนูข้าง" : "ขยายเมนูข้าง"}
            >
              <List className="w-4 h-4 text-foreground" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded border border-primary/20 bg-primary/10">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80">
                Venue Control Console
              </p>
              <h1 className="text-xs font-bold sm:text-sm text-foreground">
                Music Library
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(true)}
              className="h-8 gap-1 border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10 hover:text-primary transition-all rounded"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-black/5 border-border transition-all rounded"
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace: Full width layout with resizable columns */}
      <main className="w-full px-4 pt-4 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch min-h-0 flex-1">
          {/* LEFT COLUMN: Resizable & Toggleable Library Sidebar */}
          {isSidebarOpen && (
            <div
              className="flex-shrink-0 flex flex-col gap-4 min-h-0 w-full lg:w-auto"
              style={{
                width:
                  typeof window !== "undefined" && window.innerWidth >= 1024
                    ? `${sidebarWidth}px`
                    : undefined,
              }}
            >
              {/* Stats Bar */}
              <div className="admin-surface rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20">
                    <LibraryBig className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {currentPlaylist?.name || "ยังไม่ได้เลือกเพลย์ลิสต์"}
                    </p>
                    <p className="text-[9px] text-muted-foreground truncate uppercase tracking-wider">
                      {currentPlaylist?.is_default
                        ? "Default Rotation"
                        : "Custom Playlist"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 border-t border-border/30 pt-2.5 text-center">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Playlists
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                      {playlists.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Tracks
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                      {playlistSongs.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Requests
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-primary">
                      {requests.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Playlist Manager */}
              <div className="admin-surface rounded-lg p-3 flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                    เพลย์ลิสต์ของคุณ
                  </h2>

                  {/* View mode toggle */}
                  <div className="flex rounded border border-border/40 bg-black/5 p-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlaylistView("cards")}
                      className={cn(
                        "h-5 w-6 p-0 rounded-sm",
                        playlistView === "cards" &&
                          "bg-white text-primary shadow-sm hover:bg-white",
                      )}
                    >
                      <LayoutGrid className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlaylistView("table")}
                      className={cn(
                        "h-5 w-6 p-0 rounded-sm",
                        playlistView === "table" &&
                          "bg-white text-primary shadow-sm hover:bg-white",
                      )}
                    >
                      <Rows3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Create Playlist Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="เพิ่มเพลย์ลิสต์ใหม่..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreatePlaylist()
                    }
                    className="h-8 border-border bg-black/5 text-xs rounded shadow-inner text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreatePlaylist}
                    disabled={isCreating || !newPlaylistName.trim()}
                    className="h-8 w-8 rounded shrink-0 p-0"
                  >
                    {isCreating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>

                {/* Multiselection Manager */}
                <div className="flex flex-col gap-1.5 rounded border border-border/40 bg-black/5 p-2.5">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[10px] text-foreground font-bold">
                      เลือกสตรีมต่อเนื่อง ({selectedPlaylists.size})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      size="sm"
                      className="h-7 text-[10px] flex-1 rounded font-bold"
                      onClick={handleApplySelectedPlaylists}
                    >
                      เล่นเซ็ตนี้ต่อเนื่อง
                    </Button>
                    {selectedPlaylists.size > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[10px] text-muted-foreground hover:text-foreground rounded"
                        onClick={() => setSelectedPlaylists(new Set())}
                      >
                        ล้าง
                      </Button>
                    )}
                  </div>
                </div>

                {/* Scrollable area of Playlists */}
                <ScrollArea className="flex-1 min-h-0 pr-1">
                  {playlistView === "cards" ? (
                    /* Playlist Cards: Gorgeous square Spotify-like grid layout */
                    <div className="grid grid-cols-2 gap-2.5 p-0.5">
                      {playlists.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-muted-foreground text-xs">
                          ไม่มีเพลย์ลิสต์
                        </div>
                      ) : (
                        playlists.map((pl) => {
                          const isCurrent = currentPlaylist?.id === pl.id;
                          return (
                            <div
                              key={pl.id}
                              className={cn(
                                "group overflow-hidden rounded border transition-all duration-200 cursor-pointer flex flex-col p-2.5 gap-2 relative bg-card shadow-sm",
                                isCurrent
                                  ? "border-primary bg-primary/[0.03] shadow-md"
                                  : "border-border/50 hover:bg-secondary/40 hover:border-border/80",
                                !pl.is_enabled && "opacity-40",
                              )}
                              onClick={() => setActivePlaylistId(pl.id)}
                            >
                              {/* Playlist Cover on Top - Square fill for grid cards */}
                              <div className="relative w-full aspect-square rounded overflow-hidden shadow-inner bg-muted shrink-0">
                                <PlaylistCover playlist={pl} className="w-full h-full text-lg" />

                                {/* Overlay Checkbox for continuous playback */}
                                <button
                                  className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white hover:bg-black/60 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectPlaylist(pl.id);
                                  }}
                                >
                                  {selectedPlaylists.has(pl.id) ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {/* Playlist Info */}
                              <div className="min-w-0 flex-1 flex flex-col gap-0.5 mt-0.5">
                                <p className="truncate text-xs font-bold text-foreground leading-tight">
                                  {pl.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {pl.song_count ?? 0} เพลง
                                </p>
                              </div>

                              {/* Options Strip for active item */}
                              {isCurrent && (
                                <div className="flex items-center gap-1 border-t border-border/30 pt-1.5 mt-0.5 flex-wrap justify-between">
                                  {!pl.is_default && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5 hover:bg-black/5 rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetDefault(pl.id);
                                      }}
                                      title="ตั้งเป็นหลัก"
                                    >
                                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    </Button>
                                  )}
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 hover:bg-black/5 rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleEnabled(pl.id, pl.is_enabled);
                                    }}
                                    title={
                                      pl.is_enabled
                                        ? "ปิดการใช้งาน"
                                        : "เปิดการใช้งาน"
                                    }
                                  >
                                    {pl.is_enabled ? (
                                      <PowerOff className="w-3 h-3 text-red-500" />
                                    ) : (
                                      <Power className="w-3 h-3 text-emerald-500" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 hover:bg-black/5 rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportPlaylist(pl.id);
                                    }}
                                    title="ส่งออก"
                                  >
                                    <Download className="w-3 h-3 text-foreground" />
                                  </Button>
                                  {!pl.is_default && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5 text-destructive hover:bg-destructive/10 rounded ml-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePlaylist(pl.id);
                                      }}
                                      title="ลบ"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    /* Playlist Table View */
                    <div className="overflow-hidden rounded border border-border/40 bg-black/5">
                      <Table>
                        <TableHeader className="bg-black/5">
                          <TableRow className="border-b border-border/20">
                            <TableHead className="w-8 h-8 px-1 text-[9px]"></TableHead>
                            <TableHead className="px-1 text-[9px] text-muted-foreground">
                              ชื่อ
                            </TableHead>
                            <TableHead className="w-12 px-1 text-[9px] text-muted-foreground text-center">
                              เพลง
                            </TableHead>
                            <TableHead className="w-12 px-1 text-[9px] text-muted-foreground text-right"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {playlists.map((pl) => {
                            const isCurrent = currentPlaylist?.id === pl.id;
                            return (
                              <TableRow
                                key={pl.id}
                                onClick={() => setActivePlaylistId(pl.id)}
                                className={cn(
                                  "cursor-pointer border-b border-border/10 hover:bg-black/5 transition-colors",
                                  isCurrent && "bg-primary/[0.02]",
                                  !pl.is_enabled && "opacity-40",
                                )}
                              >
                                <TableCell className="p-1 text-center">
                                  <button
                                    className="flex h-5 w-5 items-center justify-center text-muted-foreground mx-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSelectPlaylist(pl.id);
                                    }}
                                  >
                                    {selectedPlaylists.has(pl.id) ? (
                                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                      <Square className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </TableCell>
                                <TableCell className="p-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <PlaylistCover playlist={pl} className="w-8 h-8 text-[10px]" />
                                    <div className="truncate">
                                      <p className="font-bold text-xs text-foreground truncate">
                                        {pl.name}
                                      </p>
                                      {pl.is_default && (
                                        <span className="text-[8px] text-primary">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="p-1 text-center text-xs tabular-nums text-foreground">
                                  {pl.song_count ?? 0}
                                </TableCell>
                                <TableCell className="p-1 text-right">
                                  <div
                                    className="flex justify-end gap-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {!pl.is_default && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 rounded hover:bg-black/5"
                                        onClick={() => handleSetDefault(pl.id)}
                                        title="ตั้งเป็นหลัก"
                                      >
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                      </Button>
                                    )}
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5 rounded hover:bg-black/5"
                                      onClick={() =>
                                        handleToggleEnabled(
                                          pl.id,
                                          pl.is_enabled,
                                        )
                                      }
                                      title={pl.is_enabled ? "ปิด" : "เปิด"}
                                    >
                                      {pl.is_enabled ? (
                                        <PowerOff className="h-3 w-3 text-red-500" />
                                      ) : (
                                        <Power className="h-3 w-3 text-emerald-500" />
                                      )}
                                    </Button>
                                    {!pl.is_default && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 text-destructive hover:bg-destructive/10 rounded"
                                        onClick={() =>
                                          handleDeletePlaylist(pl.id)
                                        }
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Drag Handle divider (Desktop only) */}
          {isSidebarOpen && (
            <div
              onMouseDown={handleMouseDown}
              className="hidden lg:block w-1 hover:w-1.5 hover:bg-primary/50 bg-border/40 cursor-col-resize transition-all self-stretch shrink-0 relative z-10"
              title="ลากเพื่อยืดหดแผงไลบรารี"
            />
          )}

          {/* RIGHT COLUMN: Active Workspace (List / Grid View for tracks) */}
          <div className="admin-surface rounded-lg p-4 flex-1 flex flex-col gap-4 min-h-0">
            {/* Header Area inside Workspace */}
            <div className="border-b border-border/40 pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {currentPlaylist
                    ? currentPlaylist.name
                    : "กรุณาเลือกเพลย์ลิสต์"}
                  {currentPlaylist?.is_default && (
                    <Badge className="h-4 bg-primary/10 border-primary/20 text-primary text-[8px]">
                      เริ่มต้น
                    </Badge>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground">
                  สับเปลี่ยนเพลง ค้นหาแทร็ก
                  หรือบริหารรายการขอเพลงจากลูกค้าในพื้นที่เดียว
                </p>
              </div>

              {/* Console controls & toggle layout view */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode Grid/List selectors */}
                <div className="flex rounded border border-border/40 bg-black/5 p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMusicListView("list")}
                    className={cn(
                      "h-6 w-7 p-0 rounded-sm",
                      musicListView === "list" &&
                        "bg-white text-primary shadow-sm hover:bg-white",
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
                      "h-6 w-7 p-0 rounded-sm",
                      musicListView === "grid" &&
                        "bg-white text-primary shadow-sm hover:bg-white",
                    )}
                    title="มุมมองตารางรูปปก"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Tab switch buttons */}
                <div className="flex rounded bg-black/5 p-0.5 border border-border/40">
                  <button
                    onClick={() => setActiveWorkspaceTab("tracks")}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1.5",
                      activeWorkspaceTab === "tracks"
                        ? "bg-white text-primary border border-border shadow-sm"
                        : "text-muted-foreground hover:text-foreground border border-transparent",
                    )}
                  >
                    <List className="w-3 h-3" />
                    เพลงในเพลย์ลิสต์
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("search")}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1.5",
                      activeWorkspaceTab === "search"
                        ? "bg-white text-primary border border-border shadow-sm"
                        : "text-muted-foreground hover:text-foreground border border-transparent",
                    )}
                  >
                    <Search className="w-3 h-3" />
                    ค้นหาและเพิ่มเพลง
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab("requests")}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1.5 relative",
                      activeWorkspaceTab === "requests"
                        ? "bg-white text-primary border border-border shadow-sm"
                        : "text-muted-foreground hover:text-foreground border border-transparent",
                    )}
                  >
                    <Radio className="w-3 h-3 text-primary animate-pulse" />
                    คำขอจากลูกค้า
                    {requests.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded bg-primary text-[8px] font-bold text-primary-foreground px-1 border border-background">
                        {requests.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: PLAYLIST TRACKS (Full Div Height enabled) */}
            {activeWorkspaceTab === "tracks" && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between shrink-0 mb-1.5">
                  <p className="text-xs text-muted-foreground">
                    รายการเพลงทั้งหมดในแผง ({playlistSongs.length} แทร็ก)
                  </p>
                </div>

                <ScrollArea className="flex-1 min-h-0 h-0 pr-1">
                  {playlistSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                      <Music2 className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-xs font-bold text-foreground">
                        เพลย์ลิสต์นี้ว่างเปล่า
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[280px]">
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
                          className="flex items-center gap-3 p-2.5 rounded border border-border/20 bg-black/[0.01] hover:bg-black/[0.03] hover:border-border/60 transition-all group"
                        >
                          <span className="text-[10px] font-semibold text-muted-foreground w-6 text-center tabular-nums">
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
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {song.artist || "ไม่ระบุผู้แต่ง"}
                            </p>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded opacity-0 group-hover:opacity-100 transition-all text-destructive hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                            onClick={() => handleRemoveFromPlaylist(song.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Grid Thumbnail View (Spotify album grid style) */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 p-0.5">
                      {playlistSongs.map((song) => (
                        <div
                          key={song.id}
                          className="group relative rounded border border-border/40 bg-card p-2 flex flex-col gap-2 hover:border-primary hover:shadow transition-all"
                        >
                          {/* Song Thumbnail */}
                          <div className="relative aspect-square w-full rounded overflow-hidden shadow-inner bg-muted shrink-0">
                            <img
                              src={song.thumbnail || ""}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8 rounded bg-destructive/90 text-white hover:bg-destructive hover:scale-105"
                                onClick={() =>
                                  handleRemoveFromPlaylist(song.id)
                                }
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
                            <p className="text-[9px] text-muted-foreground truncate">
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
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-3">
                {/* Search Type controls */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={searchType === "video" ? "default" : "outline"}
                    className="h-8 text-[10px] gap-1 rounded font-bold"
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
                    className="h-8 text-[10px] gap-1 rounded font-bold"
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
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="h-9 px-4 rounded shrink-0"
                  >
                    {isSearching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>

                {/* Destination Dropdown for single search */}
                {searchType === "video" && playlists.length > 0 && (
                  <div className="flex items-center gap-2 rounded bg-black/5 p-2 border border-border shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-bold">
                      บันทึกเข้าสู่:
                    </span>
                    <select
                      className="flex-1 h-7 px-2 text-[10px] rounded border border-border/60 bg-white text-foreground font-bold focus:outline-none"
                      value={targetPlaylistId || currentPlaylist?.id || ""}
                      onChange={(e) =>
                        setTargetPlaylistId(Number(e.target.value))
                      }
                    >
                      {playlists.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="text-foreground bg-white"
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
                      <p className="text-[10px] text-muted-foreground mt-2">
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
                              "flex items-center gap-3 rounded border border-border/20 bg-black/[0.01] p-2 hover:border-border/60 hover:bg-black/[0.02] transition-all",
                              inPlaylist && "opacity-50",
                            )}
                          >
                            {result.thumbnail && (
                              <img
                                src={result.thumbnail}
                                alt={result.title}
                                className="w-14 h-10 rounded object-cover flex-shrink-0 shadow border border-black/5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {result.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {result.channelTitle}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={inPlaylist ? "secondary" : "default"}
                              disabled={inPlaylist || isAdding}
                              onClick={() => handleAddToPlaylist(result)}
                              className="h-8 text-[10px] px-3 font-bold rounded shrink-0"
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
                          className="flex items-center gap-3 rounded border border-border/20 bg-black/[0.01] p-2 hover:border-border/60 hover:bg-black/[0.02] transition-all"
                        >
                          {pl.thumbnail && (
                            <img
                              src={pl.thumbnail}
                              alt={pl.title}
                              className="w-14 h-10 rounded object-cover flex-shrink-0 shadow border border-black/5"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {pl.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {pl.channelTitle} · {pl.itemCount} เพลง
                            </p>
                          </div>
                          <Button
                            size="sm"
                            disabled={importingId === pl.id}
                            onClick={() => handleImportYoutubePlaylist(pl)}
                            className="h-8 text-[10px] px-3 font-bold rounded shrink-0"
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
                            <p className="text-[10px]">
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
                              "group relative rounded border border-border/40 bg-card p-2 flex flex-col gap-2 hover:border-primary hover:shadow transition-all",
                              inPlaylist && "opacity-40",
                            )}
                          >
                            {/* Video cover */}
                            <div className="relative aspect-square w-full rounded overflow-hidden shadow bg-muted shrink-0">
                              <img
                                src={result.thumbnail || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  disabled={inPlaylist || isAdding}
                                  className="w-8 h-8 rounded bg-primary/95 text-white hover:bg-primary hover:scale-105"
                                  onClick={() => handleAddToPlaylist(result)}
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
                              <p className="text-[9px] text-muted-foreground truncate">
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
                          className="group relative rounded border border-border/40 bg-card p-2 flex flex-col gap-2 hover:border-primary hover:shadow transition-all"
                        >
                          <div className="relative aspect-square w-full rounded overflow-hidden shadow bg-muted shrink-0">
                            <img
                              src={pl.thumbnail || ""}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={importingId === pl.id}
                                className="w-8 h-8 rounded bg-primary/95 text-white hover:bg-primary hover:scale-105"
                                onClick={() => handleImportYoutubePlaylist(pl)}
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
                            <p className="text-[9px] text-muted-foreground truncate">
                              {pl.channelTitle} · {pl.itemCount} เพลง
                            </p>
                          </div>
                        </div>
                      ))}

                      {searchResults.length === 0 &&
                        ytPlaylistResults.length === 0 && (
                          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                            <Search className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-[10px]">
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
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[260px]">
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
                              "flex items-center gap-3 p-2.5 rounded border transition-all duration-200",
                              isCurrentPlaying
                                ? "border-primary/45 bg-primary/[0.04] shadow-sm"
                                : "border-border/20 bg-black/[0.01]",
                            )}
                          >
                            <span className="text-xs font-semibold text-muted-foreground w-6 text-center tabular-nums">
                              {i + 1}
                            </span>

                            {req.thumbnail && (
                              <img
                                src={req.thumbnail}
                                alt={req.title}
                                className="w-12 h-9 rounded object-cover shadow border border-black/5 flex-shrink-0"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {req.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                ส่งขอโดย: {req.requested_by || "ลูกค้าทั่วไป"}
                              </p>
                            </div>

                            {isCurrentPlaying && (
                              <Badge className="h-5 px-1.5 text-[8px] bg-primary/20 text-primary border-primary/30 pointer-events-none font-bold shrink-0">
                                กำลังเล่น
                              </Badge>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                              onClick={() => handleRemoveRequest(req.id)}
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
                              "group relative rounded border bg-card p-2 flex flex-col gap-2 hover:border-primary hover:shadow transition-all",
                              isCurrentPlaying
                                ? "border-primary bg-primary/[0.02]"
                                : "border-border/40",
                            )}
                          >
                            {/* Request cover */}
                            <div className="relative aspect-square w-full rounded overflow-hidden shadow bg-muted shrink-0">
                              <img
                                src={req.thumbnail || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-8 h-8 rounded bg-destructive/90 text-white hover:bg-destructive hover:scale-105"
                                  onClick={() => handleRemoveRequest(req.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {isCurrentPlaying && (
                                <div className="absolute bottom-1.5 left-1.5">
                                  <Badge className="h-4 px-1 bg-primary text-primary-foreground text-[8px] font-bold">
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
                              <p className="text-[9px] text-muted-foreground truncate">
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
          </div>
        </div>
      </main>

      {/* QR Code Dialog Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-card rounded p-6 max-w-sm w-full border border-border shadow-lg animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-foreground">
                บาร์โค้ด QR ลิงก์สำหรับลูกค้า
              </h3>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded"
                onClick={() => setShowQR(false)}
              >
                <X className="w-4 h-4 text-foreground" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-4 text-center select-all border border-border bg-black/5 p-2 rounded shadow-inner">
              {pageUrl}
            </p>
            {qrDataUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="overflow-hidden rounded border border-border bg-white p-2.5 shadow-sm">
                  <img
                    src={qrDataUrl}
                    alt="Request Webpage QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <Button
                  className="w-full gap-1.5 rounded font-bold h-9 text-xs"
                  onClick={handleDownloadQR}
                >
                  <Download className="w-3.5 h-3.5" />
                  ดาวน์โหลดภาพบาร์โค้ด
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
