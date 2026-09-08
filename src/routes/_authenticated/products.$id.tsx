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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/products/$id")({
  head: () => ({
    meta: [
      { title: "รายละเอียดสินค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { name: "description", content: "ข้อมูลสินค้า ลูกค้า และรูปแบบการบรรจุที่เกี่ยวข้อง" },
      { property: "og:title", content: "รายละเอียดสินค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { property: "og:description", content: "ข้อมูลสินค้า ลูกค้า และรูปแบบการบรรจุที่เกี่ยวข้อง" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { canEditProducts } = useMyRoles();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const [product, customers, formats] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("customers").select("*").order("customer_code"),
        supabase
          .from("packaging_formats")
          .select("id, packaging_code, version, status")
          .eq("product_id", id)
          .order("packaging_code"),
      ]);
      if (product.error) throw product.error;
      if (customers.error) throw customers.error;
      return { product: product.data, customers: customers.data, formats: formats.data ?? [] };
    },
  });

  const [form, setForm] = useState({
    customer_id: "",
    product_code: "",
    product_name: "",
    category: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (!data?.product) return;
    setForm({
      customer_id: data.product.customer_id,
      product_code: data.product.product_code,
      product_name: data.product.product_name,
      category: data.product.category ?? "",
      description: data.product.description ?? "",
      status: data.product.status,
    });
  }, [data?.product]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: updated, error } = await supabase
        .from("products")
        .update({ ...form, status: form.status as "active" | "inactive" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      await logAudit({
        entity_type: "product",
        entity_id: id,
        action: "update",
        before_value: data?.product,
        after_value: updated,
      });
    },
    onSuccess: () => {
      toast.success("บันทึกข้อมูลสินค้าเรียบร้อย");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products-page"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error("บันทึกไม่สำเร็จ", { description: e.message }),
  });

  if (isLoading || !data) return <p className="text-muted-foreground">กำลังโหลด...</p>;

  const currentCustomer = data.customers.find(
    (customer) => customer.id === data.product.customer_id,
  );

  return (
    <>
      <PageHeader
        title={data.product.product_name}
        description={`รหัสสินค้า ${data.product.product_code} · สร้างเมื่อ ${formatDate(data.product.created_at)}`}
        action={
          <Button asChild variant="outline">
            <Link to="/products">กลับรายการสินค้า</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลสินค้า</CardTitle>
          </CardHeader>
          <CardContent>
            <fieldset disabled={!canEditProducts} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>ลูกค้า</Label>
                <Select
                  value={form.customer_id}
                  onValueChange={(v) => setForm({ ...form, customer_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.customer_code} · {customer.customer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field
                label="รหัสสินค้า"
                value={form.product_code}
                onChange={(v) => setForm({ ...form, product_code: v })}
              />
              <Field
                label="ชื่อสินค้า"
                value={form.product_name}
                onChange={(v) => setForm({ ...form, product_name: v })}
              />
              <Field
                label="หมวดหมู่"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
              />
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
                <Label>รายละเอียด</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              {canEditProducts && (
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
              <CardTitle className="text-base">ลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              {currentCustomer ? (
                <Link
                  to="/customers/$id"
                  params={{ id: currentCustomer.id }}
                  className="block rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span className="font-medium">{currentCustomer.customer_code}</span> ·{" "}
                  {currentCustomer.customer_name}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่พบข้อมูลลูกค้า</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">รูปแบบการบรรจุ ({data.formats.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.formats.map((format) => (
                <Link
                  key={format.id}
                  to="/packaging/$id"
                  params={{ id: format.id }}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span>
                    {format.packaging_code} v{format.version}
                  </span>
                  <StatusBadge status={format.status as PfStatus} />
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
