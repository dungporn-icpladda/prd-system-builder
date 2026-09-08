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
import { Field } from "./customers";
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

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({
    meta: [
      { title: "สินค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { name: "description", content: "รายชื่อสินค้าและลูกค้าที่เกี่ยวข้อง" },
      { property: "og:title", content: "สินค้า | ระบบรูปแบบการบรรจุสินค้า" },
      { property: "og:description", content: "รายชื่อสินค้าและลูกค้าที่เกี่ยวข้อง" },
    ],
  }),
  component: ProductsPage,
});

const EMPTY = {
  customer_id: "",
  product_code: "",
  product_name: "",
  category: "",
  description: "",
};

function ProductsPage() {
  const { canEditProducts } = useMyRoles();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["products-page"],
    queryFn: async () => {
      const [products, customers] = await Promise.all([
        supabase.from("products").select("*").order("product_code"),
        supabase.from("customers").select("*").order("customer_code"),
      ]);
      if (products.error) throw products.error;
      if (customers.error) throw customers.error;
      return { products: products.data, customers: customers.data };
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error("กรุณาเลือกลูกค้า");
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("products")
        .insert({ ...form, created_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      await logAudit({
        entity_type: "product",
        entity_id: data.id,
        action: "create",
        after_value: data,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("เพิ่มสินค้าเรียบร้อย");
      setOpen(false);
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: ["products-page"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error("บันทึกไม่สำเร็จ", { description: e.message }),
  });

  const products = data?.products ?? [];
  const customers = data?.customers ?? [];
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const filtered = products.filter((product) => {
    const term = q.toLowerCase();
    const customer = customerById.get(product.customer_id);
    return (
      product.product_name.toLowerCase().includes(term) ||
      product.product_code.toLowerCase().includes(term) ||
      (customer?.customer_name ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <>
      <PageHeader
        title="สินค้า"
        description="จัดการข้อมูลสินค้าและผูกกับลูกค้า"
        action={
          canEditProducts && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> เพิ่มสินค้า
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
                </DialogHeader>
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <div className="space-y-2 sm:col-span-2">
                    <Label>
                      ลูกค้า <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.customer_id}
                      onValueChange={(v) => setForm({ ...form, customer_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกลูกค้า" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.customer_code} · {customer.customer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Field
                    label="รหัสสินค้า"
                    required
                    value={form.product_code}
                    onChange={(v) => setForm({ ...form, product_code: v })}
                  />
                  <Field
                    label="ชื่อสินค้า"
                    required
                    value={form.product_name}
                    onChange={(v) => setForm({ ...form, product_name: v })}
                  />
                  <Field
                    label="หมวดหมู่"
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: v })}
                  />
                  <div className="space-y-2 sm:col-span-2">
                    <Label>รายละเอียด</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
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
          placeholder="ค้นหาชื่อ รหัสสินค้า หรือลูกค้า"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสสินค้า</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
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
            {filtered.map((product) => {
              const customer = customerById.get(product.customer_id);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/products/$id"
                      params={{ id: product.id }}
                      className="text-primary hover:underline"
                    >
                      {product.product_code}
                    </Link>
                  </TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{customer?.customer_name ?? "-"}</TableCell>
                  <TableCell>{product.category || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "secondary" : "outline"}>
                      {RECORD_STATUS_LABEL[product.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(product.created_at)}</TableCell>
                </TableRow>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  ไม่พบข้อมูลสินค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
