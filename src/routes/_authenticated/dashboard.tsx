import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, type PfStatus } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "แดชบอร์ด | ระบบรูปแบบการบรรจุสินค้า" },
      { name: "description", content: "ภาพรวมลูกค้า สินค้า และสถานะรูปแบบการบรรจุทั้งหมด" },
      { property: "og:title", content: "แดชบอร์ด | ระบบรูปแบบการบรรจุสินค้า" },
      { property: "og:description", content: "ภาพรวมลูกค้า สินค้า และสถานะรูปแบบการบรรจุทั้งหมด" },
    ],
  }),
  component: Dashboard,
});

const SLA_DAYS = 3;

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [customers, products, formats] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase
          .from("packaging_formats")
          .select("id, packaging_code, version, status, updated_at, products(product_name), customers(customer_name)")
          .order("updated_at", { ascending: false }),
      ]);
      if (formats.error) throw formats.error;
      return {
        customers: customers.count ?? 0,
        products: products.count ?? 0,
        formats: formats.data ?? [],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const count = (s: PfStatus) => data.formats.filter((f) => f.status === s).length;
  const overdue = data.formats.filter(
    (f) => f.status === "pending" && Date.now() - new Date(f.updated_at).getTime() > SLA_DAYS * 864e5,
  );

  const stats = [
    { label: "ลูกค้าทั้งหมด", value: data.customers, to: "/customers" },
    { label: "สินค้าทั้งหมด", value: data.products, to: "/products" },
    { label: "รูปแบบการบรรจุทั้งหมด", value: data.formats.length, to: "/packaging" },
    { label: "ฉบับร่าง", value: count("draft"), to: "/packaging" },
    { label: "รออนุมัติ", value: count("pending"), to: "/approvals" },
    { label: "อนุมัติแล้ว", value: count("approved"), to: "/packaging" },
    { label: "ไม่อนุมัติ", value: count("rejected"), to: "/packaging" },
    { label: `รออนุมัติเกิน ${SLA_DAYS} วัน`, value: overdue.length, to: "/approvals" },
  ] as const;

  return (
    <>
      <PageHeader title="แดชบอร์ด" description="ภาพรวมข้อมูลรูปแบบการบรรจุสินค้าทั้งระบบ" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="panel p-5 transition-colors hover:border-primary">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold">{s.value.toLocaleString("th-TH")}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">รายการที่มีการแก้ไขล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.formats.slice(0, 8).map((f) => (
            <Link
              key={f.id}
              to="/packaging/$id"
              params={{ id: f.id }}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3 text-sm hover:bg-muted/50"
            >
              <div>
                <span className="font-medium">{f.packaging_code}</span>
                <span className="text-muted-foreground"> · v{f.version} · {f.products?.product_name}</span>
                <p className="text-xs text-muted-foreground">{f.customers?.customer_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{formatDateTime(f.updated_at)}</span>
                <StatusBadge status={f.status as PfStatus} />
              </div>
            </Link>
          ))}
          {data.formats.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
