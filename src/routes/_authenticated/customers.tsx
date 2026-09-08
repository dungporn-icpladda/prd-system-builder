import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/db";
import { useMyRoles } from "@/hooks/useAuth";
import { PageHeader } from "@/components/AppShell";
import { RECORD_STATUS_LABEL, formatDate } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({
    meta: [
      { title: "ลูกค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { name: "description", content: "รายชื่อลูกค้าทั้งหมด พร้อมรหัสลูกค้าและข้อมูลผู้ติดต่อ" },
      { property: "og:title", content: "ลูกค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { property: "og:description", content: "รายชื่อลูกค้าทั้งหมด พร้อมรหัสลูกค้าและข้อมูลผู้ติดต่อ" },
    ],
  }),
  component: CustomersPage,
});

const EMPTY = {
  customer_code: "",
  customer_name: "",
  contact_name: "",
  phone: "",
  email: "",
  address: "",
};

function CustomersPage() {
  const { canEditCustomers } = useMyRoles();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("customer_code");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("customers")
        .insert({ ...form, created_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      await logAudit({ entity_type: "customer", entity_id: data.id, action: "create", after_value: data });
      return data;
    },
    onSuccess: () => {
      toast.success("เพิ่มลูกค้าเรียบร้อย");
      setOpen(false);
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e: Error) => toast.error("บันทึกไม่สำเร็จ", { description: e.message }),
  });

  const filtered = data.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(q.toLowerCase()) ||
      c.customer_code.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="ลูกค้า"
        description="จัดการข้อมูลลูกค้าและผู้ติดต่อ"
        action={
          canEditCustomers && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> เพิ่มลูกค้า
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
                </DialogHeader>
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <Field label="รหัสลูกค้า" required value={form.customer_code} onChange={(v) => setForm({ ...form, customer_code: v })} />
                  <Field label="ชื่อลูกค้า" required value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
                  <Field label="ผู้ติดต่อ" value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} />
                  <Field label="เบอร์โทรศัพท์" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field label="อีเมล" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                  <div className="space-y-2 sm:col-span-2">
                    <Label>ที่อยู่</Label>
                    <Textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                  <DialogFooter className="sm:col-span-2">
                    <Button type="submit" disabled={create.isPending}>
                      บันทึก
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="ค้นหาชื่อหรือรหัสลูกค้า"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสลูกค้า</TableHead>
              <TableHead>ชื่อลูกค้า</TableHead>
              <TableHead>ผู้ติดต่อ</TableHead>
              <TableHead>โทรศัพท์</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            )}
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link to="/customers/$id" params={{ id: c.id }} className="text-primary hover:underline">
                    {c.customer_code}
                  </Link>
                </TableCell>
                <TableCell>{c.customer_name}</TableCell>
                <TableCell>{c.contact_name || "-"}</TableCell>
                <TableCell>{c.phone || "-"}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "active" ? "secondary" : "outline"}>
                    {RECORD_STATUS_LABEL[c.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(c.created_at)}</TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  ไม่พบข้อมูลลูกค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
