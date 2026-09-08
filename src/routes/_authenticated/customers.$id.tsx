import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/db";
import { useMyRoles } from "@/hooks/useAuth";
import { PageHeader } from "@/components/AppShell";
import { Field } from "./customers";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, type PfStatus } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/customers/$id")({
  head: () => ({
    meta: [
      { title: "รายละเอียดลูกค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { name: "description", content: "ข้อมูลติดต่อลูกค้า สินค้า และรูปแบบการบรรจุที่เกี่ยวข้อง" },
      { property: "og:title", content: "รายละเอียดลูกค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { property: "og:description", content: "ข้อมูลติดต่อลูกค้า สินค้า และรูปแบบการบรรจุที่เกี่ยวข้อง" },
    ],
  }),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const { canEditCustomers } = useMyRoles();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const [c, p, f] = await Promise.all([
        supabase.from("customers").select("*").eq("id", id).single(),
        supabase.from("products").select("*").eq("customer_id", id).order("product_code"),
        supabase
          .from("packaging_formats")
          .select("id, packaging_code, version, status, products(product_name)")
          .eq("customer_id", id)
          .order("packaging_code"),
      ]);
      if (c.error) throw c.error;
      return { customer: c.data, products: p.data ?? [], formats: f.data ?? [] };
    },
  });

  const [form, setForm] = useState({
    customer_code: "",
    customer_name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
  });

  useEffect(() => {
    if (data?.customer) {
      const c = data.customer;
      setForm({
        customer_code: c.customer_code,
        customer_name: c.customer_name,
        contact_name: c.contact_name ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
        address: c.address ?? "",
        status: c.status,
      });
    }
  }, [data?.customer]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: updated, error } = await supabase
        .from("customers")
        .update({ ...form, status: form.status as "active" | "inactive" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      await logAudit({
        entity_type: "customer",
        entity_id: id,
        action: "update",
        before_value: data?.customer,
        after_value: updated,
      });
    },
    onSuccess: () => {
      toast.success("บันทึกข้อมูลลูกค้าเรียบร้อย");
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e: Error) => toast.error("บันทึกไม่สำเร็จ", { description: e.message }),
  });

  if (isLoading || !data) return <p className="text-muted-foreground">กำลังโหลด...</p>;

  return (
    <>
      <PageHeader
        title={data.customer.customer_name}
        description={`รหัสลูกค้า ${data.customer.customer_code} · สร้างเมื่อ ${formatDate(data.customer.created_at)}`}
        action={
          <Button asChild variant="outline">
            <Link to="/customers">กลับรายการลูกค้า</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลลูกค้า</CardTitle>
          </CardHeader>
          <CardContent>
            <fieldset disabled={!canEditCustomers} className="grid gap-4 sm:grid-cols-2">
              <Field label="รหัสลูกค้า" value={form.customer_code} onChange={(v) => setForm({ ...form, customer_code: v })} />
              <Field label="ชื่อลูกค้า" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
              <Field label="ผู้ติดต่อ" value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} />
              <Field label="เบอร์โทรศัพท์" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="อีเมล" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">ใช้งาน</SelectItem>
                    <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>ที่อยู่</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              {canEditCustomers && (
                <div className="sm:col-span-2">
                  <Button onClick={() => save.mutate()} disabled={save.isPending}>
                    บันทึกการแก้ไข
                  </Button>
                </div>
              )}
            </fieldset>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">สินค้าของลูกค้า ({data.products.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.products.map((p) => (
                <Link
                  key={p.id}
                  to="/products/$id"
                  params={{ id: p.id }}
                  className="block rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span className="font-medium">{p.product_code}</span> · {p.product_name}
                </Link>
              ))}
              {data.products.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีสินค้า</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">รูปแบบการบรรจุ ({data.formats.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.formats.map((f) => (
                <Link
                  key={f.id}
                  to="/packaging/$id"
                  params={{ id: f.id }}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span>
                    {f.packaging_code} v{f.version}
                  </span>
                  <StatusBadge status={f.status as PfStatus} />
                </Link>
              ))}
              {data.formats.length === 0 && (
                <p className="text-sm text-muted-foreground">ยังไม่มีรูปแบบการบรรจุ</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
