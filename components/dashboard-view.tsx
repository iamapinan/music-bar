"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Music2,
  Radio,
  LibraryBig,
  LayoutDashboard,
  QrCode,
  MonitorPlay,
  Copy,
  Check,
  Download,
  ExternalLink,
  Smartphone,
  Users,
  Music,
  Sparkles,
  RefreshCw,
  ToggleLeft,
  ArrowRight,
  RadioTower,
  Disc3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/context/player-context";
import { useAdminAuth } from "@/app/(system)/admin/layout";
import { forceUpdateApp } from "@/lib/app-update";
import type { Playlist, PlaylistSong, SongRequest } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function DashboardView() {
  const { activeTenant, user } = useAdminAuth();
  const {
    isRequestsEnabled,
    setIsRequestsEnabled,
    isAutoPlayEnabled,
    setIsAutoPlayEnabled,
  } = usePlayer();
  const [pageUrl, setPageUrl] = useState("");
  const [playerUrl, setPlayerUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState<"link" | "player" | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState<string | null>(null);

  const { data: playlists = [] } = useSWR<Playlist[]>(
    "/api/playlists",
    fetcher,
  );
  const currentPlaylist = playlists.find((p) => p.is_default) || playlists[0];

  const { data: playlistSongs = [] } = useSWR<PlaylistSong[]>(
    currentPlaylist ? `/api/playlists/${currentPlaylist.id}/songs` : null,
    fetcher,
  );

  const { data: requests = [] } = useSWR<SongRequest[]>(
    "/api/requests",
    fetcher,
    { refreshInterval: 3000 },
  );

  useEffect(() => {
    if (!activeTenant?.slug) return;
    const origin = window.location.origin;
    const slug = activeTenant.slug;
    setPageUrl(`${origin}/play/${slug}/request`);
    setPlayerUrl(`${origin}/play/${slug}`);
  }, [activeTenant?.slug]);

  useEffect(() => {
    if (!pageUrl) return;
    setQrDataUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pageUrl)}&bgcolor=ffffff&color=059669&format=png&margin=20`,
    );
  }, [pageUrl]);

  const handleCopyLink = async () => {
    if (!pageUrl) return;
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied("link");
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const handleCopyPlayer = async () => {
    if (!playerUrl) return;
    try {
      await navigator.clipboard.writeText(playerUrl);
      setCopied("player");
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const handleForceUpdate = () => forceUpdateApp(setIsUpdating);

  const handleDownloadQR = async () => {
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `music-bar-qr-${activeTenant?.slug || "store"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };

  const handleToggleRequests = (enabled: boolean) => {
    setIsRequestsEnabled(enabled);
    setSettingsChanged(enabled ? "requests_on" : "requests_off");
    setTimeout(() => setSettingsChanged(null), 2000);
  };

  const handleToggleAutoPlay = (enabled: boolean) => {
    setIsAutoPlayEnabled(enabled);
    setSettingsChanged(enabled ? "autoplay_on" : "autoplay_off");
    setTimeout(() => setSettingsChanged(null), 2000);
  };

  const storeName =
    activeTenant?.display_name ||
    activeTenant?.name ||
    user?.email ||
    "Music Bar";

  return (
    <main className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-6 px-4 py-4 sm:px-6 xl:px-8 xl:py-7 flex-1 overflow-y-auto">
      {/* ===== Hero / Overview ===== */}
      <section className="admin-dashboard-hero relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1815] via-[#0b1110] to-[#0a0f0e] p-6 sm:p-8 xl:p-10">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 bg-primary/12 blur-[80px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 bg-emerald-500/8 blur-[70px] rounded-full" />

        <div className="relative z-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white sm:text-3xl xl:text-4xl">
                {storeName}
              </h1>
              <p className="mt-2 text-sm text-white/50">
                {playlists.length} เพลย์ลิสต์ · {playlistSongs.length} เพลง ·{" "}
                {requests.length} คำขอ
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => window.open(playerUrl, "_blank")}
                disabled={!playerUrl}
                className="h-10 gap-2 rounded-full px-5 text-sm font-semibold shadow-[0_8px_24px_rgba(16,185,129,0.2)]"
              >
                <MonitorPlay className="h-4 w-4" />
                เปิดเครื่องเล่น
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </Button>
              <Button
                onClick={handleCopyPlayer}
                disabled={!playerUrl}
                variant="outline"
                className="h-10 gap-2 rounded-full border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-white hover:bg-white/[0.08] hover:text-white"
              >
                {copied === "player" ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === "player" ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
              </Button>
              <Button
                onClick={handleForceUpdate}
                disabled={isUpdating}
                variant="outline"
                className="h-10 gap-2 rounded-full border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-white hover:bg-white/[0.08] hover:text-white"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isUpdating && "animate-spin")}
                />
                {isUpdating ? "กำลังอัปเดต..." : "อัปเดตแอป"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats + QR Row ===== */}
      <section className="grid gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
        {/* Left: Stats + Settings */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              [
                "เพลย์ลิสต์",
                playlists.length,
                "ชุดบรรยากาศ",
                <LibraryBig key="lib" className="h-5 w-5" />,
                "from-emerald-500/10 to-emerald-500/5 border-emerald-500/15",
              ],
              [
                "เพลงในคิว",
                playlistSongs.length,
                "ในเพลย์ลิสต์ปัจจุบัน",
                <Music2 key="mus" className="h-5 w-5" />,
                "from-cyan-500/10 to-cyan-500/5 border-cyan-500/15",
              ],
              [
                "คำขอเพลง",
                requests.length,
                "จากลูกค้า",
                <Radio key="rad" className="h-5 w-5" />,
                "from-violet-500/10 to-violet-500/5 border-violet-500/15",
              ],
            ].map(([label, value, detail, icon, gradient]) => (
              <div
                key={String(label)}
                className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${gradient} p-5 transition-all hover:border-primary/30 xl:rounded-2xl xl:p-6`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/50">
                    {label}
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-primary border border-white/8">
                    {icon}
                  </div>
                </div>
                <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-5xl">
                  {value}
                </p>
                <p className="mt-1.5 text-xs text-white/40">{detail}</p>
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 bg-primary/8 blur-3xl rounded-full" />
              </div>
            ))}
          </div>

          {/* Settings Card */}
          <div className="admin-dashboard-qr-card overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#0f1815] to-[#0b1110] xl:rounded-2xl">
            <div className="admin-dashboard-qr-header flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary border border-primary/15">
                  <ToggleLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    ตั้งค่าเครื่องเล่น
                  </p>
                  <p className="text-xs text-white/45">
                    จัดการการทำงานของระบบเพลง
                  </p>
                </div>
              </div>
              {settingsChanged && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary animate-in fade-in">
                  <Check className="h-3 w-3" />
                  {settingsChanged.includes("on") ? "เปิด" : "ปิด"}แล้ว
                </span>
              )}
            </div>
            <div className="divide-y divide-white/[0.04] px-5 py-2">
              {/* Requests toggle */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/12 text-violet-400">
                    <RadioTower className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      เปิดรับเพลงจากลูกค้า
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      เมื่อเปิด ลูกค้าสามารถสแกน QR เพื่อส่งเพลงเข้าคิวได้
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isRequestsEnabled}
                  onCheckedChange={handleToggleRequests}
                  className="shrink-0 data-[state=checked]:bg-accent"
                />
              </div>

              {/* Auto-play toggle */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-400">
                    <Disc3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      เล่นเพลงอัตโนมัติ
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      เมื่อเปิด
                      ระบบจะเล่นเพลงถัดไปโดยอัตโนมัติเมื่อเพลงปัจจุบันจบ
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isAutoPlayEnabled}
                  onCheckedChange={handleToggleAutoPlay}
                  className="shrink-0 data-[state=checked]:bg-accent"
                />
              </div>

              {/* Open Player link */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <MonitorPlay className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      จัดการหน้าเครื่องเล่น
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      ดูคิวเพลงและควบคุมการเล่นบนหน้าจอใหญ่
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => window.open(playerUrl, "_blank")}
                  disabled={!playerUrl}
                  size="sm"
                  className="shrink-0 gap-1.5 rounded-full px-4 text-xs font-semibold"
                >
                  เปิด
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR Card */}
        <div className="admin-dashboard-qr-card flex flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#0f1815] to-[#0b1110] xl:rounded-2xl">
          <div className="admin-dashboard-qr-header flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary border border-primary/15">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">QR ขอเพลง</p>
                <p className="text-xs text-white/45">ให้ลูกค้าสแกนแล้วขอเพลง</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={handleCopyLink}
                disabled={!pageUrl}
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06]"
                title="คัดลอกลิงก์"
              >
                {copied === "link" ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => window.open(pageUrl, "_blank")}
                disabled={!pageUrl}
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06]"
                title="เปิดหน้า request"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <div className="relative rounded-xl bg-white p-3 shadow-lg">
              {qrDataUrl ? (
                <div className="relative">
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="h-40 w-40 object-contain sm:h-48 sm:w-48"
                  />
                  {/* App logo overlay at center of QR */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md ring-2 ring-white">
                      <img
                        src="/icon-512.png"
                        alt=""
                        className="h-7 w-7 rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 w-40 animate-pulse items-center justify-center rounded-lg bg-white/10 sm:h-48 sm:w-48">
                  <span className="text-xs text-white/30">
                    กำลังสร้าง QR...
                  </span>
                </div>
              )}
            </div>
            {pageUrl && (
              <p className="max-w-full truncate text-xs text-white/40 px-2 text-center">
                {pageUrl}
              </p>
            )}
            <Button
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
              variant="outline"
              size="sm"
              className="w-full gap-2 rounded-full border-white/10 bg-white/[0.03] text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.07]"
            >
              <Download className="h-3.5 w-3.5" />
              บันทึก QR Code
            </Button>
          </div>
        </div>
      </section>

      {/* ===== Usage tips ===== */}
      <section className="admin-dashboard-tips rounded-xl border border-white/8 bg-white/[0.02] p-5 sm:p-6 xl:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">วิธีใช้งาน</h3>
            <p className="mt-1 text-xs text-white/45 max-w-xl leading-relaxed">
              พิมพ์ QR Code วางไว้ที่โต๊ะลูกค้า
              หรือแชร์ลิงก์ให้ลูกค้าสแกนจากมือถือ
              เพื่อส่งเพลงที่อยากฟังเข้าคิวของร้าน — ลูกค้าไม่ต้องลงแอป
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-primary/60" />
              ไม่ต้องลงแอป
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-primary/60" />
              YouTube ทุกเพลง
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary/60" />
              จัดการคิวเรียลไทม์
            </span>
          </div>
        </div>
      </section>

      {/* ===== Stat insight ===== */}
      <section className="admin-dashboard-coming-soon flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.015] p-8 text-center sm:p-12">
        <LayoutDashboard className="mb-4 h-10 w-10 text-white/15" />
        <h3 className="text-base font-semibold text-white/60">
          สถิติเชิงลึก (เร็ว ๆ นี้)
        </h3>
        <p className="mt-2 max-w-md text-xs text-white/35 leading-relaxed">
          ดูสถิติเพลงยอดฮิต ช่วงเวลาที่มีคนขอเพลงมากที่สุด
          และแนวเพลงที่ลูกค้าชื่นชอบ
        </p>
      </section>
    </main>
  );
}
