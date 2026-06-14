"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  LibraryBig,
  MonitorPlay,
  QrCode,
  SlidersHorizontal,
  Sparkles,
  Store,
  Volume2,
  Waves,
  Music,
  Smartphone,
  Users,
  RefreshCw,
  Youtube,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Station = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  logo_url: string | null;
  playlist_count: string;
  song_count: string;
  cover_thumbnail: string | null;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
};

const features = [
  {
    icon: Store,
    title: "แยกอิสระทุกสาขา",
    detail: "คลังเพลง คิว และสิทธิ์การจัดการของแต่ละสาขาแยกจากกัน ไม่ปนกัน",
  },
  {
    icon: QrCode,
    title: "QR ขอเพลง",
    detail: "ลูกค้าสแกน QR แล้วค้นหาเพลงส่งเข้าคิวได้ทันที ไม่ต้องลงแอป",
  },
  {
    icon: MonitorPlay,
    title: "Player สำหรับร้าน",
    detail:
      "คุมเสียง วิดีโอ และคิวเพลงบนจอเดียว เปิดเพลงร้านและรับ request ได้พร้อมกัน",
  },
  {
    icon: Youtube,
    title: "YouTube Integration",
    detail: "ค้นหาและเล่นเพลงจาก YouTube โดยตรง ไม่ต้องอัปโหลดไฟล์",
  },
  {
    icon: RefreshCw,
    title: "สลับคิวอัตโนมัติ",
    detail:
      "สลับจาก playlist เพลงร้านไปเพลงที่ลูกค้าขอ แล้วกลับเข้า playlist อัตโนมัติ เมื่อคิว request หมด",
  },
  {
    icon: LayoutGrid,
    title: "หลายเพลย์ลิสต์พร้อมกัน",
    detail: "เลือกเปิดหลาย playlist พร้อมกัน เล่นแบบวนหรือสุ่มตามที่ต้องการ",
  },
];

const operatingNotes = [
  "ตั้ง playlist หลักของแต่ละสาขา",
  "รับ request แบบเรียงคิว",
  "สลับจากเพลงร้านไปเพลงที่ลูกค้าขอ",
  "กลับเข้า playlist อัตโนมัติเมื่อคิวหมด",
];

export function LandingPage() {
  const { data: stations = [], isLoading } = useSWR<Station[]>(
    "/api/stations",
    fetcher,
  );
  const totalSongs = stations.reduce(
    (sum, station) => sum + Number(station.song_count || 0),
    0,
  );
  const totalPlaylists = stations.reduce(
    (sum, station) => sum + Number(station.playlist_count || 0),
    0,
  );

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#111426] text-white selection:bg-primary/30 selection:text-white">
      {/* ---- Background ---- */}
      <div className="pointer-events-none absolute inset-0 z-0 mx-auto overflow-hidden">
        {/* Core theme gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_4%,rgba(106,92,255,0.24),transparent_32rem),radial-gradient(circle_at_82%_18%,rgba(226,232,240,0.08),transparent_24rem),linear-gradient(180deg,#111426_0%,#111426_42%,#171b34_100%)]" />
        <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />

        {/* Dynamic party spotlights */}
        <div className="absolute -left-1/4 -top-1/4 h-[80vw] w-[80vw] rounded-full bg-violet-500/10 blur-[120px] animate-party-drift-1 mix-blend-screen" />
        <div className="absolute -right-1/4 top-1/4 h-[70vw] w-[70vw] rounded-full bg-indigo-500/10 blur-[130px] animate-party-drift-2 mix-blend-screen" />
        <div className="absolute left-1/3 top-1/2 h-[75vw] w-[75vw] rounded-full bg-pink-500/8 blur-[140px] animate-party-drift-3 mix-blend-screen" />

        {/* Diagonal Swaying Lasers */}
        <div className="absolute left-[-10%] top-[-20%] h-[150%] w-[1.5px] origin-top bg-gradient-to-b from-violet-400/40 via-violet-400/20 to-transparent blur-[2px] animate-laser-1" />
        <div className="absolute right-[-10%] top-[-20%] h-[150%] w-[1.5px] origin-top bg-gradient-to-b from-pink-400/40 via-pink-400/20 to-transparent blur-[2px] animate-laser-2" />
        <div
          className="absolute left-[30%] top-[-20%] h-[150%] w-[1px] origin-top bg-gradient-to-b from-blue-400/30 via-blue-400/10 to-transparent blur-[1px] animate-laser-1"
          style={{ animationDelay: "-4s" }}
        />

        {/* Floating Note Particles */}
        <div className="absolute inset-0 select-none overflow-hidden opacity-30">
          <span
            className="absolute bottom-10 left-[10%] text-xl text-primary/40 animate-note-float"
            style={
              {
                "--x": "60px",
                "--rot": "30deg",
                animationDelay: "0s",
                animationDuration: "6s",
              } as React.CSSProperties
            }
          >
            🎵
          </span>
          <span
            className="absolute bottom-10 left-[25%] text-lg text-pink-400/40 animate-note-float"
            style={
              {
                "--x": "-40px",
                "--rot": "-45deg",
                animationDelay: "1.5s",
                animationDuration: "8s",
              } as React.CSSProperties
            }
          >
            🎶
          </span>
          <span
            className="absolute bottom-10 left-[45%] text-2xl text-violet-400/40 animate-note-float"
            style={
              {
                "--x": "80px",
                "--rot": "15deg",
                animationDelay: "3s",
                animationDuration: "7s",
              } as React.CSSProperties
            }
          >
            ✨
          </span>
          <span
            className="absolute bottom-10 left-[65%] text-xl text-indigo-400/40 animate-note-float"
            style={
              {
                "--x": "-70px",
                "--rot": "60deg",
                animationDelay: "0.8s",
                animationDuration: "9s",
              } as React.CSSProperties
            }
          >
            🎵
          </span>
          <span
            className="absolute bottom-10 left-[80%] text-lg text-violet-300/40 animate-note-float"
            style={
              {
                "--x": "50px",
                "--rot": "-25deg",
                animationDelay: "4.5s",
                animationDuration: "6.5s",
              } as React.CSSProperties
            }
          >
            🎶
          </span>
        </div>
      </div>

      {/* ---- Nav ---- */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "pt-2 px-2 sm:px-4" : "pt-4 px-3 sm:px-5"
        }`}
      >
        <nav
          className={`mx-auto grid h-[72px] w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-3 rounded-[1.75rem] border transition-all duration-300 ${
            isScrolled
              ? "border-primary/20 bg-[#111426]/90 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
              : "border-white/10 bg-[#111426]/40 shadow-none backdrop-blur-xl"
          } px-3 sm:px-4 lg:grid-cols-[1fr_auto_1fr]`}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 group/logo"
            aria-label="Music Bar home"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 group-hover/logo:scale-105">
              <img
                src="/icon-512.png"
                alt=""
                className="h-9 w-9 rounded-xl object-cover"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-none tracking-wide text-white transition-colors duration-300 group-hover/logo:text-white/88">
                Music Bar
              </span>
              <span className="mt-1 block truncate text-[11px] font-medium text-white/45">
                Play anywhere. Stay in the vibe.
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/[0.045] p-1 text-xs font-semibold text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:flex">
            <a href="#features" className="rounded-full px-4 py-2 transition hover:bg-white/[0.07] hover:text-white">
              Features
            </a>
            <a href="#stations" className="rounded-full px-4 py-2 transition hover:bg-white/[0.07] hover:text-white">
              Stations
            </a>
            <a href="#download" className="rounded-full px-4 py-2 transition hover:bg-white/[0.07] hover:text-white">
              App
            </a>
            <a href="#start" className="rounded-full px-4 py-2 transition hover:bg-white/[0.07] hover:text-white">
              Start
            </a>
          </div>

          <div className="ml-auto flex items-center justify-end gap-2">
            <Link href="/admin">
              <Button
                variant="ghost"
                className="h-10 rounded-full border border-white/8 bg-white/[0.035] px-3 text-sm font-semibold text-white/72 hover:bg-white/[0.08] hover:text-white sm:px-4"
              >
                <span className="sm:hidden">จัดการ</span>
                <span className="hidden sm:inline">ระบบจัดการ</span>
              </Button>
            </Link>
            <Link href="/apply" className="hidden sm:block">
              <Button className="h-10 rounded-full bg-[linear-gradient(135deg,#3D7BFF,#6A5CFF_52%,#FF5DB8)] px-5 text-sm font-semibold shadow-[0_14px_36px_rgba(106,92,255,0.24)] transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,93,184,0.28)] active:scale-[0.98]">
                ขอเปิดสถานี
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <span className="text-lg font-bold">✕</span>
              ) : (
                <span className="text-xl">☰</span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-[88px] left-3 right-3 rounded-3xl border border-white/10 bg-[#111426]/95 p-6 shadow-2xl backdrop-blur-3xl lg:hidden animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="flex flex-col gap-4 text-center font-semibold text-white/72">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl py-3 hover:bg-white/[0.05] hover:text-white transition"
              >
                Features
              </a>
              <a
                href="#stations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl py-3 hover:bg-white/[0.05] hover:text-white transition"
              >
                Stations
              </a>
              <a
                href="#download"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl py-3 hover:bg-white/[0.05] hover:text-white transition"
              >
                Download App
              </a>
              <a
                href="#start"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl py-3 hover:bg-white/[0.05] hover:text-white transition"
              >
                Start
              </a>
              <hr className="border-white/10 my-2" />
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl py-3 hover:bg-white/[0.05] hover:text-white transition"
              >
                ระบบจัดการ (Admin)
              </Link>
              <Link
                href="/apply"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full bg-[linear-gradient(135deg,#3D7BFF,#6A5CFF_52%,#FF5DB8)] py-3 font-semibold text-white hover:scale-[1.02] active:scale-[0.98] transition"
              >
                ขอเปิดสถานี
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==================== HERO ==================== */}
      <section className="relative z-10 w-full overflow-hidden px-5 pb-16 pt-28 sm:px-8 sm:pt-36 lg:pb-28 lg:pt-40 xl:px-16">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/hero-party-background.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-42 saturate-[1.08]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,20,38,0.95)_0%,rgba(17,20,38,0.78)_34%,rgba(17,20,38,0.48)_68%,rgba(17,20,38,0.74)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_24%_42%,rgba(17,20,38,0.38),transparent_34rem),linear-gradient(180deg,rgba(17,20,38,0.05)_0%,rgba(17,20,38,0.88)_100%)]" />
          <div className="absolute inset-x-[-18%] top-[-22%] h-[82%] bg-[radial-gradient(circle_at_24%_30%,rgba(255,93,184,0.18),transparent_18rem),radial-gradient(circle_at_58%_20%,rgba(106,92,255,0.24),transparent_22rem),radial-gradient(circle_at_84%_36%,rgba(61,123,255,0.18),transparent_19rem)] blur-[2px]" />
          <div className="absolute left-[7%] top-[-24%] h-[118%] w-24 rotate-[16deg] bg-[linear-gradient(180deg,transparent,rgba(106,92,255,0.20),transparent)] blur-2xl" />
          <div className="absolute right-[12%] top-[-18%] h-[108%] w-20 -rotate-[22deg] bg-[linear-gradient(180deg,transparent,rgba(255,93,184,0.15),transparent)] blur-2xl" />
          <div className="absolute left-[42%] top-[-28%] h-[122%] w-16 rotate-[6deg] bg-[linear-gradient(180deg,transparent,rgba(61,123,255,0.14),transparent)] blur-2xl" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.52)_0_1px,transparent_1.5px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_74%_48%_at_50%_18%,black,transparent_76%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,20,38,0)_0%,rgba(17,20,38,0.18)_44%,rgba(17,20,38,0.92)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl grid gap-12 lg:grid-cols-[1.02fr_0.98fr] w-full">
          <div className="relative z-10 flex max-w-3xl flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            
            Multi-tenant music control
          </div>

          <h1 className="max-w-4xl text-2xl font-bold leading-[1.08] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-300 via-pink-400 to-indigo-400 bg-[size:200%_auto] animate-text-shine sm:text-4xl lg:text-5xl xl:text-6xl drop-shadow-[0_2px_15px_rgba(106,92,255,0.15)]">
            คิวเพลงของร้านที่ดูดีเท่าบรรยากาศจริง
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
            ให้ลูกค้าขอเพลงผ่าน QR และให้ทีมร้านคุม playlist, queue, player
            ของทุกสาขาได้ในที่เดียว
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#stations" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-full px-7 text-sm font-semibold shadow-[0_18px_42px_rgba(106,92,255,0.22)] hover:shadow-[0_0_25px_rgba(106,92,255,0.4)] hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] sm:w-auto"
              >
                เลือกสถานี
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/apply" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-white/12 bg-white/[0.035] px-7 text-sm font-semibold text-white hover:bg-white/[0.08] hover:text-white hover:border-violet-500/35 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] sm:w-auto"
              >
                เปิดใช้กับร้านของคุณ
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 min-h-[460px] lg:min-h-[560px] perspective-1200 preserve-3d group/player">
          {/* Main Room Turntable Mockup */}
          <div className="absolute left-0 top-6 w-[78%] overflow-hidden rounded-[2rem] border border-white/10 bg-[#171b34] shadow-[0_40px_90px_rgba(0,0,0,0.45)] sm:left-8 hero-3d-turntable">
            <div className="aspect-[4/5] bg-[radial-gradient(circle_at_50%_22%,rgba(106,92,255,0.24),transparent_18rem),linear-gradient(160deg,#202542,#0d1021_62%)] p-5">
              <div className="flex items-center justify-between text-xs text-white/44">
                <span className="tracking-widest font-semibold text-violet-400/90">
                  MAIN ROOM
                </span>
                <span className="font-mono bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                  21:48
                </span>
              </div>

              {/* Spinning Vinyl Record and Stylus Needle Section */}
              <div className="mt-14 flex justify-center relative">
                {/* Vinyl Record */}
                <div
                  className="relative h-56 w-56 rounded-full border border-white/20 p-1 bg-black/40 shadow-[0_0_35px_rgba(106,92,255,0.15)] animate-ring-pulse"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <div className="h-full w-full rounded-full vinyl-grooves animate-vinyl-spin flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                    {/* Concentric sheen lines */}
                    <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
                    <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
                    <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
                    <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none" />

                    {/* Vinyl Center Sticker */}
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 p-[2px] shadow-lg flex items-center justify-center">
                      <div className="h-full w-full rounded-full bg-[#0d1021] flex flex-col items-center justify-center p-1 text-[8px] font-bold tracking-tight text-white select-none">
                        <span className="text-violet-400 scale-90">MUSIC</span>
                        <span className="text-indigo-400 scale-75 leading-none">
                          BAR
                        </span>
                        {/* Spindle hole */}
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#111] border border-white/10" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Turntable Stylus / Tone Arm */}
                <div
                  className="absolute right-6 top-[-10px] w-24 h-32 pointer-events-none z-10 origin-top-right rotate-[-12deg] transition-transform duration-500 group-hover/player:rotate-[-8deg]"
                  style={{ transform: "translateZ(40px)" }}
                >
                  {/* Base pivot */}
                  <div className="absolute right-0 top-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 shadow-md flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-zinc-600 border border-zinc-500" />
                  </div>
                  {/* Metal Arm Line */}
                  <div className="absolute right-3.5 top-4 w-1 h-28 bg-gradient-to-b from-zinc-400 to-zinc-600 origin-top rotate-[-15deg] shadow-sm">
                    {/* Head shell / Needle cartridge */}
                    <div className="absolute bottom-[-6px] left-[-3px] w-3 h-6 bg-zinc-700 rounded-sm border border-zinc-600 rotate-[15deg]">
                      <div className="w-1.5 h-1 bg-violet-400 absolute bottom-0.5 left-0.5 rounded-full shadow-[0_0_8px_rgba(106,92,255,0.8)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress and Track Info */}
              <div className="mt-12">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-violet-500 to-blue-400 shadow-[0_0_12px_rgba(106,92,255,0.4)] animate-pulse" />
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-white tracking-wide">
                      Now playing
                    </p>
                    <p className="mt-1 text-sm text-white/45 truncate">
                      Playlist switches when requests arrive
                    </p>
                  </div>

                  {/* Equalizer Visualizer */}
                  <div className="flex items-end gap-[3px] h-8 shrink-0 pb-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-[3px] bg-violet-400 rounded-t-sm landing-eq-bar-${(i % 4) + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Queue Cards Overlay */}
          <div className="absolute bottom-8 right-0 w-[68%] rounded-[2rem] border border-white/12 bg-white/[0.04] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.52)] backdrop-blur-3xl sm:right-4 hero-3d-queue group/queue">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/14 text-primary shadow-[0_0_15px_rgba(106,92,255,0.1)] group-hover/queue:scale-105 transition-transform duration-300">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white tracking-wide">
                    Live queue
                  </p>
                  <p className="text-xs text-white/42">
                    Requests move by play order
                  </p>
                </div>
              </div>
              <BadgeCheck className="h-5 w-5 text-primary shadow-[0_0_10px_rgba(106,92,255,0.2)] animate-pulse" />
            </div>
            <div className="mt-4 space-y-2.5">
              {operatingNotes.map((note, index) => (
                <div
                  key={note}
                  className="flex items-center gap-3 rounded-xl bg-black/30 px-3 py-2.5 hover:bg-black/40 border border-transparent hover:border-white/5 transition-all duration-300"
                >
                  <span className="font-mono text-xs text-primary font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-white/80">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto scroll-mt-28 px-5 pb-24 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            ทุกอย่างที่ร้านเพลงต้องการ
          </h2>
          <p className="mt-4 text-base leading-7 text-white/55">
            ตั้งแต่ระบบจัดการเพลย์ลิสต์ ไปจนถึงคิวขอเพลงจากลูกค้า —
            ครบในที่เดียว
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="party-border-glow-card group p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-[0_0_15px_rgba(106,92,255,0.1)] transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(106,92,255,0.25)]">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white tracking-wide group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60 group-hover:text-white/85 transition-colors duration-300">
                {feature.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== STATIONS ==================== */}
      <section
        id="stations"
        className="relative z-10 w-full max-w-7xl mx-auto scroll-mt-24 px-5 pb-24 sm:px-8 lg:px-12 xl:px-16"
      >
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            เลือกสถานีที่เปิดให้บริการ
          </h2>
          <p className="mt-4 text-base leading-7 text-white/55">
            เปิด player ของสาขา หรือให้ทีมร้านเข้าไปจัดการเพลงจากระบบหลังบ้าน
          </p>
        </div>

        <div className="mt-8 grid gap-4 border-y border-white/10 py-6 sm:grid-cols-3 relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="group/stat">
            <p className="font-mono text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 group-hover/stat:from-violet-400 group-hover/stat:to-blue-300 transition-all duration-300 tracking-tight">
              {stations.length}
            </p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-white/40 group-hover/stat:text-white/60 transition-colors duration-300">
              สถานี
            </p>
          </div>
          <div className="group/stat">
            <p className="font-mono text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 group-hover/stat:from-indigo-400 group-hover/stat:to-indigo-300 transition-all duration-300 tracking-tight">
              {totalPlaylists}
            </p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-white/40 group-hover/stat:text-white/60 transition-colors duration-300">
              เพลย์ลิสต์
            </p>
          </div>
          <div className="group/stat">
            <p className="font-mono text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 group-hover/stat:from-pink-400 group-hover/stat:to-pink-300 transition-all duration-300 tracking-tight">
              {totalSongs.toLocaleString()}
            </p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-white/40 group-hover/stat:text-white/60 transition-colors duration-300">
              เพลงในระบบ
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[340px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.045]"
              />
            ))
          ) : stations.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-dashed border-white/12 bg-white/[0.035] px-6 py-14 text-center">
              <Headphones className="mx-auto h-10 w-10 text-white/24 animate-bounce" />
              <p className="mt-5 text-base font-semibold text-white/72">
                ยังไม่พบสถานีที่เปิดให้บริการ
              </p>
              <p className="mt-2 text-sm text-white/42">
                ส่งคำขอเปิดสถานี แล้วระบบจะพร้อมให้เลือกจากหน้านี้
              </p>
              <Link href="/apply" className="mt-6 inline-flex">
                <Button className="rounded-full px-5 hover:scale-105 active:scale-95 transition-all">
                  ส่งคำขอเปิดร้าน
                </Button>
              </Link>
            </div>
          ) : (
            stations.map((station) => (
              <Link
                key={station.id}
                href={`/play/${station.slug}`}
                className="group relative flex min-h-[340px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#171b34] transition-all duration-500 hover:-translate-y-2 hover:border-violet-500/30 hover:shadow-[0_30px_70px_rgba(106,92,255,0.18)]"
              >
                {station.cover_thumbnail ? (
                  <img
                    src={station.cover_thumbnail}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-50 transition-all duration-700 group-hover:scale-110 group-hover:saturate-125 group-hover:opacity-75"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_22%,rgba(106,92,255,0.18),transparent_18rem),linear-gradient(145deg,#171b34,#0d1021)] transition-all duration-700 group-hover:scale-105" />
                )}

                {/* Neon overlay shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#111426] via-[#111426]/75 to-black/10" />

                <div className="relative mt-auto w-full p-6 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-16">
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-950/40 px-3.5 py-1.5 text-xs font-semibold text-violet-400 backdrop-blur-md">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                      </span>
                      เปิดให้บริการ
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 transition-all duration-300 group-hover:border-violet-500/30 group-hover:bg-violet-500 group-hover:text-black group-hover:translate-x-1 group-hover:rotate-[-10deg]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-xs font-semibold text-violet-400/90 tracking-wider">
                      /play/{station.slug}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-snug text-white group-hover:text-primary transition-colors duration-300">
                      {station.display_name || station.name}
                    </h3>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/72">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md group-hover:bg-white/[0.08] transition-colors duration-300">
                        <LibraryBig className="h-3.5 w-3.5 text-violet-400" />
                        {station.playlist_count} เพลย์ลิสต์
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md group-hover:bg-white/[0.08] transition-colors duration-300">
                        <Volume2 className="h-3.5 w-3.5 text-violet-400" />
                        {station.song_count} เพลง
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ==================== ANDROID DOWNLOAD ==================== */}
      <section id="download" className="relative z-10 w-full max-w-7xl mx-auto scroll-mt-24 px-5 pb-24 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#1b1f3b] via-[#111426] to-[#0d1021] p-8 sm:p-12 lg:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          {/* Ambient glow */}
          <div className="absolute -right-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute -left-1/4 -bottom-1/4 h-[80%] w-[80%] rounded-full bg-primary/10 blur-[120px]" />
          
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                แอปพลิเคชันสำหรับอุปกรณ์ Android
              </div>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                ควบคุมเพลงสะดวกรวดเร็ว ผ่านปุ่มมีเดียของเครื่อง
              </h2>
              <p className="mt-4 text-base leading-8 text-white/60 sm:text-lg">
                ยกระดับการจัดการเพลงของร้านด้วยแอป Music Bar บนระบบ Android 
                เล่นเพลงในเบื้องหลังอย่างต่อเนื่อง ป้องกันเบราว์เซอร์หยุดทำงาน 
                และควบคุมเพลงได้ทันทีจากปุ่มเพิ่ม-ลดเสียง ปุ่มหูฟังบลูทูธ หรือหน้าจอล็อก (เหมือนแอป Spotify)
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    ✓
                  </div>
                  <span className="text-white/80"><strong>Background Audio:</strong> เล่นเพลงต่อเนื่องแม้ย่อแอปหรือปิดหน้าจอ</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    ✓
                  </div>
                  <span className="text-white/80"><strong>Media Control:</strong> ควบคุม เล่น/หยุด/ข้ามเพลง จากปุ่มอุปกรณ์และหูฟังบลูทูธ</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    ✓
                  </div>
                  <span className="text-white/80"><strong>System Notification:</strong> แสดงภาพปกเพลง ชื่อเพลง และชื่อศิลปินผู้ขอเพลงบนแถบแจ้งเตือน</span>
                </li>
              </ul>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a href="/app-debug.apk" download className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-8 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]">
                    ดาวน์โหลด Android APK (v1.0.0)
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              {/* Device Mockup */}
              <div className="relative w-64 h-[480px] bg-zinc-900 rounded-[2.5rem] border-[6px] border-zinc-800 shadow-2xl p-3 flex flex-col overflow-hidden">
                {/* Speaker grill / Camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-zinc-700" />
                  <div className="ml-4 w-12 h-1 bg-zinc-900 rounded-full" />
                </div>
                
                {/* Screen content */}
                <div className="flex-1 rounded-[1.8rem] bg-gradient-to-b from-[#111426] to-[#0a0c18] p-4 flex flex-col relative z-10 select-none overflow-hidden">
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-white/40">Music Bar Player</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  
                  {/* Mock Player UI */}
                  <div className="mt-8 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 p-1 shadow-lg animate-pulse">
                      <div className="h-full w-full rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Waves className="h-12 w-12 text-white/80" />
                      </div>
                    </div>
                    
                    <h4 className="mt-6 text-sm font-bold text-white truncate max-w-[200px]">เพลงที่กำลังเล่นอยู่</h4>
                    <p className="mt-1 text-xs text-white/50 truncate max-w-[180px]">ศิลปินผู้ขอเพลง • สาขา 1</p>
                    
                    {/* Fake Progress Bar */}
                    <div className="w-full mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-emerald-500" />
                    </div>
                    <div className="w-full mt-1.5 flex justify-between text-[8px] text-white/40 font-mono">
                      <span>01:45</span>
                      <span>03:20</span>
                    </div>
                    
                    {/* Controls */}
                    <div className="mt-6 flex items-center justify-center gap-6 text-white/80">
                      <span className="text-lg">⏮</span>
                      <span className="text-2xl bg-emerald-500/20 p-2 rounded-full border border-emerald-500/40">⏸</span>
                      <span className="text-lg">⏭</span>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="mt-auto text-center border-t border-white/5 pt-3">
                    <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ✓ เชื่อมต่อ Media Button แล้ว
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section id="start" className="relative z-10 w-full scroll-mt-28 overflow-hidden border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:px-12 xl:px-16 bg-gradient-to-b from-transparent to-[#111426]/30">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(106,92,255,0.08),transparent_40rem)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(236,72,153,0.04),transparent_30rem)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

          {/* Subtle CTA light sweeps */}
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-violet-500/5 blur-[90px] animate-pulse" />
          <div
            className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-pink-500/5 blur-[90px] animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/68">
            <Sparkles
              className="h-4 w-4 text-primary animate-spin"
              style={{ animationDuration: "3s" }}
            />
            เริ่มใช้งานได้ฟรี
          </div>

          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            พร้อมที่จะเปลี่ยนบรรยากาศร้านของคุณ?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55">
            ไม่ต้องมีฮาร์ดแวร์เพิ่ม แค่มีจอและอินเทอร์เน็ต
            ก็ตั้งระบบขอเพลงให้ลูกค้าได้ทันที
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row relative z-10">
            <Link href="/apply" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-full px-8 text-sm font-semibold shadow-[0_18px_42px_rgba(106,92,255,0.25)] hover:shadow-[0_0_30px_rgba(106,92,255,0.45)] hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
              >
                ขอเปิดสถานีฟรี
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-white/12 bg-white/[0.035] px-8 text-sm font-semibold text-white hover:bg-white/[0.08] hover:text-white hover:border-violet-500/35 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
              >
                เข้าสู่ระบบจัดการ
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-white/42 relative z-10">
            <span className="inline-flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-default">
              <Smartphone className="h-4 w-4 text-white/30" />
              ไม่ต้องลงแอป
            </span>
            <span className="inline-flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-default">
              <Music className="h-4 w-4 text-white/30" />
              YouTube + เพลงของคุณ
            </span>
            <span className="inline-flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-default">
              <Users className="h-4 w-4 text-white/30" />
              รองรับหลายสาขา
            </span>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative z-10 border-t border-white/10 px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>Music Bar keeps each branch in its own queue.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-white transition-colors">
              ระบบจัดการ
            </Link>
            <Link href="/apply" className="hover:text-white transition-colors">
              ขอเปิดสถานี
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
