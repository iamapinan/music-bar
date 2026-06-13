"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAdminAuth } from "@/app/(system)/admin/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  LibraryBig,
  Radio,
  MonitorPlay,
  QrCode,
  RefreshCw,
  PowerOff,
  Music2,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  X,
  LayoutDashboard,
  Plus,
  ChevronDown,
  Store,
  Check,
  Copy,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  ClipboardList,
  Sun,
  Moon,
} from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { forceUpdateApp } from "@/lib/app-update";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PersistentYouTubePlayer } from "@/components/persistent-player";
import { PlayerBottomBar } from "@/components/player-bottom-bar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout, tenants, activeTenant, switchTenant, refreshSession, user } =
    useAdminAuth();
  const pathname = usePathname();

  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [editStoreName, setEditStoreName] = useState("");
  const [editStoreSlug, setEditStoreSlug] = useState("");
  const [editStoreActive, setEditStoreActive] = useState(true);
  const [isSavingStoreSettings, setIsSavingStoreSettings] = useState(false);

  const { data: requests = [] } = useSWR("/api/requests", fetcher, {
    refreshInterval: 3000,
  });
  const { data: storeApplications = [] } = useSWR(
    user?.is_super_admin
      ? "/api/admin/store-applications?status=pending"
      : null,
    fetcher,
    { refreshInterval: 8000 },
  );
  const { data: players = [], mutate: mutatePlayers } = useSWR(
    showPlayersModal ? "/api/players" : null,
    fetcher,
    { refreshInterval: 5000 },
  );

  useEffect(() => {
    const storedTheme = localStorage.getItem("music_bar_admin_theme");
    if (storedTheme === "light") {
      setIsLightTheme(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isLightTheme;
    setIsLightTheme(nextTheme);
    const themeStr = nextTheme ? "light" : "dark";
    localStorage.setItem("music_bar_admin_theme", themeStr);
    if (nextTheme) {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light-theme");
    }
  };

  useEffect(() => {
    if (!activeTenant?.slug) return;
    setPageUrl(window.location.origin + `/play/${activeTenant.slug}/request`);
  }, [activeTenant?.slug]);

  useEffect(() => {
    const stored = localStorage.getItem("music_bar_admin_sidebar_collapsed");
    if (stored) setIsSidebarCollapsed(stored === "true");
  }, []);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem(
      "music_bar_admin_sidebar_collapsed",
      String(collapsed),
    );
  };

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

  const handleForceUpdate = () => forceUpdateApp(setIsUpdating);

  const playerUrl = activeTenant?.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/play/${activeTenant.slug}`
    : "";

  const handleCopyPlayerUrl = async () => {
    if (!playerUrl) return;
    try {
      await navigator.clipboard.writeText(playerUrl);
      toast.success("คัดลอก URL เครื่องเล่นแล้ว");
    } catch {
      toast.error("ไม่สามารถคัดลอก URL ได้");
    }
  };

  const handleTogglePlayer = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      mutatePlayers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("ต้องการลบเครื่องเล่นนี้หรือไม่?")) return;
    try {
      await fetch(`/api/players/${id}`, { method: "DELETE" });
      mutatePlayers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) return;
    setIsCreatingTenant(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTenantName.trim(),
          slug: newTenantSlug.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถสร้างร้านได้");
      toast.success("สร้างร้านใหม่แล้ว");
      setNewTenantName("");
      setNewTenantSlug("");
      setShowCreateTenant(false);
      await refreshSession();
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถสร้างร้านได้",
      );
    } finally {
      setIsCreatingTenant(false);
    }
  };

  const isAllowedToManage =
    user?.is_super_admin ||
    activeTenant?.role === "owner" ||
    activeTenant?.role === "admin";

  const handleSaveStoreSettings = async () => {
    if (!activeTenant?.tenant_id) return;
    if (!editStoreName.trim()) {
      toast.error("กรุณากรอกชื่อร้าน");
      return;
    }
    const normalizedSlug = editStoreSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!normalizedSlug) {
      toast.error("กรุณากรอกสลัก URL ร้านค้าที่ถูกต้อง");
      return;
    }

    setIsSavingStoreSettings(true);
    try {
      const res = await fetch(`/api/tenants/${activeTenant.tenant_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editStoreName.trim(),
          slug: normalizedSlug,
          is_active: editStoreActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถบันทึกข้อมูลได้");

      toast.success("บันทึกการตั้งค่าร้านค้าแล้ว");
      setShowStoreSettings(false);
      await refreshSession();
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึก",
      );
    } finally {
      setIsSavingStoreSettings(false);
    }
  };

  return (
    <div
      className={cn(
        "admin-shell flex min-h-[100dvh] pb-[88px] text-foreground sm:pb-[112px]",
        isLightTheme && "light-theme",
      )}
    >
      <aside
        className={cn(
          "admin-command-rail sticky top-0 z-30 hidden h-[calc(100dvh-7rem)] shrink-0 flex-col border-r border-white/[0.07] p-4 transition-[width] duration-300 xl:flex",
          isSidebarCollapsed ? "w-[92px]" : "w-[280px]",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3",
            isSidebarCollapsed && "justify-center px-2",
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_32px_rgba(52,211,153,0.12)]">
            <Settings className="h-5 w-5" />
          </div>
          <div className={cn("min-w-0", isSidebarCollapsed && "hidden")}>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              Music Bar
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white/90">
              Admin console
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "mt-4 h-auto w-full justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-left hover:bg-white/[0.07]",
                isSidebarCollapsed && "justify-center px-2",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Store className="h-4 w-4" />
                </span>
                <span className={cn("min-w-0", isSidebarCollapsed && "hidden")}>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                    ร้านที่ใช้งาน
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-white">
                    {activeTenant?.display_name ||
                      activeTenant?.name ||
                      user?.email ||
                      "เลือกร้าน"}
                  </span>
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-white/45",
                  isSidebarCollapsed && "hidden",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side={isSidebarCollapsed ? "right" : "bottom"}
            sideOffset={12}
            className="w-72 border-white/10 bg-black/95 text-white backdrop-blur-xl max-h-[350px] flex flex-col"
          >
            <DropdownMenuLabel className="text-xs text-white/50">
              ร้านค้าทั้งหมด
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <ScrollArea className="flex-1 min-h-0">
              <div className="py-1">
                {tenants.length === 0 ? (
                  <DropdownMenuItem
                    disabled
                    className="text-xs text-white/40 justify-center"
                  >
                    ยังไม่มีร้าน
                  </DropdownMenuItem>
                ) : (
                  tenants.map((tenant) => {
                    const isActive =
                      tenant.tenant_id === activeTenant?.tenant_id;
                    return (
                      <DropdownMenuItem
                        key={tenant.tenant_id}
                        onClick={() =>
                          !isActive && switchTenant(tenant.tenant_id)
                        }
                        className="min-h-11 rounded-xl gap-3 px-3 py-2 cursor-pointer hover:bg-white/5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {isActive ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Store className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">
                            {tenant.display_name || tenant.name}
                          </span>
                          <span className="block truncate text-xs text-white/40 font-mono">
                            /{tenant.slug}
                          </span>
                        </span>
                      </DropdownMenuItem>
                    );
                  })
                )}
                {user?.is_super_admin && (
                  <>
                    <DropdownMenuSeparator className="bg-white/10 my-1.5" />
                    <DropdownMenuItem
                      onClick={() => setShowCreateTenant(true)}
                      className="min-h-11 rounded-xl gap-3 px-3 py-2 cursor-pointer text-primary hover:text-primary-foreground hover:bg-primary/20"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Plus className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-bold">สร้างร้านใหม่</span>
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="mt-5 flex min-h-0 flex-1 flex-col gap-1.5">
          <Link href="/admin/dashboard" title="สถิติและภาพรวม">
            <Button
              variant="ghost"
              className={cn(
                "h-11 w-full gap-3 rounded-xl px-3",
                isSidebarCollapsed ? "justify-center" : "justify-start",
                pathname === "/admin/dashboard"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className={cn(isSidebarCollapsed && "hidden")}>ภาพรวม</span>
            </Button>
          </Link>
          <Link href="/admin" title="คลังเพลง">
            <Button
              variant="ghost"
              className={cn(
                "h-11 w-full gap-3 rounded-xl px-3",
                isSidebarCollapsed ? "justify-center" : "justify-start",
                pathname === "/admin"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <LibraryBig className="h-4 w-4" />
              <span className={cn(isSidebarCollapsed && "hidden")}>
                คลังเพลง
              </span>
            </Button>
          </Link>
          <Link href="/admin?tab=requests" title="คำขอเพลง">
            <Button
              variant="ghost"
              className={cn(
                "relative h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary",
                isSidebarCollapsed ? "justify-center" : "justify-start",
              )}
            >
              <Radio className="h-4 w-4" />
              <span className={cn(isSidebarCollapsed && "hidden")}>
                คำขอเพลง
              </span>
              {requests.length > 0 && !isSidebarCollapsed && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {requests.length}
                </span>
              )}
            </Button>
          </Link>
          {user?.is_super_admin && (
            <>
              <Link href="/admin/applications" title="คำขอเปิดร้าน">
                <Button
                  variant="ghost"
                  className={cn(
                    "relative h-11 w-full gap-3 rounded-xl px-3",
                    isSidebarCollapsed ? "justify-center" : "justify-start",
                    pathname === "/admin/applications"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span className={cn(isSidebarCollapsed && "hidden")}>
                    คำขอเปิดร้าน
                  </span>
                  {storeApplications.length > 0 && !isSidebarCollapsed && (
                    <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {storeApplications.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/admin/users" title="จัดการ admin">
                <Button
                  variant="ghost"
                  className={cn(
                    "h-11 w-full gap-3 rounded-xl px-3",
                    isSidebarCollapsed ? "justify-center" : "justify-start",
                    pathname === "/admin/users"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className={cn(isSidebarCollapsed && "hidden")}>
                    จัดการ admin
                  </span>
                </Button>
              </Link>
            </>
          )}
          <Link href="/admin/security" title="ตั้งค่า PIN">
            <Button
              variant="ghost"
              className={cn(
                "h-11 w-full gap-3 rounded-xl px-3",
                isSidebarCollapsed ? "justify-center" : "justify-start",
                pathname === "/admin/security"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              <span className={cn(isSidebarCollapsed && "hidden")}>
                ความปลอดภัย
              </span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={cn(
              "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary",
              isSidebarCollapsed ? "justify-center" : "justify-start",
            )}
            onClick={() => setShowPlayersModal(true)}
            title="จัดการเครื่องเล่น"
          >
            <MonitorPlay className="h-4 w-4" />
            <span className={cn(isSidebarCollapsed && "hidden")}>
              เครื่องเล่น
            </span>
          </Button>
          {isAllowedToManage && (
            <Button
              variant="ghost"
              className={cn(
                "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary",
                isSidebarCollapsed ? "justify-center" : "justify-start",
              )}
              onClick={() => {
                setEditStoreName(
                  activeTenant?.display_name || activeTenant?.name || "",
                );
                setEditStoreSlug(activeTenant?.slug || "");
                setEditStoreActive(activeTenant?.is_active ?? true);
                setShowStoreSettings(true);
              }}
              title="ตั้งค่าร้านค้า"
            >
              <Settings className="h-4 w-4" />
              <span className={cn(isSidebarCollapsed && "hidden")}>
                ตั้งค่าร้านค้า
              </span>
            </Button>
          )}
          {activeTenant?.slug && (
            <div
              className={cn(
                "flex items-center gap-1 w-full pr-1",
                isSidebarCollapsed ? "justify-center" : "justify-between",
              )}
            >
              <Link
                href={`/play/${activeTenant.slug}`}
                target="_blank"
                className="flex-1"
                title="เปิดหน้าเครื่องเล่น"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary justify-start",
                    isSidebarCollapsed && "justify-center px-0",
                  )}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className={cn(isSidebarCollapsed && "hidden")}>
                    เปิดเครื่องเล่น
                  </span>
                </Button>
              </Link>
              {!isSidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/10"
                  onClick={handleCopyPlayerUrl}
                  disabled={!playerUrl}
                  title="คัดลอก URL เครื่องเล่น"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary",
              isSidebarCollapsed ? "justify-center" : "justify-start",
            )}
            onClick={() => setShowQR(true)}
            title="QR สำหรับลูกค้า"
          >
            <QrCode className="h-4 w-4" />
            <span className={cn(isSidebarCollapsed && "hidden")}>
              QR ลูกค้า
            </span>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary",
              isSidebarCollapsed ? "justify-center" : "justify-start",
            )}
            onClick={handleForceUpdate}
            disabled={isUpdating}
            title="อัปเดตแอป"
          >
            <RefreshCw
              className={cn("h-4 w-4", isUpdating && "animate-spin")}
            />
            <span className={cn(isSidebarCollapsed && "hidden")}>
              อัปเดตแอป
            </span>
          </Button>
        </nav>

        <div className="mt-4 border-t border-white/10 pt-3 space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary",
              isSidebarCollapsed ? "justify-center" : "justify-start",
            )}
            onClick={toggleTheme}
            title="เปลี่ยนธีม"
          >
            {isLightTheme ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className={cn(isSidebarCollapsed && "hidden")}>
              {isLightTheme ? "Dark mode" : "Light mode"}
            </span>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary",
              isSidebarCollapsed ? "justify-center" : "justify-start",
            )}
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
            <span className={cn(isSidebarCollapsed && "hidden")}>
              ย่อ sidebar
            </span>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "h-11 w-full gap-3 rounded-xl px-3 text-muted-foreground hover:text-destructive",
              isSidebarCollapsed ? "justify-center" : "justify-start",
            )}
            onClick={logout}
            title="ออกจากระบบ"
          >
            <PowerOff className="h-4 w-4" />
            <span className={cn(isSidebarCollapsed && "hidden")}>
              ออกจากระบบ
            </span>
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <header className="sticky top-2 z-40 mx-2 mb-2 flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-xl shadow-lg xl:hidden transition-all">
          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Music2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider text-white/90">
              Admin
            </span>
            {activeTenant && (
              <span className="hidden max-w-[120px] truncate text-xs text-white/50 sm:inline">
                {activeTenant.display_name || activeTenant.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                title="ภาพรวม"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                title="คลังเพลง"
              >
                <LibraryBig className="h-3.5 w-3.5" />
              </Button>
            </Link>
            {user?.is_super_admin && (
              <Link href="/admin/applications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  title="คำขอเปิดร้าน"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}

            {/* Security / PIN (all admins) */}
            <Link href="/admin/security">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                title="ตั้งค่า PIN"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
              </Button>
            </Link>

            {activeTenant?.slug && (
              <>
                <Link href={`/play/${activeTenant.slug}`} target="_blank">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                    title="เปิดหน้าเครื่องเล่น"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={handleCopyPlayerUrl}
                  disabled={!playerUrl}
                  title="คัดลอก URL เครื่องเล่น"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setShowQR(true)}
              title="QR ลูกค้า"
            >
              <QrCode className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setShowPlayersModal(true)}
              title="จัดการเครื่องเล่น"
            >
              <MonitorPlay className="h-3.5 w-3.5" />
            </Button>
            {isAllowedToManage && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setEditStoreName(
                    activeTenant?.display_name || activeTenant?.name || "",
                  );
                  setEditStoreSlug(activeTenant?.slug || "");
                  setEditStoreActive(activeTenant?.is_active ?? true);
                  setShowStoreSettings(true);
                }}
                title="ตั้งค่าร้านค้า"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            {user?.is_super_admin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setShowCreateTenant(true)}
                title="สร้างร้านใหม่"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              onClick={toggleTheme}
              title="เปลี่ยนธีม"
            >
              {isLightTheme ? (
                <Moon className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/70 hover:bg-destructive/80 hover:text-white"
              onClick={logout}
              title="ออกจากระบบ"
            >
              <PowerOff className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        {children}
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md border-white/10 bg-black/90 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              QR Code สั่งเพลง
            </DialogTitle>
            <DialogDescription className="text-white/70">
              ให้ลูกค้าสแกนเพื่อเข้าสู่หน้าระบบขอเพลงของร้าน
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 gap-6">
            <div className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white/70">
              {activeTenant?.display_name || activeTenant?.name || user?.email}
            </div>
            <div className="p-4 bg-white rounded-xl shadow-xl">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-medium">
                    กำลังสร้าง QR...
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={handleDownloadQR}
              className="w-full sm:w-auto px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full"
            >
              <Download className="w-4 h-4" />
              บันทึกภาพ QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Players Modal */}
      <Dialog open={showPlayersModal} onOpenChange={setShowPlayersModal}>
        <DialogContent className="sm:max-w-md border-white/10 bg-black/90 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              เครื่องเล่นที่เชื่อมต่อ
            </DialogTitle>
            <DialogDescription className="text-white/70">
              เครื่องเล่นที่กำลังเปิดหน้าสตรีมเพลงของร้านนี้อยู่ในปัจจุบัน
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-[400px] mt-4 -mx-2 px-2">
              <div className="flex flex-col gap-2 pb-2">
                {players.length === 0 ? (
                  <div className="text-center py-8 text-white/50 text-sm">
                    ไม่พบเครื่องเล่นที่เชื่อมต่ออยู่
                  </div>
                ) : (
                  players.map((player: any) => {
                    const isOnline =
                      new Date().getTime() -
                        new Date(player.last_ping).getTime() <
                      60000;
                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-full border shadow-sm",
                              player.is_active
                                ? "bg-primary/20 border-primary/30 text-primary"
                                : "bg-white/10 border-white/10 text-white/50",
                            )}
                          >
                            {player.device_type === "Mobile" ? (
                              <Smartphone className="w-4 h-4" />
                            ) : player.device_type === "Tablet" ? (
                              <Tablet className="w-4 h-4" />
                            ) : (
                              <Monitor className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">
                              {player.device_name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full animate-pulse",
                                  isOnline ? "bg-green-500" : "bg-red-500",
                                )}
                              ></span>
                              <span className="text-sm text-white/60">
                                {isOnline ? "ออนไลน์" : "ออฟไลน์"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={player.is_active ? "default" : "outline"}
                            className={cn(
                              "h-7 px-3 text-xs rounded-full",
                              player.is_active
                                ? "bg-primary text-primary-foreground"
                                : "border-white/20 text-white",
                            )}
                            onClick={() =>
                              handleTogglePlayer(player.id, player.is_active)
                            }
                          >
                            {player.is_active ? "เปิดใช้งาน" : "ระงับ"}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-full"
                            onClick={() => handleDeletePlayer(player.id)}
                            title="ลบเครื่องเล่น"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateTenant} onOpenChange={setShowCreateTenant}>
        <DialogContent className="sm:max-w-md border-white/10 bg-black/90 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              สร้างร้านใหม่
            </DialogTitle>
            <DialogDescription className="text-white/70">
              ระบบจะสร้าง tenant ใหม่และสลับไปยังร้านนั้นทันที
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60">
                ชื่อร้าน
              </label>
              <Input
                value={newTenantName}
                onChange={(event) => {
                  const val = event.target.value;
                  setNewTenantName(val);
                  setNewTenantSlug(
                    val
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                  );
                }}
                placeholder="ชื่อร้าน"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60">
                Slug ร้าน (ใน URL: /play/[slug])
              </label>
              <Input
                value={newTenantSlug}
                onChange={(event) => setNewTenantSlug(event.target.value)}
                placeholder="เช่น my-awesome-bar (เว้นว่างไว้ได้)"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <Button
              onClick={handleCreateTenant}
              disabled={!newTenantName.trim() || isCreatingTenant}
              className="w-full gap-2 mt-2"
            >
              <Plus className="h-4 w-4" />
              สร้างร้าน
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Store Settings Dialog */}
      <Dialog open={showStoreSettings} onOpenChange={setShowStoreSettings}>
        <DialogContent className="sm:max-w-md border-white/10 bg-black/90 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              ตั้งค่าร้านค้า
            </DialogTitle>
            <DialogDescription className="text-white/70">
              แก้ไขชื่อร้าน สลัก URL และสถานะการให้บริการของร้านค้าที่ใช้งานอยู่
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60">
                ชื่อร้านค้า
              </label>
              <Input
                value={editStoreName}
                onChange={(event) => setEditStoreName(event.target.value)}
                placeholder="ระบุชื่อร้านค้า"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60">
                สลัก URL ร้านค้า (URL Slug: /play/[slug])
              </label>
              <Input
                value={editStoreSlug}
                onChange={(event) => setEditStoreSlug(event.target.value)}
                placeholder="เช่น my-awesome-bar"
                className="border-white/10 bg-white/5 text-white font-mono"
              />
              <p className="text-[10px] text-white/40 leading-relaxed">
                * อนุญาตเฉพาะตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข
                และเครื่องหมายขีดกลาง (-) เท่านั้น
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/15 bg-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-white">
                  สถานะการให้บริการ
                </span>
                <span className="text-[10px] text-white/50">
                  {editStoreActive
                    ? "เปิดให้บริการตามปกติ ลูกค้าสามารถเข้าขอเพลงได้"
                    : "ปิดให้บริการชั่วคราว ลูกค้าจะไม่สามารถทำรายการได้"}
                </span>
              </div>
              <Switch
                checked={editStoreActive}
                onCheckedChange={setEditStoreActive}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowStoreSettings(false)}
                className="flex-1 border-white/10 text-gray-800"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSaveStoreSettings}
                disabled={
                  isSavingStoreSettings ||
                  !editStoreName.trim() ||
                  !editStoreSlug.trim()
                }
                className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
              >
                {isSavingStoreSettings ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PersistentYouTubePlayer />
      <PlayerBottomBar />
    </div>
  );
}

function Trash2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
