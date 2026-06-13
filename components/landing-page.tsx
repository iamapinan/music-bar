"use client";

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

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#080b0a] text-white selection:bg-primary/30 selection:text-white">
      {/* ---- Background ---- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_4%,rgba(80,132,105,0.24),transparent_32rem),radial-gradient(circle_at_82%_18%,rgba(226,232,240,0.08),transparent_24rem),linear-gradient(180deg,#0b1110_0%,#080b0a_42%,#0d1110_100%)]" />
        <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.05)_44%,transparent_46%)]" />
      </div>

      {/* ---- Nav ---- */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080b0a]/78 backdrop-blur-2xl">
        <nav className="mx-auto flex h-[72px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Music Bar home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <img
                src="/icon-512.png"
                alt=""
                className="h-8 w-8 rounded-xl object-cover"
              />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-none tracking-wide text-white">
                Music Bar
              </span>
              <span className="mt-1 block text-[11px] font-medium text-white/45">
                Request queue system
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button
                variant="ghost"
                className="mr-8 h-10 rounded-full px-3 text-sm font-medium text-white/72 hover:bg-white/[0.07] hover:text-white sm:mr-0 sm:px-4"
              >
                <span className="sm:hidden">จัดการ</span>
                <span className="hidden sm:inline">ระบบจัดการ</span>
              </Button>
            </Link>
            <Link href="/apply" className="hidden sm:block">
              <Button className="h-10 rounded-full px-5 text-sm font-semibold shadow-[0_14px_36px_rgba(16,185,129,0.2)] transition-transform active:scale-[0.98]">
                ขอเปิดสถานี
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="relative z-10 grid w-full gap-12 overflow-hidden px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-12 lg:pb-28 lg:pt-20 xl:px-16">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/hero-party-background.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-42 saturate-[1.08]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,10,0.95)_0%,rgba(8,11,10,0.78)_34%,rgba(8,11,10,0.48)_68%,rgba(8,11,10,0.74)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_24%_42%,rgba(8,11,10,0.38),transparent_34rem),linear-gradient(180deg,rgba(8,11,10,0.05)_0%,rgba(8,11,10,0.88)_100%)]" />
          <div className="absolute inset-x-[-18%] top-[-22%] h-[82%] bg-[radial-gradient(circle_at_24%_30%,rgba(255,70,116,0.18),transparent_18rem),radial-gradient(circle_at_58%_20%,rgba(52,211,153,0.24),transparent_22rem),radial-gradient(circle_at_84%_36%,rgba(84,160,255,0.18),transparent_19rem)] blur-[2px]" />
          <div className="absolute left-[7%] top-[-24%] h-[118%] w-24 rotate-[16deg] bg-[linear-gradient(180deg,transparent,rgba(52,211,153,0.20),transparent)] blur-2xl" />
          <div className="absolute right-[12%] top-[-18%] h-[108%] w-20 -rotate-[22deg] bg-[linear-gradient(180deg,transparent,rgba(255,70,116,0.15),transparent)] blur-2xl" />
          <div className="absolute left-[42%] top-[-28%] h-[122%] w-16 rotate-[6deg] bg-[linear-gradient(180deg,transparent,rgba(134,190,255,0.14),transparent)] blur-2xl" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.52)_0_1px,transparent_1.5px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_74%_48%_at_50%_18%,black,transparent_76%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,10,0)_0%,rgba(8,11,10,0.18)_44%,rgba(8,11,10,0.92)_100%)]" />
        </div>

        <div className="relative z-10 flex max-w-3xl flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Multi-tenant music control
          </div>

          <h1 className="max-w-4xl text-2xl font-semibold leading-[1.04] tracking-normal text-white sm:text-4xl lg:text-4xl xl:text-6xl">
            คิวเพลงของร้านที่ดูดีเท่าบรรยากาศจริง
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
            ให้ลูกค้าขอเพลงผ่าน QR และให้ทีมร้านคุม playlist, queue, player
            ของทุกสาขาได้ในที่เดียว
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#stations">
              <Button
                size="lg"
                className="h-12 w-full rounded-full px-7 text-sm font-semibold shadow-[0_18px_42px_rgba(16,185,129,0.22)] transition-transform active:scale-[0.98] sm:w-auto"
              >
                เลือกสถานี
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/apply">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-white/12 bg-white/[0.035] px-7 text-sm font-semibold text-white hover:bg-white/[0.08] hover:text-white sm:w-auto"
              >
                เปิดใช้กับร้านของคุณ
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 min-h-[460px] lg:min-h-[560px]">
          <div className="absolute left-0 top-6 w-[78%] overflow-hidden rounded-[2rem] border border-white/10 bg-[#121817] shadow-[0_40px_90px_rgba(0,0,0,0.45)] sm:left-8">
            <div className="aspect-[4/5] bg-[radial-gradient(circle_at_50%_22%,rgba(52,211,153,0.24),transparent_18rem),linear-gradient(160deg,#1a2421,#090d0c_62%)] p-5">
              <div className="flex items-center justify-between text-xs text-white/44">
                <span>MAIN ROOM</span>
                <span className="font-mono">21:48</span>
              </div>
              <div className="mt-14 flex justify-center">
                <div className="relative h-56 w-56 rounded-full border border-white/10 bg-black/30 p-5 shadow-[inset_0_0_42px_rgba(255,255,255,0.04)]">
                  <div className="h-full w-full rounded-full bg-[conic-gradient(from_20deg,#dbe7df,#2dd58d,#1b2a25,#edf3ef,#2dd58d,#111)] p-[2px]">
                    <div className="grid h-full w-full place-items-center rounded-full bg-[#111816]">
                      <Waves className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[64%] rounded-full bg-primary" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Now playing</p>
                    <p className="mt-1 text-sm text-white/45">
                      Playlist switches when requests arrive
                    </p>
                  </div>
                  <Volume2 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-0 w-[68%] rounded-[1.5rem] border border-white/10 bg-white/[0.075] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:right-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/14 text-primary">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Live queue</p>
                  <p className="text-xs text-white/42">
                    Requests move by play order
                  </p>
                </div>
              </div>
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              {operatingNotes.map((note, index) => (
                <div
                  key={note}
                  className="flex items-center gap-3 rounded-2xl bg-black/20 px-3 py-2.5"
                >
                  <span className="font-mono text-xs text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-white/72">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="relative z-10 w-full px-5 pb-24 sm:px-8 lg:px-12 xl:px-16">
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
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors group-hover:bg-primary/18">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/50">
                {feature.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== STATIONS ==================== */}
      <section
        id="stations"
        className="relative z-10 w-full scroll-mt-24 px-5 pb-24 sm:px-8 lg:px-12 xl:px-16"
      >
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            เลือกสถานีที่เปิดให้บริการ
          </h2>
          <p className="mt-4 text-base leading-7 text-white/55">
            เปิด player ของสาขา หรือให้ทีมร้านเข้าไปจัดการเพลงจากระบบหลังบ้าน
          </p>
        </div>

        <div className="mt-8 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-3">
          <div>
            <p className="font-mono text-3xl text-white">{stations.length}</p>
            <p className="mt-1 text-sm text-white/45">สถานี</p>
          </div>
          <div>
            <p className="font-mono text-3xl text-white">{totalPlaylists}</p>
            <p className="mt-1 text-sm text-white/45">เพลย์ลิสต์</p>
          </div>
          <div>
            <p className="font-mono text-3xl text-white">{totalSongs}</p>
            <p className="mt-1 text-sm text-white/45">เพลงในระบบ</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[336px] animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.045]"
              />
            ))
          ) : stations.length === 0 ? (
            <div className="col-span-full rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.035] px-6 py-14 text-center">
              <Headphones className="mx-auto h-10 w-10 text-white/24" />
              <p className="mt-5 text-base font-semibold text-white/72">
                ยังไม่พบสถานีที่เปิดให้บริการ
              </p>
              <p className="mt-2 text-sm text-white/42">
                ส่งคำขอเปิดสถานี แล้วระบบจะพร้อมให้เลือกจากหน้านี้
              </p>
              <Link href="/apply" className="mt-6 inline-flex">
                <Button className="rounded-full px-5">ส่งคำขอเปิดร้าน</Button>
              </Link>
            </div>
          ) : (
            stations.map((station) => (
              <Link
                key={station.id}
                href={`/play/${station.slug}`}
                className="group relative flex min-h-[336px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111615] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_26px_70px_rgba(0,0,0,0.42)]"
              >
                {station.cover_thumbnail ? (
                  <img
                    src={station.cover_thumbnail}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-62 transition duration-700 group-hover:scale-105 group-hover:opacity-78"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_22%,rgba(52,211,153,0.2),transparent_18rem),linear-gradient(145deg,#1b2421,#0b0f0e)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/62 to-black/10" />
                <div className="relative mt-auto w-full p-5">
                  <div className="mb-16 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-xs font-medium text-white/82 backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      เปิดให้บริการ
                    </span>
                    <ArrowRight className="h-5 w-5 text-white/72 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="font-mono text-xs text-primary/90">
                    /play/{station.slug}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-semibold leading-tight text-white">
                    {station.display_name || station.name}
                  </h3>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/72">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                      <LibraryBig className="h-3.5 w-3.5 text-primary" />
                      {station.playlist_count} เพลย์ลิสต์
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                      <Volume2 className="h-3.5 w-3.5 text-primary" />
                      {station.song_count} เพลง
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="relative z-10 w-full overflow-hidden border-t border-white/[0.04] px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(16,185,129,0.08),transparent_40rem)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(134,190,255,0.04),transparent_30rem)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/68">
            <Sparkles className="h-4 w-4 text-primary" />
            เริ่มใช้งานได้ฟรี
          </div>

          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            พร้อมที่จะเปลี่ยนบรรยากาศร้านของคุณ?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55">
            ไม่ต้องมีฮาร์ดแวร์เพิ่ม แค่มีจอและอินเทอร์เน็ต
            ก็ตั้งระบบขอเพลงให้ลูกค้าได้ทันที
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/apply">
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-sm font-semibold shadow-[0_18px_42px_rgba(16,185,129,0.25)] transition-transform active:scale-[0.98]"
              >
                ขอเปิดสถานีฟรี
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/12 bg-white/[0.035] px-8 text-sm font-semibold text-white hover:bg-white/[0.08] hover:text-white"
              >
                เข้าสู่ระบบจัดการ
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-white/42">
            <span className="inline-flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-white/30" />
              ไม่ต้องลงแอป
            </span>
            <span className="inline-flex items-center gap-2">
              <Music className="h-4 w-4 text-white/30" />
              YouTube + เพลงของคุณ
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-white/30" />
              รองรับหลายสาขา
            </span>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative z-10 border-t border-white/10 px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex w-full flex-col gap-4 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>Music Bar keeps each branch in its own queue.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-white">
              ระบบจัดการ
            </Link>
            <Link href="/apply" className="hover:text-white">
              ขอเปิดสถานี
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
