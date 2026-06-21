"use client";

import useSWR from "swr";
import {
  Radio,
  Music2,
  Play,
  Pause,
  Trash2,
  Clock,
  User,
  Headphones,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/context/player-context";
import { toast } from "sonner";
import type { SongRequest } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AdminRequestsView() {
  const { currentSong, isPlaying, togglePlay, playSongImmediately } =
    usePlayer();
  const { data: requests = [], mutate } = useSWR<SongRequest[]>(
    "/api/requests",
    fetcher,
    {
      refreshInterval: 5000,
      dedupingInterval: 2000,
      revalidateOnFocus: false,
    },
  );

  const handlePlayPause = (req: SongRequest) => {
    try {
      if (currentSong?.youtube_id === req.youtube_id) {
        togglePlay();
      } else {
        playSongImmediately({
          id: req.id,
          youtube_id: req.youtube_id,
          title: req.title,
          thumbnail: req.thumbnail,
          artist: req.requested_by || "ลูกค้าทั่วไป",
        });
      }
    } catch (err) {
      console.error("Play error:", err);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await fetch("/api/requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate();
      toast.success("ลบคำขอแล้ว");
    } catch {
      toast.error("ไม่สามารถลบคำขอได้");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-6 px-4 py-4 sm:px-6 xl:px-8 xl:py-7 flex-1 overflow-y-auto">
      {/* Header */}
      <section className="admin-dashboard-hero relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#171b34] via-[#111426] to-[#0d1021] p-2 sm:p-4 xl:p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 bg-violet-500/12 blur-[80px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 bg-violet-500/8 blur-[70px] rounded-full" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400 border border-violet-500/20">
            <Radio className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white sm:text-2xl xl:text-3xl">
              คำขอเพลงจากลูกค้า
            </h1>
            <p className="mt-1 text-sm text-white/50">
              มีคำขอ {requests.length} รายการ
            </p>
          </div>
        </div>
      </section>

      {/* Requests List */}
      <section className="admin-dashboard-qr-card overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#171b34] to-[#111426] xl:rounded-2xl">
        <div className="admin-dashboard-qr-header flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
              รายการคำขอ
            </span>
          </div>
          {requests.length > 0 && (
            <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/20 text-[10px] font-bold px-2 py-0.5">
              {requests.length} รายการ
            </Badge>
          )}
        </div>

        <div className="p-4">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/8">
                <Radio className="h-8 w-8 text-white/20" />
              </div>
              <p className="text-sm font-semibold text-white/60">
                ยังไม่มีคำขอเพลง
              </p>
              <p className="mt-2 max-w-xs text-xs text-white/35 leading-relaxed">
                เมื่อลูกค้าสแกน QR และส่งเพลงเข้าคิว คำขอจะแสดงที่นี่
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {requests.map((req, i) => {
                const isCurrentPlaying = i === 0;
                const isThisPlaying =
                  currentSong?.youtube_id === req.youtube_id && isPlaying;

                return (
                  <div
                    key={req.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                      isCurrentPlaying
                        ? "border-violet-500/30 bg-violet-500/[0.04] shadow-sm"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10",
                    )}
                  >
                    <span className="w-6 text-center text-xs font-semibold text-white/30 tabular-nums">
                      {i + 1}
                    </span>

                    {req.thumbnail ? (
                      <img
                        src={req.thumbnail}
                        alt=""
                        className="h-10 w-14 shrink-0 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/10">
                        <Music2 className="h-4 w-4 text-white/20" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {req.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/40">
                        <User className="h-3 w-3 shrink-0" />
                        {req.requested_by || "ลูกค้าทั่วไป"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCurrentPlaying && (
                        <Badge className="h-5 px-2 text-[10px] bg-primary/15 text-primary border-primary/20 font-bold">
                          <Clock className="mr-1 h-2.5 w-2.5" />
                          กำลังเล่น
                        </Badge>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          isThisPlaying
                            ? "bg-primary/15 text-primary hover:bg-primary/20"
                            : "text-white/50 hover:text-primary hover:bg-white/[0.06]",
                        )}
                        onClick={() => handlePlayPause(req)}
                      >
                        {isThisPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleRemove(req.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
