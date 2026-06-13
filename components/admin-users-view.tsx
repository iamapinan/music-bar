"use client";

import { useState } from "react";
import useSWR from "swr";
import { ShieldCheck, Plus, Trash2, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminGrant, TenantMembership } from "@/lib/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
};

export function AdminUsersView() {
  const { data: tenants = [] } = useSWR<TenantMembership[]>(
    "/api/tenants",
    fetcher,
  );
  const { data: grants = [], mutate } = useSWR<AdminGrant[]>(
    "/api/admin/grants",
    fetcher,
  );
  const [email, setEmail] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [role, setRole] = useState<"owner" | "admin" | "staff">("admin");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !tenantId) {
      toast.error("กรุณากรอก email และเลือกร้าน");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tenantId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถเพิ่มสิทธิ์ได้");
      toast.success("เพิ่มสิทธิ์ admin แล้ว");
      setEmail("");
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถเพิ่มสิทธิ์ได้",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (grantId: string) => {
    if (!confirm("ต้องการลบสิทธิ์ admin นี้หรือไม่?")) return;
    try {
      const res = await fetch("/api/admin/grants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: grantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบสิทธิ์ได้");
      toast.success("ลบสิทธิ์แล้ว");
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถลบสิทธิ์ได้",
      );
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1880px] min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 xl:gap-6 xl:px-8 xl:py-7">
      <section className="admin-dashboard-hero rounded-2xl border border-border/60 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              Super admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              จัดการผู้ดูแลระบบ
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              เพิ่ม Google account ให้ดูแลร้านได้หลายร้าน และกำหนด role
              ต่อร้านได้จากหน้านี้
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="admin-content-panel rounded-2xl p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
            <Plus className="h-4 w-4 text-primary" />
            เพิ่ม admin
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Google</Label>
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="border-border bg-secondary/40"
              />
            </div>
            <div className="space-y-2">
              <Label>ร้าน</Label>
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger className="border-border bg-secondary/40">
                  <SelectValue placeholder="เลือกร้าน" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.tenant_id} value={tenant.tenant_id}>
                      {tenant.display_name || tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as "owner" | "admin" | "staff")
                }
              >
                <SelectTrigger className="border-border bg-secondary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              บันทึกสิทธิ์
            </Button>
          </div>
        </div>

        <div className="admin-content-panel rounded-2xl p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
            <UserRound className="h-4 w-4 text-primary" />
            รายชื่อ admin
          </h2>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Email</TableHead>
                <TableHead>ร้าน</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {grants.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    ยังไม่มี admin grant
                  </TableCell>
                </TableRow>
              ) : (
                grants.map((grant) => (
                  <TableRow key={grant.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {grant.email}
                          </p>
                          {grant.user_name && (
                            <p className="text-xs text-muted-foreground">
                              {grant.user_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {grant.tenant_name || grant.tenant_slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                        {grant.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(grant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}
